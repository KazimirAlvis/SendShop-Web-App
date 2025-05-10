import { useState } from "react";
import Tabs from "@/components/Tabs";
import { getAuth, updatePassword } from "firebase/auth";

export default function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match." });
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return setMessage({ type: "error", text: "You must be logged in." });
    }

    try {
      setLoading(true);
      await updatePassword(user, newPassword);
      setMessage({ type: "success", text: "Password updated successfully ✅" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password update error:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to update password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Change Password</h1>
      <Tabs />

      <form onSubmit={handleChangePassword} className="mt-6 space-y-4 bg-white border p-6 rounded shadow">
        {/* Password fields */}
        <div>
          <label className="block font-medium mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {message && (
          <div className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {message.text}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
