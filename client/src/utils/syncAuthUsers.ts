/**
 * Firebase Auth to Firestore User Sync Utility
 * Helps sync Firebase Auth users with Firestore user profiles
 */

import { auth, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

export const syncAuthUsers = {
  /**
   * Create a Firestore user profile from Firebase Auth user
   */
  async createUserProfile(
    firebaseUser: FirebaseUser,
    additionalData: any = {}
  ) {
    try {
      const userRef = await addDoc(collection(db, "users"), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName:
          additionalData.firstName ||
          firebaseUser.displayName?.split(" ")[0] ||
          "",
        lastName:
          additionalData.lastName ||
          firebaseUser.displayName?.split(" ").slice(1).join(" ") ||
          "",
        fullName: firebaseUser.displayName || "",
        displayName: firebaseUser.displayName || "",
        role: additionalData.role || "user",
        phone: additionalData.phone || "",
        address: additionalData.address || "",
        specialization: additionalData.specialization || "",
        bio: additionalData.bio || "",
        experience: additionalData.experience || "",
        profileImage: additionalData.profileImage || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(
        `✅ Created Firestore profile for user: ${firebaseUser.email}`
      );
      return { success: true, docId: userRef.id };
    } catch (error: any) {
      console.error(`❌ Failed to create Firestore profile: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if user exists in Firestore
   */
  async userExistsInFirestore(email: string) {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  },

  /**
   * Get user from Firestore by email
   */
  async getUserFromFirestore(email: string) {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user from Firestore:", error);
      return null;
    }
  },

  /**
   * Create admin user with both Firebase Auth and Firestore profile
   */
  async createAdminUser(email: string, password: string, userData: any = {}) {
    try {
      console.log("Creating admin user...");

      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Update Firebase Auth profile with display name
      await updateFirebaseProfile(user, {
        displayName:
          userData.fullName ||
          `${userData.firstName} ${userData.lastName}` ||
          "Admin User",
      });

      // 3. Create Firestore profile
      const profileResult = await this.createUserProfile(user, {
        ...userData,
        role: "admin",
      });

      if (profileResult.success) {
        console.log("✅ Admin user created successfully!");
        return { success: true, user, profileId: profileResult.docId };
      } else {
        console.log("❌ Failed to create Firestore profile");
        return { success: false, error: profileResult.error };
      }
    } catch (error: any) {
      console.error(`❌ Failed to create admin user: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create trainer user with both Firebase Auth and Firestore profile
   */
  async createTrainerUser(email: string, password: string, userData: any = {}) {
    try {
      console.log("Creating trainer user...");

      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Update Firebase Auth profile
      await updateFirebaseProfile(user, {
        displayName:
          userData.fullName ||
          `${userData.firstName} ${userData.lastName}` ||
          "Trainer",
      });

      // 3. Create Firestore profile
      const profileResult = await this.createUserProfile(user, {
        ...userData,
        role: "trainer",
      });

      if (profileResult.success) {
        console.log("✅ Trainer user created successfully!");
        return { success: true, user, profileId: profileResult.docId };
      } else {
        return { success: false, error: profileResult.error };
      }
    } catch (error: any) {
      console.error(`❌ Failed to create trainer user: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create student user with both Firebase Auth and Firestore profile
   */
  async createStudentUser(email: string, password: string, userData: any = {}) {
    try {
      console.log("Creating student user...");

      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Update Firebase Auth profile
      await updateFirebaseProfile(user, {
        displayName:
          userData.fullName ||
          `${userData.firstName} ${userData.lastName}` ||
          "Student",
      });

      // 3. Create Firestore profile
      const profileResult = await this.createUserProfile(user, {
        ...userData,
        role: "user",
      });

      if (profileResult.success) {
        console.log("✅ Student user created successfully!");
        return { success: true, user, profileId: profileResult.docId };
      } else {
        return { success: false, error: profileResult.error };
      }
    } catch (error: any) {
      console.error(`❌ Failed to create student user: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sync existing Firebase Auth user to Firestore
   */
  async syncExistingAuthUser(email: string, userData: any = {}) {
    try {
      console.log(`Syncing existing Auth user: ${email}`);

      // Check if user already exists in Firestore
      const exists = await this.userExistsInFirestore(email);
      if (exists) {
        console.log("User already exists in Firestore");
        return { success: true, message: "User already exists in Firestore" };
      }

      // Get the Firebase Auth user (you'll need to be signed in as this user)
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === email) {
        const profileResult = await this.createUserProfile(
          currentUser,
          userData
        );
        return profileResult;
      } else {
        return {
          success: false,
          error: "User not signed in. Please sign in first, then sync.",
        };
      }
    } catch (error: any) {
      console.error(`❌ Failed to sync user: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test login with credentials
   */
  async testLogin(email: string, password: string) {
    try {
      console.log(`Testing login for: ${email}`);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("✅ Login successful!");
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error(`❌ Login failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Handle existing user - create Firestore profile if user exists in Auth but not Firestore
   */
  async handleExistingUser(
    email: string,
    password: string,
    userData: any = {}
  ) {
    try {
      console.log(`Handling existing user: ${email}`);

      // First, try to sign in to get the user
      const loginResult = await this.testLogin(email, password);
      if (!loginResult.success) {
        return { success: false, error: `Login failed: ${loginResult.error}` };
      }

      const firebaseUser = loginResult.user;

      if (!firebaseUser) {
        return {
          success: false,
          error: "Failed to get Firebase user after login",
        };
      }

      // Check if user exists in Firestore
      const existsInFirestore = await this.userExistsInFirestore(email);

      if (existsInFirestore) {
        console.log("✅ User already exists in both Auth and Firestore");
        return {
          success: true,
          message: "User already exists in both systems",
        };
      } else {
        console.log("Creating Firestore profile for existing Auth user...");
        const profileResult = await this.createUserProfile(firebaseUser, {
          ...userData,
          role: userData.role || "admin",
        });

        if (profileResult.success) {
          console.log("✅ Firestore profile created for existing Auth user!");
          return {
            success: true,
            message: "Firestore profile created successfully",
          };
        } else {
          return { success: false, error: profileResult.error };
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to handle existing user: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
};

export default syncAuthUsers;
