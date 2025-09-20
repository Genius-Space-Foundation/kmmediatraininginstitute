import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { initializeFirestore } from "../utils/initializeFirestore";
import { syncAuthUsers } from "../utils/syncAuthUsers";

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState("Testing Firebase connection...");
  const [collections, setCollections] = useState<string[]>([]);
  const [testData, setTestData] = useState<any[]>([]);
  const [userManagement, setUserManagement] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "admin",
    phone: "",
    specialization: "",
  });
  const [userManagementStatus, setUserManagementStatus] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    testFirebaseConnection();
    listCollections();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      // Test writing to Firestore
      const testRef = await addDoc(collection(db, "test"), {
        timestamp: new Date(),
        message: "Firebase connection successful",
        userId: user?.id || "anonymous",
      });

      setStatus("✅ Firebase connection successful");

      // Clean up test document
      await deleteDoc(doc(db, "test", testRef.id));
      console.log("✅ Test document cleaned up");
    } catch (error: any) {
      setStatus(`❌ Firebase connection failed: ${error.message}`);
      console.error("Firebase connection error:", error);
    }
  };

  const listCollections = async () => {
    try {
      // Get all documents from common collections to see what exists
      const commonCollections = [
        "users",
        "courses",
        "registrations",
        "payments",
        "assignments",
        "stories",
        "test",
      ];

      const existingCollections: string[] = [];
      const allTestData: any[] = [];

      for (const collectionName of commonCollections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          if (!snapshot.empty) {
            existingCollections.push(collectionName);
            const docs = snapshot.docs.map((doc) => ({
              id: doc.id,
              collection: collectionName,
              data: doc.data(),
            }));
            allTestData.push(...docs);
          }
        } catch (error) {
          console.log(`Collection ${collectionName} doesn't exist or is empty`);
        }
      }

      setCollections(existingCollections);
      setTestData(allTestData);
    } catch (error) {
      console.error("Error listing collections:", error);
    }
  };

  const createSampleData = async () => {
    try {
      // Create a sample user document
      if (user) {
        await addDoc(collection(db, "users"), {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Create a sample course document
      await addDoc(collection(db, "courses"), {
        title: "Sample Course",
        description: "This is a test course",
        instructor: "Test Instructor",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setStatus("✅ Sample data created successfully");
      listCollections(); // Refresh the list
    } catch (error: any) {
      setStatus(`❌ Failed to create sample data: ${error.message}`);
    }
  };

  const initializeCollections = async () => {
    try {
      setStatus("Initializing collections with sample data...");
      const result = await initializeFirestore.initializeCollections();

      if (result.success) {
        setStatus(`✅ ${result.message}`);
        listCollections(); // Refresh the list
      } else {
        setStatus(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setStatus(`❌ Failed to initialize collections: ${error.message}`);
    }
  };

  const createUser = async () => {
    try {
      // Validate required fields
      if (!userManagement.email || !userManagement.password) {
        setUserManagementStatus("❌ Email and password are required!");
        return;
      }

      if (!userManagement.firstName || !userManagement.lastName) {
        setUserManagementStatus("❌ First name and last name are required!");
        return;
      }

      setUserManagementStatus("Creating user...");

      const userData = {
        firstName: userManagement.firstName,
        lastName: userManagement.lastName,
        phone: userManagement.phone,
        specialization: userManagement.specialization,
        address: "",
        bio: "",
        experience: "",
      };

      let result;
      switch (userManagement.role) {
        case "admin":
          result = await syncAuthUsers.createAdminUser(
            userManagement.email,
            userManagement.password,
            userData
          );
          break;
        case "trainer":
          result = await syncAuthUsers.createTrainerUser(
            userManagement.email,
            userManagement.password,
            userData
          );
          break;
        case "user":
          result = await syncAuthUsers.createStudentUser(
            userManagement.email,
            userManagement.password,
            userData
          );
          break;
        default:
          result = { success: false, error: "Invalid role" };
      }

      if (result.success) {
        setUserManagementStatus(
          `✅ ${userManagement.role} user created successfully!`
        );
        // Reset form
        setUserManagement({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "admin",
          phone: "",
          specialization: "",
        });
        listCollections(); // Refresh collections
      } else {
        // Check if it's an "email already in use" error
        if (result.error.includes("email-already-in-use")) {
          setUserManagementStatus(
            `⚠️ User already exists in Firebase Auth but may be missing Firestore profile. Try "Sync Existing User" below.`
          );
        } else {
          setUserManagementStatus(`❌ Failed to create user: ${result.error}`);
        }
      }
    } catch (error: any) {
      setUserManagementStatus(`❌ Error creating user: ${error.message}`);
    }
  };

  const testUserLogin = async () => {
    try {
      // Validate required fields
      if (!userManagement.email || !userManagement.password) {
        setUserManagementStatus(
          "❌ Email and password are required for login test!"
        );
        return;
      }

      setUserManagementStatus("Testing login...");
      const result = await syncAuthUsers.testLogin(
        userManagement.email,
        userManagement.password
      );

      if (result.success) {
        setUserManagementStatus("✅ Login successful!");
      } else {
        setUserManagementStatus(`❌ Login failed: ${result.error}`);
      }
    } catch (error: any) {
      setUserManagementStatus(`❌ Login error: ${error.message}`);
    }
  };

  const checkUserInFirestore = async () => {
    try {
      // Validate required fields
      if (!userManagement.email) {
        setUserManagementStatus(
          "❌ Email is required to check user in Firestore!"
        );
        return;
      }

      setUserManagementStatus("Checking user in Firestore...");
      const userExists = await syncAuthUsers.userExistsInFirestore(
        userManagement.email
      );

      if (userExists) {
        const userData = await syncAuthUsers.getUserFromFirestore(
          userManagement.email
        );
        setUserManagementStatus(
          `✅ User found in Firestore: ${JSON.stringify(userData, null, 2)}`
        );
      } else {
        setUserManagementStatus("❌ User not found in Firestore");
      }
    } catch (error: any) {
      setUserManagementStatus(`❌ Error checking user: ${error.message}`);
    }
  };

  const syncExistingUser = async () => {
    try {
      // Validate required fields
      if (!userManagement.email || !userManagement.password) {
        setUserManagementStatus(
          "❌ Email and password are required to sync existing user!"
        );
        return;
      }

      if (!userManagement.firstName || !userManagement.lastName) {
        setUserManagementStatus("❌ First name and last name are required!");
        return;
      }

      setUserManagementStatus("Syncing existing user...");

      const userData = {
        firstName: userManagement.firstName,
        lastName: userManagement.lastName,
        phone: userManagement.phone,
        specialization: userManagement.specialization,
        address: "",
        bio: "",
        experience: "",
      };

      const result = await syncAuthUsers.handleExistingUser(
        userManagement.email,
        userManagement.password,
        {
          ...userData,
          role: userManagement.role,
        }
      );

      if (result.success) {
        setUserManagementStatus(`✅ ${result.message}`);
        listCollections(); // Refresh collections
      } else {
        setUserManagementStatus(`❌ Failed to sync user: ${result.error}`);
      }
    } catch (error: any) {
      setUserManagementStatus(`❌ Error syncing user: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase Database Test</h2>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="font-semibold">Connection Status:</p>
        <p
          className={status.includes("✅") ? "text-green-600" : "text-red-600"}
        >
          {status}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Existing Collections</h3>
          {collections.length > 0 ? (
            <ul className="space-y-1">
              {collections.map((collectionName) => (
                <li key={collectionName} className="text-green-600">
                  ✅ {collectionName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No collections found</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={initializeCollections}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              🚀 Initialize All Collections
            </button>
            <button
              onClick={createSampleData}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Sample Data
            </button>
            <button
              onClick={listCollections}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Refresh Collections
            </button>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">👤 User Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            <span className="text-red-500">*</span> Required fields. Fill in all
            required fields before creating or testing users.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={userManagement.email}
                onChange={(e) =>
                  setUserManagement({
                    ...userManagement,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={userManagement.password}
                onChange={(e) =>
                  setUserManagement({
                    ...userManagement,
                    password: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userManagement.firstName}
                onChange={(e) =>
                  setUserManagement({
                    ...userManagement,
                    firstName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userManagement.lastName}
                onChange={(e) =>
                  setUserManagement({
                    ...userManagement,
                    lastName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={userManagement.role}
                onChange={(e) =>
                  setUserManagement({ ...userManagement, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="trainer">Trainer</option>
                <option value="user">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={userManagement.phone}
                onChange={(e) =>
                  setUserManagement({
                    ...userManagement,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
              />
            </div>

            {userManagement.role === "trainer" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={userManagement.specialization}
                  onChange={(e) =>
                    setUserManagement({
                      ...userManagement,
                      specialization: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Web Development, Data Science, etc."
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={createUser}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              ➕ Create{" "}
              {userManagement.role.charAt(0).toUpperCase() +
                userManagement.role.slice(1)}{" "}
              User
            </button>
            <button
              onClick={syncExistingUser}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              🔄 Sync Existing User
            </button>
            <button
              onClick={testUserLogin}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔐 Test Login
            </button>
            <button
              onClick={checkUserInFirestore}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              🔍 Check User in Firestore
            </button>
          </div>

          {userManagementStatus && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {userManagementStatus}
              </p>
            </div>
          )}
        </div>
      </div>

      {testData.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Sample Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Collection</th>
                  <th className="px-4 py-2 text-left">Document ID</th>
                  <th className="px-4 py-2 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {testData.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{item.collection}</td>
                    <td className="px-4 py-2 font-mono text-sm">{item.id}</td>
                    <td className="px-4 py-2">
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-w-xs">
                        {JSON.stringify(item.data, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting Tips</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>No collections showing?</strong> Click "🚀 Initialize All
            Collections" to create the expected collections with sample data
          </li>
          <li>
            <strong>Can't log in?</strong> Use the User Management section to
            create users with both Firebase Auth and Firestore profiles
          </li>
          <li>
            <strong>User exists in Auth but not Firestore?</strong> Use "🔄 Sync
            Existing User" to create the missing Firestore profile
          </li>
          <li>
            <strong>Getting "email-already-in-use" error?</strong> Your user
            exists in Firebase Auth but needs a Firestore profile - use "🔄 Sync
            Existing User"
          </li>
          <li>Make sure your Firebase project has Firestore enabled</li>
          <li>
            Check that your Firestore security rules allow read/write access
          </li>
          <li>Verify your Firebase configuration in the .env file</li>
          <li>Check the browser console for any error messages</li>
          <li>Ensure you're logged in to see user-specific data</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseTest;
