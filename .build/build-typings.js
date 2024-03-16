const path = require('node:path');
const fs = require('node:fs');
const packageJson = require(path.join(process.cwd(), './package.json'));
const bundleDtsPath = path.join(process.cwd(), './dist/bundle.d.ts');

let bundleDts = fs.readFileSync(bundleDtsPath, { encoding: 'utf-8' });
bundleDts += `\ndeclare module "${packageJson.name}" {
    export * from "src/index";
}
`;

fs.writeFileSync(bundleDtsPath, bundleDts, { encoding: 'utf-8' });
