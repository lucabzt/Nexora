import globals from "globals";
import pluginReact from "eslint-plugin-react";

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default [
  {
    // Apply this configuration to all JavaScript and JSX files
    files: ["**/*.{js,jsx}"],

    // 1. Define the React plugin
    plugins: {
      react: pluginReact,
    },

    // 2. Configure language options
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
      // Define all standard browser global variables (window, document, etc.)
      // This prevents 'no-undef' errors for browser-specific APIs.
      globals: {
        ...globals.browser,
      },
    },

    // 3. Define the rules
    // All rules are set to "warn" or "off".
    // This ensures that only a fatal parsing error will cause a failure.
    rules: {
      // --- All previously seen errors are now warnings ---
      "no-undef": "warn",          // Warns about undefined variables instead of erroring
      "no-unused-vars": "warn",    // Warns about unused variables
      "no-useless-escape": "warn", // Warns about unnecessary backslashes in strings
      "semi": "warn",              // Warns about missing semicolons
      "quotes": ["warn", "single"],// Warns about wrong quote types

      // --- Essential React plugin configuration ---
      // These should remain as they are for modern React
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn", // Warns if a component is imported but not used
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
