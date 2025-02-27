module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@vidya/api/(.*)$': '<rootDir>/src/$1',
    '^@vidya/protocol$': '<rootDir>/../../../libs/protocol',
    '^@vidya/entities$': '<rootDir>/../../../libs/entities',
    '^@vidya/domain$': '<rootDir>/../../../libs/domain',
  },
};