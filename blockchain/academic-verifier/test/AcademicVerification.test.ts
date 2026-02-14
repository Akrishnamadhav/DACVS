import { expect } from "chai";
import { ethers } from "hardhat";

describe("AcademicVerification", function () {
  let AcademicVerification: any;
  let contract: any;
  let owner: any;
  let institution: any;
  const studentId = "STU123";
  const institutionId = "INST001";
  const credentialHash = ethers.keccak256(ethers.toUtf8Bytes("dummy-certificate"));

  beforeEach(async function () {
    [owner, institution] = await ethers.getSigners();
    AcademicVerification = await ethers.getContractFactory("AcademicVerification");
    contract = await AcademicVerification.deploy();
    await contract.waitForDeployment();
    await contract.setInstitution(await institution.getAddress(), true);
  });

  it("should allow registered institution to issue credential", async function () {
    await contract.connect(institution).issueCredential(credentialHash, studentId, institutionId);
    const cred = await contract.credentials(credentialHash);
    expect(cred.studentId).to.equal(studentId);
    expect(cred.institutionId).to.equal(institutionId);
    expect(cred.issuer).to.equal(await institution.getAddress());
    expect(cred.revoked).to.equal(false);
  });

  it("should verify issued credential", async function () {
    await contract.connect(institution).issueCredential(credentialHash, studentId, institutionId);
    const res = await contract.verifyCredential(credentialHash);
    expect(res[0]).to.equal(true);
    expect(res[1]).to.equal(studentId);
    expect(res[2]).to.equal(institutionId);
    expect(res[3]).to.equal(await institution.getAddress());
    expect(res[5]).to.equal(false);
  });

  it("should not verify non-existent credential", async function () {
    const res = await contract.verifyCredential(ethers.keccak256(ethers.toUtf8Bytes("unknown")));
    expect(res[0]).to.equal(false);
  });

  it("should allow institution to revoke credential", async function () {
    await contract.connect(institution).issueCredential(credentialHash, studentId, institutionId);
    await contract.connect(institution).revokeCredential(credentialHash);
    const res = await contract.verifyCredential(credentialHash);
    expect(res[5]).to.equal(true);
  });

  it("should not allow unregistered institution to issue", async function () {
    const [, , attacker] = await ethers.getSigners();
    await expect(
      contract.connect(attacker).issueCredential(credentialHash, studentId, institutionId)
    ).to.be.revertedWith("Not a registered institution");
  });

  it("should run a dummy test", async function () {
    expect(1).to.equal(1);
  });
});