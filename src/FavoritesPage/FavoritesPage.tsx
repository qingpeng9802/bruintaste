import React from 'react';

import '../styles/PageBody.css';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import GlobalCss from '../styles/GlobalCss';
import themeMui from '../styles/themeMui';

import { useState, useEffect, useContext, createContext } from 'react';

import { useAuth0 } from "@auth0/auth0-react";

import {
  ifShowOverlayContext,
  itemsPerPageContext,
  currPageResContext
} from './FavContexts';

import RecipeResultsWithSort from './RecipeResultsWithSort';
import BackAppBar from './BackAppBar';
import LoginPop from './LoginPop';

function FavoritesPage() {
  const { loginWithPopup, logout, user, isAuthenticated, isLoading } = useAuth0();

  // share state management
  const [currPageRes, setCurrPageRes] = useState<{ [key: string]: any }[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [ifShowOverlay, setIfShowOverlay] = useState(false);

  useEffect(() => {
    if ((!isLoading) && isAuthenticated) {
      setIfShowOverlay(false);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <ThemeProvider theme={themeMui}>
      <GlobalCss />

      <div>

        <itemsPerPageContext.Provider value={{ itemsPerPage, setItemsPerPage }}>
          <currPageResContext.Provider value={{ currPageRes, setCurrPageRes }}>
            <ifShowOverlayContext.Provider value={{ ifShowOverlay, setIfShowOverlay }}>

              <BackAppBar />
              <RecipeResultsWithSort />
              <LoginPop show={ifShowOverlay} />

            </ifShowOverlayContext.Provider>
          </currPageResContext.Provider>
        </itemsPerPageContext.Provider>

      </div>

    </ThemeProvider>
  );
}

export default FavoritesPage;
