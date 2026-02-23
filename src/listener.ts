import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { Controller__factory } from "../types/ethers-contracts";
import { ControllerHandler, Addresses } from "./contracts";
import { CacheProvider, PromServer } from "./lib";
import config from "../config.json";

type ChainKey =
  | "eth"
  | "polygon"
  | "arbitrum"
  | "base"
  | "zksync"
  | "hyperevm";

type ChainCfg = {
  enabled: boolean;
  provider: string;
  lookbackHarvests?: boolean;
};

type PollOpts = {
  pollMs: number;              // e.g. 60_000
  confirmations: number;       // e.g. 2 (L2) / 5-12 (ETH)
  maxBlockRange: number;       // cap per request, e.g. 50_000 (tune per chain/RPC)
};

const STATE_FILE = path.join(process.cwd(), "listener-state.json");

function readState(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeState(state: Record<string, number>) {
  const tmp = `${STATE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, STATE_FILE);
}

async function pollSharePriceEvents(params: {
  chain: ChainKey;
  chainCfg: ChainCfg;
  addresses: Addresses;
  provider: ethers.providers.JsonRpcProvider;
  handler: ControllerHandler;
  opts: PollOpts;
}) {
  const { chain, chainCfg, addresses, provider, handler, opts } = params;

  const controller = Controller__factory.connect(addresses.controller, provider);
  const filter = controller.filters.SharePriceChangeLog();

  const state = readState();
  const stateKey = `${chain}:${addresses.chainId}:SharePriceChangeLog`;

  // Determine initial start block
  let fromBlock = state[stateKey] ?? (await provider.getBlockNumber() - 10000);

  console.log(`[${chain}] polling from block ${fromBlock}`);

  let running = false;

  const tick = async () => {
    if (running) return; // avoid overlapping if processing runs long
    running = true;
    try {
      const latest = await provider.getBlockNumber();
      const safeTo = latest - opts.confirmations;
      if (safeTo < fromBlock) return;

      // Bounded range per request
      const toBlock = Math.min(safeTo, fromBlock + opts.maxBlockRange);

      const events = await controller.queryFilter(filter, fromBlock, toBlock);

      for (const event of events) {
        const args = event.args;
        if (!args) continue;

        const receipt = await provider.getTransactionReceipt(event.transactionHash);

        await handler.handleHardWork(
          args.vault,
          args.strategy,
          args.oldSharePrice,
          args.newSharePrice,
          args.timestamp,
          receipt,
          addresses
        );
      }

      // checkpoint: we completed [fromBlock..toBlock]
      const latestState = readState();
      latestState[stateKey] = toBlock;
      writeState(latestState);

      fromBlock = toBlock + 1;

      if (events.length > 0) {
        console.log(`[${chain}] processed ${events.length} events through block ${toBlock}`);
      }
    } catch (e) {
      console.error(`[${chain}] poll error`, e);
      // No state update on failure; will retry same range next tick
    } finally {
      running = false;
    }
  };

  // run immediately and then on interval
  await tick();
  setInterval(tick, opts.pollMs);
}

export class Listener {
  public static async start() {
    console.log("Starting events listener");

    const cacheProvider = new CacheProvider();
    const promServer = new PromServer(Number(config.port) || 9095);
    promServer.start();

    const opts: PollOpts = {
      pollMs: 60_000,
      confirmations: 5,
      maxBlockRange: 50_000,
    };

    const chains: Array<{ key: ChainKey; cfg: ChainCfg }> = ([
      { key: "eth", cfg: config.eth },
      { key: "polygon", cfg: config.polygon },
      { key: "arbitrum", cfg: config.arbitrum },
      { key: "base", cfg: config.base },
      { key: "zksync", cfg: config.zksync },
      { key: "hyperevm", cfg: config.hyperevm },
    ] as const).filter((c) => c.cfg?.enabled) as Array<{ key: ChainKey; cfg: ChainCfg }>;

    for (const c of chains) {
      const provider = new ethers.providers.JsonRpcProvider(c.cfg.provider);
      const addresses = new Addresses(c.key);
      const handler = new ControllerHandler(provider, cacheProvider.instance());

      await pollSharePriceEvents({
        chain: c.key,
        chainCfg: c.cfg,
        addresses,
        provider,
        handler,
        opts: opts,
      });

      console.log(`[${c.key}] polling enabled.`);
    }
  }
}