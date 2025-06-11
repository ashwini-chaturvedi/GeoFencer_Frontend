import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import google from "../../icons/google.svg";
import git from "../../icons/github.svg";
import { AlertCircle, X, Info, Shield } from "lucide-react";
import { faAt, faPhone, faLock, faUser, faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ServerWake from "../ServerWake/ServerWake";
import { useSelector } from "react-redux";

export default function Registration() {
    const [formData, setFormData] = useState({
        emailId: "",
        fullName: "",
        userName: "",
        phoneNo: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showServerBanner, setShowServerBanner] = useState(false);
    const [showTrialModal, setShowTrialModal] = useState(false);
    const [showOAuthModal, setShowOAuthModal] = useState(false); // New state for OAuth modal

    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { loading } = useSelector((state) => state.auth);

    const iconMap = {
        phone: faPhone,
        envelope: faEnvelope,
        user: faUser,
        at: faAt,
        lock: faLock
    };

    const fields = [
        { name: "emailId", label: "Email Address", type: "email", icon: "envelope" },
        { name: "fullName", label: "Full Name", type: "text", icon: "user" },
        { name: "userName", label: "Username", type: "text", icon: "at" },
        { name: "phoneNo", label: "Phone Number", type: "tel", icon: "phone" },
        { name: "password", label: showPassword ? "Password(Visible)" : "Password", type: showPassword ? "text" : "password", icon: "lock", isPassword: true }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (error) setError("");
    };

    // Helper function to parse and format error messages
    const formatErrorMessage = (errorData, defaultMessage) => {
        if (typeof errorData === 'string') {
            return errorData;
        }

        if (errorData && errorData.message) {
            return errorData.message;
        }

        if (errorData && errorData.error) {
            return errorData.error;
        }

        // Handle validation errors from backend
        if (errorData && errorData.errors) {
            if (Array.isArray(errorData.errors)) {
                return errorData.errors.join(', ');
            }
            if (typeof errorData.errors === 'object') {
                return Object.values(errorData.errors).flat().join(', ');
            }
        }

        return defaultMessage;
    };

    const adminAPI = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        setShowServerBanner(true);

        try {
            const response = await fetch(`${backendUrl}/admin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData),
                mode: "cors",
            });

            if (response.ok) {
                alert("Registration Successful!!!");
                navigate("/login");
            } else {
                let errorMessage = "Registration failed. Please try again.";

                try {
                    if (response.headers.get("content-type")?.includes("application/json")) {
                        const errorData = await response.json();

                        // Handle specific HTTP status codes
                        switch (response.status) {
                            case 400:
                                errorMessage = formatErrorMessage(errorData, "Invalid input data. Please check your information.");
                                break;
                            case 409:
                                errorMessage = formatErrorMessage(errorData, "User with this email already exists. Please use a different email or sign in.");
                                break;
                            case 422:
                                errorMessage = formatErrorMessage(errorData, "Please check your input data for validation errors.");
                                break;
                            case 500:
                                errorMessage = "Server error. Please try again later.";
                                break;
                            default:
                                errorMessage = formatErrorMessage(errorData, "Registration failed. Please try again.");
                        }
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || `HTTP ${response.status}: Registration failed`;
                    }
                } catch (parseError) {
                    console.error("Error parsing response:", parseError);
                    errorMessage = `HTTP ${response.status}: Registration failed`;
                }

                setError(errorMessage);
            }
        } catch (error) {
            console.error("Network error:", error);

            // Handle different types of network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setError("Unable to connect to server. Please check your internet connection and try again.");
            } else if (error.code === 'ECONNREFUSED') {
                setError("Server is not responding. Please try again later.");
            } else {
                setError(`Network error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
            setShowServerBanner(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.25,
                delayChildren: 0.5,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // Modal animation variants
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.2 }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    // Handle OAuth button clicks - show modal instead of redirecting
    const handleOAuthLogin = () => {
        setShowOAuthModal(true);
    };

    // Handle OAuth modal close
    const handleOAuthModalClose = () => {
        setShowOAuthModal(false);
    };

    // Handle trial access - navigate to login page
    const handleTrialAccess = () => {
        setShowTrialModal(false);
        navigate('/login');
    };

    // Handle go to login from OAuth modal
    const handleGoToLogin = () => {
        setShowOAuthModal(false);
        navigate('/login');
    };

    return (
        <>
            <ServerWake
                isLoading={loading || showServerBanner}
                onClose={() => setShowServerBanner(false)}
            />

            {/* OAuth Security Modal */}
            <AnimatePresence>
                {showOAuthModal && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={overlayVariants}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={handleOAuthModalClose}
                    >
                        <motion.div
                            variants={modalVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <Shield className="text-orange-500 mr-2" size={24} />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        OAuth Registration Locked
                                    </h3>
                                </div>
                                <button
                                    onClick={handleOAuthModalClose}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <p className="text-orange-800 dark:text-orange-200 font-medium">
                                        Due to Security Reasons, OAuth Registration has been Locked
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                                        For Trial Access, you can use our demo credentials available on the login page:
                                    </p>
                                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        <p><strong>Email:</strong> dummy123@gmail.com</p>
                                        <p><strong>Password:</strong> Dumb@123</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleOAuthModalClose}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg px-4 py-2 transition-all duration-200"
                                    >
                                        Continue Registration
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleGoToLogin}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-200"
                                    >
                                        Go to Login
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trial Modal */}
            <AnimatePresence>
                {showTrialModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowTrialModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowTrialModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-yellow-100 dark:from-blue-900 dark:to-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Need Trial Access?
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    If you&apos;re looking for trial credentials to test our platform, you can find the demo login ID and password on our login page.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowTrialModal(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Continue Registration
                                    </button>
                                    <button
                                        onClick={handleTrialAccess}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-lg hover:from-blue-600 hover:to-yellow-600 transition-all duration-200 font-medium"
                                    >
                                        Go to Login
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="min-h-screen flex items-center justify-center p-4 dark:from-gray-900 dark:to-gray-800 mt-24"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl dark:bg-gray-800"
                >
                    <div className="px-8 pt-8 pb-2 bg-gradient-to-r from-blue-400 to-yellow-200">
                        <motion.h1
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-extrabold text-center text-black dark:text-white mb-2"
                        >
                            Join Us Today
                        </motion.h1>
                        <motion.p
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-lg font-bold text-center text-black dark:text-gray-300 mb-6"
                        >
                            Create your account and get started
                        </motion.p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center mt-1">
                        Looking for trial access?{" "}
                        <span
                            className="font-medium text-green-600 hover:text-green-800 dark:text-green-400 hover:underline transition-colors duration-200 cursor-pointer hover:text-lg"
                            onClick={() => setShowTrialModal(true)}
                        >
                            Get Demo Credentials
                        </span>
                    </p>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start"
                        >
                            <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                            <span className="flex-1">{error}</span>
                        </motion.div>
                    )}



                    <motion.form
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="px-8 pb-8 space-y-6 mt-5"
                        onSubmit={adminAPI}
                    >
                        {fields.map((field) => (
                            <motion.div
                                key={field.name}
                                variants={itemVariants}
                            >
                                <label htmlFor={field.name} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                        <FontAwesomeIcon icon={iconMap[field.icon]} className="text-gray-400" />
                                    </div>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        id={field.name}
                                        className="pl-10 w-full p-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                                        placeholder={field.label}
                                        required
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                    />
                                    {field.isPassword && (
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center text-black bg-gradient-to-r from-blue-200 to-yellow-200 hover:from-yellow-200 hover:to-blue-200 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-lg px-5 py-3 transition-all duration-200 disabled:opacity-70"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Create Account"}
                        </motion.button>

                        <motion.div variants={itemVariants} className="relative flex items-center my-6">
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-gray-600 dark:text-gray-400 text-sm">or continue with</span>
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex justify-center gap-4">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center bg-gradient-to-r from-blue-200 to-yellow-200 hover:from-yellow-200 hover:to-blue-200 justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                                onClick={handleOAuthLogin}
                            >
                                <img className="h-8 mr-2" src={google} alt="Google" />
                                <span className="text-lg font-bold text-gray-700 dark:text-gray-200">Google</span>
                            </motion.button>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 bg-gradient-to-r from-blue-200 to-yellow-200 hover:from-yellow-200 hover:to-blue-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                                onClick={handleOAuthLogin}
                            >
                                <img className="h-8 mr-2" src={git} alt="GitHub" />
                                <span className="text-lg font-bold text-gray-700 dark:text-gray-200">GitHub</span>
                            </motion.button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 mt-6">
                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                Already have an account?{" "}
                                <span
                                    className="font-medium hover:text-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition-colors duration-200 cursor-pointer"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign in
                                </span>
                            </p>


                        </motion.div>
                    </motion.form>
                </motion.div>
            </motion.section>
        </>
    );
}