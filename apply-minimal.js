const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, 'app');
const componentsDirectory = path.join(__dirname, 'components');

const replacements = [
  // Backgrounds
  { regex: /bg-nord-0/g, replacement: 'bg-oled-black' },
  { regex: /bg-nord-1\/50/g, replacement: 'bg-glass-surface' },
  { regex: /bg-nord-2\/50/g, replacement: 'bg-white\/[0.06]' },
  { regex: /bg-nord-1/g, replacement: 'bg-zinc-900' },
  { regex: /bg-nord-2/g, replacement: 'bg-zinc-800' },
  { regex: /bg-nord-3/g, replacement: 'bg-zinc-800' },
  { regex: /bg-nord-1\/80/g, replacement: 'bg-oled-black\/80' },
  
  // Accents (Buttons, Highlights)
  { regex: /bg-nord-8\/10/g, replacement: 'bg-electric-blue\/10' },
  { regex: /bg-nord-8\/20/g, replacement: 'bg-electric-blue\/20' },
  { regex: /bg-nord-8/g, replacement: 'bg-electric-blue' },
  { regex: /bg-nord-9/g, replacement: 'bg-white\/10' },
  { regex: /bg-nord-9\/10/g, replacement: 'bg-white\/5' },
  { regex: /bg-nord-9\/20/g, replacement: 'bg-white\/10' },
  { regex: /bg-nord-12/g, replacement: 'bg-white\/10' },
  { regex: /bg-nord-12\/10/g, replacement: 'bg-white\/5' },
  { regex: /bg-nord-12\/20/g, replacement: 'bg-white\/10' },
  { regex: /bg-nord-15/g, replacement: 'bg-white\/10' },
  { regex: /bg-nord-15\/20/g, replacement: 'bg-white\/10' },
  { regex: /bg-nord-11/g, replacement: 'bg-red-600' },
  { regex: /bg-nord-14/g, replacement: 'bg-green-600' },
  
  // Text
  { regex: /text-nord-4/g, replacement: 'text-zinc-400' },
  { regex: /text-nord-5/g, replacement: 'text-zinc-400' },
  { regex: /text-nord-6/g, replacement: 'text-white' },
  { regex: /text-nord-8/g, replacement: 'text-white' },
  { regex: /text-nord-9/g, replacement: 'text-zinc-300' },
  { regex: /text-nord-12/g, replacement: 'text-zinc-300' },
  { regex: /text-nord-15/g, replacement: 'text-zinc-300' },
  
  // Borders
  { regex: /border-nord-3/g, replacement: 'border-glass-border' },
  { regex: /border-nord-2/g, replacement: 'border-glass-border' },
  { regex: /border-nord-8\/30/g, replacement: 'border-electric-blue\/30' },
  { regex: /border-nord-8/g, replacement: 'border-electric-blue' },
  { regex: /border-nord-9\/30/g, replacement: 'border-white\/10' },
  { regex: /border-nord-9/g, replacement: 'border-white\/20' },
  { regex: /border-nord-12\/30/g, replacement: 'border-white\/10' },
  { regex: /border-nord-12/g, replacement: 'border-white\/20' },
  { regex: /border-nord-15/g, replacement: 'border-white\/20' },
  
  // Gradients
  { regex: /from-nord-7/g, replacement: 'from-white' },
  { regex: /via-nord-8/g, replacement: 'via-zinc-300' },
  { regex: /to-nord-9/g, replacement: 'to-zinc-500' },
  { regex: /from-nord-8/g, replacement: 'from-electric-blue' },
  { regex: /to-nord-10/g, replacement: 'to-electric-blue-dark' },
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
console.log('Minimalist aesthetic applied!');
