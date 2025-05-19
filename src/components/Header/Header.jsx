import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../../icons/logo.webp';
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../../Features/Slices/authSlice';
import { toggleDarkMode } from '../../Features/Slices/themeSlice';
import { FaHome } from "react-icons/fa";
import { TbDeviceMobilePlus } from "react-icons/tb";
import { FaGithubSquare } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { FaUserSecret } from "react-icons/fa";
import { VscFeedback } from "react-icons/vsc";
import { FaMoon, FaSun } from "react-icons/fa";
import { TbPasswordUser } from "react-icons/tb";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const profileDropdownRef = useRef(null);

    // Redux state access
    const { loading, isAuthenticated, user, token } = useSelector((state) => state.auth);
    const { darkMode } = useSelector((state) => state.theme);

    // Safely access user properties with fallbacks
    const userName = user?.userName || "User";
    const email = user?.emailId || "";

    const handleNavigation = (path) => {
        navigate(path);
        setMenuOpen(false);
        setProfileDropdownOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setProfileDropdownOpen(false);
    };

    const handleThemeToggle = () => {
        dispatch(toggleDarkMode());
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const navItems = [
        {
            icon: <FaHome className="mr-1" size={20} />,
            label: 'Home',
            path: '/'
        },
        {
            icon: <TbDeviceMobilePlus className="mr-1" size={20} />,
            label: 'Add Device',
            path: isAuthenticated ? '/addDevice' : '/addDevice'
        },
        {
            icon: <VscFeedback className="mr-1 " size={22} />,
            label: 'Feedback',
            path: '/contact'
        },
        {
            icon: <FaGithubSquare className="mr-1" size={22} />,
            label: 'Developer\'s Github',
            path: '/github'
        }
    ];

    const profileDropdownItems = [
        {
            icon: <CgProfile className="mr-2" size={20} />,
            label: 'My Profile',
            onClick: () => handleNavigation('/profile')
        },
        {
            icon: <FiSettings className="mr-2" size={20} />,
            label: 'Edit User Details',
            onClick: () => handleNavigation('/editProfile')
        },
        {
            icon: <TbPasswordUser className="mr-2" size={20} />,
            label: 'Change Password',
            onClick: () => handleNavigation('/forgotPassword')
        },
        {
            icon: <FiLogOut className="mr-2" size={20} />,
            label: 'Logout',
            onClick: handleLogout
        }
    ];

    // Debug
    useEffect(() => {
        console.log("Auth state:", { isAuthenticated, user, token });
        console.log("Theme state:", { darkMode });
    }, [isAuthenticated, token, user, darkMode]);

    // Profile picture renderer function
    const renderProfilePicture = () => {
        return <FaUserSecret size={30} className={`${darkMode ? "text-gray-300" : "text-black"}`} />;
    };

    // Mobile profile picture renderer function
    const renderMobileProfilePicture = () => {
        return <FaUserSecret size={48} className={`${darkMode ? "text-gray-300" : "text-red-700"} w-12 h-12 border-2 border-blue-500 rounded-full p-1`} />;
    };

    // Mobile menu button profile picture
    const renderMenuButtonProfile = () => {
        return <FaUserSecret size={32} className={`${darkMode ? "text-white" : "text-black"} hover:size-10 w-8 h-8 border-2 border-red-500 rounded-full p-1`} />;
    };

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${darkMode
            ? "bg-gradient-to-r from-gray-800 to-gray-900 rounded-b-3xl border-gray-600 border-b-2"
            : "bg-gradient-to-r from-blue-400 to-yellow-200 rounded-b-3xl border-gray-700 border-b-2"}`}>
            <nav className="px-4 py-2 mx-auto max-w-screen-xl">
                <div className="flex items-center justify-between">
                    {/* Logo and Brand */}
                    <div>
                        <button
                            className="flex items-center mt-2 group transition-transform duration-300 hover:scale-105 focus:outline-none"
                            onClick={() => handleNavigation('/')}
                            aria-label="Go to homepage"
                        >
                            <img
                                className="w-12 h-12 rounded-full"
                                src={logo}
                                alt="Geo-Fencer logo"
                            />
                            <span className={`ml-2 text-2xl lg:text-3xl font-bold ${darkMode ? "text-white" : "text-stone-950"}`}>
                                GeoTracker
                            </span>
                        </button>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex md:items-center">
                        <ul className="flex space-x-6 mr-6 font-medium">
                            {navItems.map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className={`flex items-center relative py-2 ${darkMode
                                            ? "text-gray-200 hover:text-blue-400"
                                            : "text-gray-800 hover:text-blue-600"
                                            } font-bold transition-colors duration-200 group`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                        <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${darkMode ? "bg-blue-400" : "bg-blue-600"
                                            } transition-all duration-300 group-hover:w-full`}></span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Auth Buttons or Profile Area */}
                        <div className="flex space-x-4 items-center">
                            {isAuthenticated ? (
                                <div className="relative" ref={profileDropdownRef}>
                                    <button
                                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                        className={`flex items-center space-x-2 ${darkMode
                                            ? "bg-gray-700 border-blue-400"
                                            : "bg-white border-blue-500"
                                            } p-1 rounded-full border-2 hover:border-blue-600 transition-all duration-200 focus:outline-none`}
                                        aria-expanded={profileDropdownOpen}
                                        aria-label="Toggle profile dropdown"
                                    >
                                        {renderProfilePicture()}
                                        <span className={`font-medium ${darkMode ? "text-gray-200" : "text-black"} pr-1`}>{userName}</span>

                                        <svg
                                            className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"} transition-transform duration-200 ${profileDropdownOpen ? 'transform rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>


                                    {/* Profile Dropdown Menu */}
                                    {profileDropdownOpen && (
                                        <div className={`absolute right-0 mt-2 w-48 ${darkMode
                                            ? "bg-gray-800 border-gray-700 text-white"
                                            : "bg-white border-gray-200 text-gray-800"
                                            } rounded-lg shadow-lg border py-1 z-50 animate-fadeIn`}>
                                            <div className={`px-4 py-2 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                                                <p className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Signed in as</p>
                                                <p className={`text-lg font-bold hover:text-xl hover:text-blue-600 hover:underline ${darkMode ? "text-gray-400" : "text-black"} truncate`}>{userName}</p>
                                            </div>
                                            {profileDropdownItems.map((item, index) => (
                                                <button
                                                    key={index}
                                                    onClick={item.onClick}
                                                    className={`flex items-center w-full px-4 py-2 text-sm ${darkMode
                                                        ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                                                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                                        } transition-colors duration-150`}
                                                >
                                                    {item.icon}
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleNavigation('/login')}
                                        className={`px-4 py-2 flex items-center text-white transition-all duration-200 rounded-lg font-medium ${darkMode
                                            ? "bg-gradient-to-r from-green-700 to-blue-800 hover:from-blue-800 hover:to-green-700"
                                            : "bg-gradient-to-r from-green-600 to-blue-700 hover:from-blue-600 hover:to-green-500"
                                            } shadow-md hover:shadow-lg transform hover:translate-y-px`}
                                        disabled={loading}
                                    >
                                        <IoMdLogIn size={20} className="mr-1" />
                                        {loading ? 'Processing...' : 'Log in'}
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/register')}
                                        className={`px-4 py-2 flex items-center text-white transition-all duration-200 rounded-lg font-medium ${darkMode
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-800 hover:from-indigo-800 hover:to-blue-600"
                                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500"
                                            } shadow-md hover:shadow-lg transform hover:translate-y-px`}
                                    >
                                        <FaUserPlus size={20} className="mr-1" />
                                        Sign up
                                    </button>


                                    {/* Dark Mode Toggle Button */}
                                    <button
                                        onClick={handleThemeToggle}
                                        className={`mr-6 p-2 rounded-full transition-colors duration-200 ${darkMode
                                            ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                                            : "bg-blue-100 text-gray-800 hover:bg-blue-200"
                                            }`}
                                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                                    >
                                        {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        {/* Mobile Dark Mode Toggle */}
                        <button
                            onClick={handleThemeToggle}
                            className={`mr-3 p-2 rounded-full transition-colors duration-200 ${darkMode
                                ? "bg-gray-700 text-yellow-300"
                                : "bg-blue-100 text-gray-800"
                                }`}
                            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
                        </button>

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={`p-1 ${darkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-700 hover:text-blue-600"} focus:outline-none transition-colors rounded-lg`}
                            aria-expanded={menuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            {isAuthenticated ? (
                                renderMenuButtonProfile()
                            ) : (
                                menuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                    </svg>
                                )
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className={`md:hidden mt-4 pb-4 animate-fadeIn ${darkMode ? "bg-gray-800" : ""}`}>
                        {isAuthenticated && (
                            <div className={`px-4 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} mb-3 flex items-center`}>
                                {renderMobileProfilePicture()}
                                <div className="ml-3">
                                    <p className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{userName}</p>
                                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} truncate`}>{email || 'user@example.com'}</p>
                                </div>
                            </div>
                        )}

                        <ul className={`flex flex-col space-y-3 border-b pb-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                            {navItems.map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className={`flex items-center w-full text-left py-2 px-3 font-bold ${darkMode
                                            ? "text-gray-200 hover:text-blue-400 hover:bg-gray-700"
                                            : "text-black hover:text-blue-600 hover:bg-gray-50"
                                            } rounded-lg transition-colors duration-200`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4 flex flex-col space-y-3 px-3">
                            {isAuthenticated ? (
                                <>
                                    {/* Mobile Profile Options */}
                                    {profileDropdownItems.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={item.onClick}
                                            className={`w-full py-2 flex items-center justify-center ${item.label === 'Logout'
                                                ? 'text-white bg-red-500 hover:bg-red-600'
                                                : darkMode
                                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                                } transition-colors duration-200 rounded-lg font-medium shadow-md`}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleNavigation('/login')}
                                        className={`w-full py-2 flex items-center justify-center text-white ${darkMode
                                            ? "bg-gradient-to-r from-green-700 to-blue-800 hover:from-blue-800 hover:to-green-700"
                                            : "bg-gradient-to-r from-green-600 to-blue-700 hover:from-blue-600 hover:to-green-500"
                                            } transition-colors duration-200 rounded-lg font-medium shadow-md`}
                                        disabled={loading}
                                    >
                                        <IoMdLogIn size={20} className="mr-1" />
                                        {loading ? 'Processing...' : 'Log in'}
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/register')}
                                        className={`w-full py-2 flex items-center justify-center text-white ${darkMode
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-800 hover:from-indigo-800 hover:to-blue-600"
                                            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500"
                                            } transition-colors duration-200 rounded-lg font-medium shadow-md`}
                                    >
                                        <FaUserPlus size={20} className="mr-1" />
                                        Sign up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;