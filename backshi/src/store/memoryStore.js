// In-memory storage for MVP
// Data is lost on server restart

const commitments = new Map();
const proofs = new Map();

module.exports = {
  commitments,
  proofs
};
