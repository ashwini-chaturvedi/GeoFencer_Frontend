import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../../icons/logo.webp';
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../../Features/Slices/authSlice';
import { MdContactMail } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { TbDeviceMobilePlus } from "react-icons/tb";
import { MdDashboardCustomize } from "react-icons/md";
import { FaGithubSquare } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, isAuthenticated } = useSelector((state) => state.auth);

    const handleNavigation = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const navItems = [
        { icon: <FaHome className="mr-1" size={20} />, label: 'Home', path: '/' },
        { 
            icon: <MdDashboardCustomize className="mr-1" size={20} />, 
            label: 'Dashboard', 
            path: isAuthenticated ? '/dashboard' : '/login' 
        },
        { 
            icon: <TbDeviceMobilePlus className="mr-1" size={20} />, 
            label: 'Add Device', 
            path: isAuthenticated ? '/addDevice' : '/login' 
        },
        { icon: <MdContactMail className="mr-1" size={20} />, label: 'Contact Developer', path: '/contact' },
        { icon: <FaGithubSquare className="mr-1" size={22} />, label: 'Developer\'s Github', path: '/github' }
    ];

    return (
        <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-gradient-to-r from-blue-400 to-yellow-200 rounded-b-3xl border-gray-700 border-b-2">
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
                            <span className="ml-2 text-2xl lg:text-3xl font-bold text-stone-950">
                                Geo-Fencer
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
                                        className="flex items-center relative py-2 text-gray-800 font-bold hover:text-blue-600 transition-colors duration-200 group"
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Auth Buttons */}
                        <div className="flex space-x-4">
                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 text-white bg-red-500 hover:bg-red-600 transition-all duration-200 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:translate-y-px"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Log Out'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleNavigation('/login')}
                                        className="px-4 py-2 flex items-center text-white transition-all duration-200 rounded-lg font-medium bg-gradient-to-r from-green-600 to-blue-700 hover:from-blue-600 hover:to-green-500 shadow-md hover:shadow-lg transform hover:translate-y-px"
                                        disabled={loading}
                                    >
                                        <IoMdLogIn size={20} className="mr-1"/>
                                        {loading ? 'Processing...' : 'Log in'}
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/register')}
                                        className="px-4 py-2 flex items-center text-white transition-all duration-200 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 shadow-md hover:shadow-lg transform hover:translate-y-px"
                                    >
                                        <FaUserPlus size={20} className="mr-1"/>
                                        Sign up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none transition-colors rounded-lg"
                            aria-expanded={menuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            {menuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden mt-4 pb-4 animate-fadeIn">
                        <ul className="flex flex-col space-y-3 border-t pt-4 border-gray-200">
                            {navItems.map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className="flex items-center w-full text-left py-2 px-3 text-black font-bold hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 flex flex-col space-y-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2 text-center text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 rounded-lg font-medium shadow-md"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Log Out'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleNavigation('/login')}
                                        className="w-full py-2 flex items-center justify-center text-white bg-gradient-to-r from-green-600 to-blue-700 hover:from-blue-600 hover:to-green-500 transition-colors duration-200 rounded-lg font-medium shadow-md"
                                        disabled={loading}
                                    >
                                        <IoMdLogIn size={20} className="mr-1"/>
                                        {loading ? 'Processing...' : 'Log in'}
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/register')}
                                        className="w-full py-2 flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 transition-colors duration-200 rounded-lg font-medium shadow-md"
                                    >
                                        <FaUserPlus size={20} className="mr-1"/>
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