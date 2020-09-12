import {
  IconButton
} from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from "@material-ui/icons/Star";

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext,
} from 'react';

import {
  BrowserRouter as Router, Link as RouterLink,
  Switch, Route, useLocation
} from 'react-router-dom';

import { useAuth0 } from "@auth0/auth0-react";

import {
  ifShowOverlayContext
} from './ErrorContexts';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    favStarButton: {
      margin: theme.spacing(0, 1),
      display: 'flex',
      flexFlow: 'column nowrap',
      justifyContent: 'center',
    }
  }),
);

function FavButton() {
  const classes = useStyles();

  const location = useLocation();
  const locPath = location.pathname;
  const favPath = '/favorites';

  const { loginWithPopup, logout, user, isAuthenticated, isLoading } = useAuth0();

  const { ifShowOverlay, setIfShowOverlay } = useContext(ifShowOverlayContext);

  const handleChange = () => {
    if ((!isLoading) && isAuthenticated) {
      console.log(user);
      return;
    }
    setIfShowOverlay(true);
    loginWithPopup();
  };

  return (
    <div className={classes.favStarButton}>

      {(!isLoading) && isAuthenticated ?
        <IconButton
          color="inherit"
          aria-label="favorites"
          component={RouterLink}
          to='/favorites'
          style={{ padding: 0 }}
        >
          {locPath === favPath ? <StarIcon fontSize='default' />
            : <StarBorderIcon fontSize='default' />}
        </IconButton >
        :
        <IconButton
          color="inherit"
          aria-label="favorites"
          onClick={handleChange}
          style={{ padding: 0 }}
        >
          {locPath === favPath ? <StarIcon fontSize='default' /> :
            <StarBorderIcon fontSize='default' />}
        </IconButton >
      }

      <div style={{ fontSize: 12, }}>
        Favorites
      </div>

    </div>
  );

}

export default FavButton;
