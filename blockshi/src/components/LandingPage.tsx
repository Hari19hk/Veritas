import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleExecuteClick = () => {
    if (loading) return;

    if (user) {
      // already logged in
      navigate('/app/dashboard');
    } else {
      // not logged in → trigger login
      navigate('/login');
    }
  };

  const handleVerifyClick = () => {
    navigate('/verify');
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40
      }}
    >
      <button onClick={handleExecuteClick}>
        Execute a Task
      </button>

      <button onClick={handleVerifyClick}>
        Verify a Proof
      </button>
    </div>
  );
};

export default Landing;
