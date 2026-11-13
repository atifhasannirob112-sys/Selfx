const fs = require('fs');

function inspect(filename) {
  if (!fs.existsSync(filename)) return;
  console.log('=== Inspecting', filename, '===');
  const html = fs.readFileSync(filename, 'utf-8');
  
  // 1. Check title
  const title = html.match(/<title>([^<]+)<\/title>/i);
  console.log('Title:', title ? title[1] : 'none');

  // 2. Check JSON data scripts
  const scripts = html.matchAll(/<script[^>]*>(.*?)<\/script>/gs);
  let jsonVideoUrls = [];
  for (const s of scripts) {
    const content = s[1];
    if (content.includes('video_url') || content.includes('browser_native_hd_url') || content.includes('.mp4')) {
      const vMatch = content.match(/"video_url":"([^"]+)"/g) || [];
      const hdMatch = content.match(/"browser_native_hd_url":"([^"]+)"/g) || [];
      const sdMatch = content.match(/"browser_native_sd_url":"([^"]+)"/g) || [];
      const mp4Match = content.match(/https:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/g) || [];
      jsonVideoUrls.push(...vMatch, ...hdMatch, ...sdMatch, ...mp4Match);
    }
  }

  console.log('Found video candidates count:', jsonVideoUrls.length);
  for (const u of jsonVideoUrls.slice(0, 5)) {
    console.log('Candidate:', u.replace(/\\u0026/g, '&').replace(/\\/g, '').replace(/"/g, '').substring(0, 120));
  }
}

inspect('ig_page.html');
inspect('fb_ig.html');
