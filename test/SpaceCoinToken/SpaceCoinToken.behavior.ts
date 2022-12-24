import { expect } from "chai"
import { ethers, waffle } from "hardhat"

import type { SpaceCoinToken } from "../../src/types/SpaceCoinToken";

export function shouldBehaveLikeSpaceCoinToken(): void {
  beforeEach(async function () {
    this.token = <SpaceCoinToken>await waffle.deployContract(this.signers.owner, this.tokenArtifact, [this.signers.treasury.address]);
  })

  it("should have a total supply of 500,000 SPC", async function () {
    expect(await this.token.connect(this.signers.owner).totalSupply()).to.equal(ethers.utils.parseUnits("500000", await this.token.decimals()))
  })

  it("should mint the total supply to the treasury account", async function () {
    expect(await this.token.connect(this.signers.owner).balanceOf(this.signers.treasury.address)).to.equal(await this.token.totalSupply())
  })

  it("should allow the owner to toggle the transfer tax fee", async function () {
    const initialFlag = await this.token.transferTaxEnabled()
    await expect(this.token.connect(this.signers.treasury).toggleTransferTax()).to.be.revertedWith("E_OWNER_ONLY")
    await expect(this.token.connect(this.signers.owner).toggleTransferTax()).to.emit(this.token, "TransferTaxToggled")
    expect(await this.token.transferTaxEnabled()).to.equal(!initialFlag)
  })

  it("should send 2% of amount fee to treasury when transfering SPC", async function () {
    const decimals = await this.token.decimals();
    await this.token.connect(this.signers.treasury).transfer(this.signers.buyer1.address, ethers.utils.parseUnits("10", decimals))
    await expect(() => this.token.connect(this.signers.buyer1).transfer(this.signers.buyer2.address, ethers.utils.parseUnits("5", decimals))).to.changeTokenBalances(
      this.token,
      [this.signers.buyer1, this.signers.buyer2, this.signers.treasury],
      ["-5", "5", "0"].map(s => ethers.utils.parseUnits(s, decimals)),
    )

    await this.token.connect(this.signers.owner).toggleTransferTax()
    await expect(() => this.token.connect(this.signers.buyer2).transfer(this.signers.buyer1.address, ethers.utils.parseUnits("5", decimals))).to.changeTokenBalances(
      this.token,
      [this.signers.buyer2, this.signers.buyer1, this.signers.treasury],
      ["-5", "4.9", "0.1"].map(s => ethers.utils.parseUnits(s, decimals)),
    )
  })
}
