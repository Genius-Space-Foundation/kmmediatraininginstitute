import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { UserService, User } from "../services/userService";

// Use the User interface from userService

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!firebaseUser;

  // Role-based access control
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        try {
          // Get user data from Firestore
          let userData = await UserService.getUserByEmail(firebaseUser.email!);

          if (!userData) {
            // If user doesn't exist in Firestore, create a basic profile
            console.log(
              "User exists in Firebase Auth but not in Firestore. Creating user profile..."
            );

            // Create a basic user profile in Firestore
            const userCreateData: any = {
              email: firebaseUser.email!,
              password: "", // Password is handled by Firebase Auth
              firstName: firebaseUser.displayName?.split(" ")[0] || "User",
              lastName:
                firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
            };

            // Only add phone if it exists (Firestore doesn't allow undefined values)
            if (firebaseUser.phoneNumber) {
              userCreateData.phone = firebaseUser.phoneNumber;
            }

            userData = await UserService.createUser(userCreateData);

            console.log("User profile created successfully:", userData);
          }

          setUser(userData);
        } catch (error) {
          console.error("Error fetching/creating user data:", error);
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      let userData = await UserService.getUserByEmail(firebaseUser.email!);

      if (!userData) {
        // If user doesn't exist in Firestore, create a basic profile
        console.log(
          "User exists in Firebase Auth but not in Firestore. Creating user profile..."
        );

        // Create a basic user profile in Firestore
        const userCreateData: any = {
          email: firebaseUser.email!,
          password: "", // Password is handled by Firebase Auth
          firstName: firebaseUser.displayName?.split(" ")[0] || "User",
          lastName:
            firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
        };

        // Only add phone if it exists (Firestore doesn't allow undefined values)
        if (firebaseUser.phoneNumber) {
          userCreateData.phone = firebaseUser.phoneNumber;
        }

        userData = await UserService.createUser(userCreateData);

        console.log("User profile created successfully:", userData);
      }

      return userData;
    } catch (error: any) {
      let message = "Login failed. Please check your credentials.";

      if (error.code === "auth/user-not-found") {
        message = "No account found with this email address.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      }

      throw new Error(message);
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const firebaseUser = userCredential.user;

      // Update Firebase profile with display name
      await updateFirebaseProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Create user profile in Firestore
      const newUser = await UserService.createUser({
        email: userData.email,
        password: userData.password, // This won't be stored in Firestore
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
      });

      return newUser;
    } catch (error: any) {
      let message = "Registration failed. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        message = "An account with this email already exists.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }

      throw new Error(message);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);

      // Clear any cached data
      sessionStorage.clear();
    } catch (error) {
      console.error("Error signing out:", error);
      throw new Error("Failed to sign out. Please try again.");
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Update user in Firestore
      await UserService.updateUser(user.id, userData);

      // Update local user state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // Update Firebase profile if display name changed
      if (userData.firstName || userData.lastName) {
        const displayName = `${userData.firstName || user.firstName} ${
          userData.lastName || user.lastName
        }`;
        await updateFirebaseProfile(firebaseUser!, { displayName });
      }
    } catch (error: any) {
      const message =
        error.message || "Profile update failed. Please try again.";
      throw new Error(message);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      if (!firebaseUser?.email) {
        throw new Error("No authenticated user");
      }

      const userData = await UserService.getUserByEmail(firebaseUser.email);

      if (userData) {
        setUser(userData);
      } else {
        throw new Error("User profile not found");
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      await logout();
      throw new Error("Failed to refresh user profile.");
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated,
    hasRole,
    login,
    logout,
    register,
    refreshUser,
    updateProfile,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
