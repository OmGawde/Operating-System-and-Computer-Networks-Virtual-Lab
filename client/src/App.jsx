import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Hub pages
import FundamentalsHub from './pages/FundamentalsHub';
import RoutingHub from './pages/RoutingHub';
import TransportHub from './pages/TransportHub';
import ApplicationHub from './pages/ApplicationHub';
import NetworkLayerHub from './pages/NetworkLayerHub';
import SecurityHub from './pages/SecurityHub';
import FlashcardsPage from './pages/FlashcardsPage';

// Simulation pages
import OsiSimulation from './pages/simulations/OsiSimulation';
import DnsSimulation from './pages/simulations/DnsSimulation';
import DhcpSimulation from './pages/simulations/DhcpSimulation';
import DijkstraSimulation from './pages/simulations/DijkstraSimulation';
import DistanceVectorSimulation from './pages/simulations/DistanceVectorSimulation';
import TcpHandshakeSimulation from './pages/simulations/TcpHandshakeSimulation';
import SlidingWindowSimulation from './pages/simulations/SlidingWindowSimulation';
import HttpSimulation from './pages/simulations/HttpSimulation';
import ArpSimulation from './pages/simulations/ArpSimulation';
import IcmpSimulation from './pages/simulations/IcmpSimulation';
import EncryptionSimulation from './pages/simulations/EncryptionSimulation';
import VpnSimulation from './pages/simulations/VpnSimulation';
import FirewallSimulation from './pages/simulations/FirewallSimulation';
import MasteryQuiz from './pages/MasteryQuiz';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/network-fundamentals" replace />} />

        <Route path="/network-fundamentals" element={<FundamentalsHub />} />
        <Route path="/network-fundamentals/osi" element={<OsiSimulation />} />
        <Route path="/network-fundamentals/dns" element={<DnsSimulation />} />
        <Route path="/network-fundamentals/dhcp" element={<DhcpSimulation />} />

        <Route path="/routing" element={<RoutingHub />} />
        <Route path="/routing/link-state" element={<DijkstraSimulation />} />
        <Route path="/routing/distance-vector" element={<DistanceVectorSimulation />} />

        <Route path="/transport" element={<TransportHub />} />
        <Route path="/transport/tcp-handshake" element={<TcpHandshakeSimulation />} />
        <Route path="/transport/sliding-window" element={<SlidingWindowSimulation />} />

        <Route path="/application" element={<ApplicationHub />} />
        <Route path="/application/http" element={<HttpSimulation />} />

        <Route path="/network-layer" element={<NetworkLayerHub />} />
        <Route path="/network-layer/arp" element={<ArpSimulation />} />
        <Route path="/network-layer/icmp" element={<IcmpSimulation />} />

        <Route path="/security" element={<SecurityHub />} />
        <Route path="/security/encryption" element={<EncryptionSimulation />} />
        <Route path="/security/vpn" element={<VpnSimulation />} />
        <Route path="/security/firewall" element={<FirewallSimulation />} />

        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/mastery-quiz" element={<MasteryQuiz />} />
      </Route>
    </Routes>
  );
}
