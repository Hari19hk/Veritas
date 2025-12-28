import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateCommitment from './components/CreateCommitment';
import ExecuteTask from './components/ExecuteTask';
import VerifyProof from './components/VerifyProof';
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
        <Route path="/verify-proof" element={<VerifyProof />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
