import { expect } from "chai"
import { ethers, waffle } from "hardhat"

import type { SpaceCoinICO } from "../../src/types/SpaceCoinICO"

export function shouldBehaveLikeSpaceCoinICO(): void {
  beforeEach(async function () {
    this.ico = <SpaceCoinICO>await waffle.deployContract(
        this.signers.owner,
        this.icoArtifact,
        [
            this.token.address,
            [this.signers.icoInvestor1.address, this.signers.icoInvestor2.address],
        ]
    )
    expect(await this.ico.currentPhase()).to.eq(0)
  })

  it("should allow the owner to advance to the next phase", async function () {
    await expect(this.ico.connect(this.signers.treasury).moveToPhase(1)).to.be.revertedWith("E_OWNER_ONLY")
    await expect(this.ico.connect(this.signers.owner).moveToPhase(1)).to.emit(this.ico, "PhaseChanged")
    expect(await this.ico.currentPhase()).to.eq(1)
  })

  it("should allow the owner to add more investors", async function () {
    const investors = [this.signers.buyer1.address, this.signers.buyer2.address]
    await expect(this.ico.connect(this.signers.treasury).addAddressesToWhitelist(investors)).to.be.revertedWith("E_OWNER_ONLY")
    await expect(this.ico.connect(this.signers.owner).addAddressesToWhitelist(investors)).to.be.ok
  })

  it("should allow the owner to toggle the fundraising", async function () {
    const initialFlag = await this.ico.fundraisingEnabled();
    await expect(this.ico.connect(this.signers.treasury).toggleFundraisingEnabled()).to.be.revertedWith("E_OWNER_ONLY")
    await expect(this.ico.connect(this.signers.owner).toggleFundraisingEnabled()).to.emit(this.ico, "FoundraisingEnabledChanged")
    expect(await this.ico.fundraisingEnabled()).to.equal(!initialFlag)
  })

  it("should allow funding only when fundraising is enabled", async function () {
    await expect(this.ico.connect(this.signers.icoInvestor1).invest({value: ethers.utils.parseEther("1")})).to.be.revertedWith("E_FUNDRAISING_DISABLED")
    await expect(this.ico.connect(this.signers.owner).toggleFundraisingEnabled()).to.emit(this.ico, "FoundraisingEnabledChanged")
    await expect(() => this.ico.connect(this.signers.icoInvestor1).invest({value: ethers.utils.parseEther("1")})).to.changeEtherBalances(
        [this.signers.icoInvestor1, this.ico],
        ["-1", "1"].map(s => ethers.utils.parseEther(s)),
    )
    await expect(this.ico.connect(this.signers.buyer1).invest({value: ethers.utils.parseEther("1")})).to.be.revertedWith("E_NOT_WHITELISTED")
  })

  it("should limit funding to 1500 ether during SEED phase", async function () {
    await expect(this.ico.connect(this.signers.owner).toggleFundraisingEnabled()).to.emit(this.ico, "FoundraisingEnabledChanged")
    await expect(() => this.ico.connect(this.signers.icoInvestor1).invest({value: ethers.utils.parseEther("1500")})).to.changeEtherBalances(
        [this.signers.icoInvestor1, this.ico],
        ["-1500", "1500"].map(s => ethers.utils.parseEther(s)),
    )

    await expect(this.ico.connect(this.signers.icoInvestor1).invest({value: 1})).to.be.revertedWith("E_INDIVIDUAL_CAP_OVERFLOW")
  })

  it("should limit the total funding to 15000 ether during SEED phase", async function () {
    await expect(this.ico.connect(this.signers.owner).toggleFundraisingEnabled()).to.emit(this.ico, "FoundraisingEnabledChanged")
    const signers = (await ethers.getSigners()).slice(10, 20)
    await this.ico.connect(this.signers.owner).addAddressesToWhitelist(signers.map(s => s.address))
    
    await Promise.all(signers.map(async signer => {
      await expect(() => this.ico.connect(signer).invest({value: ethers.utils.parseEther("1500")})).to.changeEtherBalances(
        [signer, this.ico],
        ["-1500", "1500"].map(s => ethers.utils.parseEther(s)),
      )
    }))
    
    await expect((await this.ico.phases(0)).collected).to.equal(ethers.utils.parseEther("15000"))
    await expect(this.ico.connect(this.signers.icoInvestor1).invest({value: 1})).to.be.revertedWith("E_PHASE_TARGET_REACHED")
  })

  it("should limit combined funding to 1000 ether during GENERAL phase", async function () {
    await expect(this.ico.connect(this.signers.owner).toggleFundraisingEnabled()).to.emit(this.ico, "FoundraisingEnabledChanged")
    await expect(() => this.ico.connect(this.signers.icoInvestor1).invest({value: ethers.utils.parseEther("1500")})).to.changeEtherBalances(
      [this.signers.icoInvestor1, this.ico],
      ["-1500", "1500"].map(s => ethers.utils.parseEther(s)),
    )
    await expect(() => this.ico.connect(this.signers.icoInvestor2).invest({value: ethers.utils.parseEther("999")})).to.changeEtherBalances(
      [this.signers.icoInvestor2, this.ico],
      ["-999", "999"].map(s => ethers.utils.parseEther(s)),
    )

    await expect(this.ico.connect(this.signers.owner).moveToPhase(1)).to.emit(this.ico, "PhaseChanged")
    
    await expect(this.ico.connect(this.signers.icoInvestor1).invest({value: ethers.utils.parseEther("1000")})).to.be.revertedWith("E_INDIVIDUAL_CAP_OVERFLOW")
    await expect(this.ico.connect(this.signers.icoInvestor2).invest({value: ethers.utils.parseEther("2")})).to.be.revertedWith("E_INDIVIDUAL_CAP_OVERFLOW")
    
    await expect(() => this.ico.connect(this.signers.icoInvestor2).invest({value: ethers.utils.parseEther("1")})).to.changeEtherBalances(
      [this.signers.icoInvestor2, this.ico],
      ["-1", "1"].map(s => ethers.utils.parseEther(s)),
    )

    await expect(() => this.ico.connect(this.signers.buyer1).invest({value: ethers.utils.parseEther("1")})).to.changeEtherBalances(
      [this.signers.buyer1, this.ico],
      ["-1", "1"].map(s => ethers.utils.parseEther(s)),
    )

  })

  it("should limit the total funding to 30000 ether during GENERAL phase", async function () {
    await expect(this.ico.connect(this.signers.owner).toggleFundraisingEnabled()).to.emit(this.ico, "FoundraisingEnabledChanged")
    const seedSigners = (await ethers.getSigners()).slice(10, 20)
    await this.ico.connect(this.signers.owner).addAddressesToWhitelist(seedSigners.map(s => s.address))
    
    await Promise.all(seedSigners.map(async signer => {
      await expect(() => this.ico.connect(signer).invest({value: ethers.utils.parseEther("1500")})).to.changeEtherBalances(
        [signer, this.ico],
        ["-1500", "1500"].map(s => ethers.utils.parseEther(s)),
      )
    }))

    await expect(this.ico.connect(this.signers.owner).moveToPhase(1)).to.emit(this.ico, "PhaseChanged")

    const generalSigners = (await ethers.getSigners()).slice(20, 30)
    await Promise.all(generalSigners.map(async signer => {
      await expect(() => this.ico.connect(signer).invest({value: ethers.utils.parseEther("1000")})).to.changeEtherBalances(
        [signer, this.ico],
        ["-1000", "1000"].map(s => ethers.utils.parseEther(s)),
      )
    }))
  })

  it("should distribute tokens when moving to OPEN phase", async function () {
    await expect(this.ico.connect(this.signers.owner).toggleFundraisingEnabled()).to.emit(this.ico, "FoundraisingEnabledChanged")
    const seedSigners = (await ethers.getSigners()).slice(10, 15)
    await this.ico.connect(this.signers.owner).addAddressesToWhitelist(seedSigners.map(s => s.address))
    
    await Promise.all(seedSigners.map(async signer => {
      await expect(() => this.ico.connect(signer).invest({value: ethers.utils.parseEther("1500")})).to.changeEtherBalances(
        [signer, this.ico],
        ["-1500", "1500"].map(s => ethers.utils.parseEther(s)),
      )
    }))

    await expect(this.ico.connect(this.signers.owner).moveToPhase(1)).to.emit(this.ico, "PhaseChanged")

    const generalSigners = (await ethers.getSigners()).slice(15, 20)
    await Promise.all(generalSigners.map(async signer => {
      await expect(() => this.ico.connect(signer).invest({value: ethers.utils.parseEther("1000")})).to.changeEtherBalances(
        [signer, this.ico],
        ["-1000", "1000"].map(s => ethers.utils.parseEther(s)),
      )
    }))

    const exchangeRate = await this.ico.EXCHANGE_RATE()
    await expect(this.token.connect(this.signers.treasury).transfer(this.ico.address, ethers.utils.parseEther("30000").mul(exchangeRate))).to.emit(this.token, "Transfer")
    
    await expect(this.ico.connect(this.signers.owner).moveToPhase(2)).to.be.ok

    await expect(() => this.ico.connect(this.signers.buyer1).invest({value: ethers.utils.parseEther("1")})).to
      .changeTokenBalances(this.token,
        [this.signers.buyer1, this.ico],
        ["5", "-5"].map(s => ethers.utils.parseEther(s))
      )

    await expect(() => this.ico.connect(seedSigners[0]).withdrawTokens(ethers.utils.parseEther("1500"))).to
      .changeTokenBalance(
        this.token,
        seedSigners[0],
        ethers.utils.parseEther("1500").mul(5)
      )
  })

  it("should only have 3 phases", async function () {
    await expect(this.ico.connect(this.signers.owner).moveToPhase(1)).to.emit(this.ico, "PhaseChanged")
    await expect(this.ico.connect(this.signers.owner).moveToPhase(2)).to.emit(this.ico, "PhaseChanged")
    await expect(this.ico.connect(this.signers.owner).moveToPhase(3)).to.revertedWith("E_PHASE_INVALID")
  })
}
