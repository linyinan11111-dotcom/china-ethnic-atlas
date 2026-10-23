const urls = process.argv.slice(2);
for (const url of urls) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const b = new Uint8Array(await r.arrayBuffer());
    const utf = new TextDecoder('utf-8').decode(b);
    const t = new TextDecoder(
      /charset=[\"']?(?:gb|GB)/.test(utf.slice(0, 5000)) ? 'gb18030' : 'utf-8',
    ).decode(b);
    console.log(
      '\nURL',
      url,
      'STATUS',
      r.status,
      'TYPE',
      r.headers.get('content-type'),
      'BYTES',
      b.length,
    );
    if (url.includes('left.htm'))
      console.log(
        [...t.matchAll(/<a[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi)]
          .filter((m) => /民族|地区生产总值|人均地区|各地区人口/.test(m[2]))
          .map((m) => m[1] + ' ' + m[2].replace(/<[^>]+>/g, ''))
          .join('\n'),
      );
    else
      console.log(
        t
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 20000),
      );
  } catch (e) {
    console.log(url, e.message);
  }
}
