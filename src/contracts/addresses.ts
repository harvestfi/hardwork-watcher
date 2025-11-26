import config from '../../config.json'

export class Addresses {
  network: string
  chainId: string
  controller: string
  profitToken: string
  profitTokenName: string
  profitShare: string
  scanApiUrl: string
  scanUrl: string
  discord: string
  constructor(net: string) {
    if (net == 'eth') {
      this.network = 'Ethereum'
      this.chainId = '1'
      this.controller = '0x7583D7f36635E5642713ACCBdEd717ca59fdad07'
      this.profitToken = '0xa0246c9032bC3A600820415aE600c6388619A14D'
      this.profitTokenName = 'FARM'
      this.profitShare = '0xE20c31e3d08027F5AfACe84A3A46B7b3B165053c'
      this.scanApiUrl =
        'https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getsourcecode&apikey=' +
        config.eth.scanKey +
        '&address='
      this.scanUrl = 'https://etherscan.io/'
      this.discord = config.eth.discord
    } else if (net == 'polygon') {
      this.network = 'Polygon'
      this.chainId = '137'
      this.controller = '0xA8F156088ebFCc4530507e4E3d145e2FC1E6124e'
      this.profitToken = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
      this.profitTokenName = 'WETH'
      this.profitShare = '0xF066789028fE31D4f53B69B81b328B8218Cc0641'
      this.scanApiUrl =
        'https://api.etherscan.io/v2/api?chainid=137&module=contract&action=getsourcecode&apikey=' +
        config.polygon.scanKey +
        '&address='
      this.scanUrl = 'https://polygonscan.com/'
      this.discord = config.polygon.discord
    } else if (net == 'bsc') {
      this.network = 'BSC'
      this.chainId = '56'
      this.controller = '0x222412af183BCeAdEFd72e4Cb1b71f1889953b1C'
      this.profitToken = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'
      this.profitTokenName = 'WETH'
      this.profitShare = '0xf00dD244228F51547f0563e60bCa65a30FBF5f7f'
      this.scanApiUrl =
        'https://api.etherscan.io/v2/api?chainid=56&module=contract&action=getsourcecode&apikey=' +
        config.bsc.scanKey +
        '&address='
      this.scanUrl = 'https://bscscan.com/'
      this.discord = config.bsc.discord
    } else if (net == 'arbitrum') {
      this.network = 'Arbitrum'
      this.chainId = '42161'
      this.controller = '0x68B2FC1566f411C1Af8fF5bFDA3dD4F3F3e59D03'
      this.profitToken = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
      this.profitTokenName = 'WETH'
      this.profitShare = '0xf3D1A027E858976634F81B7c41B09A05A46EdA21'
      this.scanApiUrl =
        'https://api.etherscan.io/v2/api?chainid=42161&module=contract&action=getsourcecode&apikey=' +
        config.arbitrum.scanKey +
        '&address='
      this.scanUrl = 'https://arbiscan.io/'
      this.discord = config.arbitrum.discord
    } else if (net == 'base') {
      this.network = 'Base'
      this.chainId = '8453'
      this.controller = '0xF90FF0F7c8Db52bF1bF869F74226eAD125EFa745'
      this.profitToken = '0x4200000000000000000000000000000000000006'
      this.profitTokenName = 'WETH'
      this.profitShare = '0x97b3e5712CDE7Db13e939a188C8CA90Db5B05131'
      this.scanApiUrl =
        'https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getsourcecode&apikey=' +
        config.base.scanKey +
        '&address='
      this.scanUrl = 'https://basescan.org/'
      this.discord = config.base.discord
    } else if (net == 'zksync') {
      this.network = 'zkSync'
      this.chainId = '324'
      this.controller = '0xC04b19b91EBe5DFBE285C89ACDdDBa0f7258c2Be'
      this.profitToken = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'
      this.profitTokenName = 'WETH'
      this.profitShare = '0xD8CC993c30Cc70059348bf01E11b1e61497F6335'
      this.scanApiUrl =
        'https://api.etherscan.io/v2/api?chainid=324&module=contract&action=getsourcecode&apikey=' +
        config.zksync.scanKey +
        '&address='
      this.scanUrl = 'https://era.zksync.network/'
      this.discord = config.zksync.discord
    } else if (net == 'hyperevm') {
      this.network = 'HyperEVM'
      this.chainId = '999'
      this.controller = '0x292eB9d147566F6c6777f55Ff2b632D4673Ced29'
      this.profitToken = '0xBe6727B535545C67d5cAa73dEa54865B92CF7907'
      this.profitTokenName = 'UETH'
      this.profitShare = '0xCD719739C3Ece8b576D649BE97195aD03e676a2c'
      this.scanApiUrl =
        'https://api.etherscan.io/v2/api?chainid=999&module=contract&action=getsourcecode&apikey=' +
        config.hyperevm.scanKey +
        '&address='
      this.scanUrl = 'https://hyperevmscan.io/'
      this.discord = config.hyperevm.discord
    } else {
      throw Error('Unknown network ' + net)
    }
  }
}
