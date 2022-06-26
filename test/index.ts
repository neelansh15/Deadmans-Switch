import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { DeadmansSwitch } from "../typechain";

describe("Deadman's Switch", function () {

  let account0: SignerWithAddress, account1: SignerWithAddress, deadman: DeadmansSwitch

  this.beforeAll(async function () {
    const [_account0, _account1] = await ethers.getSigners()
    account0 = _account0
    account1 = _account1

    const Deadman = await ethers.getContractFactory('DeadmansSwitch')
    deadman = await Deadman.deploy(_account1.address)
  })

  it("Should Accept Ether", async function () {
    let ethBalance = +formatEther(await deadman.provider.getBalance(deadman.address))
    // console.log("Final Ether balance of Contract", ethBalance)

    const amount = 1
    const result = await account0.sendTransaction({
      to: deadman.address,
      value: parseEther(amount.toString())
    })
    await result.wait(1)

    ethBalance = +formatEther(await deadman.provider.getBalance(deadman.address))
    // console.log("Final Ether balance of Contract", ethBalance)

    expect(ethBalance).to.equal(amount)
  })

  it("Should not transfer funds if still alive", async function () {
    const emergencyAddress = await deadman.emergencyAddress()

    const blockFrequency = (await deadman.blockFrequency()).toNumber() / 2
    const blockFrequencyHex = '0x' + blockFrequency.toString(16)

    // Mine "blockFrequency / 2 = 10 / 2 = 5" blocks
    await network.provider.send("hardhat_mine", [blockFrequencyHex])

    const initialBalance = await ethers.provider.getBalance(emergencyAddress)

    await deadman.rescueFunds()

    const finalBalance = await ethers.provider.getBalance(emergencyAddress)

    expect(finalBalance).to.be.equal(initialBalance)
  })

  it("Should Transfer Ether to emergencyAddress if deadman", async function () {
    const emergencyAddress = await deadman.emergencyAddress()

    const blockFrequency = (await deadman.blockFrequency()).toNumber()
    const blockFrequencyHex = '0x' + blockFrequency.toString(16)

    // Mine 'blockFrequency = 10' blocks
    await network.provider.send("hardhat_mine", [blockFrequencyHex])

    const initialBalance = await ethers.provider.getBalance(emergencyAddress)
    const contractBalance = await ethers.provider.getBalance(deadman.address)

    await deadman.rescueFunds()

    const finalBalance = await ethers.provider.getBalance(emergencyAddress)

    expect(finalBalance).to.be.equal(initialBalance.add(contractBalance))
  })
});
