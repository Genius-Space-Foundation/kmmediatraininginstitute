import React, { useState } from "react";

interface EnquiryFormProps {
  onSuccess?: () => void;
}

const EnquiryForm: React.FC<EnquiryFormProps> = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      return "Valid email is required.";
    if (!form.message.trim()) return "Message is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send enquiry.");
      }
      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-2xl p-8 max-w-xl mx-auto border border-gray-100"
    >
      <h3 className="text-3xl font-extrabold text-primary mb-2 text-center flex items-center justify-center gap-2">
        <svg
          className="w-7 h-7 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5" />
          <path d="M16 19h6" />
          <path d="M19 16v6" />
        </svg>
        Enquire Now
      </h3>
      <p className="text-gray-600 text-center mb-6">
        Have a question or need more info? Fill out the form below and our team
        will get back to you.
      </p>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-sm text-center">
          Thank you for your enquiry! We'll be in touch soon.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
              <path d="M12 14a7 7 0 0 0-7 7v1h14v-1a7 7 0 0 0-7-7Z" />
            </svg>
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input"
            placeholder="Your Name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M22 6.5V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.5" />
              <path d="m22 6.5-10 7-10-7" />
            </svg>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input"
            placeholder="you@email.com"
            required
          />
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
            <path d="m3 19 3-3 3 3 3-3 3 3 3-3 3 3" />
          </svg>
          Message *
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          className="input min-h-[100px] resize-y"
          placeholder="How can we help you?"
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full mt-8 text-lg font-semibold"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
};

export default EnquiryForm;
