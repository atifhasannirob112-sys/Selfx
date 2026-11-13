const testUrl = "https://www.instagram.com/reel/C8K73aZpB3Q/";

async function testAll() {
  console.log("Testing downloader engines for:", testUrl);

  // 1. VKR Downloader
  try {
    const r1 = await fetch(`https://api.vkrdownloader.com/server?vkr=${encodeURIComponent(testUrl)}`);
    console.log("VKR Status:", r1.status);
    if (r1.ok) {
      const j1 = await r1.json();
      console.log("VKR response:", JSON.stringify(j1).substring(0, 150));
    }
  } catch(e) { console.log("VKR err:", e.message); }

  // 2. Cobalt API instances
  const cobaltInstances = [
    "https://api.cobalt.tools",
    "https://cobalt-api.kwiatekm.pl",
    "https://co.wuk.sh"
  ];
  for (const c of cobaltInstances) {
    try {
      const r2 = await fetch(`${c}/`, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl }),
        signal: AbortSignal.timeout(5000)
      });
      console.log("Cobalt", c, "Status:", r2.status);
      if (r2.ok) {
        const j2 = await r2.json();
        console.log("Cobalt response:", JSON.stringify(j2).substring(0, 150));
      }
    } catch(e) { console.log("Cobalt", c, "err:", e.message); }
  }

  // 3. InDown API
  try {
    const r3 = await fetch("https://indown.io/download", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://indown.io/",
        "Origin": "https://indown.io",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `link=${encodeURIComponent(testUrl)}&referer=instagram`,
      signal: AbortSignal.timeout(6000)
    });
    console.log("InDown status:", r3.status);
    if (r3.ok) {
      const t3 = await r3.text();
      console.log("InDown html len:", t3.length, "has mp4:", t3.includes(".mp4"));
    }
  } catch(e) { console.log("InDown err:", e.message); }

  // 4. SaveFrom Worker
  try {
    const sfRes = await fetch("https://worker.savefrom.net/savefrom.php", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Origin": "https://en1.savefrom.net",
        "Referer": "https://en1.savefrom.net/",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `sf_url=${encodeURIComponent(testUrl)}&new=2&lang=en&app=`,
      signal: AbortSignal.timeout(6000)
    });
    console.log("SaveFrom status:", sfRes.status);
    if (sfRes.ok) {
      const sfText = await sfRes.text();
      console.log("SaveFrom len:", sfText.length, "has link:", sfText.includes("link-download"));
    }
  } catch(e) { console.log("SaveFrom err:", e.message); }
}

testAll();
