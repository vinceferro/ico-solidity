import { task } from "hardhat/config"
import { TaskArguments } from "hardhat/types"

import { SpaceCoinToken } from "../../src/types/SpaceCoinToken"
import { SpaceCoinToken__factory } from "../../src/types/factories/SpaceCoinToken__factory"

task("deploy:SpaceCoinToken")
  .addParam("deployer", "The address of the deployer account")
  .addParam("treasury", "The address of the treasury account")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const deployer = await ethers.getSigner(taskArguments.deployer)
    const treasury = await ethers.getSigner(taskArguments.treasury)
    if (!deployer || !treasury) {
      throw new Error("Invalid deployer or treasury address")
    }
    const tokenFactory: SpaceCoinToken__factory = <SpaceCoinToken__factory>await ethers.getContractFactory("SpaceCoinToken");
    const token: SpaceCoinToken = <SpaceCoinToken>await tokenFactory.connect(deployer).deploy(treasury.address);
    await token.deployed();
    console.log("SpaceCoinToken deployed to: ", token.address);
  });
