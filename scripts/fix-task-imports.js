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
  
  // Example: import { Task, useTaskStore } from '@todone/store';
  if (content.includes('Task') && content.includes('@todone/store')) {
    // replace `Task, useTaskStore` -> `useTaskStore`
    // and add `import { Task } from '@todone/types';`
    const hasImport = content.match(/import.*\{([^}]+)\}.*['"]@todone\/store['"]/);
    if (hasImport) {
        let items = hasImport[1].split(',').map(s => s.trim());
        if (items.includes('Task')) {
            content = content.replace(/import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"]@todone\/store['"]/, (match, group) => {
                const newItems = group.split(',').map(s => s.trim()).filter(s => s !== 'Task');
                if (newItems.length === 0) return `import { Task } from '@todone/types';`;
                let res = `import { ${newItems.join(', ')} } from '@todone/store';\nimport type { Task } from '@todone/types';`;
                return res;
            });
            fs.writeFileSync(file, content);
        }
    }
  }
});
console.log('Task imports fixed!');
