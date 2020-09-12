import React from 'react';

import {
  Typography, Avatar
} from '@material-ui/core';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import themeMui from '../styles/themeMui';

import logo from '../logo.png';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
      },
      flexFlow: 'row nowrap',
      alignItems: 'center',
    }
  }),
);

function AppTitle() {
  const classes = useStyles();
  return (
    <div className={classes.title} >
      <img style={{
        marginRight: 8,
      }} alt="Bruin Taste Logo" src={logo} width="32" height="32" />
      <Typography variant="h6" noWrap>
        Bruin Taste
      </Typography>
    </div>
  );
}

export default AppTitle;
