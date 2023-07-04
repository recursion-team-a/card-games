const path = require('path')

const lintCommand = () => `npm run lint`
// const lintFixCommand = (filenames) =>
//   `next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`
const formatCommand = () => `npm run format`
const testCommand = () => `npm run test`

module.exports = {
  '*.{js,jsx,ts,tsx}': [lintCommand, formatCommand, testCommand],
}
