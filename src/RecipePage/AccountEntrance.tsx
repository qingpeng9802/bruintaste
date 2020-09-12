import {
  IconButton, Button,
  Paper,
  Popper, Grow,
  ClickAwayListener,
} from '@material-ui/core';

import AccountCircle from '@material-ui/icons/AccountCircle';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, useRef
} from 'react';

import { useAuth0 } from "@auth0/auth0-react";

import {
  ifShowOverlayContext
} from './RecipePageContexts';

import themeMui from '../styles/themeMui';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accountButton: {
      margin: theme.spacing(0, 1),
      display: 'flex',
      flexFlow: 'column nowrap',
      justifyContent: 'center'
    },
    logoutButton: {
      backgroundColor: '#005587',
      color: '#ffffff',
      padding: theme.spacing(1, 2),
      margin: theme.spacing(2, 2),
    }
  }),
);

function AccountEntrance() {
  const classes = useStyles();

  const { loginWithPopup, logout, user, isAuthenticated, isLoading } = useAuth0();

  const { ifShowOverlay, setIfShowOverlay } = useContext(ifShowOverlayContext);

  const handleClick = () => {
    if ((!isLoading) && isAuthenticated) {
      console.log(user);
      handleToggle();
      return;
    }
    setIfShowOverlay(true);
    loginWithPopup();
  };

  /** ---------------------------- Popper ----------------------------------- */
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  /** ---------------------------- Popper End ----------------------------------- */

  return (
    <div>
      <div className={classes.accountButton}>

        <IconButton
          ref={anchorRef}
          aria-label="account of current user"
          onClick={handleClick}
          color="inherit"
          style={{ padding: 0 }}
        >
          <AccountCircle fontSize='default' />
        </IconButton>

        <div style={{
          fontSize: 12,
        }}>
          {(!isLoading) && isAuthenticated ? user.given_name : 'Login'}
        </div>

      </div>

      <div>
        <Popper open={open} anchorEl={anchorRef.current}
          role={undefined} transition>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'right bottom' }}>

              <ClickAwayListener onClickAway={handleClose}>

                <Paper>
                  <Button onClick={() => logout({ returnTo: window.location.origin })} className={classes.logoutButton}>
                    Log Out
                  </Button>
                </Paper>

              </ClickAwayListener>

            </Grow>
          )}
        </Popper>
      </div>

    </div>
  );
}

export default AccountEntrance;
