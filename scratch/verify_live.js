const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('https://tvarita-backend.onrender.com/api/auth/login', {
      email: 'admin@tvarita.com',
      password: 'dhanesh'
    });
    console.log('Login Success');
    const token = loginRes.data.token;

    const issueRes = await axios.post('https://tvarita-backend.onrender.com/api/issues', {
      title: 'Pothole Verification',
      description: 'System-wide verification of Render, AI Sentinel, and Cloudinary pipelines.',
      category: 'Pothole',
      latitude: 12.97,
      longitude: 77.59,
      // A slightly more complex base64 to avoid "empty" blocks but still small
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADfE7sS9YAAAAAElFTkSuQmCC', 
      forceSubmit: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Final Verification: SUCCESS');
    console.log('Issue ID:', issueRes.data._id);
  } catch (error) {
    console.error('Status:', error.response ? error.response.status : error.message);
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
