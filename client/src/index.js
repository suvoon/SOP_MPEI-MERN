import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import { HomePage } from './pages/HomePage/HomePage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { SurveysPage } from './pages/SurveysPage/SurveysPage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { AdminPage } from './pages/AdminPage/AdminPage';
import { SurveyPage } from './pages/SurveyPage/SurveyPage';
import { ResultsPage } from './pages/ResultsPage/ResultsPage';
import { ForumsPage } from './pages/ForumsPage/ForumsPage';
import { ForumPage } from './pages/ForumPage/ForumPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="survey/:surveyID" element={<SurveyPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="forums" element={<ForumsPage />} />
          <Route path="forum/:forumID" element={<ForumPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
