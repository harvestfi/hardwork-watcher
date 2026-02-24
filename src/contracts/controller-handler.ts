import { BigNumberish, ethers, utils } from 'ethers'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { Weth__factory, StrategyProxy__factory } from '../../types/ethers-contracts'
import { Utils, DiscordSender } from '../lib'
import { Addresses } from './'
import NodeCache from 'node-cache'

const TOKENS_URL = 'https://app.harvest.finance/data/tokens.json'
const TOKENS_FILE = 'tokens-cache.json'
const STRATEGY_PLACEHOLDER = 'farming strategy'
const CACHE_STRATEGY_SEC = 24 * 60 * 60 // 24 hours

const CHADISMS = ['BRAH', 'DUDE', 'NICE', 'COOL', 'SICK', 'BOSS']

export class ControllerHandler {
  private readonly provider: ethers.providers.JsonRpcProvider
  private cache: NodeCache

  constructor(provider: ethers.providers.JsonRpcProvider, cache: NodeCache) {
    this.provider = provider
    this.cache = cache
  }

  async handleHardWork(
    vault: string,
    strategy: string,
    oldSharePrice: BigNumberish,
    newSharePrice: BigNumberish,
    timestamp: BigNumberish,
    receipt: TransactionReceipt,
    addresses: Addresses,
  ) {
    const sharePriceDecimals = await this.queryTokens(vault, addresses.chainId, 'decimals')
    const sharePrice = Utils.formatUnits(newSharePrice, sharePriceDecimals)
    const oldSharePriceNumber = Utils.formatUnits(oldSharePrice, sharePriceDecimals)
    const sharePriceChangePercent = 100 * ((sharePrice - oldSharePriceNumber) / oldSharePriceNumber)
    const vaultName = await this.queryTokens(vault, addresses.chainId, 'displayName')
    const strategyName = await this.getStrategyName(
      strategy,
      addresses.chainId,
      addresses.scanApiUrl,
    )
    const utcString = new Date(Number(timestamp) * 1000).toUTCString()
    const randomChadism = CHADISMS[Math.floor(Math.random() * CHADISMS.length)]
    let sharedProfit = 0
    receipt.logs.forEach(log => {
      if (log.address.toLowerCase() == addresses.profitToken.toLowerCase()) {
        const profitToken = Weth__factory.connect(addresses.profitToken, this.provider)
        const parsedLog = profitToken.interface.parseLog(log)
        if (parsedLog.name == 'Transfer' && parsedLog.args.to == addresses.profitShare) {
          sharedProfit += Utils.formatUnits(parsedLog.args.value, 18)
        }
      }
    })

    let msg =
      ':tractor: [' +
      vaultName +
      '](<' +
      addresses.scanUrl +
      'tx/' +
      receipt.transactionHash +
      '>) harvested at `' +
      utcString +
      '`\n:tools: Using the [' +
      strategyName +
      '](<' +
      addresses.scanUrl +
      'address/' +
      strategy +
      '#code>)!'
    if (sharePriceChangePercent > 0) {
      msg +=
        '\n:chart_with_upwards_trend: Share price changes `' +
        sharePriceChangePercent.toFixed(4) +
        '%` to `' +
        sharePrice.toFixed(6) +
        '`!'
    }
    if (sharedProfit > 0) {
      msg += '\n:farmer: ' + addresses.profitTokenName + ' to profit share: `' + sharedProfit + '`'
    }
    msg += ` <:chadright:758033272101011622> ${randomChadism}.`
    DiscordSender.sendHardWork(msg, addresses.discord)
    Utils.saveLastBlock(addresses.chainId, receipt.blockNumber)
  }

  async getStrategyName(address: string, chainId: string, scanApiUrl: string) {
    const cacheKey = chainId + '_' + address.toLowerCase()
    const cachedValue = this.cache.get(cacheKey)
    if (cachedValue == undefined) {
      let url: string
      try {
        const proxy = StrategyProxy__factory.connect(address, this.provider)
        const implementation = await proxy.implementation()
        if (utils.isAddress(implementation)) {
          url = scanApiUrl + implementation
        } else {
          url = scanApiUrl + address
        }
      } catch {
        url = scanApiUrl + address
      }
      const response = await Utils.downloadFile(url)
      if (response != undefined) {
        const respJson = JSON.parse(response)
        if (respJson.message == 'OK') {
          const name: string = respJson.result[0].ContractName
          if (name != '') {
            this.cache.set(cacheKey, name, CACHE_STRATEGY_SEC)
            return name
          } else {
            // contract not verified
            return STRATEGY_PLACEHOLDER
          }
        } else return STRATEGY_PLACEHOLDER
      } else return STRATEGY_PLACEHOLDER
    } else {
      return String(cachedValue)
    }
  }

  async queryTokens(vaultAddress: string, chainId: string, query: string) {
    const tokens = JSON.parse(await Utils.cacheFile(TOKENS_URL, TOKENS_FILE))
    const vaultName = Object.keys(tokens.data).find(
      key =>
        tokens.data[key].vaultAddress &&
        tokens.data[key].vaultAddress.toLowerCase() === vaultAddress.toLowerCase() &&
        tokens.data[key].chain === chainId,
    )

    if (vaultName != undefined) {
      if (query == 'displayName') {
        return vaultName
      } else {
        return tokens.data[vaultName][query]
      }
    } else {
      if (query == 'displayName') {
        return vaultAddress
      } else {
        return undefined
      }
    }
  }
}
