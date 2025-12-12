import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BuilderView } from './modules/builder';
import { PreviewView } from './modules/preview';
import { initializeFieldRegistry } from './fields/initializeRegistry';

function App() {
  useEffect(() => {
    initializeFieldRegistry();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/builder" replace />} />
        <Route path="/builder" element={<BuilderView />} />
        <Route path="/preview" element={<PreviewView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
