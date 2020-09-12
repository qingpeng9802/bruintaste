import React from 'react';
import {
  useState, useEffect, useContext, createContext,
} from 'react';

import {
  searFieldsContext
} from './HomeAppBarContext';

import {
  makeStyles, Theme, createStyles, withStyles,
} from '@material-ui/core/styles';

import {
  Radio, RadioGroup, Checkbox,
  FormControl, FormControlLabel, FormLabel,
  TextField, FormGroup, FormHelperText,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchCheckBox: {
      height: '100%',
      width: '100%',
    },
    acFieldButton: {
      fontSize: 14,
      color: 'white',
      borderRadius: 0,
      padding: 2,
    },
    formGroup: {
      display: 'flex',
      color: 'white',
    },
  })
);

function SearchCheckBox() {
  const classes = useStyles();

  const { searFields, setSearFields } = useContext(searFieldsContext);

  const handleFieldsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearFields({ ...searFields, [event.target.name]: event.target.checked });
  };

  const { title, desc, ingredstr, allerg, piccode, fuzzy } = searFields;
  const leastFieldNum = 1;
  const error = [title, desc, ingredstr, allerg, piccode]
    .filter((v) => v).length < leastFieldNum;

  return (
    <FormControl component="fieldset" className={classes.searchCheckBox}>

      <FormLabel component="legend">Search Field</FormLabel>

      <FormHelperText>Choose the fields for searching in</FormHelperText>
      <FormHelperText error={error}>(at least one)</FormHelperText>

      <FormGroup className={classes.formGroup} onChange={handleFieldsChange}>
        <FormControlLabel
          control={<Checkbox checked={title} name="title" />}
          label="Title" />
        <FormControlLabel
          control={<Checkbox checked={desc} name="desc" />}
          label="Description" />
        <FormControlLabel
          control={<Checkbox checked={ingredstr} name="ingredstr" />}
          label="Ingredients" />
        <FormControlLabel
          control={<Checkbox checked={allerg} name="allerg" />}
          label="Allergens" />
        <FormControlLabel
          control={<Checkbox checked={piccode} name="piccode" />}
          label="Features" />
      </FormGroup>

      <div style={{ paddingTop: 16 }}></div>

      <FormLabel component="legend">Fuzzy Search</FormLabel>

      <FormGroup className={classes.formGroup} onChange={handleFieldsChange}>
        <FormControlLabel
          control={<Checkbox checked={fuzzy} name="fuzzy" />}
          label="Fuzzy Search" />
      </FormGroup>

    </FormControl>
  );
}

export default SearchCheckBox;
