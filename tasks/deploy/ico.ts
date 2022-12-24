import { task } from "hardhat/config"
import { TaskArguments } from "hardhat/types"

import { SpaceCoinICO } from "../../src/types/SpaceCoinICO"
import { SpaceCoinICO__factory } from "../../src/types/factories/SpaceCoinICO__factory"

task("deploy:SpaceCoinICO")
  .addParam("deployer", "The address of the deployer account")
  .addParam("token", "The address of the token")
  .addOptionalVariadicPositionalParam("whitelist", "The addresses of the whitelisted investors")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const deployer = await ethers.getSigner(taskArguments.deployer)
    if (!deployer) {
      throw new Error("Invalid deployer or treasury address")
    }
    const icoFactory: SpaceCoinICO__factory = <SpaceCoinICO__factory>await ethers.getContractFactory("SpaceCoinICO");
    const ico: SpaceCoinICO = <SpaceCoinICO>await icoFactory.connect(deployer).deploy(taskArguments.token, taskArguments.whitelist);
    await ico.deployed();
    console.log("SpaceCoinICO deployed to: ", ico.address);
  });
