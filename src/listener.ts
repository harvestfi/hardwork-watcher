import { ethers } from 'ethers'
import { Controller__factory } from '../types/ethers-contracts'
import { PromServer, CacheProvider, Utils } from './lib'
import { ControllerHandler, Addresses } from './contracts'
import config from '../config.json'

export class Listener {
  public static async start() {
    console.log('Starting events listener')

    const cacheProvider = new CacheProvider()
    const promServer = new PromServer(Number(config.port) || 9095)
    promServer.start()

    const ethEnabled = config.eth.enabled || false
    if (ethEnabled) {
      const ethProvider = new ethers.providers.JsonRpcProvider(config.eth.provider)
      const ethLookback = config.eth.lookbackHarvests || false
      const ethAddresses = new Addresses('eth')
      const ethController = Controller__factory.connect(ethAddresses.controller, ethProvider)
      const ethControllerHandler = new ControllerHandler(ethProvider, cacheProvider.instance())

      if (ethLookback) {
        const lastBlock = Utils.getLastBlock(ethAddresses.chainId)
        console.log('Starting with Ethereum lookback from block ' + lastBlock)
        const events = await ethController.queryFilter(
          ethController.filters.SharePriceChangeLog(),
          lastBlock,
          'latest',
        )

        for (const event of events) {
          await ethControllerHandler.handleHardWork(
            event.args.vault,
            event.args.strategy,
            event.args.oldSharePrice,
            event.args.newSharePrice,
            event.args.timestamp,
            await event.getTransactionReceipt(),
            ethAddresses,
          )
          await Utils.sleep(500)
        }
        console.log('Ethereum lookback done.')
      }

      ethController.on(
        ethController.filters.SharePriceChangeLog(),
        async (vault, strategy, oldSharePrice, newSharePrice, timestamp, event) => {
          await ethControllerHandler.handleHardWork(
            vault,
            strategy,
            oldSharePrice,
            newSharePrice,
            timestamp,
            await event.getTransactionReceipt(),
            ethAddresses,
          )
        },
      )
      console.log('Subscribed to Ethereum controller events.')
    }

    const polygonEnabled = config.polygon.enabled || false
    if (polygonEnabled) {
      const polygonProvider = new ethers.providers.JsonRpcProvider(config.polygon.provider)
      const polygonLookback = config.polygon.lookbackHarvests || false
      const polygonAddresses = new Addresses('polygon')
      const polygonController = Controller__factory.connect(
        polygonAddresses.controller,
        polygonProvider,
      )
      const polygonControllerHandler = new ControllerHandler(
        polygonProvider,
        cacheProvider.instance(),
      )

      if (polygonLookback) {
        const lastBlock = Utils.getLastBlock(polygonAddresses.chainId)
        console.log('Starting with Polygon lookback from block ' + lastBlock)
        const events = await polygonController.queryFilter(
          polygonController.filters.SharePriceChangeLog(),
          lastBlock,
          'latest',
        )

        for (const event of events) {
          await polygonControllerHandler.handleHardWork(
            event.args.vault,
            event.args.strategy,
            event.args.oldSharePrice,
            event.args.newSharePrice,
            event.args.timestamp,
            await event.getTransactionReceipt(),
            polygonAddresses,
          )
          await Utils.sleep(500)
        }
        console.log('Polygon lookback done.')
      }

      polygonController.on(
        polygonController.filters.SharePriceChangeLog(),
        async (vault, strategy, oldSharePrice, newSharePrice, timestamp, event) => {
          await polygonControllerHandler.handleHardWork(
            vault,
            strategy,
            oldSharePrice,
            newSharePrice,
            timestamp,
            await event.getTransactionReceipt(),
            polygonAddresses,
          )
        },
      )
      console.log('Subscribed to Polygon controller events.')
    }

    const bscEnabled = config.bsc.enabled || false
    if (bscEnabled) {
      const bscProvider = new ethers.providers.JsonRpcProvider(config.bsc.provider)
      const bscLookback = config.bsc.lookbackHarvests || false
      const bscAddresses = new Addresses('bsc')
      const bscController = Controller__factory.connect(bscAddresses.controller, bscProvider)
      const bscControllerHandler = new ControllerHandler(bscProvider, cacheProvider.instance())
      if (bscLookback) {
        const lastBlock = Utils.getLastBlock(bscAddresses.chainId)
        console.log('Starting with BSC lookback from block ' + lastBlock)
        const events = await bscController.queryFilter(
          bscController.filters.SharePriceChangeLog(),
          lastBlock,
          'latest',
        )

        for (const event of events) {
          await bscControllerHandler.handleHardWork(
            event.args.vault,
            event.args.strategy,
            event.args.oldSharePrice,
            event.args.newSharePrice,
            event.args.timestamp,
            await event.getTransactionReceipt(),
            bscAddresses,
          )
          await Utils.sleep(500)
        }
        console.log('BSC lookback done.')
      }

      bscController.on(
        bscController.filters.SharePriceChangeLog(),
        async (vault, strategy, oldSharePrice, newSharePrice, timestamp, event) => {
          await bscControllerHandler.handleHardWork(
            vault,
            strategy,
            oldSharePrice,
            newSharePrice,
            timestamp,
            await event.getTransactionReceipt(),
            bscAddresses,
          )
        },
      )
      console.log('Subscribed to BSC controller events.')
    }

    const arbitrumEnabled = config.arbitrum.enabled || false
    if (arbitrumEnabled) {
      const arbitrumProvider = new ethers.providers.JsonRpcProvider(config.arbitrum.provider)
      const arbitrumLookback = config.arbitrum.lookbackHarvests || false
      const arbitrumAddresses = new Addresses('arbitrum')
      const arbitrumController = Controller__factory.connect(
        arbitrumAddresses.controller,
        arbitrumProvider,
      )
      const arbitrumControllerHandler = new ControllerHandler(
        arbitrumProvider,
        cacheProvider.instance(),
      )
      if (arbitrumLookback) {
        const lastBlock = Utils.getLastBlock(arbitrumAddresses.chainId)
        console.log('Starting with arbitrum lookback from block ' + lastBlock)
        const events = await arbitrumController.queryFilter(
          arbitrumController.filters.SharePriceChangeLog(),
          lastBlock,
          'latest',
        )

        for (const event of events) {
          await arbitrumControllerHandler.handleHardWork(
            event.args.vault,
            event.args.strategy,
            event.args.oldSharePrice,
            event.args.newSharePrice,
            event.args.timestamp,
            await event.getTransactionReceipt(),
            arbitrumAddresses,
          )
          await Utils.sleep(500)
        }
        console.log('arbitrum lookback done.')
      }

      arbitrumController.on(
        arbitrumController.filters.SharePriceChangeLog(),
        async (vault, strategy, oldSharePrice, newSharePrice, timestamp, event) => {
          await arbitrumControllerHandler.handleHardWork(
            vault,
            strategy,
            oldSharePrice,
            newSharePrice,
            timestamp,
            await event.getTransactionReceipt(),
            arbitrumAddresses,
          )
        },
      )
      console.log('Subscribed to arbitrum controller events.')
    }

    const baseEnabled = config.base.enabled || false
    if (baseEnabled) {
      const baseProvider = new ethers.providers.JsonRpcProvider(config.base.provider)
      const baseLookback = config.base.lookbackHarvests || false
      const baseAddresses = new Addresses('base')
      const baseController = Controller__factory.connect(baseAddresses.controller, baseProvider)
      const baseControllerHandler = new ControllerHandler(baseProvider, cacheProvider.instance())
      if (baseLookback) {
        const lastBlock = Utils.getLastBlock(baseAddresses.chainId)
        console.log('Starting with base lookback from block ' + lastBlock)
        const events = await baseController.queryFilter(
          baseController.filters.SharePriceChangeLog(),
          lastBlock,
          'latest',
        )

        for (const event of events) {
          await baseControllerHandler.handleHardWork(
            event.args.vault,
            event.args.strategy,
            event.args.oldSharePrice,
            event.args.newSharePrice,
            event.args.timestamp,
            await event.getTransactionReceipt(),
            baseAddresses,
          )
          await Utils.sleep(500)
        }
        console.log('base lookback done.')
      }

      baseController.on(
        baseController.filters.SharePriceChangeLog(),
        async (vault, strategy, oldSharePrice, newSharePrice, timestamp, event) => {
          await baseControllerHandler.handleHardWork(
            vault,
            strategy,
            oldSharePrice,
            newSharePrice,
            timestamp,
            await event.getTransactionReceipt(),
            baseAddresses,
          )
        },
      )
      console.log('Subscribed to base controller events.')
    }

    const zksyncEnabled = config.zksync.enabled || false
    if (zksyncEnabled) {
      const zksyncProvider = new ethers.providers.JsonRpcProvider(config.zksync.provider)
      const zksyncLookback = config.zksync.lookbackHarvests || false
      const zksyncAddresses = new Addresses('zksync')
      const zksyncController = Controller__factory.connect(
        zksyncAddresses.controller,
        zksyncProvider,
      )
      const zksyncControllerHandler = new ControllerHandler(
        zksyncProvider,
        cacheProvider.instance(),
      )
      if (zksyncLookback) {
        const lastBlock = Utils.getLastBlock(zksyncAddresses.chainId)
        console.log('Starting with zksync lookback from block ' + lastBlock)
        const events = await zksyncController.queryFilter(
          zksyncController.filters.SharePriceChangeLog(),
          lastBlock,
          'latest',
        )

        for (const event of events) {
          await zksyncControllerHandler.handleHardWork(
            event.args.vault,
            event.args.strategy,
            event.args.oldSharePrice,
            event.args.newSharePrice,
            event.args.timestamp,
            await event.getTransactionReceipt(),
            zksyncAddresses,
          )
          await Utils.sleep(500)
        }
        console.log('zksync lookback done.')
      }

      zksyncController.on(
        zksyncController.filters.SharePriceChangeLog(),
        async (vault, strategy, oldSharePrice, newSharePrice, timestamp, event) => {
          await zksyncControllerHandler.handleHardWork(
            vault,
            strategy,
            oldSharePrice,
            newSharePrice,
            timestamp,
            await event.getTransactionReceipt(),
            zksyncAddresses,
          )
        },
      )
      console.log('Subscribed to zksync controller events.')
    }

    const hyperevmEnabled = config.hyperevm.enabled || false
    if (hyperevmEnabled) {
      const hyperevmProvider = new ethers.providers.JsonRpcProvider(config.hyperevm.provider)
      const hyperevmLookback = config.hyperevm.lookbackHarvests || false
      const hyperevmAddresses = new Addresses('hyperevm')
      const hyperevmController = Controller__factory.connect(
        hyperevmAddresses.controller,
        hyperevmProvider,
      )
      const hyperevmControllerHandler = new ControllerHandler(
        hyperevmProvider,
        cacheProvider.instance(),
      )
      if (hyperevmLookback) {
        const lastBlock = Utils.getLastBlock(hyperevmAddresses.chainId)
        console.log('Starting with hyperevm lookback from block ' + lastBlock)
        const events = await hyperevmController.queryFilter(
          hyperevmController.filters.SharePriceChangeLog(),
          lastBlock,
          'latest',
        )

        for (const event of events) {
          await hyperevmControllerHandler.handleHardWork(
            event.args.vault,
            event.args.strategy,
            event.args.oldSharePrice,
            event.args.newSharePrice,
            event.args.timestamp,
            await event.getTransactionReceipt(),
            hyperevmAddresses,
          )
          await Utils.sleep(500)
        }
        console.log('hyperevm lookback done.')
      }

      hyperevmController.on(
        hyperevmController.filters.SharePriceChangeLog(),
        async (vault, strategy, oldSharePrice, newSharePrice, timestamp, event) => {
          await hyperevmControllerHandler.handleHardWork(
            vault,
            strategy,
            oldSharePrice,
            newSharePrice,
            timestamp,
            await event.getTransactionReceipt(),
            hyperevmAddresses,
          )
        },
      )
      console.log('Subscribed to hyperevm controller events.')
    }
  }
}
