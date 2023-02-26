const { ethers } = require("hardhat");

const tokenConfig = {
  name: "Basic Cat Token",
  symbol: "BCT",
  decimals: 18,
  totalSupply: ethers.utils.parseUnits("1.0", 24),
};

const developmentNetworks = ["localhost", "hardhat"];

module.exports = { tokenConfig, developmentNetworks };
