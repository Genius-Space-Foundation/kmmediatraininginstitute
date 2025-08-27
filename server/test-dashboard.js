const axios = require("axios");

async function testStudentDashboard() {
  try {
    console.log("🔍 Testing student dashboard endpoint...");

    // Test the student dashboard overview endpoint
    const response = await axios.get(
      "http://localhost:5000/api/students/dashboard/overview",
      {
        headers: {
          Authorization: "Bearer YOUR_JWT_TOKEN_HERE", // You'll need to get a real token
        },
      }
    );

    console.log("✅ Student dashboard response:", response.data);
  } catch (error) {
    console.error(
      "❌ Error testing student dashboard:",
      error.response?.data || error.message
    );
  }
}

testStudentDashboard();





