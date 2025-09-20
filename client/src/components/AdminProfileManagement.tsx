import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  X,
  Edit,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
} from "lucide-react";

interface AdminProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminProfileManagement: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editData, setEditData] = useState<UpdateProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    bio: "",
    profileImage: "",
  });
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/profile");
      setProfile(response.data.profile);
      setEditData({
        firstName: response.data.profile.firstName,
        lastName: response.data.profile.lastName,
        phone: response.data.profile.phone || "",
        address: response.data.profile.address || "",
        bio: response.data.profile.bio || "",
        profileImage: response.data.profile.profileImage || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setEditData({ ...editData, profileImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put("/admin/profile", editData);
      toast.success("Profile updated successfully");
      setShowEditModal(false);
      setPreviewImage(null);

      // Update the user context with new data
      if (updateUser) {
        updateUser({
          ...user,
          firstName: editData.firstName,
          lastName: editData.lastName,
          profileImage: editData.profileImage,
        });
      }

      fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      setSaving(true);
      await api.put("/admin/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    setEditData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      bio: profile?.bio || "",
      profileImage: profile?.profileImage || "",
    });
    setPreviewImage(profile?.profileImage || null);
    setShowEditModal(true);
  };

  const removeProfilePicture = () => {
    setEditData({ ...editData, profileImage: "" });
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Profile Management
          </h3>
          <p className="text-gray-600">
            Manage your admin profile and settings
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Shield className="h-4 w-4 mr-2" />
            Change Password
          </button>
          <button
            onClick={openEditModal}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-white" />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-2xl font-bold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h4>
              <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {profile?.role}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-3" />
                <span>{profile?.email}</span>
              </div>

              {profile?.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>{profile.phone}</span>
                </div>
              )}

              {profile?.address && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{profile.address}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3" />
                <span>
                  Joined{" "}
                  {new Date(profile?.createdAt || "").toLocaleDateString()}
                </span>
              </div>
            </div>

            {profile?.bio && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Bio</h5>
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Account Status
              </p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Last Login
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.lastLogin
                  ? new Date(profile.lastLogin).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Admin Level
              </p>
              <p className="text-lg font-semibold text-gray-900">Super Admin</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center mx-auto">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-picture"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                </div>
                {previewImage && (
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Picture
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.firstName}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.lastName}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) =>
                    setEditData({ ...editData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileManagement;
