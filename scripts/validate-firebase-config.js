#!/usr/bin/env node

/**
 * Firebase Configuration Validation Script
 * Validates Firebase configuration and environment variables
 */

const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(text) {
  console.log(colorize(`\n${text}`, "cyan"));
  console.log(colorize("=".repeat(text.length), "cyan"));
}

function printSuccess(text) {
  console.log(colorize(`✅ ${text}`, "green"));
}

function printError(text) {
  console.log(colorize(`❌ ${text}`, "red"));
}

function printWarning(text) {
  console.log(colorize(`⚠️  ${text}`, "yellow"));
}

function printInfo(text) {
  console.log(colorize(`ℹ️  ${text}`, "blue"));
}

// Validation functions
function validateBackendConfig() {
  printHeader("Backend Configuration Validation");

  const envPath = path.join(__dirname, "..", "server", ".env");

  if (!fs.existsSync(envPath)) {
    printError("Backend .env file not found");
    printInfo(
      "Copy server/env.firebase.example to server/.env and configure it"
    );
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const requiredVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_DATABASE_URL",
  ];

  let allValid = true;

  for (const varName of requiredVars) {
    const regex = new RegExp(`^${varName}=(.+)$`, "m");
    const match = envContent.match(regex);

    if (!match || !match[1] || match[1].trim() === "") {
      printError(`Missing or empty ${varName}`);
      allValid = false;
    } else {
      printSuccess(`${varName} is configured`);
    }
  }

  // Validate private key format
  if (envContent.includes("FIREBASE_PRIVATE_KEY=")) {
    const privateKeyMatch = envContent.match(/FIREBASE_PRIVATE_KEY="(.+)"/s);
    if (privateKeyMatch && privateKeyMatch[1]) {
      const privateKey = privateKeyMatch[1];
      if (
        privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
        privateKey.includes("-----END PRIVATE KEY-----")
      ) {
        printSuccess("Private key format is correct");
      } else {
        printError("Private key format is incorrect");
        printInfo("Ensure the private key includes the BEGIN/END markers");
        allValid = false;
      }
    }
  }

  return allValid;
}

function validateFrontendConfig() {
  printHeader("Frontend Configuration Validation");

  const envPath = path.join(__dirname, "..", "client", ".env");

  if (!fs.existsSync(envPath)) {
    printError("Frontend .env file not found");
    printInfo(
      "Copy client/env.firebase.example to client/.env and configure it"
    );
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const requiredVars = [
    "REACT_APP_FIREBASE_API_KEY",
    "REACT_APP_FIREBASE_AUTH_DOMAIN",
    "REACT_APP_FIREBASE_PROJECT_ID",
    "REACT_APP_FIREBASE_STORAGE_BUCKET",
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
    "REACT_APP_FIREBASE_APP_ID",
  ];

  let allValid = true;

  for (const varName of requiredVars) {
    const regex = new RegExp(`^${varName}=(.+)$`, "m");
    const match = envContent.match(regex);

    if (!match || !match[1] || match[1].trim() === "") {
      printError(`Missing or empty ${varName}`);
      allValid = false;
    } else {
      printSuccess(`${varName} is configured`);
    }
  }

  return allValid;
}

function validateProjectStructure() {
  printHeader("Project Structure Validation");

  const requiredFiles = [
    "server/src/config/firebase.ts",
    "client/src/config/firebase.ts",
    "server/test-firebase-connection.js",
    "client/src/components/FirebaseTest.tsx",
  ];

  let allValid = true;

  for (const filePath of requiredFiles) {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(fullPath)) {
      printSuccess(`${filePath} exists`);
    } else {
      printError(`${filePath} not found`);
      allValid = false;
    }
  }

  return allValid;
}

function validateDependencies() {
  printHeader("Dependencies Validation");

  const packageJsonPaths = ["server/package.json", "client/package.json"];

  let allValid = true;

  for (const packagePath of packageJsonPaths) {
    const fullPath = path.join(__dirname, "..", packagePath);

    if (!fs.existsSync(fullPath)) {
      printError(`${packagePath} not found`);
      allValid = false;
      continue;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (packagePath.includes("server")) {
        if (dependencies["firebase-admin"]) {
          printSuccess("firebase-admin is installed in server");
        } else {
          printError("firebase-admin not found in server dependencies");
          allValid = false;
        }
      }

      if (packagePath.includes("client")) {
        if (dependencies["firebase"]) {
          printSuccess("firebase is installed in client");
        } else {
          printError("firebase not found in client dependencies");
          allValid = false;
        }
      }
    } catch (error) {
      printError(`Error reading ${packagePath}: ${error.message}`);
      allValid = false;
    }
  }

  return allValid;
}

function validateFirebaseFiles() {
  printHeader("Firebase Files Validation");

  const firebaseFiles = [
    "firebase.json",
    "firestore.rules",
    "server/migration/firestore-security-rules.rules",
  ];

  let allValid = true;

  for (const filePath of firebaseFiles) {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(fullPath)) {
      printSuccess(`${filePath} exists`);
    } else {
      printWarning(`${filePath} not found (optional)`);
    }
  }

  return allValid;
}

function generateReport(results) {
  printHeader("Validation Report");

  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter((result) => result).length;

  console.log(`\n${colorize("Summary:", "bright")}`);
  console.log(`Total checks: ${totalChecks}`);
  console.log(`Passed: ${colorize(passedChecks.toString(), "green")}`);
  console.log(
    `Failed: ${colorize((totalChecks - passedChecks).toString(), "red")}`
  );

  if (passedChecks === totalChecks) {
    printSuccess("All validations passed! Firebase is ready to use.");
    console.log(
      colorize("\n🎉 You can now run the migration scripts!", "green")
    );
  } else {
    printError("Some validations failed. Please fix the issues above.");
    console.log(
      colorize(
        "\n📚 See FIREBASE_SETUP_GUIDE.md for detailed instructions.",
        "yellow"
      )
    );
  }

  // Next steps
  console.log(colorize("\nNext Steps:", "bright"));
  if (results.backend && results.frontend) {
    console.log(
      "1. Test Firebase connection: cd server && node test-firebase-connection.js"
    );
    console.log(
      "2. Run data migration: node server/migration/postgres-to-firestore-export.js"
    );
    console.log("3. Import data: node server/migration/firestore-import.js");
  } else {
    console.log("1. Fix configuration issues above");
    console.log("2. Run this validation script again");
    console.log("3. Follow the setup guide for detailed instructions");
  }
}

// Main execution
async function main() {
  console.log(colorize("🔥 Firebase Configuration Validation", "bright"));
  console.log(colorize("=====================================", "bright"));

  const results = {
    backend: validateBackendConfig(),
    frontend: validateFrontendConfig(),
    structure: validateProjectStructure(),
    dependencies: validateDependencies(),
    firebaseFiles: validateFirebaseFiles(),
  };

  generateReport(results);

  // Exit with appropriate code
  process.exit(Object.values(results).every((result) => result) ? 0 : 1);
}

// Handle errors
process.on("unhandledRejection", (error) => {
  printError(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the validation
main().catch((error) => {
  printError(`Validation failed: ${error.message}`);
  process.exit(1);
});

