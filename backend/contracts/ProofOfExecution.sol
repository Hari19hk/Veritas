// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofOfExecution {

    struct Proof {
        string poeHash;
        uint256 timestamp;
        bool exists;
    }

    // commitmentId => Proof
    mapping(string => Proof) private proofs;

    // Store proof (can be done only once per commitmentId)
    function storeProof(string memory commitmentId, string memory poeHash) public {
        require(!proofs[commitmentId].exists, "Proof already exists");

        proofs[commitmentId] = Proof({
            poeHash: poeHash,
            timestamp: block.timestamp,
            exists: true
        });
    }

    // Read proof
    function getProof(string memory commitmentId) public view returns (string memory, uint256) {
        require(proofs[commitmentId].exists, "Proof does not exist");
        return (proofs[commitmentId].poeHash, proofs[commitmentId].timestamp);
    }
}
