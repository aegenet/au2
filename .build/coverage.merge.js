const fs = require('fs');
const path = require('path');

let folders = process.argv.slice(2);

let coverageBundle = {};
const buildConfigPath = path.join(__dirname, 'build-flow.config.json');
const projects = fs.existsSync(buildConfigPath) ? require(buildConfigPath) : [];

if (projects?.length) {
  // S'il y a une config, nous la prenons en + des répertoires spécifiés
  folders = folders.concat(... projects.map(f => `./packages/${f.name}/coverage`));
}

for (let i = 0; i < folders.length; i++) {
  if (fs.existsSync(path.resolve(folders[i]))) {
    if (fs.existsSync(path.resolve(folders[i], 'coverage-final.json'))) {
      console.log(path.resolve(folders[i]));
      coverageBundle = Object.assign(coverageBundle, require(path.resolve(folders[i], 'coverage-final.json')));
    } else {
      const files = fs.readdirSync(path.resolve(folders[i]));
      files.forEach(file => {
        if (file.endsWith('.json')) {
          coverageBundle = Object.assign(coverageBundle, require(path.join(path.resolve(folders[i]), file)));
        }
      });
    }
  }
}

const outputDir = path.join(__dirname, '..', '.nyc_output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
fs.writeFileSync(path.join(outputDir, 'bundle.json'), JSON.stringify(coverageBundle, null, 2), 'utf8');