import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Results from './pages/Results';
import DLATips from './pages/DLATips';
import GrantsDirectory from './pages/GrantsDirectory';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-indigo-600">SEN Compass</h1>
            <p className="text-slate-500 text-sm">UK Benefits Support for SEN Families</p>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dla-tips" element={<DLATips />} />
            <Route path="/grants" element={<GrantsDirectory />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
            <p>© 2026 SEN Compass. Helping families navigate support. All calculations are estimates based on 2026-27 DWP rates.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
