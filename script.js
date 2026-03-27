const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<img 
                                src="https://cdn.phototourl.com/free/2026-03-27-67c1be21-1d10-4957-bd11-5b7c19abfb2d.png" 
                                alt="吉祥物" 
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 object-contain drop-shadow-lg relative z-10"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />`;

const replacement = `<img 
                                src="https://cdn.phototourl.com/free/2026-03-26-6304bee5-2b6a-4fdd-8b23-75648ac52af8.png" 
                                alt="吉祥物" 
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 object-contain drop-shadow-lg relative z-10"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced successfully!");
} else {
  console.log("Target not found!");
}
