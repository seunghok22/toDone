const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./packages/ui/src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace utils imports
  content = content.replace(/from\s+['"](?:\.\.\/|\.\/)*lib\/utils['"]/g, "from '@todone/utils'");
  content = content.replace(/from\s+['"]@\/lib\/utils['"]/g, "from '@todone/utils'");
  
  // Replace store and types imports
  content = content.replace(/from\s+['"]@\/store\/useTaskStore['"]/g, "from '@todone/store'");
  content = content.replace(/from\s+['"](?:\.\.\/|\.\/)*store\/useTaskStore['"]/g, "from '@todone/store'");
  
  // Replace sibling ui imports (@/atoms -> ../atoms, etc)
  const dirName = path.dirname(file).split(path.sep).pop(); // atoms, molecules, organisms
  const isRoot = dirName === 'src';
  
  content = content.replace(/from\s+['"]@\/(atoms|molecules|organisms)\/([^'"]+)['"]/g, (match, folder, component) => {
    if (isRoot) return `from './${folder}/${component}'`;
    return `from '../${folder}/${component}'`;
  });

  fs.writeFileSync(file, content);
});

// Create index.ts
let indexContent = '';
const folders = ['atoms', 'molecules', 'organisms'];
folders.forEach(folder => {
  const dirPath = path.join('./packages/ui/src', folder);
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(f => {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const name = f.replace(/\.tsx?$/, '');
        indexContent += `export * from './${folder}/${name}';\n`;
      }
    });
  }
});

fs.writeFileSync('./packages/ui/src/index.ts', indexContent);
console.log('UI imports refactored & index.ts created!');
