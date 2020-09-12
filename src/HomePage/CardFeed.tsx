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
          <RecipeResCard res={searchResult}
            key={searchResult._id}
            fav={cardsResIdArr.includes(searchResult._id)}
          />
        )
        )}
      </BreakpointMasonry>

    </div>
  ), [cardsResIdArr, res]);
}

export default CardFeed;
