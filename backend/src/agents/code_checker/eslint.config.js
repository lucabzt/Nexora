import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default [
  {
    // Apply this configuration to all JavaScript and JSX files
    files: ["**/*.{js,jsx}"],

    // 1. Define the plugins
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },

    // 2. Configure language options
    languageOptions: {
      // Add these missing configuration options:
      ecmaVersion: 2022,        // Specify ECMAScript version
      sourceType: "module",     // Enable ES6 imports/exports

      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
      // Define all standard browser global variables (window, document, etc.)
      // This prevents 'no-undef' errors for browser-specific APIs.
      globals: {
        ...globals.browser,
        // Add React globals to prevent false positives
        React: "readonly",
        JSX: "readonly",
      },
    },

    // 3. Define the rules
    rules: {
      // =================
      // FATAL ERRORS (will cause component to crash/not render)
      // =================

      // Undefined variables cause ReferenceError at runtime
      "no-undef": "error",

      // These cause syntax/runtime errors that break components
      "no-dupe-keys": "error",           // Duplicate object keys
      "no-dupe-args": "error",           // Duplicate function arguments
      "no-unreachable": "error",         // Code after return/throw
      "no-func-assign": "error",         // Reassigning function declarations
      "no-import-assign": "error",       // Reassigning imports
      "no-obj-calls": "error",           // Calling objects as functions
      "no-sparse-arrays": "error",       // Arrays with empty slots can cause issues
      "no-unexpected-multiline": "error", // Automatic semicolon insertion issues
      "use-isnan": "error",              // Comparing with NaN
      "valid-typeof": "error",           // Invalid typeof comparisons

      // React-specific fatal errors
      "react/jsx-key": "error",                    // Missing keys cause React warnings/errors
      "react/jsx-no-duplicate-props": "error",     // Duplicate props break components
      "react/jsx-no-undef": "error",              // Undefined JSX components
      "react/no-children-prop": "error",          // Using children as prop incorrectly
      "react/no-danger-with-children": "error",   // Dangerous pattern that causes errors
      "react/no-direct-mutation-state": "error",  // Direct state mutation breaks React
      "react/no-find-dom-node": "error",          // Deprecated API that can break
      "react/no-is-mounted": "error",             // Deprecated API that can break
      "react/no-render-return-value": "error",    // Using deprecated ReactDOM.render return
      "react/no-string-refs": "error",            // String refs are deprecated and break
      "react/no-unescaped-entities": "warn",     // Unescaped entities break JSX
      "react/require-render-return": "error",     // render method must return something

      // React Hooks rules (breaking these causes crashes)
      "react-hooks/rules-of-hooks": "error",      // Hooks must be called in consistent order
      "react-hooks/exhaustive-deps": "error",     // Missing dependencies cause bugs/crashes

      // =================
      // WARNINGS (style/preference issues, won't break component)
      // =================

      "no-unused-vars": "warn",           // Unused variables (cleanup issue)
      "no-useless-escape": "warn",        // Unnecessary escapes (style issue)
      "semi": "warn",                     // Missing semicolons (style issue)
      "quotes": ["warn", "single"],       // Quote style (style issue)
      "no-console": "warn",               // Console statements (cleanup issue)
      "no-debugger": "warn",              // Debugger statements (cleanup issue)

      // React warnings (won't break component but good practice)
      "react/jsx-uses-vars": "warn",             // Imported components not used
      "react/prop-types": "warn",                // Missing prop types
      "react/no-unused-prop-types": "warn",      // Unused prop types
      "react/no-unused-state": "warn",           // Unused state
      "react/prefer-stateless-function": "warn", // Could be functional component

      // Modern React - these rules should be off
      "react/react-in-jsx-scope": "off",   // Not needed in modern React
      "react/jsx-uses-react": "off",       // Not needed in modern React
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
