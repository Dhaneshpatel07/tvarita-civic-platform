const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('https://tvarita-backend.onrender.com/api/auth/login', {
      email: 'admin@tvarita.com',
      password: 'dhanesh'
    });
    console.log('Login Success:', loginRes.data);
    const token = loginRes.data.token;

    // Test a dummy issue submission (it should be blocked by AI or duplicate check if I send it twice)
    const issueRes = await axios.post('https://tvarita-backend.onrender.com/api/issues', {
      title: 'Remote Test Issue',
      description: 'Testing the deployed backend from scratch script',
      category: 'Pothole',
      latitude: 12.9716,
      longitude: 77.5946,
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', // 1x1 transparent pixel
      forceSubmit: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Issue Success:', issueRes.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
