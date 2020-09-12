module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2020,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
          "no-trailing-spaces":"warn",
          "semi": ["warn", "always"],

          "arrow-parens": "warn",
          "no-var": "warn",
          "use-isnan":"warn",
          "no-unreachable":"warn",
          "no-cond-assign":"warn",

          "valid-typeof":"warn",

          "no-undef-init": "warn",
          "require-await":"warn",
          
          "eol-last":["warn", "always"],
          "no-eval": "error",
          "linebreak-style": ["error", "unix"],
          
          "no-console": "off",
          "no-unused-vars":"off"
    }
};
