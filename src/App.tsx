import React, { useEffect } from 'react';
import './index.css';
import HomePage from './HomePage/HomePage';

import { BrowserRouter as Router, Link as RouterLink, Switch, Route } from 'react-router-dom';

import RecipePage from './RecipePage/RecipePage';
import FavoritesPage from './FavoritesPage/FavoritesPage';
import ErrorPage from './ErrorPage/ErrorPage';

import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { Auth0Provider } from "@auth0/auth0-react";

function App() {
  return (
    <div>
      <Auth0Provider
        domain={process.env.REACT_APP_AUTH0_DOMAIN as string}
        clientId={process.env.REACT_APP_AUTH0_SERVICE_ID as string}
        redirectUri={window.location.origin}
        useRefreshTokens={true}
        cacheLocation="localstorage"
        audience={process.env.REACT_APP_AUD as string}
      >
        <CacheSwitch>
          <CacheRoute exact path='/' component={HomePage} />
          <Route exact path="/recipe/:pageid/:fav?" component={RecipePage} />
          <CacheRoute exact path='/favorites' component={FavoritesPage} />
          <Route path='*' component={ErrorPage} />
        </CacheSwitch>
      </Auth0Provider>
    </div>
  );
}

export default App;
