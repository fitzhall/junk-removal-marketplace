#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the credentials file
const credsPath = '/Users/fitzhall/Downloads/junkremoval-473115-c273bc176639.json';
const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

console.log('Add these environment variables to Vercel:\n');
console.log('================================================\n');

console.log('GOOGLE_CLOUD_PROJECT_ID=' + creds.project_id);
console.log('\nGOOGLE_CLOUD_CLIENT_EMAIL=' + creds.client_email);
console.log('\nGOOGLE_CLOUD_PRIVATE_KEY=' + creds.private_key);

console.log('\n================================================');
console.log('\nIMPORTANT: When adding to Vercel:');
console.log('1. Go to your Vercel project dashboard');
console.log('2. Click on "Settings" tab');
console.log('3. Click on "Environment Variables" in the left sidebar');
console.log('4. Add each variable above');
console.log('5. For GOOGLE_CLOUD_PRIVATE_KEY, make sure to include the entire key');
console.log('   including the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines');
console.log('6. Deploy your project again after adding the variables');