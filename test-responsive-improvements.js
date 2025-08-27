#!/usr/bin/env node

/**
 * Responsive Design Improvements Testing Script for KM Media
 *
 * This script helps verify all the responsive design improvements implemented
 * Run with: node test-responsive-improvements.js
 */

const fs = require("fs");
const path = require("path");

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

// Screen sizes to test
const SCREEN_SIZES = {
  mobile: [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 12/13/14", width: 390, height: 844 },
    { name: "Samsung Galaxy S20", width: 360, height: 800 },
    { name: "iPhone 12 Pro Max", width: 428, height: 926 },
  ],
  tablet: [
    { name: "iPad", width: 768, height: 1024 },
    { name: "iPad Pro", width: 1024, height: 1366 },
    { name: "Samsung Galaxy Tab", width: 800, height: 1280 },
  ],
  desktop: [
    { name: "Laptop", width: 1366, height: 768 },
    { name: "Desktop", width: 1920, height: 1080 },
    { name: "Ultra-wide", width: 2560, height: 1440 },
  ],
};

// Responsive improvements checklist
const IMPROVEMENTS_CHECKLIST = [
  {
    category: "CSS Improvements",
    tests: [
      {
        name: "Mobile form optimization (16px font)",
        description:
          "Input fields should have 16px font to prevent zoom on mobile",
        check: () => {
          const cssContent = fs.readFileSync("client/src/index.css", "utf8");
          return (
            cssContent.includes("font-size: 16px") &&
            cssContent.includes('input[type="text"]')
          );
        },
      },
      {
        name: "Touch target sizing (44px minimum)",
        description:
          "Buttons and interactive elements should have minimum 44px touch targets",
        check: () => {
          const cssContent = fs.readFileSync("client/src/index.css", "utf8");
          return (
            cssContent.includes("min-height: 44px") &&
            cssContent.includes("min-width: 44px")
          );
        },
      },
      {
        name: "Responsive text utilities",
        description:
          "CSS should include responsive text utilities with clamp()",
        check: () => {
          const cssContent = fs.readFileSync("client/src/index.css", "utf8");
          return (
            cssContent.includes("font-size: clamp(") &&
            cssContent.includes(".text-responsive")
          );
        },
      },
      {
        name: "Accessibility improvements",
        description: "CSS should include reduced motion and focus indicators",
        check: () => {
          const cssContent = fs.readFileSync("client/src/index.css", "utf8");
          return (
            cssContent.includes("prefers-reduced-motion") &&
            cssContent.includes("focus-visible")
          );
        },
      },
    ],
  },
  {
    category: "Tailwind Configuration",
    tests: [
      {
        name: "Additional breakpoints (xs, 3xl, 4xl)",
        description: "Tailwind config should include custom breakpoints",
        check: () => {
          const configContent = fs.readFileSync(
            "client/tailwind.config.js",
            "utf8"
          );
          return (
            configContent.includes('xs: "475px"') &&
            configContent.includes('"3xl": "1600px"') &&
            configContent.includes('"4xl": "1920px"')
          );
        },
      },
      {
        name: "Responsive font sizes",
        description: "Config should include responsive font size utilities",
        check: () => {
          const configContent = fs.readFileSync(
            "client/tailwind.config.js",
            "utf8"
          );
          return (
            configContent.includes("responsive-xs") &&
            configContent.includes("responsive-lg") &&
            configContent.includes("clamp(")
          );
        },
      },
      {
        name: "Custom responsive utilities",
        description: "Config should include custom responsive utilities plugin",
        check: () => {
          const configContent = fs.readFileSync(
            "client/tailwind.config.js",
            "utf8"
          );
          return (
            configContent.includes(".touch-target") &&
            configContent.includes(".text-responsive") &&
            configContent.includes("addUtilities")
          );
        },
      },
    ],
  },
  {
    category: "Component Improvements",
    tests: [
      {
        name: "Navbar responsive logo",
        description: "Navbar should have responsive logo sizing",
        check: () => {
          const navbarContent = fs.readFileSync(
            "client/src/components/Navbar.tsx",
            "utf8"
          );
          return (
            navbarContent.includes("w-10 h-10 sm:w-12 sm:h-12") &&
            navbarContent.includes("text-lg sm:text-xl")
          );
        },
      },
      {
        name: "Navbar touch targets",
        description: "Navbar buttons should have touch-target class",
        check: () => {
          const navbarContent = fs.readFileSync(
            "client/src/components/Navbar.tsx",
            "utf8"
          );
          return (
            navbarContent.includes("touch-target") &&
            navbarContent.includes("aria-label")
          );
        },
      },
      {
        name: "Enhanced mobile menu structure",
        description:
          "Mobile menu should have organized sections with all navigation items",
        check: () => {
          const navbarContent = fs.readFileSync(
            "client/src/components/Navbar.tsx",
            "utf8"
          );
          return (
            navbarContent.includes("Navigation") &&
            navbarContent.includes("Account") &&
            navbarContent.includes("Quick Actions") &&
            navbarContent.includes("Contact")
          );
        },
      },
      {
        name: "Home page responsive text",
        description: "Home page should use responsive text classes",
        check: () => {
          const homeContent = fs.readFileSync(
            "client/src/pages/Home.tsx",
            "utf8"
          );
          return (
            homeContent.includes("text-responsive-") &&
            homeContent.includes("text-responsive-lg")
          );
        },
      },
      {
        name: "Home page responsive buttons",
        description:
          "Home page buttons should have touch targets and responsive sizing",
        check: () => {
          const homeContent = fs.readFileSync(
            "client/src/pages/Home.tsx",
            "utf8"
          );
          return (
            homeContent.includes("touch-target") &&
            homeContent.includes("text-responsive-base")
          );
        },
      },
      {
        name: "Courses page responsive grid",
        description: "Courses page should use responsive grid classes",
        check: () => {
          const coursesContent = fs.readFileSync(
            "client/src/pages/Courses.tsx",
            "utf8"
          );
          return (
            coursesContent.includes("text-responsive-") &&
            coursesContent.includes("container mx-auto")
          );
        },
      },
    ],
  },
];

function runTest(test, category) {
  testResults.total++;

  try {
    const passed = test.check();
    if (passed) {
      testResults.passed++;
      testResults.details.push({
        status: "✅ PASSED",
        category,
        name: test.name,
        description: test.description,
      });
    } else {
      testResults.failed++;
      testResults.details.push({
        status: "❌ FAILED",
        category,
        name: test.name,
        description: test.description,
      });
    }
  } catch (error) {
    testResults.failed++;
    testResults.details.push({
      status: "❌ ERROR",
      category,
      name: test.name,
      description: test.description,
      error: error.message,
    });
  }
}

function generateTestReport() {
  console.log("🎯 KM Media Responsive Design Improvements Test Report\n");
  console.log("=".repeat(80));

  // Run all tests
  IMPROVEMENTS_CHECKLIST.forEach((category) => {
    console.log(`\n📋 ${category.category.toUpperCase()}\n`);
    category.tests.forEach((test) => {
      runTest(test, category.category);
    });
  });

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 TEST SUMMARY\n");
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(
    `🎯 Success Rate: ${(
      (testResults.passed / testResults.total) *
      100
    ).toFixed(1)}%`
  );

  // Detailed results
  console.log("\n📋 DETAILED RESULTS\n");
  testResults.details.forEach((result) => {
    console.log(`${result.status} ${result.category}: ${result.name}`);
    console.log(`   ${result.description}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log("");
  });

  // Recommendations
  console.log("💡 RECOMMENDATIONS\n");

  if (testResults.failed === 0) {
    console.log("🎉 All responsive improvements are properly implemented!");
    console.log(
      "✅ Your application should now provide excellent responsive experience"
    );
    console.log("✅ Test on real devices to verify the improvements");
  } else {
    console.log("⚠️  Some improvements need attention:");
    console.log("1. Review failed tests above");
    console.log("2. Implement missing responsive features");
    console.log("3. Re-run tests after making changes");
    console.log("4. Test on real devices");
  }

  // Next steps
  console.log("\n🚀 NEXT STEPS\n");
  console.log("1. Test the application in browser developer tools:");
  console.log("   - Open DevTools (F12)");
  console.log("   - Toggle device toolbar (Ctrl+Shift+M)");
  console.log("   - Test each screen size from the list below");

  console.log("\n2. Test these specific screen sizes:");
  Object.entries(SCREEN_SIZES).forEach(([category, sizes]) => {
    console.log(`\n   ${category.toUpperCase()}:`);
    sizes.forEach((size) => {
      console.log(`   • ${size.name}: ${size.width} × ${size.height}`);
    });
  });

  console.log("\n3. Key areas to verify:");
  console.log("   • Navigation hamburger menu on mobile");
  console.log("   • Touch targets (44px minimum)");
  console.log("   • Text readability without zooming");
  console.log("   • Form inputs (16px font to prevent zoom)");
  console.log("   • Responsive grids and layouts");
  console.log("   • Button and link accessibility");

  console.log("\n4. Performance testing:");
  console.log("   • Use Lighthouse for performance audit");
  console.log("   • Test on slow network (3G simulation)");
  console.log("   • Check for layout shifts (CLS)");

  console.log("\n" + "=".repeat(80));

  if (testResults.failed === 0) {
    console.log(
      "🎉 All tests passed! Your responsive design improvements are working correctly."
    );
  } else {
    console.log(
      `⚠️  ${testResults.failed} tests failed. Please review and fix the issues above.`
    );
  }
}

// Main execution
if (require.main === module) {
  generateTestReport();
}

module.exports = {
  testResults,
  IMPROVEMENTS_CHECKLIST,
  SCREEN_SIZES,
};
