import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Deployments from "./components/Deployments";
import Extension from "./components/Extension";
import Navigation from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <BrowserRouter>
        <div className="flex">
          <Navigation />
          <main className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/deployments" element={<Deployments />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/extension" element={<Extension />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;