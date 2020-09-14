import {
  IconButton, Button,
  Typography, Paper,
  CircularProgress,
} from '@material-ui/core';

import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, useCallback
} from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
  useRouteMatch,
  useParams
} from "react-router-dom";

import axios from 'axios';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';

import { useAuth0 } from "@auth0/auth0-react";

import { API_PREFIX } from '../apiv1/apiv1EndPoint';
import { searchkey, userskey } from '../apiv1/apiv1Keys';

import themeMui from '../styles/themeMui';

import {
  ifShowOverlayContext
} from './RecipePageContexts';

import NutritionFactsClass from './NutritionFactsClass';
import NutritionFactsLabel from './NutritionFactsLabel';

const uclamenuURL = 'http://menu.dining.ucla.edu/Recipes/';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pageContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      paddingTop: 8,
    },
    pagePaper: {
      display: 'flex',
      flexFlow: 'column nowrap',


      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      marginLeft: theme.spacing(6),
      marginRight: theme.spacing(6),
      [theme.breakpoints.up('lg')]: {
        width: 1000,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },

    pageHeader: {
      display: 'flex',

      [theme.breakpoints.down('sm')]: {
        flexFlow: 'row wrap',
      },

      flexFlow: 'row nowrap',
      alignItems: 'center',

      margin: theme.spacing(4, 4),
    },
    pageLeftHeader: {
      marginRight: 'auto',
    },
    pageRedirect: {
      margin: theme.spacing(1, 1),
    },
    pageFeatures: {
      [theme.breakpoints.down('sm')]: {
        marginRight: 'auto',
        marginLeft: 0,
        marginTop: 16,
      },
      marginLeft: 16,

      width: 300,
    },

    pageBody: {
      display: 'flex',

      [theme.breakpoints.down('sm')]: {
        flexFlow: 'row wrap',
      },
      flexFlow: 'row nowrap',

      margin: theme.spacing(4, 4),
    },
    pageNFL: {
      minWidth: 290,
    },
    pageBodyRight: {

    },
    pageImg: {
      maxWidth: '100%',
      height: 'auto',

      [theme.breakpoints.up('sm')]: {
        margin: theme.spacing(2, 2),
      },
    },

    pageIngr: {
      margin: theme.spacing(2, 2),
    },
    pageAlleg: {
      margin: theme.spacing(2, 2),
    },
    pageTip: {
      margin: theme.spacing(2, 2),
    },

    disc: {
      display: 'flex',
      flexFlow: 'row nowrap',

      margin: theme.spacing(4, 4),
    }
  }),
);

function RecipeContent() {
  const classes = useStyles();

  const { pageid, fav } = useParams() ?? { pageid: undefined, fav: undefined };

  const [item, setItem] = useState<{ [key: string]: any }>({
    "_id": "",
    "allerg": [],
    "desc": null,
    "eimg": true,
    "ingredstr": "",
    "nf_cal": 0,
    "nf_calcium": 0,
    "nf_chol": 0,
    "nf_cholp": 0,
    "nf_diefib": 0,
    "nf_diefibp": 0,
    "nf_fatcal": 0,
    "nf_iron": 0,
    "nf_protein": 0,
    "nf_sf": 0,
    "nf_sfp": 0,
    "nf_size": 0,
    "nf_sodium": 0,
    "nf_sodiump": 0,
    "nf_sugars": 0,
    "nf_tf": 0,
    "nf_totalcar": 0,
    "nf_totalcarp": 0,
    "nf_totalf": 0,
    "nf_totalfp": 0,
    "nf_unit": "",
    "nf_vitaa": 0,
    "nf_vitac": 0,
    "piccode": [],
    "title": ""
  });

  /** ----------------------- Search -------------------------------- */
  const [isSearching, setIsSearching] = useState(false);

  const getSearchAsync = async (pageid: string) => {
    const searchRouteURL = `/recipes/basic/${pageid}`;
    let searchParams = {};
    searchParams = Object.assign(
      searchParams,
      searchkey,
    );

    // Test: if `isSearching` works
    //await new Promise(r => setTimeout(r, 2000));

    let res: { [key: string]: any }[] = [];

    await axios.get(API_PREFIX + searchRouteURL, {
      params: searchParams,
      timeout: 10000
    }).then((response) => {
      res = response.data;
      setItem(res);
      return;
    }).catch((e) => {
      console.log(e);
      return;
    });
  };

  const getSearchAsyncDebounced = useConstant(() =>
    AwesomeDebouncePromise(getSearchAsync, 200)
  );

  // when search button is clicked, do searching
  const handleSearch = useCallback(() => {
    // still searching, cut new search
    if (isSearching) {
      return;
    }

    console.log('Getting start');
    setIsSearching(true);

    getSearchAsyncDebounced(pageid).then(
      () => {
        setIsSearching(false);
        console.log('Getting end');
      }
    );
    return;
  }, [pageid, isSearching, setIsSearching, getSearchAsyncDebounced]);

  // initial `pageContent`
  useEffect(() => {
    handleSearch();
  }, []);

  /** ----------------------- Search End ----------------------------- */

  /** ------------------------ Fav Click Button ------------------------ */

  const { getAccessTokenSilently, loginWithPopup, logout, user, isAuthenticated, isLoading } = useAuth0();

  const { ifShowOverlay, setIfShowOverlay } = useContext(ifShowOverlayContext);

  const [isOperating, setIsOperating] = useState(false);
  const [isFav, setIsFav] = useState(fav);

  const patchAccountAsync = async (user: any, isFav: boolean, recipeid: string) => {
    if (user === undefined) {
      return;
    }
    console.log(user);

    const op = isFav ? 'favremove' : 'favadd';

    const putAccountRouteURL = `/users/${op}/${user.sub}`;

    let searchParams = {};
    searchParams = Object.assign(
      searchParams,
      userskey
    );

    // Test: if `isSearching` works
    //await new Promise(r => setTimeout(r, 2000));

    const scope = isFav ? process.env.REACT_APP_AUTH0_REMFAV : process.env.REACT_APP_AUTH0_USFAV;

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
      { 'recipeid': recipeid }, {
      params: searchParams,
      timeout: 10000,
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
      console.log(`Log in database as ${user.name} successfully.`);

      setIsFav(!isFav);
      return;
    }).catch(() => {
      console.log(`Log in database as ${user.name} failed.`);
      return;
    });
  };

  const patchAccountAsyncDebounced = useConstant(() =>
    AwesomeDebouncePromise(patchAccountAsync, 200)
  );

  // when search button is clicked, do searching
  const handlePatchAccountAsyncDebounced = useCallback(() => {
    // still searching, cut new search
    if (isOperating) {
      return;
    }

    console.log('Operating start');
    setIsOperating(true);

    patchAccountAsyncDebounced(user, isFav, item._id).then(
      () => {
        setIsOperating(false);
        console.log('Operating end');
      }
    );
  }, [patchAccountAsyncDebounced, user, setIsOperating, isOperating, isFav, item]);

  const handleChange = () => {
    if ((!isLoading) && isAuthenticated) {
      console.log(user);
      return;
    }
    setIfShowOverlay(true);
    loginWithPopup();
  };

  /** ------------------------ Fav Click Button ------------------------ */

  /** ----------------------- Prepare for nf ------------------------- */
  const validnf = [
    'nf_cal',
    'nf_calcium',
    'nf_chol',
    'nf_cholp',
    'nf_diefib',
    'nf_diefibp',
    'nf_fatcal',
    'nf_iron',
    'nf_protein',
    'nf_sf',
    'nf_sfp',
    'nf_size',
    'nf_sodium',
    'nf_sodiump',
    'nf_sugars',
    'nf_tf',
    'nf_totalcar',
    'nf_totalcarp',
    'nf_totalf',
    'nf_totalfp',
    'nf_unit',
    'nf_vitaa',
    'nf_vitac'
  ];

  let nfs: { [key: string]: any } = {};
  for (const ele of validnf) {
    nfs[ele] = item[ele];
  }
  const nfsClass = new NutritionFactsClass(nfs);

  /** ----------------------- Prepare for nf End ------------------------- */

  const { _id, allerg, piccode, title, desc, ingredstr, eimg } = item;

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
      featuresStr += (ele + '\n');
    }
    featuresStr = featuresStr.slice(0, -1);
  }

  const tip = '*This item’s ingredients contain or are produced in a facility that processes the indicated allergens.';
  const disc = 'Nutrition information is approximate, based on current product and recipe data. Manufacturers may change their product formulation or consistency of ingredients without our knowledge, and product availability may fluctuate. While we make every effort to identify ingredients, we cannot assure against these contingencies. We cannot guarantee that a particular dish or item is free of a certain ingredient. UCLA Dining Services will assume no liability for any adverse reactions that may occur in the residential restaurants. Please be advised that our Bakery produces hamburger buns, pizza dough, and baked goods on equipment that also processes tree nut products.';

  function RecipePaper() {
    return (
      <Paper className={classes.pagePaper}>

        <div className={classes.pageHeader}>

          <div className={classes.pageLeftHeader}>

            <Typography variant="h4" color='primary'>
              {title}
            </Typography>

            <Button className={classes.pageRedirect} size='small' color='primary'
              target="_blank" href={`${uclamenuURL}${_id}/1`}>
              Original Link
            </Button>

            {(!isLoading) && isAuthenticated ?
              <IconButton size="small"
                onClick={handlePatchAccountAsyncDebounced}>
                {isOperating ? <CircularProgress disableShrink size={20} />
                  : isFav ? <StarIcon color='secondary' /> : <StarBorderIcon />}
              </IconButton>
              :
              <IconButton size="small"
                onClick={handleChange}>
                <StarBorderIcon />
              </IconButton>
            }

            {desc ?
              <Typography variant="h6" color='textPrimary'>
                {desc}
              </Typography>
              : null}

          </div>

          {featuresStr !== '' ?
            <Typography variant="body1" color='textPrimary' className={classes.pageFeatures}>
              <strong>Features<br /></strong> {featuresStr}
            </Typography>
            : null}

        </div>

        <div className={classes.pageBody}>

          <div className={classes.pageNFL}>
            <NutritionFactsLabel nfs={nfsClass} />
          </div>

          <div className={classes.pageBodyRight}>

            <Typography variant="body1" color='textPrimary' className={classes.pageIngr}>
              <strong>INGREDIENTS:</strong> {ingredstr}
            </Typography>

            {allerStr !== '' ?
              <Typography variant="body1" color='textPrimary' className={classes.pageAlleg}>
                <strong>ALLERGENS*:</strong> {allerStr}
              </Typography>
              : null}

            <Typography variant="body1" color='textPrimary' className={classes.pageTip}>
              <strong>{tip}</strong>
            </Typography>

            {eimg ?
              <img className={classes.pageImg} src={`${process.env.PUBLIC_URL}/recipe_imgs/${_id}.jpg`}
                alt={title} />
              : null}

          </div>

        </div>

        <Typography variant="body1" color='textPrimary' className={classes.disc}>
          <i>{disc}</i>
        </Typography>

      </Paper>
    );
  }

  return (
    <div className={classes.pageContainer}>
      {isSearching ?
        <CircularProgress disableShrink color="primary" size={30}
          style={{ margin: themeMui.spacing(3, 3) }} />
        :
        (item && _id) ?
          <RecipePaper />
          :
          <Typography variant="body1" color='textPrimary' style={{
            margin: themeMui.spacing(3, 3)
          }}>
            No result, something wrong :(
          </Typography>
      }
    </div>
  );
}

export default RecipeContent;
