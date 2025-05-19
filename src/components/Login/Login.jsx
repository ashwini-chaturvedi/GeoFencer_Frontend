import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import google from "../../icons/google.svg";
import git from "../../icons/github.svg";
import { AlertCircle, X } from "lucide-react";
import { faLock, faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { loginUser } from "../../Thunks/authThunk";
import { logout } from '../../Features/Slices/authSlice';


export default function Login() {
    const [showPassword, setShowPassword] = useState(false);//State is maintained to toggle the option to show Password

    const navigate = useNavigate();//React router for navigating to another page

    const [oauthLoading, setOauthLoading] = useState({ google: false, github: false }); // Track OAuth loading state

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    
    //Redux Hooks
    const dispatch = useDispatch()
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth)

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    //When login form is submitted this method gets invoked which deals with the backend API
    //As it handles backend API it is using 'async-await'
    const loginAPI = async (e) => {
        e.preventDefault();


        const emailValue = e.target.email.value;//Extract the value of email from the form that is submitted.
        const password = e.target.password.value;

        try {
            const response = await dispatch(loginUser(emailValue, password))//using Redux to get the authentication

            
            // The thunk should return an object with success status
            if ( response.success) {
                navigate(`/profile`);
            }else{
                console.log(response)
            }
        } catch (error) {
              // This is only for errors that might occur when dispatching the thunk itself
              console.error("Error dispatching login thunk:", error);
        }
    }

    // Animation variants
    const containerVariants = {//This is for container variation animation
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.25,
                delayChildren: 0.5,
            }
        }
    };

    const itemVariants = {//this is for item variation animation
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
   
   // OAuth2 Methods using backend endpoints
   const handleOAuthLogin = async (provider) => {
    // Set loading state for the specific provider
    setOauthLoading(prev => ({ ...prev, [provider]: true }));
    
    try {
        // Instead of directly redirecting, we'll now fetch from our backend endpoint
        // The backend will handle the redirect to the OAuth provider
        
        // We use window.location.assign instead of window.location.href for better control
        window.location.assign(`${backendUrl}/admin/oauth2/${provider}`);
        
        // Note: We won't reach the code below until we return from the OAuth flow
        
    } catch (error) {
        console.log("Error in Oauth2",error)
        setOauthLoading(prev => ({ ...prev, [provider]: false }));
    }
};

    return (
        <>
            {/* Logout Modal for authenticated users */}
            <AnimatePresence>
                {isAuthenticated && (
                    <>
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={overlayVariants}
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
                        >
                            <motion.div 
                                variants={modalVariants}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-96 max-w-md"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        You&apos;re Already Logged In
                                    </h3>
                                    <button 
                                        onClick={() => navigate('/dashboard')}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    You are currently logged in. Would you like to log out of your account?
                                </p>
                                
                                <div className="flex flex-col gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="w-full flex justify-center items-center text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-lg px-5 py-3 transition-all duration-200"
                                    >
                                        <FaSignOutAlt className="mr-2" />
                                        Logout
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/profile')}
                                        className="w-full flex justify-center items-center text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium rounded-lg text-lg px-5 py-3 transition-all duration-200"
                                    >
                                        Go to Profile
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>



            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="min-h-screen flex items-center justify-center p-4 dark:from-gray-900 dark:to-gray-800 mt-20">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md overflow-hidden  bg-white rounded-2xl shadow-2xl dark:bg-gray-800">
                    <div className="px-8 pt-8 pb-2 bg-gradient-to-r from-blue-400 to-yellow-200">
                        <motion.h1
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl font-extrabold text-center text-black dark:text-white mb-2">
                            Welcome Back
                        </motion.h1>
                        <motion.p
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-lg font-bold text-center text-black dark:text-gray-300 mb-6"
                        >
                            Sign in to your account
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
                        onSubmit={loginAPI}>

                        {/* Email itemvariant animation is also injected*/}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-black dark:text-gray-200">
                                Email*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                                    placeholder="xyz123@email.com"
                                    required
                                />
                            </div>
                        </motion.div>

                        {/* Password itemvariant animation is also injected*/}
                        <motion.div variants={itemVariants} className="relative">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-black dark:text-gray-200">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    placeholder="********"
                                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                                    required />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-500 dark:text-gray-300">
                                    Remember me
                                </label>
                            </div>
                            <a onClick={()=>navigate("/forgotPassword")} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:cursor-pointer dark:text-blue-400 hover:underline transition-colors duration-200">
                                Forgot password?
                            </a>
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center text-black bg-gradient-to-r from-blue-200 to-yellow-200 hover:from-yellow-200 hover:to-blue-200 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-lg px-5 py-3 transition-all duration-200 disabled:opacity-70"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>                            
                            ) : <>
                            <h1 className="font-bold">
                               Sign in
                            </h1>
                             <FaSignInAlt className="m-2" size={20} />
                            </>}
                        </motion.button>

                        {/*--------or continue with--------- */}
                        <motion.div variants={itemVariants} className="relative flex items-center my-6">
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-gray-600 dark:text-gray-400 text-sm">or continue with</span>
                            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex justify-center gap-4 ">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center bg-gradient-to-r from-blue-200 to-yellow-200 hover:from-yellow-200 hover:to-blue-200 justify-center w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                <img className="h-8 mr-2" src={google} alt="Google" />
                                <span className="text-lg font-bold text-gray-700 dark:text-gray-200 " onClick={()=>handleOAuthLogin('google')} disabled={oauthLoading.google}>Google</span>
                            </motion.button>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.08}}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center bg-gradient-to-r from-blue-200 to-yellow-200 hover:from-yellow-200 hover:to-blue-200 justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                <img className="h-8 mr-2" src={git} alt="GitHub" />
                                <span className="text-lg font-bold text-gray-700 dark:text-gray-200" onClick={()=>handleOAuthLogin('github')  } disabled={oauthLoading.github}>GitHub</span>
                            </motion.button>
                        </motion.div>

                        <motion.p variants={itemVariants} className=" text-sm text-gray-500 dark:text-gray-300 text-center mt-6">
                            Don&apos;t have an account yet?{" "}
                            <span className="hover:text-lg font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition-colors duration-200" onClick={() => navigate('/register')}>
                                Sign up
                            </span>
                        </motion.p>
                    </motion.form>
                </motion.div>
            </motion.section>
        </>
    );
}