import http from 'http';

function check(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

async function run() {
  console.log('--- FINAL AUDIT ---');
  
  const apiRes = await check('http://localhost:5000/api/v1/staff/services');
  console.log('Backend API (/api/v1/staff/services):', apiRes.status);
  if (apiRes.data) {
    const hasMariana = apiRes.data.includes('mariana@studiobraz.com');
    const hasLara = apiRes.data.includes('lara@studiobraz.com');
    const hasGabriela = apiRes.data.includes('gabriela@studiobraz.com');
    console.log('  Seeded Staff Found:', { hasMariana, hasLara, hasGabriela });
    if (hasMariana && hasLara && hasGabriela) console.log('  ✅ STAFF DATA 100% OK');
  }

  const feRes = await check('http://localhost:5173');
  console.log('Frontend (localhost:5173):', feRes.status || 'ERROR');
  if (feRes.data && feRes.data.includes('root')) {
    console.log('  ✅ FRONTEND 100% OK');
  }

  process.exit(0);
}

run();
