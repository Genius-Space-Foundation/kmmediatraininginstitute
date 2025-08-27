#!/usr/bin/env node

/**
 * Dashboard Responsive Design Testing Script for KM Media
 *
 * This script helps verify all the responsive design improvements implemented
 * for dashboard components across all screen sizes.
 * Run with: node test-dashboard-responsive.js
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

// Dashboard responsive improvements checklist
const DASHBOARD_IMPROVEMENTS_CHECKLIST = [
  {
    category: "AdminDashboard",
    tests: [
      {
        name: "Responsive header layout",
        description:
          "Header should use flex-col on mobile and flex-row on larger screens",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/AdminDashboard.tsx",
            "utf8"
          );
          return (
            content.includes("flex-col sm:flex-row") &&
            content.includes("text-responsive-2xl sm:text-responsive-3xl")
          );
        },
      },
      {
        name: "Responsive button text",
        description: "Button should show abbreviated text on mobile",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/AdminDashboard.tsx",
            "utf8"
          );
          return (
            content.includes("hidden sm:inline") &&
            content.includes("sm:hidden") &&
            content.includes("touch-target")
          );
        },
      },
    ],
  },
  {
    category: "DashboardOverview",
    tests: [
      {
        name: "Responsive grid layout",
        description: "Stats grid should use responsive breakpoints",
        check: () => {
          const content = fs.readFileSync(
            "client/src/components/DashboardOverview.tsx",
            "utf8"
          );
          return (
            content.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4") &&
            content.includes("gap-4 sm:gap-6")
          );
        },
      },
      {
        name: "Responsive card padding",
        description: "Cards should have responsive padding",
        check: () => {
          const content = fs.readFileSync(
            "client/src/components/DashboardOverview.tsx",
            "utf8"
          );
          return (
            content.includes("p-4 sm:p-6") &&
            content.includes("text-xs sm:text-sm")
          );
        },
      },
      {
        name: "Responsive text sizing",
        description:
          "Text should scale appropriately on different screen sizes",
        check: () => {
          const content = fs.readFileSync(
            "client/src/components/DashboardOverview.tsx",
            "utf8"
          );
          return (
            content.includes("text-xl sm:text-2xl") &&
            content.includes("text-responsive-lg sm:text-xl")
          );
        },
      },
      {
        name: "Touch targets",
        description: "Interactive elements should have touch-target class",
        check: () => {
          const content = fs.readFileSync(
            "client/src/components/DashboardOverview.tsx",
            "utf8"
          );
          return content.includes("touch-target");
        },
      },
    ],
  },
  {
    category: "ModernStudentDashboard",
    tests: [
      {
        name: "Responsive welcome section",
        description: "Welcome section should adapt to mobile screens",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/ModernStudentDashboard.tsx",
            "utf8"
          );
          return (
            content.includes("text-responsive-2xl sm:text-responsive-3xl") &&
            content.includes("flex-col sm:flex-row")
          );
        },
      },
      {
        name: "Responsive stats grid",
        description: "Stats cards should use responsive grid",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/ModernStudentDashboard.tsx",
            "utf8"
          );
          return (
            content.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4") &&
            content.includes("gap-4 sm:gap-6")
          );
        },
      },
      {
        name: "Responsive course cards",
        description: "Course cards should be mobile-friendly",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/ModernStudentDashboard.tsx",
            "utf8"
          );
          return (
            content.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3") &&
            content.includes("p-4 sm:p-6") &&
            content.includes("text-base sm:text-lg")
          );
        },
      },
      {
        name: "Responsive course card content",
        description: "Course card content should scale appropriately",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/ModernStudentDashboard.tsx",
            "utf8"
          );
          return (
            content.includes("w-10 h-10 sm:w-12 sm:h-12") &&
            content.includes("text-xs sm:text-sm") &&
            content.includes("touch-target")
          );
        },
      },
    ],
  },
  {
    category: "TrainerDashboard",
    tests: [
      {
        name: "Mobile sidebar functionality",
        description: "Trainer dashboard should have mobile sidebar",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/TrainerDashboard.tsx",
            "utf8"
          );
          return (
            content.includes("lg:hidden") &&
            content.includes("sidebarOpen") &&
            content.includes("setSidebarOpen")
          );
        },
      },
      {
        name: "Responsive stats cards",
        description: "Stats cards should be responsive",
        check: () => {
          const content = fs.readFileSync(
            "client/src/pages/TrainerDashboard.tsx",
            "utf8"
          );
          return content.includes("grid-cols-1 md:grid-cols-2 lg:grid-cols-4");
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
  console.log("🎯 KM Media Dashboard Responsive Design Test Report\n");
  console.log("=".repeat(80));

  // Run all tests
  DASHBOARD_IMPROVEMENTS_CHECKLIST.forEach((category) => {
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
    console.log(
      "🎉 All dashboard responsive improvements are properly implemented!"
    );
    console.log(
      "✅ Your dashboards should now provide excellent responsive experience"
    );
    console.log("✅ Test on real devices to verify the improvements");
  } else {
    console.log("⚠️  Some dashboard improvements need attention:");
    console.log("1. Review failed tests above");
    console.log("2. Implement missing responsive features");
    console.log("3. Re-run tests after making changes");
    console.log("4. Test on real devices");
  }

  // Next steps
  console.log("\n🚀 NEXT STEPS\n");
  console.log("1. Test the dashboards in browser developer tools:");
  console.log("   - Open DevTools (F12)");
  console.log("   - Toggle device toolbar (Ctrl+Shift+M)");
  console.log("   - Test each dashboard on different screen sizes");

  console.log("\n2. Test these specific screen sizes:");
  console.log("   MOBILE:");
  console.log("   • iPhone SE: 375 × 667");
  console.log("   • iPhone 12/13/14: 390 × 844");
  console.log("   • Samsung Galaxy S20: 360 × 800");
  console.log("   • iPhone 12 Pro Max: 428 × 926");

  console.log("\n   TABLET:");
  console.log("   • iPad: 768 × 1024");
  console.log("   • iPad Pro: 1024 × 1366");
  console.log("   • Samsung Galaxy Tab: 800 × 1280");

  console.log("\n   DESKTOP:");
  console.log("   • Laptop: 1366 × 768");
  console.log("   • Desktop: 1920 × 1080");
  console.log("   • Ultra-wide: 2560 × 1440");

  console.log("\n3. Key areas to verify:");
  console.log("   • Dashboard navigation and sidebar on mobile");
  console.log("   • Stats cards readability on small screens");
  console.log("   • Course cards and grids on mobile");
  console.log("   • Touch targets (44px minimum)");
  console.log("   • Text readability without zooming");
  console.log("   • Button and link accessibility");

  console.log("\n4. Dashboard-specific testing:");
  console.log("   • Admin Dashboard: Header layout, stats overview");
  console.log("   • Trainer Dashboard: Sidebar navigation, course management");
  console.log("   • Student Dashboard: Course cards, progress tracking");
  console.log("   • All Dashboards: Responsive grids, touch interactions");

  console.log("\n" + "=".repeat(80));

  if (testResults.failed === 0) {
    console.log(
      "🎉 All tests passed! Your dashboard responsive design improvements are working correctly."
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
  DASHBOARD_IMPROVEMENTS_CHECKLIST,
};

