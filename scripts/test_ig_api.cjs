const fs = require('fs');

async function testIGApi() {
  const shortcode = "C-r3kE1p_b5"; // sample public shortcode
  
  // Method 1: Instagram GraphQL endpoint with doc_id and X-IG-App-ID
  try {
    const res = await fetch("https://www.instagram.com/graphql/query/", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "X-IG-App-ID": "936619743392459",
        "X-FB-LSD": "AdSRIBBVkE0vOxUqtul-Byfx2Nc",
        "X-ASBD-ID": "129477",
        "Content-Type": "application/x-www-form-urlencoded",
        "Sec-Fetch-Site": "same-origin"
      },
      body: `doc_id=10015901848480474&variables=${encodeURIComponent(JSON.stringify({ shortcode }))}`
    });
    console.log("Method 1 (GraphQL) Status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("GraphQL response data keys:", Object.keys(data));
      const videoUrl = data?.data?.xdt_shortcode_media?.video_url;
      console.log("GraphQL video URL:", videoUrl ? videoUrl.substring(0, 100) : "not found");
    } else {
      const text = await res.text();
      console.log("GraphQL error text:", text.substring(0, 200));
    }
  } catch (e) {
    console.error("Method 1 Error:", e.message);
  }

  // Method 2: Instagram API v1 web info endpoint
  try {
    const res2 = await fetch(`https://www.instagram.com/api/v1/oembed/?url=https://www.instagram.com/reel/${shortcode}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "X-IG-App-ID": "936619743392459"
      }
    });
    console.log("Method 2 (OEmbed) Status:", res2.status);
    if (res2.ok) {
      const d2 = await res2.json();
      console.log("OEmbed title:", d2.title, "author:", d2.author_name);
    }
  } catch(e) {
    console.log("Method 2 Error:", e.message);
  }
}

testIGApi();
