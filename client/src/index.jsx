import React from 'react';
import ReactDOM from 'react-dom';
import MessagesPage from './components/MessagesPage.jsx';
import LandingPage from './components/LandingPage.jsx';

if (document.getElementById('landing-page')) {
  ReactDOM.render(<LandingPage />, document.getElementById('landing-page'));
} else {
  ReactDOM.render(<MessagesPage />, document.getElementById('messages-page'));
}
