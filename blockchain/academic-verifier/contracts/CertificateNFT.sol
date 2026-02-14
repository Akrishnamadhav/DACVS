// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateNFT
 * @dev ERC721 NFT representing an academic certificate.
 * Stores core metadata fully on-chain + a hash of the off-chain document.
 * Supports tokenURI for IPFS metadata linking.
 */
contract CertificateNFT is ERC721URIStorage, Ownable {
    struct Certificate {
        string studentName;
        string degree;
        string university;
        uint64 issueDate;    // Unix timestamp (UTC)
        bytes32 hash;        // SHA-256 (or other) hash of document
    }

    // tokenId => Certificate
    mapping(uint256 => Certificate) private _certificates;
    // Optional uniqueness constraint on document hash
    mapping(bytes32 => bool) public hashUsed;

    uint256 private _nextTokenId = 1;

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed to,
        string studentName,
        string degree,
        string university,
        uint64 issueDate,
        bytes32 hash
    );

    // For OpenZeppelin Contracts v5 Ownable requires initial owner in constructor
    constructor() ERC721("CertificateNFT", "CERT") Ownable(msg.sender) {}

    /**
     * @notice Mint a new certificate NFT (only owner, e.g. university admin).
     */
    function mintCertificate(
        address to,
        string memory studentName,
        string memory degree,
        string memory university,
        uint64 issueDate,
        bytes32 hash
    ) external onlyOwner returns (uint256 tokenId) {
        require(to != address(0), "Invalid recipient");
        require(!hashUsed[hash], "Hash already used");
        require(issueDate <= uint64(block.timestamp) + 1 hours, "Future issueDate");

        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _certificates[tokenId] = Certificate({
            studentName: studentName,
            degree: degree,
            university: university,
            issueDate: issueDate,
            hash: hash
        });

        hashUsed[hash] = true;

        emit CertificateMinted(tokenId, to, studentName, degree, university, issueDate, hash);
    }

    /**
     * @notice Mint certificate with IPFS URI in one transaction
     */
    function mintCertificateWithURI(
        address to,
        string memory studentName,
        string memory degree,
        string memory university,
        uint64 issueDate,
        bytes32 hash,
        string memory uri
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = this.mintCertificate(to, studentName, degree, university, issueDate, hash);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @notice Set or update tokenURI for existing token (only owner)
     */
    function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Nonexistent token");
        _setTokenURI(tokenId, uri);
    }

    /**
     * @notice Return certificate data (reverts if token does not exist).
     */
    function getCertificate(uint256 tokenId)
        external
        view
        returns (string memory, string memory, string memory, uint64, bytes32)
    {
        require(ownerOf(tokenId) != address(0), "Nonexistent token");
        Certificate storage c = _certificates[tokenId];
        return (c.studentName, c.degree, c.university, c.issueDate, c.hash);
    }

    /**
     * @notice Return full struct (ethers v6 can decode).
     */
    function certificateStruct(uint256 tokenId) external view returns (Certificate memory) {
        require(ownerOf(tokenId) != address(0), "Nonexistent token");
        return _certificates[tokenId];
    }

    /**
     * @notice Next token id (for UI convenience).
     */
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @notice Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}