import {
  IconButton, Button,
  Popper, Grow,
  ClickAwayListener,
  CardActionArea, CardActions, CardMedia, Card, CardContent
} from '@material-ui/core';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, createContext,
  useRef, useCallback
} from 'react';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import SearchCheckBox from './SearchCheckBox';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    advancedSearchPaper: {
      backgroundColor: theme.palette.primary.main,
      border: 'solid 1px white',
    },
    advancedSearchButton: {
      marginLeft: 'auto',
      fontSize: 14,
      color: 'white',
      borderRadius: 0,
      padding: 2,
    },
  })
);

function AdvancedSearchButton() {
  const classes = useStyles();

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
    <div style={{ marginLeft: 'auto', }}>

      <IconButton
        ref={anchorRef}
        aria-controls={open ? 'advanced search' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className={classes.advancedSearchButton}
      >
        Advanced Search
        <ArrowDropDownIcon />
      </IconButton>

      <Popper open={open} anchorEl={anchorRef.current} disablePortal
        role={undefined} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'center bottom' }}
          >

            <Card className={classes.advancedSearchPaper}>
              <CardContent>
                <ClickAwayListener onClickAway={handleClose}>

                  <div>
                    <SearchCheckBox />
                  </div>

                </ClickAwayListener>
              </CardContent>
            </Card>

          </Grow>
        )}
      </Popper>
    </div>
  );
}

export default AdvancedSearchButton;
