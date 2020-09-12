import {
  IconButton, Button,
  Typography, Paper
} from '@material-ui/core';

import ClearIcon from '@material-ui/icons/Clear';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext
} from 'react';

import { useAuth0 } from "@auth0/auth0-react";

import {
  ifShowOverlayContext
} from './FavContexts';

import themeMui from '../styles/themeMui';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loginPop: {
      display: (props: any) => props.show ?
        'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginOverlay: {
      background: 'rgba(163, 163, 163, 0.85)',

      height: '100%',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginPaper: {
      width: 320,
      backgroundColor: '#ffffff',
      padding: theme.spacing(2, 3),

      display: 'flex',
      flexFlow: 'column nowrap',
      alignItems: 'center',
      justifyContent: 'center',
    },
    exitIcon: {
      marginLeft: 'auto',
      padding: 8,
      margin: 0,
    },
    repopButton: {
      margin: theme.spacing(2, 0),
      backgroundColor: '#005587',
      color: '#ffffff',
    }
  }),
);

function LoginPop(props: any) {
  const classes = useStyles({
    show: props.show,
  });

  const { loginWithPopup, logout, user, isAuthenticated, isLoading } = useAuth0();

  const { ifShowOverlay, setIfShowOverlay } = useContext(ifShowOverlayContext);

  useEffect(() => {
    if ((!isLoading) && isAuthenticated) {
      setIfShowOverlay(false);
    }
  },[isLoading, isAuthenticated, setIfShowOverlay]);

  return (
    <div className={classes.loginPop}>
      <div className={classes.loginOverlay}>

        <Paper className={classes.loginPaper}>

          <IconButton className={classes.exitIcon} aria-label="exit"
            onClick={() => {
              setIfShowOverlay(false);
            }}>
            <ClearIcon />
          </IconButton>

          <LockOutlinedIcon color='primary' />

          <Typography component="h1" variant="h5" color='primary'
            style={{
              marginTop: 8
            }}>
            Please Login in Popup Page
          </Typography>

          <Typography component="p" variant="body2" color='textPrimary'
            style={{
              margin: themeMui.spacing(1, 0)
            }}>
            We don&#39;t save password :)<br />
            We use <i>OAuth</i> to protect your login security.
          </Typography>

          {(!isLoading) && isAuthenticated ?
            (
              <Typography variant="body1" color='primary' align='center'
                style={{
                  marginTop: 8
                }}>
                <strong>
                  {`You have loged in as ${user.name}`}<br />
                  {'Please close this card.'}
                </strong>
              </Typography>
            )
            : (<Button
              className={classes.repopButton}
              type="button"
              fullWidth
              variant="contained"
              onClick={loginWithPopup}
              disabled={(!isLoading) && isAuthenticated}
            >
              Repop up Login Page
            </Button>)
          }

        </Paper>

      </div>
    </div >
  );

}

export default LoginPop;
