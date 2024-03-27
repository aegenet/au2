const fs = require('node:fs');

console.log(
  JSON.parse(
    fs.readFileSync('./.build/build-flow.config.json', 'utf8')
  )
  .map(f => f.name)
  .join(',')
);
