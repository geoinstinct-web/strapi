'use strict';

const path = require("path");
module.exports = {
  setupFilesAfterEnv: [__dirname + '/test/unit.setup.js'],
  modulePathIgnorePatterns: ['.cache', 'dist'],
  testPathIgnorePatterns: ['.testdata.js', '.test.utils.js'],
  testMatch: ['**/__tests__/**/*.{js,ts,jsx,tsx}'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  // Use `jest-watch-typeahead` version 0.6.5. Newest version 1.0.0 does not support jest@26
  // Reference: https://github.com/jest-community/jest-watch-typeahead/releases/tag/v1.0.0
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
