import {
  TablePagination,
  Typography,
  CircularProgress,
} from '@material-ui/core';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, createContext,
  useRef, useCallback
} from 'react';

import { useAuth0 } from "@auth0/auth0-react";

import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';

import axios from 'axios';

import {
  searchResultsContext, searchingFlagContext,
  itemsPerPageContext, currPageResContext,
} from './HomeContexts';

import CardFeed from './CardFeed';

import { searchkey, userskey } from '../apiv1/apiv1Keys';

import { API_PREFIX } from '../apiv1/apiv1EndPoint';

import themeMui from '../styles/themeMui';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    resultHeader: {
      margin: theme.spacing(1, 3),

      paddingTop: 8,

      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center',
    },
    resultFooter: {
      margin: theme.spacing(1, 3),

      flexFlow: 'row nowrap',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    resHeaderLeft: {
      paddingTop: 8,

      marginRight: 'auto',

      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center',
    },
    resultPage: {
      display: 'flex',
      alignItems: 'center',
    },
    TablePaginationToolbar: {
      marginLeft: 'auto',
    },
  }),
);

function RecipeResults() {
  const classes = useStyles();

  const { searchResults, setSearchResults } = useContext(searchResultsContext);
  const { isSearching, setIsSearching } = useContext(searchingFlagContext);
  // the number of items showing per page
  const { itemsPerPage, setItemsPerPage } = useContext(itemsPerPageContext);
  // current page result
  const { currPageRes, setCurrPageRes } = useContext(currPageResContext);

  // page start with 0
  const [pageNum, setPageNum] = useState(0);

  /** ----------------------------------- Page Actions ------------------------------- */
  const searchResCount = searchResults.length;

  useEffect(() => {
    console.log(pageNum, itemsPerPage);
    console.log(currPageRes);
  }, [pageNum, itemsPerPage, currPageRes]);

  const handlePageAction = useCallback((pageNumAction: number) => {
    setCurrPageRes(searchResults.slice(((pageNum + pageNumAction) * itemsPerPage),
      (pageNum + pageNumAction + 1) * itemsPerPage));
    setPageNum(pageNum + pageNumAction);
  }, [setCurrPageRes, searchResults, pageNum, itemsPerPage]);

  const handleChangeItemsPerPage = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPageNum(0);
    setCurrPageRes(searchResults.slice(0, searchResCount));
  }, [setItemsPerPage, setPageNum, setCurrPageRes, searchResults, searchResCount]);

  /** ----------------------------------- Page Actions End ---------------------------- */

  /** -------------------------------- Fav Cards --------------------------------------- */
  const { getAccessTokenSilently, loginWithPopup, logout,
    user, isAuthenticated, isLoading } = useAuth0();

  const [isGetting, setIsGetting] = useState(false);
  const [cardsRes, setCardsRes] = useState<{ [key: string]: any }[]>([]);

  const cardsResCount = cardsRes.length;

  const getCardsAsync = async (user: any, getAccessTokenSilently: any) => {
    if (user === undefined) {
      return;
    }

    const tokenConfig = {
      audience: process.env.REACT_APP_AUTH0_AUD,
      scope: process.env.REACT_APP_AUTH0_RFAVC,
    };

    let token;
    try {
      token = await getAccessTokenSilently(tokenConfig);
    } catch (e) {
      console.log(e);
      return;
    }

    const getCardsRouteURL = `/users/favcards/${user.sub}`;
    console.log(userskey);
    let searchParams = {};
    searchParams = Object.assign(
      searchParams,
      userskey,
    );

    // Test: if `isSearching` works
    //await new Promise(r => setTimeout(r, 2000));

    let res: { [key: string]: string }[] = [];

    await axios.get(API_PREFIX + getCardsRouteURL, {
      params: searchParams,
      timeout: 10000,
      headers: { 'Authorization': `Bearer ${token}` }
    }).then((response) => {
      console.log(response.data);
      res = response.data;
      setCardsRes(res);
      return;
    }).catch(() => {
      setCardsRes([]);
      return;
    });
  };

  const getCardsAsyncDebounced = useConstant(() =>
    AwesomeDebouncePromise(getCardsAsync, 200)
  );

  // when search button is clicked, do searching
  const handleGetCardsAsyncDebounced = useCallback(() => {
    // still searching, cut new search
    if (isGetting) {
      return;
    }

    console.log('Getting Cards start');
    setIsGetting(true);
    console.log(user);
    getCardsAsyncDebounced(user, getAccessTokenSilently).then(
      () => {
        setIsGetting(false);
        console.log('Getting Cards end');
      }
    );
    return;
  }, [getCardsAsyncDebounced, isGetting, setIsGetting, user, getAccessTokenSilently]);

  // initial `currPage`
  useEffect(() => {
    if ((!isLoading) && isAuthenticated) {
      handleGetCardsAsyncDebounced();
    }
  }, [isLoading, isAuthenticated]);

  /** -------------------------------- Fav Cards End --------------------------------------- */

  function Pagination() {
    return (
      <TablePagination className={classes.resultPage}
        classes={{ toolbar: classes.TablePaginationToolbar }}
        component="div"

        count={searchResCount}
        // contorl < 500 to optimazied render performance
        rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
        labelRowsPerPage={'Items per page:'}
        page={pageNum}
        rowsPerPage={itemsPerPage}

        onChangePage={() => { }}
        onChangeRowsPerPage={handleChangeItemsPerPage}

        backIconButtonProps={{ 'onClick': () => handlePageAction(-1) }}
        nextIconButtonProps={{ 'onClick': () => handlePageAction(1) }}
      />
    );
  }

  return (
    <div>

      <div className={classes.resultHeader}>

        <div className={classes.resHeaderLeft}>
          <Typography variant="h5" color='primary'>
            Search Results
          </Typography>

          {isSearching ? <CircularProgress disableShrink color="primary" size={24}
            style={{
              margin: themeMui.spacing(0, 2),
            }} />
            : null}
        </div>

        <Pagination />

      </div>

      {currPageRes.length ? (
        <div>
          <CardFeed res={currPageRes} favres={cardsRes} />

          <div className={classes.resultFooter}>
            <Pagination />
          </div>

        </div>
      ) : (
          <Typography variant="body1" color='textPrimary'
            style={{
              margin: themeMui.spacing(1, 3),
            }}>
            Nothing here... _(:з」∠)_<br />
            Try to search or use new keywords.
          </Typography>
        )}

    </div>
  );
}

export default RecipeResults;
