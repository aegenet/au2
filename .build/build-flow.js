const path = require('path');
const child_process = require('child_process');

const tasks = {
  /** Clean up */
  clean: project => `cd ./packages/${project.name}/ && yarn run clean`,
  /** Delete dependencies */
  deleteNodeModules: project => {
    let cmd = `node ./node_modules/rimraf/dist/esm/bin.mjs ./packages/${project.name}/node_modules`;
    return cmd;
  },
  /** Upgrade dependencies */
  upgrade: project => {
    let cmd = `cd ./packages/${project.name}/ && node ./../../node_modules/rimraf/dist/esm/bin.mjs ./node_modules && node ./../../node_modules/rimraf/dist/esm/bin.mjs ./yarn.lock`;
    
    project.links.forEach(link => {
      cmd += ` && yarn link ${link}`;
    });

    cmd += ' && yarn && yarn upgrade && yarn link';
  
    return cmd;
  },
  /** Upgrade dependencies */
  upgradeLatest: project => {
    let cmd = `cd ./packages/${project.name}/ && node ./../../node_modules/rimraf/dist/esm/bin.mjs ./node_modules && node ./../../node_modules/rimraf/dist/esm/bin.mjs ./yarn.lock`;
    
    project.links.forEach(link => {
      cmd += ` && yarn link ${link}`;
    });

    cmd += ' && yarn && yarn upgrade --latest && yarn link';
  
    return cmd;
  },
  /** Dependencies (yarn & link) */
  dependencies: project => {
    let cmd = `cd ./packages/${project.name}/`;
    
    project.links.forEach(link => {
      cmd += ` && yarn link ${link}`;
    });
    
    cmd += ' && yarn && yarn link';

    return cmd;
  },
  /** Lint */
  lint: project => `cd ./packages/${project.name}/ && yarn run lint`,
  /** Build */
  build: project => {
    const cmds = [];
    cmds.push(`cd ./packages/${project.name}/`);

    let version;
    if (process.env.GITHUB_REF_TYPE === 'tag') {
      version = process.env.GITHUB_REF_NAME;
    } else if (process.env.GITHUB_REF_NAME) {
      // workflow github
      version = `999.${new Date().getTime()}.0`;
    }

    if (version) {
      cmds.push(`npm version "${version}"`);
    }

    cmds.push('yarn build');

    return cmds.join(' && ');
  },
  /** Test */
  test: project => `cd ./packages/${project.name}/ && npm run test-node`,
  /** Test local */
  local: project => `cd ./packages/${project.name}/ && npm run test-node-local`,
  /** Publish */
  publish: project => {
    if (project.publish) {
      const cmds = [
        // Remove devDependencies in npm package
        `json -I -f ./packages/${project.name}/package.json -e "this.devDependencies={};this.scripts={};this.jest=undefined;"`,
        `cd ./packages/${project.name}/`,
        // `npm version "999.${new Date().getTime()}.0"`,
        `npm publish --registry=${project.registry || 'https://npm.pkg.github.com/'}`
      ];
      return cmds.join(' && ');
    } else {
      return '';
    }
  },
  /** Local Publish (yalc) */
  localPublish: project => {
    if (project.publish) {
      const cmds = [
        `cd ./packages/${project.name}/`,
        `yalc installations clean && yalc publish`
      ];
      return cmds.join(' && ');
    } else {
      return '';
    }
  }
}

const taskMode = process.argv[2];
if (taskMode && taskMode in tasks) {
  console.log(`[BUILD-FLOW] ${taskMode} starting...`);
  const task = tasks[taskMode];
  const projects = require(path.join(__dirname, 'build-flow.config.json'));

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`[BUILD-FLOW] ${taskMode}/${project.name}...`);
    const cmd = task(project);
    if (cmd) {
      child_process.execSync(cmd, {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    }
  }
  console.log(`[BUILD-FLOW] ${taskMode} finished.`)
} else {
  console.log(`[BUILD-FLOW] invalid task ${taskMode} provided.`);
  process.exit(1);
}
