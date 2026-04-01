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

const files = walk('./apps/desktop/src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace utils imports
  content = content.replace(/from\s+['"]@\/lib\/utils['"]/g, "from '@todone/utils'");
  content = content.replace(/from\s+['"](?:\.\.\/|\.\/)*lib\/utils['"]/g, "from '@todone/utils'");
  
  // Replace store and types imports
  content = content.replace(/from\s+['"]@\/store\/useTaskStore['"]/g, "from '@todone/store'");
  content = content.replace(/from\s+['"](?:\.\.\/|\.\/)*store\/useTaskStore['"]/g, "from '@todone/store'");
  
  // Replace parsing
  content = content.replace(/from\s+['"]@\/lib\/icsParser['"]/g, "from '@todone/utils'");
  content = content.replace(/from\s+['"](?:\.\.\/|\.\/)*lib\/icsParser['"]/g, "from '@todone/utils'");
  
  // Replace ui imports (@/atoms -> @todone/ui, etc)
  content = content.replace(/from\s+['"]@\/(atoms|molecules|organisms)\/([^'"]+)['"]/g, "from '@todone/ui'");
  content = content.replace(/from\s+['"](?:\.\.\/|\.\/)*(atoms|molecules|organisms)\/([^'"]+)['"]/g, "from '@todone/ui'");
  
  // Types? Some files might import Task from our new types package.
  content = content.replace(/import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"]@todone\/store['"]/g, (match, imports) => {
     if (imports.includes('Task')) {
       // Just a simple heuristic. It's better to manually fix complex ones or let TS complain.
       // Actually let's just leave it and fix manually if tsc complains about missing Task export.
       return match;
     }
     return match;
  });

  fs.writeFileSync(file, content);
});

console.log('App imports refactored!');
