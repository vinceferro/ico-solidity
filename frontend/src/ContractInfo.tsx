import React, { useContext, useEffect, useState } from 'react'

import { Web3Context, getWeb3Context } from './web3'
import { SpaceCoinICO, SpaceCoinICO__factory } from '../../src/types'
import { BigNumber, ethers } from 'ethers'

const ICO_ADDRESS = "0x2836CE10c953E4Ad5f77FEe956db1531E2423A77"

type Phase = [string, BigNumber, BigNumber, BigNumber, boolean, boolean] & {
  code: string;
  target: BigNumber;
  individualTotalCap: BigNumber;
  collected: BigNumber;
  shouldReleaseTokens: boolean;
  openToAll: boolean;
}

type ContractInfo = {
  owner: string;
  phase: Phase;
  raised: BigNumber;
  raising: boolean;
  target: BigNumber;
  token: string;
}

type Position = {
  isOwner: boolean;
  isWhitelisted: boolean;
  invested: BigNumber;
}

export const ContractInfo = () => {
  const web3 = useContext<Web3Context>(getWeb3Context())
  const [contract, setContract] = useState<SpaceCoinICO>()
  const [position, setPosition] = useState<Position>()
  const [contractInfo, setContractInfo] = useState<ContractInfo>()
  const [amount, setAmount] = useState<number>(0)

  useEffect(() => {
    const loadContractData = async () => {
      const ico = SpaceCoinICO__factory.connect(ICO_ADDRESS, web3.signer!)
      setContract(ico)
    }
    loadContractData()
      .catch(console.error)
  }, [web3])

  useEffect(() => {
    if (!contract) return;
    const loadPosition = async () => {
      const cOwner = await contract.owner()
      const signerAddr = await web3.signer?.getAddress()
      const whitelist = await contract.whitelistedInvestors(signerAddr)
      const invested = await contract.investorsBalances(signerAddr)
      setPosition({
        isOwner: cOwner === signerAddr,
        isWhitelisted: whitelist,
        invested
      })
    }

    const loadContractInfo = async () => {
      const cPhase = await contract.currentPhase()
      const phase = await contract.phases(cPhase)
      const target = await contract.ICO_TARGET()
      const token = await contract.token()
      const owner = await contract.owner()
      const raising = await contract.fundraisingEnabled()
      const raised = await contract.totalRaised()
      setContractInfo({
        owner,
        phase,
        target,
        token,
        raised,
        raising,
      })
    }    
    
    loadPosition().catch(console.error)
    loadContractInfo().catch(console.error)
  
  }, [web3, contract])

  const formatEther = (value?: BigNumber) : string => {
    return ethers.utils.formatEther(value ?? 0) + " ETH"
  }

  const canInvest = () : boolean => {
    return (contractInfo?.raising && position?.isWhitelisted) ?? false
  }

  const onToggleFundraisingClick = async () => {
    await contract?.toggleFundraisingEnabled()
    const raising = await contract?.fundraisingEnabled()
    setContractInfo({...contractInfo, raising})
  }

  const handleInvest = async (e) => {
    e.preventDefault()
    if (!contract) return
    const weiAmount = ethers.utils.parseUnits(amount.toString(), 18)
    await contract?.invest({value: weiAmount})
    setAmount(0)
    const loadPosition = async () => {
      const cOwner = await contract.owner()
      const signerAddr = await web3.signer?.getAddress()
      const whitelist = await contract.whitelistedInvestors(signerAddr)
      const invested = await contract.investorsBalances(signerAddr)
      setPosition({
        isOwner: cOwner === signerAddr,
        isWhitelisted: whitelist,
        invested
      })
    }
    loadPosition().catch(console.error)
  }

  return (
    <>
      <div><b>Contract Info</b></div>
      <div>Owner: {contractInfo?.owner}</div>
      <div>Token: {contractInfo?.token}</div>
      <div>ICO Target: {formatEther(contractInfo?.target)}</div>
      <div>Raising: {contractInfo?.raising ? 'yes' : 'no'}</div>
      {position?.isOwner && (
        <button onClick={onToggleFundraisingClick}>Toggle Raising</button>
      )}
      <br />
      <div><b>Phase</b></div>
      <div>Code: {contractInfo?.phase.code}</div>
      <div>Target: {formatEther(contractInfo?.phase.target)}</div>
      <div>Total Raised: {formatEther(contractInfo?.raised)}</div>
      <div>Individual total cap: {formatEther(contractInfo?.phase.individualTotalCap)}</div>
      <div>Releasing Tokens: {contractInfo?.phase.shouldReleaseTokens ? 'yes' : 'no'}</div>
      <div>Open To All: {contractInfo?.phase.openToAll ? 'yes' : 'no'}</div><br />
      <div><b>Your Position:</b></div>
      <div>Owner: {position?.isOwner ? 'yes' : 'no'}</div>
      <div>Whitelisted: {position?.isWhitelisted ? 'yes' : 'no'}</div>
      <div>Invested: {formatEther(position?.invested)}</div>
      {canInvest() ? (
        <div>
          <form onSubmit={handleInvest}>
            <h1>Invest</h1>
            <label htmlFor='amount'>Amount</label>
            <input value={amount} onChange={e => setAmount(parseInt(e.target.value))} type='number' id='amount' />
            <input type='submit' value='Invest' />
          </form>
        </div>
       ) : "Can't invest at the moment"
      }
    </>
  )
}