import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../../icons/logo.webp';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa';

export default function Footer() {
    const navigate = useNavigate();
    const darkMode = useSelector((state) => state.theme.darkMode);

    const handleNavigation = (path) => {
        navigate(path);
        // Scroll to top when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Navigation links for footer
    const footerLinks = [
        { name: 'Home', path: '/' },
        { name: 'Add Device', path: '/addDevice' },
        {
            name: 'Feedback',
            path: '/contact'
        },
        { name: 'Developer\'s Github', path: '/github' },
    ];

    // Social media icons using react-icons (for consistency with header)
    const socialLinks = [
        {
            name: 'Twitter',
            path: 'https://x.com/X_ashwini01',
            icon: <FaTwitter className="w-5 h-5" />
        }, {
            name: 'GitHub',
            path: 'https://github.com/ashwini-chaturvedi',
            icon: <FaGithub className="w-5 h-5" />
        },
        {
            name: 'LinkedIn',
            path: 'https://linkedin.com/in/ashwini-chaturvedi',
            icon: <FaLinkedin className="w-5 h-5" />
        }
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className={`mt-16 border-t-2 ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200'} rounded-t-3xl`}>
            <div className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and Brand */}
                    <div className="flex flex-col space-y-4">
                        <button
                            className="flex items-center group transition-transform duration-300 hover:scale-105 focus:outline-none"
                            onClick={() => handleNavigation('/')}
                            aria-label="Go to homepage"
                        >
                            <img
                                className="w-12 h-12 rounded-full"
                                src={logo}
                                alt="Geo-Fencer logo"
                            />
                            <span className={`ml-2 text-2xl font-bold ${darkMode ? 'text-white' : 'text-stone-950'}`}>
                                GeoTracker
                            </span>
                        </button>
                        <p className={`mt-2 text-sm max-w-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Track your devices with precision and security. Your location data is always protected.
                        </p>
                        <div className="flex mt-4 space-x-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.path}
                                    className={`transition-colors duration-200 cursor-pointer p-2 rounded-full shadow-sm hover:shadow-md ${
                                        darkMode 
                                            ? 'text-gray-300 hover:text-blue-400 bg-gray-800' 
                                            : 'text-gray-700 hover:text-blue-600 bg-white'
                                    }`}
                                    aria-label={social.name}
                                >
                                    <span className="sr-only">{social.name}</span>
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-1">
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Quick Links</h3>
                        <ul className="space-y-2">
                            {footerLinks.map((link, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavigation(link.path)}
                                        className={`text-md flex items-center group font-bold ${
                                            darkMode 
                                                ? 'text-gray-300 hover:text-blue-400' 
                                                : 'text-gray-800 hover:text-blue-600'
                                        } transition-colors duration-200`}
                                    >
                                        <FaArrowRight className="w-3 h-3 mr-2 transform group-hover:translate-x-1 transition-transform" />
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="md:col-span-1">
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Stay Updated</h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Subscribe to our newsletter for the latest updates and features.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-grow ${
                                    darkMode 
                                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-800'
                                }`}
                                required
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap shadow-md hover:shadow-lg transform hover:translate-y-px"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert("Subscribed!!!");
                                }}
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <hr className={`my-8 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                    <span className={`mb-4 sm:mb-0 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        © {currentYear} GeoTracker. All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}