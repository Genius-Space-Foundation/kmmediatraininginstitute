#!/usr/bin/env node

/**
 * Firebase Credentials Helper Script
 * Helps users get Firebase credentials and configure environment variables
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

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

function printStep(text) {
  console.log(colorize(`\n📋 ${text}`, "magenta"));
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(colorize(`\n${question}`, "yellow"), resolve);
  });
}

function askYesNo(question) {
  return new Promise((resolve) => {
    rl.question(colorize(`\n${question} (y/n): `, "yellow"), (answer) => {
      resolve(answer.toLowerCase().startsWith("y"));
    });
  });
}

async function getBackendCredentials() {
  printHeader("Backend Firebase Credentials Setup");

  console.log(colorize("\n🔧 Backend Setup Instructions:", "bright"));
  console.log(
    "1. Go to Google Cloud Console: https://console.cloud.google.com/"
  );
  console.log("2. Select your Firebase project");
  console.log('3. Go to "IAM & Admin" > "Service Accounts"');
  console.log("4. Create a new service account or use existing one");
  console.log('5. Grant "Firebase Admin SDK Administrator Service Agent" role');
  console.log("6. Generate a JSON key file");
  console.log("7. Download and save the JSON file securely");

  const hasServiceAccount = await askYesNo(
    "Do you have a Firebase service account JSON key file?"
  );

  if (!hasServiceAccount) {
    printWarning(
      "Please create a service account first. See instructions above."
    );
    return null;
  }

  const projectId = await askQuestion("Enter your Firebase Project ID: ");
  const clientEmail = await askQuestion(
    "Enter the Client Email from your service account: "
  );
  const privateKeyId = await askQuestion("Enter the Private Key ID: ");
  const privateKey = await askQuestion(
    "Enter the Private Key (with BEGIN/END markers): "
  );
  const clientId = await askQuestion("Enter the Client ID: ");
  const databaseUrl = await askQuestion(
    "Enter the Database URL (https://your-project-id.firebaseio.com): "
  );

  return {
    projectId,
    clientEmail,
    privateKeyId,
    privateKey,
    clientId,
    databaseUrl,
  };
}

async function getFrontendCredentials() {
  printHeader("Frontend Firebase Credentials Setup");

  console.log(colorize("\n🌐 Frontend Setup Instructions:", "bright"));
  console.log(
    "1. Go to Firebase Console: https://console.firebase.google.com/"
  );
  console.log("2. Select your project");
  console.log("3. Go to Project Settings (gear icon)");
  console.log('4. Scroll to "Your apps" section');
  console.log('5. Click "Add app" > Web app');
  console.log("6. Register your app and copy the config");

  const hasWebApp = await askYesNo(
    "Do you have a Firebase Web app configured?"
  );

  if (!hasWebApp) {
    printWarning("Please configure a Web app first. See instructions above.");
    return null;
  }

  const apiKey = await askQuestion("Enter your Firebase API Key: ");
  const authDomain = await askQuestion(
    "Enter your Auth Domain (your-project-id.firebaseapp.com): "
  );
  const projectId = await askQuestion("Enter your Project ID: ");
  const storageBucket = await askQuestion(
    "Enter your Storage Bucket (your-project-id.appspot.com): "
  );
  const messagingSenderId = await askQuestion(
    "Enter your Messaging Sender ID: "
  );
  const appId = await askQuestion("Enter your App ID: ");
  const measurementId = await askQuestion(
    "Enter your Measurement ID (optional, leave empty if not available): "
  );

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };
}

function createBackendEnv(credentials) {
  if (!credentials) return false;

  const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kmmedia
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Firebase Configuration
FIREBASE_PROJECT_ID=${credentials.projectId}
FIREBASE_CLIENT_EMAIL=${credentials.clientEmail}
FIREBASE_PRIVATE_KEY="${credentials.privateKey}"
FIREBASE_PRIVATE_KEY_ID=${credentials.privateKeyId}
FIREBASE_CLIENT_ID=${credentials.clientId}
FIREBASE_DATABASE_URL=${credentials.databaseUrl}
FIREBASE_STORAGE_BUCKET=${credentials.projectId}.appspot.com

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  const envPath = path.join(__dirname, "..", "server", ".env");
  fs.writeFileSync(envPath, envContent);
  return true;
}

function createFrontendEnv(credentials) {
  if (!credentials) return false;

  const envContent = `# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=${credentials.apiKey}
REACT_APP_FIREBASE_AUTH_DOMAIN=${credentials.authDomain}
REACT_APP_FIREBASE_PROJECT_ID=${credentials.projectId}
REACT_APP_FIREBASE_STORAGE_BUCKET=${credentials.storageBucket}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${credentials.messagingSenderId}
REACT_APP_FIREBASE_APP_ID=${credentials.appId}
${
  credentials.measurementId
    ? `REACT_APP_FIREBASE_MEASUREMENT_ID=${credentials.measurementId}`
    : ""
}

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Development Configuration
REACT_APP_ENV=development
REACT_APP_DEBUG=true
`;

  const envPath = path.join(__dirname, "..", "client", ".env");
  fs.writeFileSync(envPath, envContent);
  return true;
}

async function main() {
  console.log(colorize("🔥 Firebase Credentials Setup Helper", "bright"));
  console.log(colorize("=====================================", "bright"));

  printStep(
    "This script will help you configure Firebase credentials for your KM Media application."
  );

  const setupBackend = await askYesNo(
    "Do you want to set up backend credentials?"
  );
  const setupFrontend = await askYesNo(
    "Do you want to set up frontend credentials?"
  );

  let backendCredentials = null;
  let frontendCredentials = null;

  if (setupBackend) {
    backendCredentials = await getBackendCredentials();
    if (backendCredentials) {
      const created = createBackendEnv(backendCredentials);
      if (created) {
        printSuccess("Backend .env file created successfully!");
      } else {
        printError("Failed to create backend .env file");
      }
    }
  }

  if (setupFrontend) {
    frontendCredentials = await getFrontendCredentials();
    if (frontendCredentials) {
      const created = createFrontendEnv(frontendCredentials);
      if (created) {
        printSuccess("Frontend .env file created successfully!");
      } else {
        printError("Failed to create frontend .env file");
      }
    }
  }

  printHeader("Setup Complete");

  if (backendCredentials || frontendCredentials) {
    printSuccess("Environment files have been created!");
    printInfo("Next steps:");
    console.log("1. Verify your environment files contain the correct values");
    console.log("2. Run: node scripts/validate-firebase-config.js");
    console.log(
      "3. Test connection: cd server && node test-firebase-connection.js"
    );
    console.log("4. Run the migration scripts");
  } else {
    printWarning("No credentials were configured.");
    printInfo(
      "You can run this script again anytime to set up your credentials."
    );
  }

  console.log(
    colorize(
      "\n📚 For detailed instructions, see FIREBASE_SETUP_GUIDE.md",
      "blue"
    )
  );

  rl.close();
}

// Handle errors
process.on("unhandledRejection", (error) => {
  printError(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});

// Run the setup
main().catch((error) => {
  printError(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});

