const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 1. Create dummy image file
    const filePath = path.join(__dirname, 'dummy.png');
    // a tiny 1x1 transparent png
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    // 2. Login to get token
    const email = 'testhost' + Date.now() + '@example.com';
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Host', email, password: 'password123', role: 'host' })
    });
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const { token } = await loginRes.json();

    // 3. Upload image
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'image/png' });
    formData.append('images', fileBlob, 'dummy.png');

    const uploadRes = await fetch('http://localhost:5000/api/host/listings/upload-images', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const uploadData = await uploadRes.json();
    console.log('Upload response:', uploadRes.status, uploadData);
  } catch(e) {
    console.error(e);
  }
}
testUpload();
