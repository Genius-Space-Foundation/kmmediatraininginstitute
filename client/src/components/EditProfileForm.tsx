import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { User as UserIcon, Mail, Phone, MapPin, Save } from "lucide-react";

interface EditProfileFormProps {
    initialData: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: string;
    };
    onSuccess: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ initialData, onSuccess }) => {
    const [form, setForm] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put("/auth/profile", form);
            toast.success("Profile updated successfully!");
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input"
                        type="email"
                        required
                        disabled
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                        name="phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                        className="input"
                        type="tel"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                        name="address"
                        value={form.address || ""}
                        onChange={handleChange}
                        className="input"
                        type="text"
                    />
                </div>
            </div>
            <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
                disabled={loading}
            >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
};

export default EditProfileForm;
