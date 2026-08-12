async function test() {
  try {
    // 1. Register a test host
    const email = 'testhost' + Date.now() + '@example.com';
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Host',
        email: email,
        password: 'password123',
        role: 'host'
      })
    });
    
    // 2. Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful, got token');

    // 3. Hit dashboard
    try {
      const dashRes = await fetch('http://localhost:5000/api/host/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dashText = await dashRes.text();
      try {
        const dashData = JSON.parse(dashText);
        console.log('Dashboard response:', dashRes.status, dashData);
      } catch(e) {
        console.log('Dashboard response TEXT:', dashRes.status, dashText.substring(0, 200));
      }
    } catch (e) {
      console.error('Dashboard Error:', e.message);
    }

    // 4. Hit listings
    try {
      const listRes = await fetch('http://localhost:5000/api/host/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listText = await listRes.text();
      try {
        const listData = JSON.parse(listText);
        console.log('Listings response:', listRes.status, listData);
      } catch(e) {
        console.log('Listings response TEXT:', listRes.status, listText.substring(0, 200));
      }
    } catch (e) {
      console.error('Listings Error:', e.message);
    }

  } catch (err) {
    console.error('Root Error:', err.message);
  }
}

test();
