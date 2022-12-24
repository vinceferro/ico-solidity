import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import type { Fixture } from "ethereum-waffle"
import type { Artifact } from 'hardhat/types'
import type { SpaceCoinICO } from "../src/types/SpaceCoinICO"
import type { SpaceCoinToken } from "../src/types/SpaceCoinToken"

declare module "mocha" {
  export interface Context {
    tokenArtifact: Artifact;
    token: SpaceCoinToken;
    icoArtifact: Artifact;
    ico: SpaceCoinICO;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  owner: SignerWithAddress;
  treasury: SignerWithAddress;
  icoInvestor1: SignerWithAddress;
  icoInvestor2: SignerWithAddress;
  buyer1: SignerWithAddress;
  buyer2: SignerWithAddress;
}
