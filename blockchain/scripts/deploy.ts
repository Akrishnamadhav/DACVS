import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("AcademicCredential");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  console.log("AcademicCredential deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
