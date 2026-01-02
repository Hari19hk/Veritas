import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './components/LandingPage.tsx';
import VerifyExecutionProof from './components/VerifyExecutionProof';
import ProofOfExecution from './components/ProofOfExecution';

import Dashboard from './components/Dashboard';
import CreateCommitment from './components/CreateCommitment';
import ExecuteTask from './components/ExecuteTask';
import Logs from './components/Logs';
import Settings from './components/Settings';

import DashboardShell from './components/DashboardShell';
import RequireAuth from './auth/RequireAuth.tsx';
import Login from './components/Login.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerifyExecutionProof />} />
        <Route path="/proof/:proofId" element={<ProofOfExecution />} />

        {/* Authenticated App */}
        <Route
          path="/app/dashboard"
          element={
            <RequireAuth>
              <DashboardShell breadcrumb="dashboard">
                <Dashboard />
              </DashboardShell>
            </RequireAuth>
            
          }
        />

        <Route
          path="/app/create-commitment"
          element={
            <RequireAuth>
              <DashboardShell breadcrumb="dashboard / create commitment">
                <CreateCommitment />
              </DashboardShell>
            </RequireAuth>
           
          }
        />

        <Route
          path="/app/execute-task"
          element={
            <RequireAuth>
              <DashboardShell breadcrumb="dashboard / execute task">
                <ExecuteTask />
              </DashboardShell>
            </RequireAuth>
           
          }
        />

        <Route
          path="/app/logs"
          element={
            <RequireAuth>
              <DashboardShell breadcrumb="dashboard / logs">
                <Logs />
              </DashboardShell>
            </RequireAuth>
            
          }
        />

        <Route
          path="/app/settings"
          element={
            <RequireAuth>
              <DashboardShell breadcrumb="dashboard / settings">
                <Settings />
              </DashboardShell>
            </RequireAuth>
           
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
