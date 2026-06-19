const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const loginData = JSON.stringify({ email: 'admin@school.local', password: 'Admin@123' });
    const loginOptions = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginRes = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    console.log('login', loginRes.status, loginRes.body);
    if (loginRes.status !== 200) return;
    const token = JSON.parse(loginRes.body).token;

    const csv = 'Name,Roll No,Admission No,Class,Section,Gender,Date Of Birth,Parent Name,Parent Phone,Address\nTest Student,1,ADM001,10,A,male,01012010,Parent One,9999999999,Address\n';
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = '';
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="file"; filename="tmp.csv"\r\n';
    body += 'Content-Type: text/csv\r\n\r\n';
    body += csv;
    body += `\r\n--${boundary}--\r\n`;

    const importOptions = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/students/import',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Bearer ' + token
      }
    };

    const importRes = await new Promise((resolve, reject) => {
      const req = http.request(importOptions, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    console.log('import', importRes.status, importRes.body);
  } catch (err) {
    console.error('debug import failed', err);
  }
})();
