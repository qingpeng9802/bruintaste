import React from 'react';
import {
  useState, useEffect, useContext, createContext,
  useRef, useCallback
} from 'react';

import {
  searchResultsContext, searchingFlagContext,
  itemsPerPageContext, currPageResContext,
} from './HomeContexts';

import {
  acFieldContext, searFieldsContext
} from './HomeAppBarContext';

import AwesomeDebouncePromise from 'awesome-debounce-promise';
import useConstant from 'use-constant';

import axios from 'axios';

import {
  fade, makeStyles, Theme, createStyles, withStyles,
} from '@material-ui/core/styles';

import {
  IconButton, Button,
  Divider,
  CircularProgress,
  TextField
} from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';

import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import { searchkey, userskey } from '../apiv1/apiv1Keys';

import { API_PREFIX } from '../apiv1/apiv1EndPoint';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchBar: {
      display: "flex",

      border: 'none',
      borderRadius: 36,

      backgroundColor: fade(theme.palette.common.white, 0.85),
      '&:hover': {
        backgroundColor: theme.palette.common.white,
      },
      '&:focus-within': {
        backgroundColor: theme.palette.common.white,
      },

      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(2),

      width: '100%',
      height: 36,
    },
    acSearch: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: theme.spacing(0, 0, 0, 3),
    },
    inputBox: {
      border: 'none',

      width: 440,
      [theme.breakpoints.down('md')]: {
        width: 260,
      },
      [theme.breakpoints.down('sm')]: {
        width: 130,
      },
    },
    searchIcon: {
      border: 'none',
      borderRadius: 0,

      padding: theme.spacing(2, 2),

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    clearIcon: {
      border: 'none',
      borderRadius: 0,

      padding: theme.spacing(2, 2),

      display: 'flex',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    iconDividerContainer: {
      padding: theme.spacing(1.2, 0, 2, 0),

      display: 'flex',
      alignItems: 'center',
    },
  }),
);

function SearchBar() {
  const classes = useStyles();

  // is Autocomplete loading
  const [isLoading, setIsLoading] = useState(false);

  // current search text in input box
  const [searchText, setSearchText] = useState('');
  // current search options for autocomplete
  const [searchOptions, setSearchOptions] = useState<string[]>([]);

  const { acField } = useContext(acFieldContext);
  const { searFields } = useContext(searFieldsContext);

  const { itemsPerPage } = useContext(itemsPerPageContext);
  const { currPageRes, setCurrPageRes } = useContext(currPageResContext);
  const { searchResults, setSearchResults } = useContext(searchResultsContext);
  const { isSearching, setIsSearching } = useContext(searchingFlagContext);

  /** -----------------------Suggestion ---------------------------- */

  // get suggestion from API async
  const getSuggestionAsync = async (searchText: any, acField: string) => {
    const suggestRouteURL = '/recipes/suggest';
    let suggestParams = {};
    suggestParams = Object.assign(
      suggestParams,
      searchkey,
      { searchstr: searchText },
      { [acField]: true }
    );

    let options: { [key: string]: string }[] = [];
    // Test: if `isLoading` works
    //await new Promise(r => setTimeout(r, 2000));
    console.log(API_PREFIX);
    await axios.get(API_PREFIX + suggestRouteURL, {
      params: suggestParams,
      timeout: 10000
    }).then((response) => {
      options = response.data;
      setSearchOptions(options.map((ele) => { return ele[acField]; }) as string[]);
      return;
    }).catch(() => {
      setSearchOptions(['Error: *** API Server Failed ***']);
      return;
    });
  };

  // useConstant only create function once,
  // unlike useCallback, no later updating hook,
  // need to pass new params
  const getSuggestionAsyncDebounced = useConstant(() =>
    AwesomeDebouncePromise(getSuggestionAsync, 200)
  );

  // when `searchText`, `acField` changes, get suggestion
  useEffect(() => {
    // no text, do not update
    if (searchText === undefined || searchText.length < 2) {
      setSearchOptions([]);
      return;
    }

    console.log('Update suggestion start');
    setIsLoading(true);

    getSuggestionAsyncDebounced(searchText, acField).then(
      () => {
        setIsLoading(false);
        console.log('Update suggestion end');
      }
    );
  }, [searchText, acField, getSuggestionAsyncDebounced]);

  /** ----------------------- Suggestion End---------------------------- */

  /** ----------------------- Search Button ---------------------------- */
  const getSearchAsync = async (searchText: any, searFields: any) => {
    const searchRouteURL = '/recipes/search';

    const arrOnlyTrue = Object.entries(searFields).filter((ele) => { return ele[1]; });
    let filtersOnlyTrue: { [key: string]: boolean } = {};
    arrOnlyTrue.forEach((ele: [string, any]) => {
      filtersOnlyTrue[ele[0]] = ele[1];
    });

    let searchParams = {};
    searchParams = Object.assign(
      searchParams,
      searchkey,
      { searchstr: searchText },
      filtersOnlyTrue
    );

    // Test: if `isSearching` works
    //await new Promise(r => setTimeout(r, 2000));

    let res: { [key: string]: string }[] = [];

    await axios.get(API_PREFIX + searchRouteURL, {
      params: searchParams,
      timeout: 10000
    }).then((response) => {
      res = response.data;
      setSearchResults(res);
      return;
    }).catch(() => {
      setSearchResults([]);
      return;
    });
  };

  const getSearchAsyncDebounced = useConstant(() =>
    AwesomeDebouncePromise(getSearchAsync, 200)
  );

  // when search button is clicked, do searching
  const handleSearch = useCallback((searFields: any, searchText: string) => {
    // still searching, cut new search
    if (isSearching) {
      return;
    }

    // no text, do not update
    if (searchText === undefined || searchText.length < 2) {
      setSearchResults([]);
      return;
    }

    console.log('Searching start');
    setIsSearching(true);

    getSearchAsyncDebounced(searchText, searFields).then(
      () => {
        setIsSearching(false);
        console.log('Searching end');
      }
    );
    return;
  }, [isSearching, setIsSearching, setSearchResults, getSearchAsyncDebounced]);

  // initial `currPage`
  useEffect(() => {
    setCurrPageRes(searchResults.slice(0, itemsPerPage));
  }, [setCurrPageRes, searchResults, itemsPerPage]);

  /** ----------------------- Search Button End ---------------------------- */

  return (
    <div className={classes.searchBar}
      onKeyUp={(event) => event.key === 'Enter' ? handleSearch(searFields, searchText) : null}>

      <Autocomplete
        className={classes.acSearch}
        id="ac_search"
        value={searchText}

        onChange={(event, value, reason) => {
          console.log(value, reason);
          if (reason === 'select-option' && value) {
            handleSearch(searFields, value);
          }
        }}

        onInputChange={(event, value) => {
          setSearchText(value);
          console.log(searchText);
        }}

        getOptionSelected={(option, value) => option === value}
        getOptionLabel={(option) => option}

        options={searchOptions}
        loading={isLoading}

        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search..."
            className={classes.inputBox}

            InputProps={{
              ...params.InputProps,
              disableUnderline: true,

              endAdornment: (
                <React.Fragment>
                  {isLoading ? <CircularProgress disableShrink color="inherit" size={20} /> : null}
                </React.Fragment>
              ),

            }}

          />
        )}

      />

      <IconButton className={classes.clearIcon} aria-label="clear"
        onClick={() => {
          setSearchOptions([]);
          setSearchText('');
        }}>
        <ClearIcon />
      </IconButton>

      <div className={classes.iconDividerContainer}>
        <Divider flexItem orientation="vertical" style={{
          height: 20,
        }} />
      </div>

      <IconButton className={classes.searchIcon} aria-label="search"
        onClick={() => handleSearch(searFields, searchText)} >
        <SearchIcon />
      </IconButton>

    </div >
  );
}

export default SearchBar;
