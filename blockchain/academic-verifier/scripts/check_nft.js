require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  const tokenId = process.argv[2] || 1;

  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const abiPath = path.join(__dirname, "..", "artifacts", "contracts", "CertificateNFT.sol", "CertificateNFT.json");
  const abi = JSON.parse(fs.readFileSync(abiPath)).abi;
  const nft = new ethers.Contract(process.env.CERTIFICATE_NFT_ADDRESS, abi, provider);

  console.log("═══════════════════════════════════════════════════════");
  console.log("          NFT CERTIFICATE VERIFICATION");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Token ID:", tokenId);
  console.log("Contract:", process.env.CERTIFICATE_NFT_ADDRESS);
  console.log("");

  // Owner
  const owner = await nft.ownerOf(tokenId);
  console.log("✅ Owner:", owner);

  // Certificate data
  const cert = await nft.certificateStruct(tokenId);
  console.log("✅ Student:", cert.studentName);
  console.log("✅ Degree:", cert.degree);
  console.log("✅ University:", cert.university);
  console.log("✅ Issue Date:", new Date(Number(cert.issueDate) * 1000).toISOString());
  console.log("✅ Credential Hash:", cert.hash);

  // TokenURI
  const uri = await nft.tokenURI(tokenId);
  console.log("✅ TokenURI:", uri);

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("               VIEW CERTIFICATE");
  console.log("═══════════════════════════════════════════════════════");
  
  // Extract metadata CID and fetch to get certificate PDF link
  if (uri.startsWith("ipfs://")) {
    const metadataCID = uri.replace("ipfs://", "");
    console.log("\n📄 Metadata:");
    console.log("   https://gateway.pinata.cloud/ipfs/" + metadataCID);
    
    try {
      // Fetch metadata to extract certificate PDF CID
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;
      const response = await fetch(metadataUrl);
      const metadata = await response.json();
      
      if (metadata.image) {
        const certificateCID = metadata.image.replace("ipfs://", "");
        console.log("\n📜 Certificate PDF:");
        console.log("   https://gateway.pinata.cloud/ipfs/" + certificateCID);
      }
    } catch (e) {
      console.log("\n⚠️  Could not fetch metadata to extract certificate PDF link");
      console.log("   Fetch metadata manually from the link above");
    }
  }

  console.log("\n🔍 Blockchain Explorer:");
  console.log("   https://sepolia.etherscan.io/token/" + process.env.CERTIFICATE_NFT_ADDRESS + "?a=" + tokenId);
  
  console.log("\n═══════════════════════════════════════════════════════\n");
}

main().catch(e => { 
  console.error(e); 
  process.exit(1); 
});