const axios = require("axios");

async function testAdminRegistrations() {
  try {
    console.log("🔍 Testing admin registrations endpoint...");

    // Test the admin registrations endpoint
    const response = await axios.get(
      "http://localhost:5000/api/registrations/admin/all"
    );

    console.log("✅ Admin registrations response:", response.data);

    if (response.data.success && response.data.data.registrations) {
      console.log(
        `📊 Found ${response.data.data.registrations.length} registrations`
      );
      response.data.data.registrations.forEach((reg, index) => {
        console.log(
          `  ${index + 1}. User: ${reg.firstName} ${reg.lastName}, Course: ${
            reg.courseName
          }, Status: ${reg.status}`
        );
      });
    }
  } catch (error) {
    console.error(
      "❌ Error testing admin registrations:",
      error.response?.data || error.message
    );
  }
}

testAdminRegistrations();







