import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, useMemo
} from 'react';

import themeMui from '../styles/themeMui';

import BreakpointMasonry from '../components/BreakpointMasonry';

import RecipeResCard from './RecipeResCard';
import { Console } from 'console';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
  }),
);

function CardFeed(props: any) {
  const classes = useStyles();

  const cardsResIdArr = props.favres.map((ele: any) => ele._id);
  const res = props.res;

  return useMemo(() => (
    <div style={{
      margin: themeMui.spacing(0, 3, 2, 3),
    }}>

      <BreakpointMasonry>
        {res.map((searchResult: any) => (
          <RecipeResCard
            res={searchResult}

            // Solve this component NOT re-render after login
            // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
            key={searchResult._id + (cardsResIdArr.includes(searchResult._id) ? '1' : '0')}

            fav={cardsResIdArr.includes(searchResult._id)}
          />
        )
        )}
      </BreakpointMasonry>

    </div>
  ), [cardsResIdArr, res]);
}

export default CardFeed;
