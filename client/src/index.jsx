import React from 'react';
import ReactDOM from 'react-dom';
import ConversationsPage from './components/ConversationsPage.jsx';
import LandingPage from './components/LandingPage.jsx';

if (document.getElementById('landing-page')) {
  ReactDOM.render(<LandingPage />, document.getElementById('landing-page'));
} else {
  ReactDOM.render(<ConversationsPage />, document.getElementById('conversations-page'));
}
