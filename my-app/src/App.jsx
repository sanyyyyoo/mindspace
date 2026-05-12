import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/AppShell";
import JournalInput from "./components/journal/JournalInput";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<JournalInput />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;