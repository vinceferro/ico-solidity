import { ethers } from "ethers"
import type { Web3Context } from "./context";

declare global {
  interface Window { ethereum?: any; }
}

export const connectToMetamask = async (): Promise<Web3Context> => {
  if (window.ethereum === undefined) {
    throw new Error("No Web3 compatible wallet detected")
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  try {
    console.log("Signed in", await signer.getAddress())
    return {
      provider,
      signer,
    }
  }
  catch(err) {
    console.log("Not signed in")
    await provider.send("eth_requestAccounts", [])
    return {}
  }
}