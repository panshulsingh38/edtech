const fs = require('fs');
const path = require('path');

function searchFiles(dir, textToFind) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFiles(fullPath, textToFind);
        } else if (stat.isFile()) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes(textToFind)) {
                    console.log(`FOUND IN: ${fullPath}`);
                }
            } catch (e) {
                // Ignore binary files or read errors
            }
        }
    }
}

searchFiles(process.cwd(), 'gemini-flash-latest');
console.log('Search complete.');
