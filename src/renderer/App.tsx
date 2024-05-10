import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import Servers from './servers/page';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Servers />} />
      </Routes>
    </Router>
  );
}
