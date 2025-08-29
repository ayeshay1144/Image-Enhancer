const axios = require('axios');

// --- CONFIGURATION ---
const API_BASE_URL = 'http://ec2-13-239-56-74.ap-southeast-2.compute.amazonaws.com:3000'; // Change to your EC2 public IP when testing deployment
const IMAGE_ID = 1; // The ID of the image you want to enhance repeatedly
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU2NDQyNDQwLCJleHAiOjE3NTY0NDYwNDB9.jCblYnuHTzETy4cZKgy7h7mM_vgTEKk3qCKwkZzCFHA'; // Paste your valid token
const CONCURRENT_REQUESTS = 10; // Number of parallel requests to send
// --------------------

const enhanceEndpoint = `${API_BASE_URL}/api/images/${IMAGE_ID}/enhance`;

const sendRequest = async (i) => {
    console.log(`[Request ${i}] Sending enhancement request...`);
    try {
        const response = await axios.post(enhanceEndpoint, {}, {
            headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }
        });
        console.log(`[Request ${i}] Status: ${response.status} - ${response.data.message}`);
    } catch (error) {
        console.error(`[Request ${i}] Error: ${error.response ? error.response.status : error.message}`);
    }
};

const runLoadTest = () => {
    console.log(`Starting load test with ${CONCURRENT_REQUESTS} concurrent requests...`);
    console.log('This will run indefinitely. Press Ctrl+C to stop.');

    // Send requests in a continuous loop to sustain the load
    setInterval(() => {
        for (let i = 1; i <= CONCURRENT_REQUESTS; i++) {
            sendRequest(i);
        }
    }, 1000); // Fire a batch of requests every second
};

runLoadTest();