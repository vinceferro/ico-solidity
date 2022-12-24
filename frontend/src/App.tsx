import React, { useEffect, useState } from 'react'

import type { Web3Context } from './web3'
import { connectToMetamask, getWeb3Context } from './web3'
import { ContractInfo } from './ContractInfo'

const Web3Context = getWeb3Context()

export const App = () => {
  const [web3, setWeb3] = useState<Web3Context>({})
  const [address, setAddress] = useState<string>()


  useEffect(() => {
    const loadChainData = async () => {
      const network = await web3.provider?.getNetwork()
      return network
    }
      loadChainData()
      .catch(console.error)
  }, [web3])

  useEffect(() => {
    const loadAddress = async () => {
      const address = await web3.signer?.getAddress()
      setAddress(address)
    }
      loadAddress()
      .catch(console.error)
  }, [web3])

  const handleLogin = async () => {
    const newWeb3 = await connectToMetamask()
    setWeb3(newWeb3)
  }
  
  return (
    <Web3Context.Provider value={web3}>
      {!address && (
        <>
          <button onClick={handleLogin}>login</button>
        </>
      )}
      {address && (
        <>
          <p>Connected with address: {address}</p>
          <ContractInfo />
        </>
      )}
    </Web3Context.Provider>
  )
}