import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import LogScreen from './components/LogScreen';

import * as serviceWorker from './serviceWorker';

import { BrowserRouter as Router, Link as RouterLink, Switch, Route, useHistory } from 'react-router-dom';

import firebase from './initedFirebase';

// Initialize Performance Monitoring and get a reference to the service
const fbPe = firebase.performance();

// Get the Analytics service for the default app
const fbAn = firebase.analytics();

ReactDOM.render(
  <React.StrictMode>
    <Router>

      <LogScreen fbAn={fbAn} />
      <App />

    </Router>
  </React.StrictMode >,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
