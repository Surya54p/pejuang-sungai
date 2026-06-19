const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');
content = content.replace(/resolvedTheme === "dark"/g, '(mounted && resolvedTheme === "dark")');
fs.writeFileSync('app/page.tsx', content);
