import React from 'react';
import {
  useState, useEffect, useContext, createContext,
} from 'react';

import {
  acFieldContext, searFieldsContext
} from './HomeAppBarContext';

import {
  makeStyles, Theme, createStyles, withStyles,
} from '@material-ui/core/styles';

import {
  AppBar, Toolbar,
} from '@material-ui/core';

import HideOnScroll from '../components/HideOnScroll';
import AppTitle from '../components/AppTitle';

import FavButton from './FavButton';
import AutocompleteButton from './AutocompleteButton';
import AdvancedSearchButton from './AdvancedSearchButton';
import SearchBar from './SearchBar';
import AccountEntrance from './AccountEntrance';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolBar: {
      display: 'flex',
      minHeight: 48,
    },
    centerSearch: {
      display: 'flex',

      flexFlow: 'column nowrap',
      [theme.breakpoints.up('md')]: {
        flexFlow: 'row nowrap',
      },
      alignItems: 'center',

      height: '100%',

      width: 800,
      [theme.breakpoints.down('md')]: {
        width: 600,
      },
      [theme.breakpoints.down('sm')]: {
        width: 260,
      },

      marginLeft: 'auto',
      marginRight: 'auto',
    },
    barIcons: {
      display: 'flex',
      flexFlow: 'row nowrap',
      [theme.breakpoints.down('xs')]: {
        flexFlow: 'row wrap',
      },
      alignItems: 'center',
    },
  })
);

function HomeAppBar() {
  const classes = useStyles();

  // share state management
  const [acField, setAcField] = useState('title');
  const [searFields, setSearFields] = useState({
    title: true,
    desc: false,
    ingredstr: false,
    allerg: false,
    piccode: false,
    fuzzy: true,
  });

  useEffect(() => {
    console.log(acField);
    console.log(searFields);
  }, [acField, searFields]);

  return (
    <AppBar position="static" style={{ display: 'flex', }}>
      <Toolbar className={classes.toolBar}>

        <div>
          <AppTitle />
        </div>

        <searFieldsContext.Provider value={{ searFields, setSearFields }}>
          <acFieldContext.Provider value={{ acField, setAcField }}>

            <div className={classes.centerSearch}>
              <SearchBar />
              <AutocompleteButton />
            </div>

            <div className={classes.barIcons}>
              <AdvancedSearchButton />
              <FavButton />
              <AccountEntrance />
            </div>

          </acFieldContext.Provider>
        </searFieldsContext.Provider>

      </Toolbar>
    </AppBar >
  );
}

export default HomeAppBar;
