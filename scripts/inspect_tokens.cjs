const fs = require('fs');
const html = fs.readFileSync('ig_page.html', 'utf-8');

const appId = html.match(/"appId":"(\d+)"/i) || html.match(/"APP_ID":"(\d+)"/i) || html.match(/"X-IG-App-ID":"(\d+)"/i);
const lsd = html.match(/"LSD",\[\],\{"token":"([^"]+)"/i) || html.match(/"token":"([a-zA-Z0-9_-]{15,})"/i);
const jazoest = html.match(/name="jazoest" value="(\d+)"/i) || html.match(/"jazoest":"(\d+)"/i);
const docIds = Array.from(html.matchAll(/"doc_id":"(\d+)"/g)).map(m => m[1]);

console.log('AppID:', appId ? appId[1] : '936619743392459');
console.log('LSD:', lsd ? lsd[1] : 'none');
console.log('Jazoest:', jazoest ? jazoest[1] : 'none');
console.log('DocIDs:', [...new Set(docIds)].slice(0, 10));
