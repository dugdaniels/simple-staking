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

  describe("Staking", () => {
    it("should allow staking", async () => {
      await stake.stake(amount);
      expect(await stake.stakes(acct1.address)).to.equal(amount);
    });

    it("should allow one to add to their stake", async () => {
      await stake.stake(amount / 2);
      await stake.stake(amount / 2);
      expect(await stake.stakes(acct1.address)).to.equal(amount);
    });
  });

  describe("Unstaking", () => {
    it("should allow unstaking", async () => {
      await stake.stake(amount);
      await stake.unstake(amount);
      expect(await stake.stakes(acct1.address)).to.equal(0);
    });

    it("should all someone to partially unstake", async () => {
      await stake.stake(amount);
      await stake.unstake(amount / 2);
      expect(await stake.stakes(acct1.address)).to.equal(amount / 2);
    });
  });

  describe("Verifing minimum stake", () => {
    it("should verify if an account has staked the minimum amount", async () => {
      await stake.stake(minStake);
      expect(await stake.isFullyStaked(acct1.address)).to.equal(true);
    });
    
    it("should verify if an account has not staked the minimum amount", async () => {
      await stake.stake(minStake - 1);
      expect(await stake.isFullyStaked(acct1.address)).to.equal(false);
    });
  });

  describe("Setting minimum stake amount", () => {
    it("should set the minimum stake amount", async () => {
      const newMinStake = 100;
      await stake.setMinStake(newMinStake);
      expect(await stake.minStake()).to.equal(newMinStake);
    });

    it("should not allow non-owners to set the minimum stake amount", async () => {
      await expect(
         stake.connect(acct2).setMinStake(minStake + 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      expect(await stake.minStake()).to.equal(minStake);
    });
  })

});
