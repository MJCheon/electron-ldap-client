import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import Home from './home/page';
import Layout from './components/layout/RootLayout';
import Servers from './server/[id]/page';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/server" element={<Servers />} />
        </Routes>
      </Layout>
    </Router>
  );
}
