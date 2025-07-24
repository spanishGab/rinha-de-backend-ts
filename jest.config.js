/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/src/**/*.+(test.ts)?(x)'],
  rootDir: './src',
  transform: {
    '\\.tsx?$': [
      'ts-jest',
      { tsconfig: './tsconfig.json', isolatedModules: true },
    ],
  },
};
