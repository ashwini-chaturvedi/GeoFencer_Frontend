import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [jwtToken, setJwtToken] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalError, setModalError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/forgot-password/${email}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log("sending OTP Response:", response)

            if (response.ok) {
                setEmailVerified(true);
                setShowOtpModal(true);
                setSuccess("OTP has been sent to your email address.");
            } else {
                setError("Email not found. Please check and try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setModalError("");

        if (!otp) {
            setModalError("OTP is required");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${backendUrl}/forgot-password/verify/${email}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(`${otp}`)
            });


            if (response.ok) {
                console.log("Verifying OTP Response:", response)
                const data = await response.text();
                console.log("Data:", data)

                setJwtToken(data);
                setOtpVerified(true);
                setShowOtpModal(false);
                setSuccess("OTP verified! Please set your new password.");
            } else {
                setModalError("Invalid OTP. Please check and try again.");
            }
        } catch (err) {
            setModalError("An error occurred. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newPassword || !confirmPassword) {
            setError("Both password fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/admin/updatePassword/${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${jwtToken}`
                },
                body: JSON.stringify(`${newPassword}`)
            });

            console.log("Update Password:", response)
            console.log(" Password:", newPassword)

            if (!response.ok) {
                setError("Error Occured")
                navigate('/forgotPassword')
            }

            setSuccess("Password has been reset successfully!");
            setNewPassword("");
            setConfirmPassword("");
            navigate('/login')
        } catch (err) {
            setError("An error occurred while resetting password. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-4 space-y-8 bg-white rounded-lg shadow-md">
                <div className="w-full bg-gradient-to-r from-blue-400 to-yellow-200 rounded-full p-2">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
                        <p className="mt-2 text-sm text-black">
                            {!emailVerified || !otpVerified
                                ? "Enter your email to receive a verification code"
                                : "Create your new password"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md">
                        {success}
                    </div>
                )}

                {!emailVerified || !otpVerified ? (
                    <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex justify-center w-full px-4 py-2 text-lg font-bold text-black bg-indigo-600 border border-transparent rounded-md shadow-sm bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loading ? "Processing..." : "Send OTP"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    required
                                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loading ? "Processing..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center mt-4">
                    <a
                        href="/login"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                    >
                        Back to login
                    </a>
                </div>
            </div>

            {showOtpModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Enter OTP</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please enter the one-time password sent to your email.
                        </p>

                        {modalError && (
                            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleOtpSubmit}>
                            <div className="mb-4">
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                    OTP Code
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter OTP"
                                    required
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowOtpModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}