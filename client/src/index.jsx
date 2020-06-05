import React from 'react';
import ReactDOM from 'react-dom';
import MessagePage from './components/MessagePage.jsx';
import LandingPage from './components/LandingPage.jsx';

if (document.getElementById('landing-page')) {
  ReactDOM.render(<LandingPage />, document.getElementById('landing-page'));
} else {
  ReactDOM.render(<MessagePage />, document.getElementById('message-page'));
}
