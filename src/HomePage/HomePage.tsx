import React from 'react';
import {
  useState, useEffect, useContext,
} from 'react';

import {
  searchResultsContext, searchingFlagContext,
  itemsPerPageContext, currPageResContext,
  ifShowOverlayContext
} from './HomeContexts';

import '../styles/PageBody.css';

import themeMui from '../styles/themeMui';
import GlobalCss from '../styles/GlobalCss';

import RecipeResults from './RecipeResults';
import HomeAppBar from './HomeAppBar';

import LoginPop from './LoginPop';

import {
  ThemeProvider
} from '@material-ui/core/styles';

function HomePage() {

  // share state management
  const [searchResults, setSearchResults] = useState<{ [key: string]: any }[]>([]);
  const [currPageRes, setCurrPageRes] = useState<{ [key: string]: any }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [ifShowOverlay, setIfShowOverlay] = useState(false);

  return (
    <ThemeProvider theme={themeMui}>
      <GlobalCss />

      <div>

        <itemsPerPageContext.Provider value={{ itemsPerPage, setItemsPerPage }}>
          <searchingFlagContext.Provider value={{ isSearching, setIsSearching }}>
            <searchResultsContext.Provider value={{ searchResults, setSearchResults }}>
              <currPageResContext.Provider value={{ currPageRes, setCurrPageRes }}>
                <ifShowOverlayContext.Provider value={{ ifShowOverlay, setIfShowOverlay }}>

                  <HomeAppBar />
                  <RecipeResults />
                  <LoginPop show={ifShowOverlay} />

                </ifShowOverlayContext.Provider>
              </currPageResContext.Provider>
            </searchResultsContext.Provider >
          </searchingFlagContext.Provider>
        </itemsPerPageContext.Provider>

      </div>

    </ThemeProvider>
  );
}

export default HomePage;
