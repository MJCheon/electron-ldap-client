import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import Home from './home/page';
import Layout from './components/layout/RootLayout';
import Servers from './server/[id]/page';

export default function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/server" element={<Servers />} />
        </Routes>
      </Router>
    </Layout>
  );
}
