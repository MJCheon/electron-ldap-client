import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import Home from './home/page';
import Layout from './components/layout/RootLayout';

export default function App() {
  return (
    <Layout>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </Layout>
  );
}
