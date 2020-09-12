import {
  IconButton, Button,
  Popper, Grow,
  ClickAwayListener,
  CardActionArea, CardActions, CardMedia, Card, CardContent
} from '@material-ui/core';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, createContext,
  useRef, useCallback
} from 'react';

import AutocompleteRadio from './AutocompleteRadio';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    acFieldButton: {
      fontSize: 14,
      color: 'white',
      borderRadius: 0,
      padding: 4,
    },
    acRadioCard: {
      backgroundColor: theme.palette.primary.main,
      border: 'solid 1px white',
    }
  }),
);

function AutocompleteButton() {
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
    <div>
      <IconButton
        ref={anchorRef}
        aria-controls={open ? 'autocomplete fields' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className={classes.acFieldButton}
      >
        Autocomplete Suggestion Field<ArrowDropDownIcon />
      </IconButton>

      <Popper open={open} anchorEl={anchorRef.current}
        role={undefined} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'center bottom' }}
          >

            <Card className={classes.acRadioCard}>
              <CardContent>
                <ClickAwayListener onClickAway={handleClose}>

                  <div>
                    <AutocompleteRadio />
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

export default AutocompleteButton;
