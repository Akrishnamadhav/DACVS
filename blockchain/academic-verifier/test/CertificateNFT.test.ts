import { expect } from "chai";
import { ethers } from "hardhat";

describe("CertificateNFT", function () {
  async function deploy() {
    const [owner, student] = await ethers.getSigners();
    const F = await ethers.getContractFactory("CertificateNFT");
    const nft = await F.deploy();
    await nft.waitForDeployment();
    return { owner, student, nft };
  }

  it("mints certificate", async () => {
    const { owner, student, nft } = await deploy();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("doc-1"));
    const now = Math.floor(Date.now() / 1000);
    const tx = await nft.mintCertificate(
      await student.getAddress(),
      "Alice",
      "BSc CS",
      "Sample Uni",
      now,
      hash
    );
    await tx.wait();
    const data = await nft.getCertificate(1);
    expect(data[0]).to.equal("Alice");
    expect(data[1]).to.equal("BSc CS");
    expect(data[2]).to.equal("Sample Uni");
    expect(data[3]).to.equal(now);
    expect(data[4]).to.equal(hash);
  });

  it("rejects duplicate hash", async () => {
    const { student, nft } = await deploy();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("doc-dup"));
    const now = Math.floor(Date.now() / 1000);
    await (await nft.mintCertificate(await student.getAddress(), "A", "Deg", "Uni", now, hash)).wait();
    await expect(
      nft.mintCertificate(await student.getAddress(), "B", "Deg2", "Uni2", now, hash)
    ).to.be.revertedWith("Hash already used");
  });

  it("fails for future issueDate", async () => {
    const { student, nft } = await deploy();
    const future = Math.floor(Date.now() / 1000) + 4000;
    const hash = ethers.keccak256(ethers.toUtf8Bytes("future"));
    await expect(
      nft.mintCertificate(await student.getAddress(), "A", "Deg", "Uni", future, hash)
    ).to.be.revertedWith("Future issueDate");
  });

  it("only owner can mint", async () => {
    const { student, nft } = await deploy();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("x"));
    const now = Math.floor(Date.now() / 1000);
    await expect(
      nft.connect(student).mintCertificate(await student.getAddress(), "A", "Deg", "Uni", now, hash)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});