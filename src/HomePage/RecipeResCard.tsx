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
} from './HomeContexts';

import themeMui from '../styles/themeMui';

import { searchkey, userskey } from '../apiv1/apiv1Keys';

import { API_PREFIX } from '../apiv1/apiv1EndPoint';

const uclamenuURL = 'http://menu.dining.ucla.edu/Recipes/';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    highlightRes:{
      color: '#2774AE',
    }
  }),
);

function RecipeResCard(props: any) {
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

  useEffect(() => {
    //console.log(res);
  }, [res]);

  const { _id, eimg, highlights, title, desc, ingredstr, allerg, piccode } = res;

  /** -------------------------------- Highlight -------------------------------- */

  enum ValidFields {
    Title = 'title',
    Desc = 'desc',
    Ingredstr = 'ingredstr',
    Allerg = 'allerg',
    Piccode = 'piccode',
  }

  let { title: hl_title, desc: hl_desc, ingredstr: hl_ingredstr,
    allerg: hl_allerg, piccode: hl_piccode } = res;

  const highlightEle = (ele: { [key: string]: any }): JSX.Element =>
    ele.type === 'hit' ?
      <span className={classes.highlightRes}>
        {ele.value}
      </span>
      :
      <span>{ele.value}</span>;

  const reconstructStr = (textsArr: { [key: string]: any }[]): JSX.Element => {
    return (
      <span>
        {textsArr.map((ele: { [key: string]: any }) => highlightEle(ele))}
      </span>
    );
  };

  const highlightArrEle =
    (textsArr: { [key: string]: any }[], atom: string | JSX.Element):
      string | JSX.Element => {

      const textsOnlyValueArr = textsArr.map((text: { [key: string]: any }) =>
        text.value);
      const concatAllStr = (acc: string, curr: { [key: string]: any }) =>
        acc + curr;
      const currText = textsOnlyValueArr.reduce(concatAllStr);

      return atom !== currText ? atom : reconstructStr(textsArr);
    };

  const reconstructArr = (highlightedElesArr: (JSX.Element | string)[]):
    JSX.Element[] => {

    let resArr: JSX.Element[] = [];

    for (let [i, ele] of highlightedElesArr.entries()) {
      if (!React.isValidElement(ele)) {
        ele = <span>{ele}</span>;
      }
      if (highlightedElesArr.length - 1 !== i) {
        resArr.push(ele);
        resArr.push(<span>, </span>);
      } else {
        resArr.push(ele);
      }
    }

    return resArr;
  };

  for (const ele of highlights) {
    switch (ele.path) {
      case ValidFields.Title:
        hl_title = reconstructStr(ele.texts);
        break;
      case ValidFields.Desc:
        hl_desc = reconstructStr(ele.texts);
        break;
      case ValidFields.Ingredstr:
        hl_ingredstr = reconstructStr(ele.texts);
        break;
      case ValidFields.Allerg:
        hl_allerg = hl_allerg.map((atom: string) => highlightArrEle(ele.texts, atom));
        break;
      case ValidFields.Piccode:
        hl_piccode = hl_piccode.map((atom: string) => highlightArrEle(ele.texts, atom));
        break;
      default:
        break;
    }
  }

  hl_allerg = hl_allerg ? reconstructArr(hl_allerg) : null;
  hl_piccode = hl_piccode ? reconstructArr(hl_piccode) : null;

  /** -------------------------------- Highlight End ----------------------------- */

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
            alt={hl_title}
            height="450"
            image={`${process.env.PUBLIC_URL}/recipe_imgs/${_id}.jpg`}
            title={hl_title} />
          : null}

        <CardContent>

          <Typography variant="h5" color='textPrimary'>
            {hl_title}
          </Typography>

          {hl_desc ?
            <Typography variant="h6">
            </Typography>
            : null}

          <Typography variant="body1">
            {hl_ingredstr}
          </Typography>

        </CardContent>

      </CardActionArea>

      {((!piccode || piccode.length === 0) && (!allerg || allerg.length === 0)) ?
        null :
        <CardContent>
          <Divider />
          {piccode && (piccode.length !== 0) ?
            <Typography variant="body1" color='textPrimary'>
              <strong>Features</strong> {hl_piccode}
            </Typography>
            : null}
          {allerg && (allerg.length !== 0) ?
            <Typography variant="body1" color='textPrimary'>
              <strong>Allergens</strong> {hl_allerg}
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

      </CardActions>

    </Card >
  );
}

export default RecipeResCard;
