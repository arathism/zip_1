const twilio = require('twilio');

const accountSid = 'ACc3e4a30cd1e189bbd8f9a4d0a3767606';
const authToken = '69beff649f4de25abdad51ed5235c24b';
const fromNumber = '+14343373007';

// REPLACE THIS WITH YOUR ACTUAL PHONE NUMBER
const toNumber = '+91REPLACE_WITH_YOUR_ACTUAL_NUMBER'; // e.g., +919876543210

async function testTwilio() {
  try {
    console.log('🔧 Testing Twilio credentials...');
    console.log('From:', fromNumber);
    console.log('To:', toNumber);
    
    const client = twilio(accountSid, authToken);
    
    // Test authentication by fetching account balance
    const balance = await client.balance.fetch();
    console.log('✅ Twilio authentication successful');
    console.log('💰 Account balance:', balance.balance, balance.currency);
    
    // Test sending SMS
    console.log('🚀 Testing SMS sending...');
    const message = await client.messages.create({
      body: 'Test SMS from SolveIT - Twilio is working! ✅',
      from: fromNumber,
      to: toNumber
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('Price:', message.price);
    
  } catch (error) {
    console.error('❌ Twilio test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('More info:', error.moreInfo);
    
    if (error.code === 20003) {
      console.log('💡 Solution: Check your Account SID and Auth Token');
    } else if (error.code === 21211) {
      console.log('💡 Solution: The "to" phone number is invalid');
      console.log('💡 Make sure:');
      console.log('   - Phone starts with + (e.g., +91XXXXXXXXXX)');
      console.log('   - It\'s a real, active phone number');
      console.log('   - No spaces or special characters');
    } else if (error.code === 21610) {
      console.log('💡 Solution: Your Twilio trial account can only send to verified numbers');
      console.log('💡 Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.log('💡 Add and verify your phone number there');
    } else if (error.code === 21408) {
      console.log('💡 Solution: Your Twilio number cannot send to this country');
      console.log('💡 Try a US/Canada number or upgrade your Twilio account');
    }
  }
}

// Check if phone number is provided
if (toNumber.includes('REPLACE') || toNumber === '+91YOUR_ACTUAL_PHONE_NUMBER') {
  console.log('❌ Please replace the phone number in the script with your actual number!');
  console.log('📱 Format: +91XXXXXXXXXX (for India)');
  console.log('💡 Example: +919876543210');
} else {
  testTwilio();
}