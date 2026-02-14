// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AcademicCredential {
    struct Credential {
        string studentName;
        string course;
        string institution;
        uint256 year;
        bool valid;
    }

    mapping(uint256 => Credential) public credentials;
    uint256 public nextId = 1;

    event CredentialIssued(uint256 id, string studentName, string course, string institution, uint256 year);
    event CredentialRevoked(uint256 id);

    function issueCredential(
        string memory _studentName,
        string memory _course,
        string memory _institution,
        uint256 _year
    ) public {
        credentials[nextId] = Credential(_studentName, _course, _institution, _year, true);
        emit CredentialIssued(nextId, _studentName, _course, _institution, _year);
        nextId++;
    }

    function verifyCredential(uint256 _id) public view returns (
        string memory, string memory, string memory, uint256, bool
    ) {
        Credential memory c = credentials[_id];
        return (c.studentName, c.course, c.institution, c.year, c.valid);
    }

    function revokeCredential(uint256 _id) public {
        credentials[_id].valid = false;
        emit CredentialRevoked(_id);
    }
}
