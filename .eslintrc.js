module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["@typescript-eslint", "simple-import-sort"],
  extends: [
    "eslint:recommended",
    "airbnb",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier/react",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended" // Make this the last element so prettier config overrides other formatting rules
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jasmine: true,
    jest: true,
    node: true
  },
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  rules: {
    "simple-import-sort/sort": "error",
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    "jsx-a11y/href-no-hash": ["off"],
    "react/jsx-filename-extension": ["warn", { extensions: [".jsx", ".tsx"] }],
    "max-len": [
      "warn",
      {
        code: 80,
        tabWidth: 2,
        comments: 120,
        ignoreComments: false,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true
      }
    ],

    // Rewired
    // --------------------------------
    "comma-dangle": ["error", "never"],
    semi: ["error", "always"],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "import/extensions": ["error", "never"],
    "no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-nested-ternary": "off",
    "no-underscore-dangle": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "error",
    "no-restricted-imports": [
      "error",
      {
        name: "luxon",
        message: "Please use src/lib/datetime instead."
      }
    ],

    // Rules to get linting to pass
    camelcase: ["off", { properties: "never" }],
    "no-await-in-loop": ["off"],
    "@typescript-eslint/no-var-requires": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "import/order": ["off"],
    "no-console": ["off"],
    "prefer-promise-reject-errors": ["off"],
    "no-restricted-syntax": ["off"],
    "consistent-return": ["off"],
    "no-continue": ["off"],
    "no-param-reassign": ["off"],
    "guard-for-in": ["off"],
    "react/jsx-props-no-spreading": ["off"],
    "react/no-string-refs": ["off"],
    "react/prop-types": ["off"],
    "react/state-in-constructor": ["off"],
    "react/destructuring-assignment": ["off"],
    "react/no-access-state-in-setstate": ["off"],
    "@typescript-eslint/explicit-module-boundary-types": ["off"],
    "react/forbid-prop-types": ["off"],
    "jsx-a11y/click-events-have-key-events": ["off"],
    "jsx-a11y/no-static-element-interactions": ["off"],
    "import/no-named-as-default": ["off"],
    "react/require-default-props": ["off"],
    "react/no-unescaped-entities": ["off"],
    "jsx-a11y/alt-text": ["off"],
    "react/no-unused-prop-types": ["off"]
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-shadow": "off", // JS `no-shadow` rule doesn't handle enums correctly
        "@typescript-eslint/no-shadow": "error"
      }
    }
  ]
};
