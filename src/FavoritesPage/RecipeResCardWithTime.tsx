import {
  IconButton, Button,
  Typography, Paper, Divider,
  CircularProgress,
  CardActionArea, CardActions, CardMedia, Card, CardContent
} from '@material-ui/core';

import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from "@material-ui/icons/Star";

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, useRef, useCallback
} from 'react';

import {
  BrowserRouter as Router, Link as RouterLink,
  Switch, Route, useLocation
} from 'react-router-dom';

import axios from 'axios';

import { useAuth0 } from "@auth0/auth0-react";

import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';

import {
  ifShowOverlayContext
} from './FavContexts';

import themeMui from '../styles/themeMui';

import { searchkey, userskey } from '../apiv1/apiv1Keys';

import { API_PREFIX } from '../apiv1/apiv1EndPoint';

const uclamenuURL = 'http://menu.dining.ucla.edu/Recipes/';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
  }),
);

function RecipeResCardWithTime(props: any) {
  const classes = useStyles();
  const res = props.res;

  const { getAccessTokenSilently, loginWithPopup, logout, user, isAuthenticated, isLoading } = useAuth0();

  const { ifShowOverlay, setIfShowOverlay } = useContext(ifShowOverlayContext);

  const handleClick = () => {
    if ((!isLoading) && isAuthenticated) {
      console.log(user);
      return;
    }
    setIfShowOverlay(true);
    loginWithPopup();
  };

  /** ---------------------------------- modify fav --------------------------- */
  const [isOperating, setIsOperating] = useState(false);
  const [isFav, setIsFav] = useState(props.fav);

  const patchAccountAsync = async (user: any, isFav: boolean) => {
    if (user === undefined) {
      return;
    }

    const op = isFav ? 'favremove' : 'favadd';

    const putAccountRouteURL = `/users/${op}/${user.sub}`;

    const recipeid = res._id;

    let searchParams = {};
    searchParams = Object.assign(
      searchParams,
      userskey
    );
    console.log(searchParams);

    // Test: if `isSearching` works
    //await new Promise(r => setTimeout(r, 2000));

    const scope = isFav ?
      process.env.REACT_APP_AUTH0_REMFAV :
      process.env.REACT_APP_AUTH0_USFAV;

    const tokenConfig = {
      audience: process.env.REACT_APP_AUTH0_AUD,
      scope: scope,
    };

    let token;
    try {
      token = await getAccessTokenSilently(tokenConfig);
    } catch (e) {
      console.log(e);
      return;
    }

    await axios.patch(API_PREFIX + putAccountRouteURL,
      {
        'recipeid': recipeid
      }, {
      params: searchParams,
      timeout: 10000,
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
      console.log(`User: ${user.name} and ${op} successfully.`);
      setIsFav(!isFav);
      return;
    }).catch(() => {
      console.log(`User: ${user.name} and ${op} failed.`);
      return;
    });
  };

  const patchAccountAsyncDebounced = useConstant(() =>
    AwesomeDebouncePromise(patchAccountAsync, 200)
  );

  const handlepatchAccountAsyncDebounced = useCallback(() => {
    if (isOperating) {
      return;
    }

    console.log('Operating start');
    setIsOperating(true);

    patchAccountAsyncDebounced(user, isFav).then(
      () => {
        setIsOperating(false);
        console.log('Operating end');
      }
    );
  }, [patchAccountAsyncDebounced, user, setIsOperating, isOperating, isFav]);

  /** ---------------------------------- modify fav End --------------------------- */

  const { _id, eimg, title, desc, ingredstr, allerg, piccode, createdtime } = res;

  let allerStr = '';
  if (allerg) {
    for (const ele of allerg) {
      allerStr += (ele + ', ');
    }
    allerStr = allerStr.slice(0, -2);
  }

  let featuresStr = '';
  if (piccode) {
    for (const ele of piccode) {
      featuresStr += (ele + ', ');
    }
    featuresStr = featuresStr.slice(0, -2);
  }

  const timeObj = new Date(createdtime);
  const timeStr = timeObj.toLocaleString();

  return (
    <Card style={{
      margin: themeMui.spacing(2, 0),
    }}>

      <CardActionArea component={RouterLink} to={
        isFav ? `/recipe/${_id}/fav`
          : `/recipe/${_id}`}>

        {eimg ?
          <CardMedia
            component="img"
            alt={title}
            height="450"
            image={`${process.env.PUBLIC_URL}/recipe_imgs/${_id}.jpg`}
            title={title} />
          : null}

        <CardContent>

          <Typography variant="h5" color='textPrimary'>
            {title}
          </Typography>

          {desc ?
            <Typography variant="h6">
            </Typography>
            : null}

          <Typography variant="body1">
            {ingredstr}
          </Typography>

        </CardContent>

      </CardActionArea>

      {(featuresStr === '') && (allerStr === '') ? null :
        <CardContent>
          <Divider />
          {featuresStr !== '' ?
            <Typography variant="body1" color='textPrimary'>
              <strong>Features</strong> {featuresStr}
            </Typography>
            : null}
          {allerStr !== '' ?
            <Typography variant="body1" color='textPrimary'>
              <strong>Allergens</strong> {allerStr}
            </Typography>
            : null}
          <Divider />
        </CardContent>
      }

      <CardActions>
        {(!isLoading) && isAuthenticated ?
          <IconButton size="small"
            onClick={handlepatchAccountAsyncDebounced}>
            {isOperating ? <CircularProgress disableShrink size={20} />
              : isFav ? <StarIcon color='secondary' /> : <StarBorderIcon />}
          </IconButton>
          :
          <IconButton size="small"
            onClick={handleClick}>
            <StarBorderIcon />
          </IconButton>
        }

        <Button size='small'
          target="_blank" href={`${uclamenuURL}${_id}/1`}>
          Original Link
        </Button>

        <Typography variant="body2" color='textPrimary'
          style={{ marginLeft: 'auto' }}>
          {timeStr}
        </Typography>

      </CardActions>

    </Card >
  );
}

export default RecipeResCardWithTime;
