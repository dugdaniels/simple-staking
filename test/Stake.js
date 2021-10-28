const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stake contract", () => {
  let tokenSupply = 1_000_000;
  let stake, acct1, acct2;
  const minStake = 20;
  const amount = 100;

  beforeEach(async () => {
    [acct1, acct2] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy("Test Token", "T_T", tokenSupply);

    const Stake = await ethers.getContractFactory("Stake");
    stake = await Stake.deploy(minStake, testToken.address);

    testToken.increaseAllowance(stake.address, amount);
  });

  it("Deploys successfully", async () => {  
    expect(stake.address).to.not.equal(0);
  });

  it("Has a minimum stake", async () => { 
    expect(await stake.minStake()).to.equal(minStake);
  });

  describe("Stake", () => {
    it("should allow staking", async () => {
      await stake.stake(amount);
      expect(await stake.stakes(acct1.address)).to.equal(amount);
    });

    it("should allow unstaking", async () => {
      await stake.stake(amount);
      await stake.unstake(amount);
      expect(await stake.stakes(acct1.address)).to.equal(0);
    });
  });

});
