require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const addr = await deployer.getAddress();
  const bal = await ethers.provider.getBalance(addr);
  console.log("Deployer:", addr);
  console.log("Balance (ETH):", ethers.formatEther(bal));
  if (bal < ethers.parseEther("0.002")) throw new Error("Low balance");

  const F = await ethers.getContractFactory("CertificateNFT");
  const nft = await F.deploy();
  await nft.waitForDeployment();
  console.log("CertificateNFT deployed:", nft.target);
}

main().catch(e => { console.error(e); process.exit(1); });