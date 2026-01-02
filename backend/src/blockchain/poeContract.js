import { ethers } from 'ethers';
import { createRequire } from 'module';
import dotenv from 'dotenv'

dotenv.config()

const require = createRequire(import.meta.url);
const PoEArtifact = require('../../artifacts/contracts/ProofOfExecution.sol/ProofOfExecution.json');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const poeContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  PoEArtifact.abi,
  wallet
);

export async function storeProofOnChain(commitmentId, poeHash) {
  const tx = await poeContract.storeProof(commitmentId, poeHash);
  await tx.wait();

  return {
    txHash: tx.hash,
  };
}

export async function getProofFromChain(commitmentId) {
  const [poeHash, timestamp] = await poeContract.getProof(commitmentId);

  return {
    poeHash,
    timestamp: Number(timestamp),
  };
}

