import {
  Radio, RadioGroup, Checkbox,
  FormControl, FormControlLabel, FormLabel,
  TextField, FormGroup, FormHelperText,
} from '@material-ui/core';

import {
  makeStyles, Theme, createStyles,
} from '@material-ui/core/styles';

import React from 'react';
import {
  useState, useEffect, useContext, createContext,
} from 'react';

import {
  acFieldContext
} from './HomeAppBarContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    autocompleteRadio: {
      display: 'flex',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      marginTop: 8,
    },
    radioGroup: {
      display: 'flex',
      flexFlow: 'column nowrap',
      height: '100%',
      borderRadius: 0,
      color: 'white',
    },
  }),
);

function AutocompleteRadio() {
  const classes = useStyles();

  // Set Only
  const { acField, setAcField } = useContext(acFieldContext);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAcField(event.target.value);
  };

  return (
    <FormControl component="fieldset" className={classes.autocompleteRadio}>

      <FormLabel component="legend">Autocomplete Suggestion Field</FormLabel>

      <FormHelperText style={{ marginBottom: 8, }}>
        Choose the field for searching autocomplete
      </FormHelperText>

      <RadioGroup className={classes.radioGroup} aria-label="autocomplete field"
        name="autocomplete_field" value={acField} onChange={handleFieldChange}>
        <FormControlLabel value="title" control={<Radio size='small' />}
          label="Title" labelPlacement="end" />
        <FormControlLabel value="desc" control={<Radio size='small' />}
          label="Description" labelPlacement="end" />
        <FormControlLabel value="ingredstr" control={<Radio size='small' />}
          label="Ingredients" labelPlacement="end" />
      </RadioGroup>

    </FormControl>
  );
}

export default AutocompleteRadio;
