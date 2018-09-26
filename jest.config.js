module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/migrations/',
  ],
  moduleNameMapper: {
    '^Config(.*)$': '<rootDir>/src/config$1',
    '^Util(.*)$': '<rootDir>/src/util$1',
    '^Core(.*)$': '<rootDir>/src/core$1',
  },
}
