require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const addr = await deployer.getAddress();
  const bal = await ethers.provider.getBalance(addr);
  console.log("Deployer:", addr);
  console.log("Balance (ETH):", ethers.formatEther(bal));
  if (bal < ethers.parseEther("0.002")) throw new Error("Low balance");

  const F = await ethers.getContractFactory("AcademicVerification");
  const c = await F.deploy();
  await c.waitForDeployment();
  console.log("AcademicVerification deployed:", c.target);
}

main().catch(e => { console.error(e); process.exit(1); });