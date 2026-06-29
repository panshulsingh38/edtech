const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, 'app');
const componentsDirectory = path.join(__dirname, 'components');

const replacements = [
  { regex: /bg-\[#0a0a0f\]/g, replacement: 'bg-nord-0' },
  { regex: /bg-indigo-600\/20/g, replacement: 'bg-nord-8/10' },
  { regex: /bg-purple-600\/20/g, replacement: 'bg-nord-9/10' },
  { regex: /bg-indigo-600/g, replacement: 'bg-nord-8' },
  { regex: /bg-purple-600/g, replacement: 'bg-nord-9' },
  { regex: /bg-indigo-500/g, replacement: 'bg-nord-8' },
  { regex: /bg-purple-500/g, replacement: 'bg-nord-9' },
  { regex: /bg-pink-500/g, replacement: 'bg-nord-15' },
  { regex: /bg-orange-500/g, replacement: 'bg-nord-12' },
  { regex: /bg-indigo-500\/10/g, replacement: 'bg-nord-8/10' },
  { regex: /bg-indigo-500\/20/g, replacement: 'bg-nord-8/20' },
  { regex: /bg-purple-500\/10/g, replacement: 'bg-nord-9/10' },
  { regex: /bg-purple-500\/20/g, replacement: 'bg-nord-9/20' },
  { regex: /bg-pink-500\/20/g, replacement: 'bg-nord-15/20' },
  { regex: /bg-orange-500\/10/g, replacement: 'bg-nord-12/10' },
  { regex: /bg-orange-500\/20/g, replacement: 'bg-nord-12/20' },
  
  { regex: /text-indigo-400/g, replacement: 'text-nord-8' },
  { regex: /text-purple-400/g, replacement: 'text-nord-9' },
  { regex: /text-pink-400/g, replacement: 'text-nord-15' },
  { regex: /text-orange-400/g, replacement: 'text-nord-12' },
  { regex: /text-indigo-200/g, replacement: 'text-nord-4' },
  { regex: /text-purple-100/g, replacement: 'text-nord-4' },
  { regex: /text-orange-100/g, replacement: 'text-nord-4' },
  
  { regex: /border-indigo-500/g, replacement: 'border-nord-8' },
  { regex: /border-purple-500/g, replacement: 'border-nord-9' },
  { regex: /border-pink-500/g, replacement: 'border-nord-15' },
  { regex: /border-orange-500/g, replacement: 'border-nord-12' },
  { regex: /border-indigo-500\/30/g, replacement: 'border-nord-8/30' },
  { regex: /border-purple-500\/30/g, replacement: 'border-nord-9/30' },
  { regex: /border-orange-500\/30/g, replacement: 'border-nord-12/30' },
  
  { regex: /from-indigo-400/g, replacement: 'from-nord-7' },
  { regex: /via-purple-400/g, replacement: 'via-nord-8' },
  { regex: /to-pink-400/g, replacement: 'to-nord-9' },
  { regex: /from-indigo-500/g, replacement: 'from-nord-8' },
  { regex: /to-purple-600/g, replacement: 'to-nord-10' },
  
  { regex: /bg-gray-900/g, replacement: 'bg-nord-1' },
  { regex: /bg-gray-800/g, replacement: 'bg-nord-2' },
  { regex: /bg-gray-700/g, replacement: 'bg-nord-3' },
  { regex: /text-gray-400/g, replacement: 'text-nord-4' },
  { regex: /text-gray-300/g, replacement: 'text-nord-5' },
  { regex: /text-gray-200/g, replacement: 'text-nord-6' },
  { regex: /border-gray-800/g, replacement: 'border-nord-2' },
  { regex: /border-gray-700/g, replacement: 'border-nord-3' },
  
  { regex: /bg-white\/5/g, replacement: 'bg-nord-1/50' },
  { regex: /border-white\/10/g, replacement: 'border-nord-3' },
  { regex: /bg-white\/10/g, replacement: 'bg-nord-2/50' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryToSearch);
processDirectory(componentsDirectory);
console.log('Nord aesthetic applied!');
