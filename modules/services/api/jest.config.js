module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  testTimeout: 20000,
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@vidya/api/(.*)$': '<rootDir>/$1',
    '^@vidya/protocol$': '<rootDir>/../../../libs/protocol',
    '^@vidya/entities$': '<rootDir>/../../../libs/entities',
    '^@vidya/domain$': '<rootDir>/../../../libs/domain',
  },
};
