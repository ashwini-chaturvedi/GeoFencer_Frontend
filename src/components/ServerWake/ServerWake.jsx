/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Server, AlertCircle } from "lucide-react";

export default function ServerWake({ isLoading, onClose }) {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        let interval;
        
        if (isLoading) {
            // Show banner after 2 seconds of loading
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 2000);

            // Start counting elapsed time
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);

            return () => {
                clearTimeout(timer);
                clearInterval(interval);
            };
        } else {
            setShowBanner(false);
            setTimeElapsed(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getBannerContent = () => {
        if (timeElapsed < 10) {
            return {
                icon: <Server className="w-5 h-5" />,
                title: "Connecting to server...",
                message: "Please wait while we establish connection",
                bgColor: "bg-blue-50 border-blue-200",
                textColor: "text-blue-800",
                iconColor: "text-blue-600"
            };
        } else if (timeElapsed < 30) {
            return {
                icon: <Clock className="w-5 h-5" />,
                title: "Server is waking up...",
                message: "Our server may be sleeping and needs a moment to start up",
                bgColor: "bg-yellow-50 border-yellow-200",
                textColor: "text-yellow-800",
                iconColor: "text-yellow-600"
            };
        } else {
            return {
                icon: <AlertCircle className="w-5 h-5" />,
                title: "Server startup in progress...",
                message: "Cold starts can take up to 3-5 Minutes. Thank you for your patience!",
                bgColor: "bg-orange-50 border-orange-200",
                textColor: "text-orange-800",
                iconColor: "text-orange-600"
            };
        }
    };

    const bannerContent = getBannerContent();

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        opacity: { duration: 0.2 }
                    }}
                    className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4"
                >
                    <div className={`${bannerContent.bgColor} border ${bannerContent.textColor} px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm`}>
                        <div className="flex items-start space-x-3">
                            <div className={`${bannerContent.iconColor} mt-0.5 flex-shrink-0`}>
                                {bannerContent.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm">
                                        {bannerContent.title}
                                    </h4>
                                    <span className="text-xs font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                                        {formatTime(timeElapsed)}
                                    </span>
                                </div>
                                <p className="text-sm mt-1 opacity-90">
                                    {bannerContent.message}
                                </p>
                                
                                {/* Progress indication */}
                                <div className="mt-2">
                                    <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                                        <motion.div
                                            className="bg-current h-1.5 rounded-full opacity-60"
                                            initial={{ width: "0%" }}
                                            animate={{ 
                                                width: timeElapsed >= 50 ? "100%" : `${Math.min((timeElapsed / 50) * 100, 95)}%` 
                                            }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="text-current opacity-60 hover:opacity-80 transition-opacity flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}