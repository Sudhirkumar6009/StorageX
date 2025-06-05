import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Index from './pages/Index';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './contexts/ProtectedRoute';
import NotFound from './pages/NotFound';
import { Web3Provider } from './contexts/Web3Context';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { BackTopContext } from './contexts/BackTopContext.js';

const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia], // add your chains here
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <TooltipProvider>
          <ThemeProvider>
            <ProfileProvider>
              <Web3Provider>
                <AuthProvider>
                  <Toaster />
                  <Sonner />
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 pt-16">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                    <BackTopContext />
                  </div>
                </AuthProvider>
              </Web3Provider>
            </ProfileProvider>
          </ThemeProvider>
        </TooltipProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
