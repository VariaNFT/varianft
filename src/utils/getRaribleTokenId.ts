import axios from 'axios'
import { ChainId } from '@usedapp/core'

const RaribleAPIMap = {
  [ChainId.Mainnet]: 'https://api.rarible.com/protocol/v0.1/',
  [ChainId.Rinkeby]: 'https://api-staging.rarible.com/protocol/v0.1/',
  [ChainId.Ropsten]: 'https://api-dev.rarible.com/protocol/v0.1/',
}

export function getRaribleTokenId (chainId: number, contract: string, account: string): Promise<string> {
  if (chainId !== ChainId.Mainnet && chainId !== ChainId.Rinkeby && chainId !== ChainId.Ropsten) return Promise.resolve('error')
  return axios.get(RaribleAPIMap[chainId] + `ethereum/nft/collections/${contract}/generate_token_id?minter=${account}`)
    .then(res => res.data.tokenId as string)
}
