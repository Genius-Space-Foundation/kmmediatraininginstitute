const axios = require("axios");

async function testTrainerStudents() {
  try {
    console.log("🔍 Testing trainer students endpoint...");

    // Test the trainer students endpoint
    const response = await axios.get(
      "http://localhost:5000/api/trainers/students",
      {
        headers: {
          Authorization: "Bearer YOUR_JWT_TOKEN_HERE", // You'll need to get a real token
        },
      }
    );

    console.log("✅ Trainer students response:", response.data);

    if (response.data.success && response.data.students) {
      console.log(`📊 Found ${response.data.students.length} students`);
      response.data.students.forEach((student, index) => {
        console.log(
          `  ${index + 1}. ${student.firstName} ${student.lastName} - ${
            student.courseName
          } (${student.status})`
        );
      });
    }
  } catch (error) {
    console.error(
      "❌ Error testing trainer students:",
      error.response?.data || error.message
    );
  }
}

testTrainerStudents();





