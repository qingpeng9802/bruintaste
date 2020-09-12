import React from 'react';
import {
  useState, useEffect, useContext, createContext,
} from 'react';

import {
  BrowserRouter as Router,
  Link as RouterLink, Switch, Route, useHistory
} from 'react-router-dom';

import {
  makeStyles, Theme, createStyles, withStyles,
} from '@material-ui/core/styles';

import {
  AppBar, Toolbar, IconButton
} from '@material-ui/core';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import AppTitle from '../components/AppTitle';
import HideOnScroll from '../components/HideOnScroll';

import FavButton from './FavButton';
import AccountEntrance from './AccountEntrance';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBar: {
      display: 'flex',
      minHeight: 48,
    },
    barIcons: {
      display: 'flex',
      flexFlow: 'row nowrap',
      [theme.breakpoints.down('xs')]: {
        flexFlow: 'row wrap',
      },
      alignItems: 'center',
    },
    backButton: {
      display: 'flex',
      flexBasis: 'row nowrap',
      alignItems: 'center',
      marginRight: 'auto'
    }
  })
);

function BackAppBar() {
  const classes = useStyles();

  const history = useHistory();

  return (
    <AppBar position="static" style={{ display: 'flex', }}>
      <Toolbar className={classes.toolBar}>

        <div className={classes.backButton}>

          <IconButton
            onClick={() => history.goBack()}>
            <ArrowBackIcon fontSize='default' style={{
              color: 'white',
              marginRight: 4,
            }} />
          </IconButton>

          <AppTitle />

        </div>

        <div className={classes.barIcons}>
          <FavButton />
          <AccountEntrance />
        </div>

      </Toolbar>
    </AppBar>
  );
}

export default BackAppBar;
