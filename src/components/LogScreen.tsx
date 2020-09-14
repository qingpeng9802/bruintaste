import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function LogScreen(props :any) {
  const fbAn = props.fbAn;

  const logCurrentPage = () => {
    fbAn.setCurrentScreen(window.location.pathname);
    fbAn.logEvent('screen_view' as any);
  };

  const history = useHistory();

  useEffect(() => {
    // log the first page visit
    logCurrentPage();

    history.listen(() => {
      logCurrentPage();
    });
  }, [history]);

  return (null);
}

export default LogScreen;
