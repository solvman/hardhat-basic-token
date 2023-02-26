const { tokenConfig } = require("../helper-hardhat.config");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [tokenConfig.name, tokenConfig.symbol, tokenConfig.decimals, tokenConfig.totalSupply];

  await deploy("Token", {
    from: deployer,
    args: args,
    log: true,
  });
};

module.exports.tags = ["Token", "all"];
