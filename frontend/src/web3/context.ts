import React, {createContext} from 'react'
import type {Web3Provider, JsonRpcSigner} from '@ethersproject/providers'

export type Web3Context = {
    provider?: Web3Provider;
    signer?: JsonRpcSigner;
};

let web3Context : React.Context<Web3Context> | undefined = undefined

export const getWeb3Context = () => {
    if (web3Context === undefined) {
        web3Context = createContext<Web3Context>({})
    }
    return web3Context
}