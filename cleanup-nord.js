const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, 'app');
const componentsDirectory = path.join(__dirname, 'components');

const replacements = [
  { regex: /bg-\[#1a1a24\]/g, replacement: 'bg-nord-1' },
  { regex: /bg-\[#12121a\]/g, replacement: 'bg-nord-0' },
  { regex: /bg-gradient-to-r from-red-500 to-orange-500/g, replacement: 'bg-nord-11' },
  { regex: /bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400/g, replacement: 'text-nord-6' },
  { regex: /text-indigo-300/g, replacement: 'text-nord-8' },
  { regex: /shadow-\[0_0_15px_rgba\(99,102,241,0\.2\)\]/g, replacement: 'shadow-lg' },
  { regex: /shadow-\[0_0_30px_rgba\(79,70,229,0\.4\)\]/g, replacement: 'shadow-xl' },
  { regex: /shadow-\[0_0_20px_rgba\(99,102,241,0\.2\)\]/g, replacement: 'shadow-lg' },
  { regex: /shadow-orange-500\/10/g, replacement: 'shadow-nord-12/10' },
  { regex: /bg-gradient-to-r from-nord-8 via-purple-500 to-pink-500/g, replacement: 'bg-nord-3' },
  { regex: /bg-gradient-to-r from-nord-8 to-purple-500/g, replacement: 'bg-nord-8' },
  { regex: /bg-gradient-to-r from-nord-8 to-nord-9/g, replacement: 'bg-nord-8' },
  { regex: /<div className="absolute top-0 left-1\/2 -translate-x-1\/2 w-\[80%\] h-32 bg-nord-8\/20 blur-\[60px\]" \/>/g, replacement: '' },
  { regex: /<div className="absolute inset-0 bg-nord-8\/20 blur-\[100px\] rounded-full pointer-events-none" \/>/g, replacement: '' },
  { regex: /<div className="absolute top-[-20%] left-[-10%] w-\[50%\] h-\[50%\] rounded-full bg-nord-8\/10 blur-\[120px\] pointer-events-none" \/>/g, replacement: '' },
  { regex: /<div className="absolute bottom-[-20%] right-[-10%] w-\[50%\] h-\[50%\] rounded-full bg-nord-9\/10 blur-\[120px\] pointer-events-none" \/>/g, replacement: '' },
  { regex: /blur-\[120px\]/g, replacement: 'hidden' },
  { regex: /bg-purple-500/g, replacement: 'bg-nord-15' },
  { regex: /text-purple-500/g, replacement: 'text-nord-15' },
  { regex: /border-purple-500/g, replacement: 'border-nord-15' },
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
console.log('Cleanup script executed!');
