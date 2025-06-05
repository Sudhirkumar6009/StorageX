import { Navigate } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { address, isConnected } = useWeb3();

  if (!isConnected || !address) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;