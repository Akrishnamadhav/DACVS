// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract AcademicVerification {
    address public owner;
    mapping(address => bool) public institutions;

    struct Credential {
        bytes32 credentialHash;
        string studentId;
        string institutionId;
        uint256 issuedAt;
        address issuer;
        bool revoked;
    }

    mapping(bytes32 => Credential) public credentials;

    event CredentialIssued(bytes32 indexed credentialHash, string studentId, string institutionId, address indexed issuer, uint256 issuedAt);
    event CredentialRevoked(bytes32 indexed credentialHash, address indexed issuer, uint256 revokedAt);
    event InstitutionUpdated(address indexed institution, bool approved);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyInstitution() {
        require(institutions[msg.sender], "Not a registered institution");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setInstitution(address _institution, bool _approved) external onlyOwner {
        institutions[_institution] = _approved;
        emit InstitutionUpdated(_institution, _approved);
    }

    function issueCredential(
        bytes32 _credentialHash,
        string memory _studentId,
        string memory _institutionId
    ) external onlyInstitution {
        require(credentials[_credentialHash].issuedAt == 0, "Already issued");
        credentials[_credentialHash] = Credential({
            credentialHash: _credentialHash,
            studentId: _studentId,
            institutionId: _institutionId,
            issuedAt: block.timestamp,
            issuer: msg.sender,
            revoked: false
        });
        emit CredentialIssued(_credentialHash, _studentId, _institutionId, msg.sender, block.timestamp);
    }

    function revokeCredential(bytes32 _credentialHash) external onlyInstitution {
        require(credentials[_credentialHash].issuedAt != 0, "Not issued");
        credentials[_credentialHash].revoked = true;
        emit CredentialRevoked(_credentialHash, msg.sender, block.timestamp);
    }

    function verifyCredential(bytes32 _credentialHash) external view returns (
        bool valid,
        string memory studentId,
        string memory institutionId,
        address issuer,
        uint256 issuedAt,
        bool revoked
    ) {
        Credential memory c = credentials[_credentialHash];
        if (c.issuedAt == 0) {
            return (false, "", "", address(0), 0, false);
        }
        return (true, c.studentId, c.institutionId, c.issuer, c.issuedAt, c.revoked);
    }
}