import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import NewsFeed from './pages/NewsFeed';
import Compare from './pages/Compare';
import Events from './pages/Events';
import Saved from './pages/Saved';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import LiveTV from './pages/LiveTV';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<NewsFeed />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/events" element={<Events />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/live-tv" element={<LiveTV />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;