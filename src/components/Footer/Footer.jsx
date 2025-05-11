import { useNavigate } from 'react-router-dom';
import logo from '../../icons/logo.webp';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa';

export default function Footer() {
    const navigate = useNavigate();
    
    const handleNavigation = (path) => {
        navigate(path);
        // Scroll to top when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Navigation links for footer
    const footerLinks = [
        { name: 'Home', path: '/' },
        { name: 'Add Device', path: '/addDevice' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Contact', path: '/github' },
    ];

    // Social media icons using react-icons (for consistency with header)
    const socialLinks = [
        { 
            name: 'Twitter', 
            path: '#',
            icon: <FaTwitter className="w-5 h-5" />
        },
        { 
            name: 'GitHub', 
            path: '/github',
            icon: <FaGithub className="w-5 h-5" />
        },
        { 
            name: 'LinkedIn', 
            path: '#',
            icon: <FaLinkedin className="w-5 h-5" />
        }
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className=" mt-16 border-t border-gray-200 shadow-inner">
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
                                className="w-12 h-12 rounded-full shadow-md" 
                                src={logo} 
                                alt="Geo-Fencer logo" 
                            />
                            <span className="ml-3 text-2xl font-bold text-stone-950 group-hover:text-blue-600 transition-colors">
                                Geo-Fencer
                            </span>
                        </button>
                        <p className="text-gray-700 mt-2 text-sm max-w-xs">
                            Track your devices with precision and security. Your location data is always protected.
                        </p>
                        <div className="flex mt-4 space-x-4">
                            {socialLinks.map((social, index) => (
                                <button 
                                    key={index}
                                    onClick={() => social.path !== '#' ? handleNavigation(social.path) : null}
                                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer bg-white p-2 rounded-full shadow-sm hover:shadow-md"
                                    aria-label={social.name}
                                >
                                    <span className="sr-only">{social.name}</span>
                                    {social.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold text-black mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {footerLinks.map((link, index) => (
                                <li key={index}>
                                    <button 
                                        onClick={() => handleNavigation(link.path)}
                                        className="text-black  hover:text-blue-600 transition-colors duration-200 text-md flex items-center group"
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Stay Updated</h3>
                        <p className="text-gray-700 text-sm mb-4">
                            Subscribe to our newsletter for the latest updates and features.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-2">
                            <input 
                                type="email" 
                                placeholder="Your email" 
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-grow"
                                required
                            />
                            <button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap shadow-md hover:shadow-lg transform hover:translate-y-px"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                
                <hr className="my-8 border-gray-300" />
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                    <span className="text-gray-700 mb-4 sm:mb-0">
                        © {currentYear} Geo-Fencer. All Rights Reserved.
                    </span>
                    
                    <div className="flex space-x-6">
                        <button 
                            onClick={() => handleNavigation('/privacy')}
                            className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        >
                            Privacy Policy
                        </button>
                        <button 
                            onClick={() => handleNavigation('/terms')}
                            className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        >
                            Terms of Service
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}