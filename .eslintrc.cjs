module.exports = {
  root: true,
  extends: [
    "standard",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:vue/recommended",
    "plugin:eslint-comments/recommended",
    "plugin:@typescript-eslint/recommended",
    "./.eslintrc-auto-import.json",
  ],
  plugins: ["html", "unicorn"],
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".ts", ".d.ts"] },
    },
  },
  ignorePatterns: [
    "auto-imports.d.ts",
    "components.d.ts",
    "**/node_modules/*",
    "**/dist/*",
  ],

  overrides: [
    {
      files: ["*.vue"],
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",
      },
    },
  ],
  rules: {
    // #region common

    // Require or disallow semicolons instead of ASI
    "semi": ["error", "never"],
    // Enforce consistent brace style for all control statements
    "curly": ["error", "all"],
    // Enforce the consistent use of either backticks, double, or single quotes
    "quotes": ["error", "double"],
    // Require quotes around object literal property names
    "quote-props": ["error", "consistent-as-needed"],
    // Disallow unused variables
    "no-unused-vars": "warn",
    // Disallow the use of variables before they are defined
    "no-use-before-define": "off",
    // Disallow reassigning `function` parameters
    "no-param-reassign": "off",
    // Enforce consistent spacing inside array brackets
    "array-bracket-spacing": ["error", "never"],
    // Enforce consistent brace style for blocks
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    // Disallow or enforce spaces inside of blocks after opening block and before closing block
    "block-spacing": ["error", "always"],
    // Enforce camelcase naming convention
    "camelcase": "off",
    // Enforce consistent spacing before and after commas
    "comma-spacing": ["error", { before: false, after: true }],
    // Enforce consistent comma style
    "comma-style": ["error", "last"],
    // Require or disallow trailing commas
    "comma-dangle": ["error", {
      arrays: "always-multiline",
      objects: "always-multiline",
      imports: "always-multiline",
      exports: "always-multiline",
      functions: "never",
    }],
    // Disallow constant expressions in conditions
    "no-constant-condition": "warn",
    // Disallow the use of `debugger`
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    // Disallow the use of `console`
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    // Disallow assignment operators in conditional expressions
    "no-cond-assign": ["error", "always"],
    // Require or disallow spacing between function identifiers and their invocations
    "func-call-spacing": ["error", "never"],
    // Enforce consistent spacing between keys and values in object literal properties
    "key-spacing": ["error", { beforeColon: false, afterColon: true }],
    // Enforce consistent indentation
    "indent": ["error", 2, { SwitchCase: 1, VariableDeclarator: 1, outerIIFEBody: 1 }],
    // Disallow specified syntax
    "no-restricted-syntax": [
      "error",
      "DebuggerStatement",
      "LabeledStatement",
    ],
    // Enforce consistent spacing inside braces
    "object-curly-spacing": ["error", "always"],
    // Disallow unnecessary `return await`
    "no-return-await": ["error"],
    // Enforce consistent spacing before `function` definition opening parenthesis
    "space-before-function-paren": ["error", {
      anonymous: "never",
      named: "never",
      asyncArrow: "always",
    }],

    // #endregion
    // #region import

    // Enforce a convention in module import order
    "import/order": "error",
    // This rule reports any imports that come after non-import statements.
    "import/first": "error",
    // Forbids the use of mutable exports with var or let
    "import/no-mutable-exports": "error",
    // Ensures an imported module can be resolved to a module on the local filesystem, as defined by standard Node require.resolve behavior.
    "import/no-unresolved": "off",
    // Forbid import of modules using absolute paths
    "import/no-absolute-path": "off",
    // Verifies that all named imports are part of the set of named exports in the referenced module.
    "import/named": "off",

    // #endregion
    // #region es6

    // Require `let` or `const` instead of `var`
    "no-var": "error",
    // Require `const` declarations for variables that are never reassigned after declared
    "prefer-const": [
      "error",
      {
        destructuring: "any",
        ignoreReadBeforeAssign: true,
      },
    ],
    // Require using arrow functions for callbacks
    "prefer-arrow-callback": [
      "error",
      {
        allowNamedFunctions: false,
        allowUnboundThis: true,
      },
    ],
    // Require or disallow method and property shorthand syntax for object literals
    "object-shorthand": [
      "error",
      "always",
      {
        ignoreConstructors: false,
        avoidQuotes: true,
      },
    ],
    // Require rest parameters instead of `arguments`
    "prefer-rest-params": "error",
    // Require spread operators instead of `.apply()`
    "prefer-spread": "error",
    // Require template literals instead of string concatenation
    "prefer-template": "error",
    // Require or disallow spacing around embedded expressions of template strings
    "template-curly-spacing": "error",
    // Require parentheses around arrow function arguments
    "arrow-parens": ["error", "as-needed", { requireForBlockBody: true }],
    // Enforce consistent spacing around `*` operators in generator functions
    "generator-star-spacing": "off",

    // #endregion
    // #region best-practice

    // Enforce `return` statements in callbacks of array methods
    "array-callback-return": "error",
    // Enforce the use of variables within the scope they are defined
    "block-scoped-var": "error",
    // Require `return` statements to either always or never specify values
    "consistent-return": "off",
    // Enforce a maximum cyclomatic complexity allowed in a program
    "complexity": ["off", 11],
    // Require the use of `===` and `!==`
    "eqeqeq": "off",
    // Disallow the use of `alert`, `confirm`, and `prompt`
    "no-alert": "warn",
    // Disallow lexical declarations in case clauses
    "no-case-declarations": "error",
    // Disallow multiple spaces
    "no-multi-spaces": "error",
    // Disallow multiline strings
    "no-multi-str": "error",
    // Disallow `with` statements
    "no-with": "error",
    // Disallow `void` operators
    "no-void": "error",
    // Disallow unnecessary escape characters
    "no-useless-escape": "off",
    // Require `var` declarations be placed at the top of their containing scope
    "vars-on-top": "error",
    // Disallow async functions which have no `await` expression
    "require-await": "off",
    // Disallow assignment operators in `return` statements
    "no-return-assign": "off",
    // Enforce consistent linebreak style for operators
    "operator-linebreak": ["error", "after", { overrides: { "?": "before", ":": "before" } }],

    // #endregion
    // #region unicorns

    // Pass error message when throwing errors
    "unicorn/error-message": "error",
    // Uppercase regex escapes
    "unicorn/escape-case": "error",
    // Array.isArray instead of instanceof
    "unicorn/no-array-instanceof": "error",
    // Prevent deprecated `new Buffer()`
    "unicorn/no-new-buffer": "error",
    // Keep regex literals safe!
    "unicorn/no-unsafe-regex": "off",
    // Lowercase number formatting for octal, hex, binary (0x1'error' instead of 0X1'error')
    "unicorn/number-literal-case": "error",
    // ** instead of Math.pow()
    "unicorn/prefer-exponentiation-operator": "error",
    // includes over indexOf when checking for existence
    "unicorn/prefer-includes": "error",
    // String methods startsWith/endsWith instead of more complicated stuff
    "unicorn/prefer-starts-ends-with": "error",
    // textContent instead of innerText
    "unicorn/prefer-text-content": "error",
    // Enforce throwing type error when throwing error while checking typeof
    "unicorn/prefer-type-error": "error",
    // Use new when throwing error
    "unicorn/throw-new-error": "error",

    // #endregion

    // Require a eslint-enable comment for every eslint-disable comment
    "eslint-comments/disable-enable-pair": "off",

    // Require emits option with name triggered by $emit()
    "vue/require-explicit-emits": ["error"],
    // Enforce the maximum number of attributes per line
    "vue/max-attributes-per-line": ["warn", { singleline: 3 }],
    // Enforce self-closing style
    "vue/html-self-closing": ["warn"],
    // Disallow use of v-html to prevent XSS attack
    "vue/no-v-html": "warn",
    // Require component names to be always multi-word
    "vue/multi-word-component-names": "off",
    // Enforce specific casing for the component naming style in template
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "no-useless-constructor": "off",

    // This rule enforces consistent use of semicolons after statements.
    "@typescript-eslint/semi": ["error", "never"],
    // This rule extends the base eslint/indent rule. It adds support for TypeScript nodes.
    "@typescript-eslint/indent": ["error", 2],
    // Enforces a consistent member delimiter style in interfaces and type literals.
    "@typescript-eslint/member-delimiter-style": [
      "error",
      { multiline: { delimiter: "none" } },
    ],
    // Require consistent spacing around type annotations
    "@typescript-eslint/type-annotation-spacing": ["error", {}],
    // This rule extends the base eslint/no-unused-vars rule. It adds support for TypeScript features, such as types.
    "@typescript-eslint/no-unused-vars": "error",
    // This rule extends the base eslint/no-redeclare rule. It adds support for TypeScript function overloads, and declaration merging.
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": "error",
    // Require explicit return types on functions and class methods
    "@typescript-eslint/explicit-function-return-type": "off",
    // Require explicit accessibility modifiers on class properties and methods
    "@typescript-eslint/explicit-member-accessibility": "off",
    // Disallow usage of the any type
    "@typescript-eslint/no-explicit-any": "off",
    // Disallow the use of parameter properties in class constructors
    "@typescript-eslint/no-parameter-properties": "off",
    // Disallow empty functions
    "@typescript-eslint/no-empty-function": "off",
    // Disallows non-null assertions using the ! postfix operator
    "@typescript-eslint/no-non-null-assertion": "off",
    // Bans @ts-<directive> comments from being used or requires descriptions after directive
    "@typescript-eslint/ban-ts-comment": "off",
    // Bans specific types from being used
    "@typescript-eslint/ban-types": "off",
    // Require explicit return and argument types on exported functions' and classes' public class methods
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
}
