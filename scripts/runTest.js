// import shelljs from 'shelljs';
// import path from 'path';
const shelljs = require('shelljs');
const path = require('path');

let fileName = process.argv[2]; // yarn test testFileName  例如要测试 tests/error.js, 运行命令: yarn test error

if (fileName !== 'index') {
  shelljs.exec(`node ${path.join(__dirname, '../test/', fileName)}`);
}
