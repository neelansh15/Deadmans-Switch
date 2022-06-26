// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { writeFileSync } from "fs";
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Deadman = await ethers.getContractFactory("DeadmansSwitch");
  const deadman = await Deadman.deploy("0xf475D99Be3241c69454eA8AF7B12F38078F697bc");

  await deadman.deployed();

  console.log("Deadman's Switch deployed to:", deadman.address);

  const data = JSON.stringify({
    address: deadman.address,
    abi: JSON.parse(deadman.interface.format('json') as string)
  })

  writeFileSync('./abis/DeadmansSwitch.json', data)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
