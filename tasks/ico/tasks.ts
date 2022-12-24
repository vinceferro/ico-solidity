import { task } from "hardhat/config"
import { TaskArguments } from "hardhat/types"

import { SpaceCoinToken } from "../../src/types/SpaceCoinToken"
import { SpaceCoinToken__factory } from "../../src/types/factories/SpaceCoinToken__factory"

import { SpaceCoinICO } from "../../src/types/SpaceCoinICO"
import { SpaceCoinICO__factory } from "../../src/types/factories/SpaceCoinICO__factory"

task("ico:fund")
  .addParam("treasury", "The treasury account")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const tokenAddress : string = process.env.TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
    const icoAddress : string = process.env.ICO_ADDRESS || "0x0000000000000000000000000000000000000000";
    const treasury = await ethers.getSigner(taskArguments.treasury)
    if (!treasury) {
      throw new Error("Invalid deployer or treasury address")
    }
    const tokenFactory: SpaceCoinToken__factory = <SpaceCoinToken__factory>await ethers.getContractFactory("SpaceCoinToken")
    const token: SpaceCoinToken = <SpaceCoinToken>await tokenFactory.attach(tokenAddress)
    await token.connect(treasury).transfer(icoAddress, ethers.utils.parseEther("30000").mul(5))
    console.log("SpaceCoinICO funded")
  });
