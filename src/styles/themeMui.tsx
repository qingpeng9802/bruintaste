import {
  createMuiTheme
} from '@material-ui/core/styles';

const themeMui = createMuiTheme({
  overrides: {
    MuiFormLabel: {
      root: {
        color: '#C3D7EE',
      },
    },
    MuiFormHelperText: {
      root: {
        color: '#C3D7EE',
      }
    }
  },
  palette: {
    primary: {
      light: '#2774AE',
      main: '#005587',
      dark: '#003B5C',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#FFD100',
      main: '#FFC72C',
      dark: '#FFB81C',
      contrastText: '#000000',
    },
  },
});

export default themeMui;
