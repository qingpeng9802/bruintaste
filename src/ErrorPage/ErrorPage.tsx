import React from 'react';
import {
  useState, useEffect,
  useContext, createContext,
  useRef, useCallback
} from 'react';

import '../styles/PageBody.css';

import Typography from '@material-ui/core/Typography';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import {
  ifShowOverlayContext,
} from './ErrorContexts';

import themeMui from '../styles/themeMui';
import GlobalCss from '../styles/GlobalCss';

import LoginPop from './LoginPop';
import BackAppBar from './BackAppBar';

function ErrorPage() {

  const [ifShowOverlay, setIfShowOverlay] = useState(false);

  function ErrorMsg() {
    return (
      <div style={{
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'center'
      }}>

        <Typography variant="h6" color='textPrimary'
          style={{
            margin: themeMui.spacing(3, 3),
          }}>
          Error Page _( ﾟДﾟ)ﾉ<br />
          Here is wilderness...
        </Typography>

      </div>
    );
  }

  return (
    <ThemeProvider theme={themeMui}>
      <GlobalCss />

      <ifShowOverlayContext.Provider value={{ ifShowOverlay, setIfShowOverlay }}>

        <div>
          <BackAppBar />
          <ErrorMsg />
          <LoginPop show={ifShowOverlay} />
        </div>

      </ifShowOverlayContext.Provider>

    </ThemeProvider>
  );
}

export default ErrorPage;
