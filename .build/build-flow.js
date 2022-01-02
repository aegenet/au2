const path = require('path');
const child_process = require('child_process');

const tasks = {
  /** Clean up */
  clean: project => `cd ./packages/${project.name}/ && yarn run clean`,
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
  build: project => `cd ./packages/${project.name}/ && yarn tsc && yarn build`,
  /** Test */
  test: project => `cd ./packages/${project.name}/ && npm run test-node`,
  /** Publish */
  publish: project => {
    if (project.publish) {
      return `cd ./packages/${project.name}/ && npm version "999.${new Date().getTime()}.0" && npm publish`;
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
