import {
  withStyles
} from '@material-ui/core/styles';

const GlobalCss = withStyles({
  '@global': {
    // override FormLabel focused color
    '.MuiFormLabel-root.Mui-focused': {
      color: 'white',
    },
    // override Autocomplete Input's cleanIcon position
    '.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiAutocomplete-inputRoot': {
      paddingRight: 0,
    },
    '.MuiTypography-root.MuiFormControlLabel-label.MuiTypography-body1': {
      fontSize: 12,
    },
  },
})(() => null);

export default GlobalCss;
