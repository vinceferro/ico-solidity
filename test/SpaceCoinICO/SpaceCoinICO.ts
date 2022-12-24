import { artifacts, ethers, waffle } from "hardhat"
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"

import { Signers } from "../types"
import type { SpaceCoinToken } from "../../src/types/SpaceCoinToken"
import { shouldBehaveLikeSpaceCoinICO } from "./SpaceCoinICO.behavior"

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    this.tokenArtifact = await artifacts.readArtifact("SpaceCoinToken");
    this.icoArtifact = await artifacts.readArtifact("SpaceCoinICO");

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.owner = signers[0];
    this.signers.treasury = signers[1];
    this.signers.icoInvestor1 = signers[2];
    this.signers.icoInvestor2 = signers[3];
    this.signers.buyer1 = signers[4];
    this.signers.buyer2 = signers[5];

    this.token = <SpaceCoinToken>await waffle.deployContract(this.signers.owner, this.tokenArtifact, [this.signers.treasury.address]);
  });

  describe("SpaceCoinICO", function () {
    shouldBehaveLikeSpaceCoinICO();
  });
});
