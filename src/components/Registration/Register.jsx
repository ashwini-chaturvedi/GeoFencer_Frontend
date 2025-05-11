import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import google from "../../icons/google.svg";
import git from "../../icons/github.svg";
import { AlertCircle } from "lucide-react";
import { faAt, faPhone, faLock, faUser, faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Registration() {
    //Structure of the Data that will be send to backend and the data from the form will be inserted here 
    const [formData, setFormData] = useState({
        emailId: "",
        fullName: "",
        userName: "",
        phoneNo: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    //This is used to store the type of icons we have to use in the form
    const iconMap = {
        phone: faPhone,
        envelope: faEnvelope,
        user: faUser,
        at: faAt,
        lock: faLock
    };

    // Field configuration to make the form more maintainable
    const fields = [
        { name: "emailId", label: "Email Address", type: "email", icon: "envelope" },
        { name: "fullName", label: "Full Name", type: "text", icon: "user" },
        { name: "userName", label: "Username", type: "text", icon: "at" },
        { name: "phoneNo", label: "Phone Number", type: "tel", icon: "phone" },
        { name: "password",label:showPassword ? "Password(Visible)" : "Password", type: showPassword ? "text" : "password", icon: "lock", isPassword: true }
    ];

    const [error, setError] = useState("");//Maintaining the State of Error

    const [isLoading, setIsLoading] = useState(false);//to Maintain the state of loading after submitting

    const navigate = useNavigate();//React Router method/hook to navigate to another page

    const backendUrl = import.meta.env.VITE_BACKEND_URL;//BACKEND URL

    //This Method will trigger whenever there is change in any input on registration form
    const handleChange = (e) => {
        //this will dynamically insert the data to the required field in the form data JSON
        setFormData({ ...formData, [e.target.name]: e.target.value });//🔔 Important:"[e.target.name]:e.target.value"
    };

    //When the Registration Form is Submitted gets invoked which deals with the backend API
    //As it handles backend API it is using 'async-await'
    const adminAPI = async (e) => {
        e.preventDefault();
        setError("");//No Error
        setIsLoading(true);//When the registration form is submitted the state of loading becomes true...

        try {
            //Fetch API to send the data of the form to Backend
            const response = await fetch(`${backendUrl}/admin`, {
                method: "POST",//HTTP method POST
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData),
                mode: "cors",
            });

            if (response.ok) {//if Registration is Succesfull navigate to login page
                alert("Registration Successful!!!")
                navigate("/login");
            } else {
                if (response.headers.get("content-type")?.includes("application/json")) {
                    const errorData = await response.json();
                    setError(errorData.message || "Registration failed");
                } else {
                    const errorText = await response.text();
                    setError(errorText || `Error: ${response.status} ${response.statusText}`);
                }
            }
        } catch (error) {
            setError(`Network error: ${error.message}`);
        } finally {
            setIsLoading(false);
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

    //OAuth2 Methods for Google and Github
    const googleLogin = () => {
        window.location.href = `https://localhost:8443/oauth2/authorization/google`;
    }

    const githubLogin = () => {
        window.location.href = `https://localhost:8443/oauth2/authorization/github`;
    }
    
    return (
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

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center"
                    >
                        <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                        <span>{error}</span>
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

                    {/*--------or continue with--------- */}
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
                            onClick={googleLogin}
                        >
                            <img className="h-8 mr-2" src={google} alt="Google" />
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-200">Google</span>
                        </motion.button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.08}}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 bg-gradient-to-r from-blue-200 to-yellow-200 hover:from-yellow-200 hover:to-blue-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                            onClick={githubLogin}
                        >
                            <img className="h-8 mr-2" src={git} alt="GitHub" />
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-200">GitHub</span>
                        </motion.button>
                    </motion.div>

                    <motion.p variants={itemVariants} className="text-sm text-gray-500 dark:text-gray-300 text-center mt-6">
                        Already have an account?{" "}
                        <span 
                            className="font-medium hover:text-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition-colors duration-200 cursor-pointer" 
                            onClick={() => navigate('/login')}
                        >
                            Sign in
                        </span>
                    </motion.p>
                </motion.form>
            </motion.div>
        </motion.section>
    );
}