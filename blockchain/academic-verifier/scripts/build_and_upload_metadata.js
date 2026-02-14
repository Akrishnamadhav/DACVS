require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const axios = require("axios");
const FormData = require("form-data");

function haveJWT() {
  return !!process.env.PINATA_JWT?.trim();
}
function haveKeySecret() {
  return !!(process.env.PINATA_API_KEY?.trim() && process.env.PINATA_API_SECRET?.trim());
}

async function uploadJSONv3(obj) {
  const buf = Buffer.from(JSON.stringify(obj, null, 2));
  const fd = new FormData();
  fd.append("file", buf, { filename: "metadata.json", contentType: "application/json" });
  // use uploads host for v3
  const res = await axios.post("https://uploads.pinata.cloud/v3/files", fd, {
    headers: { ...fd.getHeaders(), Authorization: `Bearer ${process.env.PINATA_JWT.trim()}` },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return res.data?.cid || res.data?.data?.cid;
}

async function uploadJSONv1(obj) {
  const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", obj, {
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY.trim(),
      pinata_secret_api_key: process.env.PINATA_API_SECRET.trim(),
    },
  });
  return res.data?.IpfsHash;
}

async function main() {
  const fileCID = process.argv[2];
  const name = process.argv[3] || "Certificate";
  const description = process.argv[4] || "Academic certificate";
  if (!fileCID) {
    console.log("Usage: node scripts/build_and_upload_metadata.js <fileCID> [name] [description]");
    process.exit(1);
  }

  const metadata = {
    name,
    description,
    image: `ipfs://${fileCID}`,
    attributes: [
      { trait_type: "storage", value: "pinata" },
      { trait_type: "type", value: "certificate" },
    ],
  };

  let cid;
  if (haveJWT()) cid = await uploadJSONv3(metadata);
  else if (haveKeySecret()) cid = await uploadJSONv1(metadata);
  else throw new Error("Missing credentials: set PINATA_JWT or PINATA_API_KEY + PINATA_API_SECRET in .env");

  if (!cid) throw new Error("No CID returned for metadata");
  console.log(cid); // metadata CID
  console.error(`tokenURI: ipfs://${cid}`);
}

main().catch((e) => {
  console.error(e.response?.data || e.message || e);
  process.exit(1);
});