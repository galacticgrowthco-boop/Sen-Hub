import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Results from './pages/Results';
import GrantsDirectory from './pages/GrantsDirectory';
import DLAGuide from './pages/DLAGuide';
import BetterOffCalculator from './pages/BetterOffCalculator';
import Legal from './pages/Legal';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Link to="/"><h1 className="text-2xl font-bold text-indigo-600">SEN Compass</h1></Link>
            <p className="text-slate-500 text-sm">UK Benefits Support for SEN Families</p>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dla-guide" element={<DLAGuide />} />
            <Route path="/grants" element={<GrantsDirectory />} />
            <Route path="/better-off" element={<BetterOffCalculator />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left text-slate-400 text-sm max-w-md">
                <p>© 2026 SEN Compass. Helping families navigate support. All calculations are estimates based on 2026-27 DWP rates.</p>
              </div>
              <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Link to="/legal" className="hover:text-indigo-600 transition-colors">Privacy</Link>
                <Link to="/legal" className="hover:text-indigo-600 transition-colors">Terms</Link>
                <Link to="/legal" className="hover:text-indigo-600 transition-colors">Accessibility</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
