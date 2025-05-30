import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CourseCreationPage from './pages/CourseCreationPage';
import CourseViewPage from './pages/CourseViewPage';
import Navbar from './components/Navbar';
import PaperBackground from './components/PaperBackground';
export function App() {
  return <Router>
      <PaperBackground>
        <Navbar />
        <div className="min-h-screen w-full pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CourseCreationPage />} />
            <Route path="/course" element={<CourseViewPage />} />
          </Routes>
        </div>
      </PaperBackground>
    </Router>;
}