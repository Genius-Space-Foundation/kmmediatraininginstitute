const axios = require("axios");

async function testPaymentVerification() {
  try {
    console.log("🔍 Testing payment verification endpoint...");

    // Get the latest payment reference
    const response = await axios.post(
      "http://localhost:5000/api/payments/verify",
      {
        reference: "KM_MEDIA_66b718587c734d2a",
      }
    );

    console.log("✅ Payment verification response:", response.data);
  } catch (error) {
    console.error(
      "❌ Error testing payment verification:",
      error.response?.data || error.message
    );
  }
}

testPaymentVerification();







