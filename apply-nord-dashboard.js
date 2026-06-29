const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, 'app');
const componentsDirectory = path.join(__dirname, 'components');

const replacements = [
  // Backgrounds
  { regex: /bg-oled-black/g, replacement: 'bg-nord-0' },
  { regex: /bg-glass-surface/g, replacement: 'bg-nord-1' },
  { regex: /bg-white\/\[0\.06\]/g, replacement: 'bg-nord-2' },
  { regex: /bg-zinc-900/g, replacement: 'bg-nord-1' },
  { regex: /bg-zinc-800/g, replacement: 'bg-nord-2' },
  { regex: /bg-oled-black\/80/g, replacement: 'bg-nord-0/80' },
  
  // Accents (Buttons, Highlights)
  { regex: /bg-electric-blue\/10/g, replacement: 'bg-nord-8/10' },
  { regex: /bg-electric-blue\/20/g, replacement: 'bg-nord-8/20' },
  { regex: /bg-electric-blue\/5/g, replacement: 'bg-nord-8/5' },
  { regex: /bg-electric-blue/g, replacement: 'bg-nord-14' }, // changed to sage green!
  { regex: /bg-white\/10/g, replacement: 'bg-nord-2' },
  { regex: /bg-white\/5/g, replacement: 'bg-nord-1' },
  { regex: /bg-red-600/g, replacement: 'bg-nord-11' },
  { regex: /bg-green-600/g, replacement: 'bg-nord-14' },
  
  // Text
  { regex: /text-zinc-400/g, replacement: 'text-nord-4' },
  { regex: /text-zinc-300/g, replacement: 'text-nord-4' },
  { regex: /text-electric-blue/g, replacement: 'text-nord-8' }, // teal text
  
  // Borders
  { regex: /border-glass-border/g, replacement: 'border-nord-3' },
  { regex: /border-electric-blue\/30/g, replacement: 'border-nord-8/30' },
  { regex: /border-electric-blue/g, replacement: 'border-nord-14' },
  { regex: /border-white\/20/g, replacement: 'border-nord-3' },
  { regex: /border-white\/10/g, replacement: 'border-nord-2' },
  
  // Gradients
  { regex: /from-electric-blue/g, replacement: 'from-nord-14' },
  { regex: /to-electric-blue-dark/g, replacement: 'to-nord-14' },
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
console.log('Nord Dashboard aesthetic applied!');
