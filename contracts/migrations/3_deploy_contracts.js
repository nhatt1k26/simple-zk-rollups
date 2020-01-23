const MerkleTree = artifacts.require("MerkleTree");
const CircomLib = artifacts.require("CircomLib");
const Hasher = artifacts.require("Hasher");

const config = require("../../zk-rollups.config");

module.exports = async deployer => {
  // Link MiMC with the Hasher object
  await deployer.link(CircomLib, Hasher);

  // Deploy hasher
  const hasher = await deployer.deploy(Hasher);

  // Deploy merkle tree
  const balanceTree = await deployer.deploy(
    MerkleTree,
    config.balanceTree.depth.toString(),
    config.balanceTree.zeroValue.toString(),
    hasher.address
  );

  // TODO:
  // Allow zk-rollups contract to call `insert` and `update` methods
  // on the MerkleTrees
  // await stateTree.whitelistAddress(maci.address);
};