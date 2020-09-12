import React from 'react';
import {
  useState, useEffect,
  useContext, createContext,
  useRef, useCallback
} from 'react';

import '../styles/PageBody.css';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import {
  ifShowOverlayContext,
} from './RecipePageContexts';

import themeMui from '../styles/themeMui';
import GlobalCss from '../styles/GlobalCss';

import LoginPop from './LoginPop';
import BackAppBar from './BackAppBar';

import RecipeContent from './RecipeContent';

function RecipePage() {

  const [ifShowOverlay, setIfShowOverlay] = useState(false);

  return (
    <ThemeProvider theme={themeMui}>
      <GlobalCss />

      <ifShowOverlayContext.Provider value={{ ifShowOverlay, setIfShowOverlay }}>

        <div>
          <BackAppBar />
          <RecipeContent />
          <LoginPop show={ifShowOverlay} />
        </div>

      </ifShowOverlayContext.Provider>

    </ThemeProvider>
  );
}

export default RecipePage;
