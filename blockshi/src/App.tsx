import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateCommitment from './components/CreateCommitment';
import ExecuteTask from './components/ExecuteTask';
import ProofOfExecution from './components/ProofOfExecution';
import VerifyExecutionProof from './components/VerifyExecutionProof';
import Logs from './components/Logs';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-commitment" element={<CreateCommitment />} />
        <Route path="/execute-task" element={<ExecuteTask />} />
        <Route path="/proof-of-execution" element={<ProofOfExecution />} />
        <Route path="/verify-execution-proof" element={<VerifyExecutionProof />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
