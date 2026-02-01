/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.tsx?$': ['ts-jest', {}] },
  moduleNameMapper: { '\\.(css|less|scss|sass)$': 'identity-obj-proxy' },
};




