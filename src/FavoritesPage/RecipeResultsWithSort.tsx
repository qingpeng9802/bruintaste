import {
  TablePagination,
  Typography,
  CircularProgress,
  MenuItem, Select,
  InputBase,
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

import { searchkey, userskey } from '../apiv1/apiv1Keys';

import { API_PREFIX } from '../apiv1/apiv1EndPoint';

import themeMui from '../styles/themeMui';

import {
  itemsPerPageContext, currPageResContext
} from './FavContexts';

import CardFeedWithTime from './CardFeedWithTime';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    resultHeader: {
      margin: theme.spacing(1, 3),

      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center',

      paddingTop: 8,
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
    sortByAndPagination: {
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    sortby: {
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center',
      margin: theme.spacing(1, 3),
    },
    sortbySelect: {
      paddingLeft: 8,
      textAlign: 'right',
      textAlignLast: 'right',
    },
    sortbyinputbase: {
      color: 'inherit',
      fontSize: 'inherit',
      flexShrink: 0,
      marginRight: 32,
      marginLeft: 8,
    },
  }),
);

function RecipeResultsWithSort() {
  const classes = useStyles();

  // the number of items showing per page
  const { itemsPerPage, setItemsPerPage } = useContext(itemsPerPageContext);
  // current page result
  const { currPageRes, setCurrPageRes } = useContext(currPageResContext);

  // page start with 0
  const [pageNum, setPageNum] = useState(0);

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

    // Test: if `isGetting` works
    //await new Promise(r => setTimeout(r, 2000));

    const sortTimeDesc = (a: any, b: any) => {
      return (b['createdtime'] as number) - (a['createdtime'] as number);
    };

    let res: { [key: string]: string }[] = [];

    await axios.get(API_PREFIX + getCardsRouteURL, {
      params: searchParams,
      timeout: 10000,
      headers: { 'Authorization': `Bearer ${token}` }
    }).then((response) => {
      console.log(response.data);
      res = response.data;

      setCardsRes(res.sort(sortTimeDesc));
      setCurrPageRes(res.slice(0, itemsPerPage));

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


  /** ----------------------------------- Page Actions ------------------------------- */

  useEffect(() => {
    console.log(pageNum, itemsPerPage);
    console.log(currPageRes);
  }, [currPageRes, pageNum, itemsPerPage]);

  const handlePageAction = useCallback((pageNumAction: number) => {
    setCurrPageRes(cardsRes.slice(((pageNum + pageNumAction) * itemsPerPage),
      (pageNum + pageNumAction + 1) * itemsPerPage));
    setPageNum(pageNum + pageNumAction);
  }, [setCurrPageRes, cardsRes, pageNum, itemsPerPage]);

  const handleChangeItemsPerPage = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPageNum(0);
    setCurrPageRes(cardsRes.slice(0, cardsResCount));
  }, [setItemsPerPage, setPageNum, setCurrPageRes, cardsRes, cardsResCount]);

  /** ----------------------------------- Page Actions End ---------------------------- */

  /** ------------------------------- Sort  ---------------------- */
  enum SortTypes {
    AddTimeAsc = 'Added Time Ascending',
    AddTimeDesc = 'Added Time Descending',
    TitleAsc = 'Title Ascending',
    TitleDesc = 'Title Descending'
  }

  const [currSortType, setCurrSortType] = useState(SortTypes.AddTimeDesc);

  function SortBy() {
    const sortTimeAsc = (a: any, b: any) => {
      return (a['createdtime'] as number) - (b['createdtime'] as number);
    };
    const sortTitleAsc = (a: any, b: any) => {
      return ('' + (a['title'] as string)).localeCompare(b['title'] as string);
    };
    const sortTimeDesc = (a: any, b: any) => {
      return (b['createdtime'] as number) - (a['createdtime'] as number);
    };
    const sortTitleDesc = (a: any, b: any) => {
      return ('' + (b['title'] as string)).localeCompare(a['title'] as string);
    };

    const sortTypes = Object.entries(SortTypes).map((ele: any) => ele[1] as string);
    const sortLabel = 'Sort by ';
    const sortLabelId = 'favSortByLabel';
    const sortId = 'favSortBy';

    const getSortFun = useCallback((sortType: SortTypes) => {
      switch (sortType) {
        case SortTypes.AddTimeAsc:
          return sortTimeAsc;
        case SortTypes.AddTimeDesc:
          return sortTimeDesc;
        case SortTypes.TitleAsc:
          return sortTitleAsc;
        case SortTypes.TitleDesc:
          return sortTitleDesc;
        default:
          return sortTimeDesc;
      }
    }, [SortTypes.AddTimeAsc, SortTypes.AddTimeDesc, SortTypes.TitleAsc, SortTypes.TitleDesc]);

    const handleRequestSort = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
      setCurrSortType(event.target.value as SortTypes);
      const sortFun = getSortFun(event.target.value as SortTypes);
      setCardsRes(cardsRes.sort(sortFun));

      setPageNum(0);
      setCurrPageRes(cardsRes.slice(0, itemsPerPage));
    }, [setCurrSortType, getSortFun, cardsRes, itemsPerPage]);

    return (
      <div className={classes.sortby}>

        <Typography color="inherit" variant="body2"
          style={{ flexShrink: 0, }} id={sortLabelId}>
          {sortLabel}
        </Typography>

        <Select
          className={classes.sortbySelect}
          input={
            <InputBase className={classes.sortbyinputbase} />
          }
          value={currSortType as string}
          onChange={handleRequestSort}
          id={sortId}
          labelId={sortLabelId}
        >

          {sortTypes.map((sorttype) => (
            <MenuItem
              key={sorttype as string}
              value={sorttype as string}
            >
              {sorttype}
            </MenuItem>
          ))}

        </Select>
      </div>
    );

  }

  /** ------------------------------- Sort End ---------------------- */

  function Pagination() {
    return (
      <TablePagination className={classes.resultPage}
        component="div"

        count={cardsResCount}
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
            Favorite Recipes
          </Typography>

          {isGetting ? <CircularProgress disableShrink color="primary" size={24}
            style={{
              margin: themeMui.spacing(0, 2),
            }} />
            : null}
        </div>

        <div className={classes.sortByAndPagination}>
          <SortBy />
          <Pagination />
        </div>

      </div>

      {(!isLoading) && isAuthenticated ?
        currPageRes.length ? (
          <div>
            <CardFeedWithTime res={currPageRes} favres={cardsRes} />

            <div className={classes.resultFooter}>
              <SortBy />
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
          ) : (
          <Typography variant="body1" color='textPrimary' style={{
            margin: themeMui.spacing(1, 3),
          }}>
            (｡･∀･)ﾉﾞ Please Log in first, then you can use Favorites Page.<br />
            Click the Account Icon in the upper right corner to Log in.
          </Typography>
        )}

    </div>
  );
}

export default RecipeResultsWithSort;
