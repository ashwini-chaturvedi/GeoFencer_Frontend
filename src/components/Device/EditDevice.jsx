import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeviceDetector from "device-detector-js";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaArrowLeft, FaMobileAlt, FaEnvelope, FaCheck, FaExclamation } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LuRadius } from "react-icons/lu";

export default function EditDevice() {
    const [userLocation, setUserLocation] = useState(null);
    const { deviceId } = useParams();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingDevice, setFetchingDevice] = useState(true);
    const [location, setLocation] = useState("");
    const [deviceInfo, setDeviceInfo] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const {  user } = useSelector((state) => state.auth);
    const jwtToken = useSelector((state) => state.auth.token);

    const [formData, setFormData] = useState({
        deviceId: parseInt(deviceId),
        uniqueId: "",
        deviceName: "",
        geofenceRadius: "",
        homeLocation: {
            latitude: "",
            longitude: "",
            distance: "",
            dateTime: "",
            deviceId: parseInt(deviceId)
        },
        currentLocation: {
            latitude: "",
            longitude: "",
            distance: "",
            dateTime: "",
            deviceId: parseInt(deviceId)
        }
    });

    // Fetch existing device data
    useEffect(() => {
        const fetchDeviceData = async () => {
            if (!deviceId || !user?.emailId) return;

            try {
                setFetchingDevice(true);
                const response = await fetch(`${backendUrl}/device/${user.emailId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${jwtToken}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const devices = await response.json();
                    const currentDevice = devices.find(device => device.deviceId === parseInt(deviceId));
                    
                    if (currentDevice) {
                        // Populate form with existing device data
                        setFormData({
                            deviceId: currentDevice.deviceId,
                            uniqueId: currentDevice.uniqueId || "",
                            deviceName: currentDevice.deviceName || "",
                            geofenceRadius: currentDevice.geofenceRadius || "",
                            homeLocation: {
                                latitude: currentDevice.homeLocation?.latitude || "",
                                longitude: currentDevice.homeLocation?.longitude || "",
                                distance: currentDevice.homeLocation?.distance || "",
                                dateTime: currentDevice.homeLocation?.dateTime || "",
                                deviceId: currentDevice.deviceId
                            },
                            currentLocation: {
                                latitude: currentDevice.currentLocation?.latitude || "",
                                longitude: currentDevice.currentLocation?.longitude || "",
                                distance: currentDevice.currentLocation?.distance || "",
                                dateTime: currentDevice.currentLocation?.dateTime || "",
                                deviceId: currentDevice.deviceId
                            }
                        });

                        // Set existing location if available
                        if (currentDevice.homeLocation?.latitude && currentDevice.homeLocation?.longitude) {
                            const existingLocation = {
                                latitude: currentDevice.homeLocation.latitude,
                                longitude: currentDevice.homeLocation.longitude,
                                distance: currentDevice.homeLocation.distance || "0",
                                dateTime: currentDevice.homeLocation.dateTime || getFormattedDateTime(),
                                deviceId: currentDevice.deviceId
                            };
                            setUserLocation(existingLocation);
                            
                            // Fetch place name for existing coordinates
                            fetchPlaceName(currentDevice.homeLocation.latitude, currentDevice.homeLocation.longitude);
                        }
                    } else {
                        setError("Device not found or you don't have permission to edit this device.");
                    }
                } else {
                    setError("Failed to fetch device data. Please try again.");
                }
            } catch (error) {
                console.error("Error fetching device:", error);
                setError("Failed to load device information.");
            } finally {
                setFetchingDevice(false);
            }
        };

        fetchDeviceData();
    }, [deviceId, user?.emailId, jwtToken, backendUrl]);

    // Device detection (for reference only in edit mode)
    useEffect(() => {
        const deviceDetector = new DeviceDetector();
        const detectedDevice = deviceDetector.parse(navigator.userAgent);
        setDeviceInfo(detectedDevice);
    }, []);

    function getFormattedDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    // Get new location
    const getLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        distance: "0",
                        dateTime: getFormattedDateTime(),
                        deviceId: parseInt(deviceId)
                    };
                    setUserLocation(newLocation);
                    setError(null);
                    setLoading(false);

                    // Update formData with new location
                    setFormData((prev) => ({
                        ...prev,
                        homeLocation: newLocation,
                        currentLocation: newLocation
                    }));

                    // Try to get place name from coordinates
                    fetchPlaceName(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    setError(error.message);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    // Using google maps API to fetch the location from latitude and longitude
    const fetchPlaceName = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );

            const apiData = await response.json();

            if (apiData.status === "OK" && apiData.results.length > 0) {
                // Use the most appropriate address (usually the first one is most specific)
                setLocation(apiData.results[0].formatted_address);
            }
        } catch (error) {
            console.error("Error fetching place name:", error);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, "-", value);
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit updated device data
    async function updateDevice(e) {
        e.preventDefault();
        
        if (!userLocation && !formData.homeLocation.latitude) {
            setError("Please set a location for your device.");
            return;
        }

        try {
            setLoading(true);
            console.log("Updating FormData:", formData);

            const response = await fetch(`${backendUrl}/device/update/${user.emailId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwtToken}`
                },
                body: JSON.stringify(formData),
                mode: "cors"
            });

            console.log("Update response:", response);

            if (response.ok) {
                // Successfully updated, navigate to profile
                navigate("/profile");
            } else {
                const errorText = await response.text();
                setError(`Failed to update device: ${errorText}`);
            }
        } catch (error) {
            console.error("Update error:", error);
            setError("Failed to update device. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Format coordinate display
    const formatCoordinate = (coord) => {
        if (!coord) return "N/A";
        return parseFloat(coord).toFixed(6);
    };

    // Show loading state while fetching device data
    if (fetchingDevice) {
        return (
            <div className="container mx-auto px-4 py-8 mt-16 mb-16 max-w-lg">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="ml-3 text-gray-600">Loading device information...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="container mx-auto px-4 py-8 mt-16 mb-16 max-w-lg"
        >
            {/* Back Button */}
            <motion.button 
                className="text-gray-600 mb-6 flex items-center hover:text-blue-500 transition-colors" 
                onClick={() => navigate(-1)}
                whileHover={{ x: -5 }}
            >
                <FaArrowLeft className="mr-2" /> Back
            </motion.button>

            <motion.div 
                className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-400 to-yellow-200 p-6">
                    <h1 className="text-2xl font-bold text-black flex items-center">
                        <FaMobileAlt className="mr-3" /> Update Device Details
                    </h1>
                </div>

                {/* Form */}
                <div className="p-6">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
                        >
                            <p>{error}</p>
                        </motion.div>
                    )}

                    {/* Device Info - Show detected vs existing */}
                    {deviceInfo && deviceInfo.device && (
                        <div className="mb-6 p-3 text-black font-bold bg-gradient-to-r from-blue-400 to-yellow-200 dark:bg-opacity-20 rounded-lg">
                            <p className="font-bold text-black text-lg dark:text-gray-300">
                                <span className="font-bold text-lg text-black">Current browser device:</span> {deviceInfo.device.brand || ''} {deviceInfo.device.model || ''}
                                {deviceInfo.os && ` (${deviceInfo.os.name} ${deviceInfo.os.version})`}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={updateDevice}>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                <FaEnvelope className="inline mr-2 text-gray-500" />
                                Email Address
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="email"
                                name="email"
                                value={user.emailId}
                                disabled
                                className="w-full p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FaMobileAlt className="inline mr-2 text-gray-500" />Device Name
                            </label>
                            <motion.input 
                                whileFocus={{ scale: 1.01 }} 
                                type="text" 
                                name="deviceName" 
                                placeholder="My iPhone, Work Laptop, etc." 
                                value={formData.deviceName} 
                                onChange={handleChange} 
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <LuRadius className="inline mr-2 text-gray-500" size={18} />Geo-Fence Distance/Radius
                                <span className="text-red-500"> (in km)</span>
                            </label>
                            <motion.input 
                                whileFocus={{ scale: 1.01 }} 
                                type="number" 
                                name="geofenceRadius" 
                                placeholder="10,20,30,..." 
                                value={formData.geofenceRadius} 
                                onChange={handleChange} 
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                                required 
                            />
                        </div>

                        {/* Location Section */}
                        <div className="mt-8 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-red-500" /> Home Location
                                </h3>

                                <motion.button 
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }} 
                                    type="button" 
                                    onClick={getLocation} 
                                    disabled={loading} 
                                    className={`flex items-center px-4 py-2 rounded-lg text-black font-bold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400"}`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                            Detecting...
                                        </>
                                    ) : (
                                        <div>Update Location</div>
                                    )}
                                </motion.button>
                            </div>

                            {userLocation || formData.homeLocation.latitude ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                            {userLocation ? "New location detected" : "Current home location"}
                                        </span>
                                    </div>
                                    <div className="text-lg font-semibold">{location || "Loading address..."}</div>

                                    <div className="flex-col grid grid-cols-2 gap-3 mt-3">
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Latitude</p>
                                            <p className="font-mono text-sm">
                                                {formatCoordinate(userLocation?.latitude || formData.homeLocation.latitude)}
                                            </p>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Longitude</p>
                                            <p className="font-mono text-sm">
                                                {formatCoordinate(userLocation?.longitude || formData.homeLocation.longitude)}
                                            </p>
                                        </div>
                                    </div>

                                    {userLocation && (
                                        <div className="flex mt-5 bg-yellow-100 rounded-xl p-3">
                                            <FaExclamation className="text-yellow-600 mt-1 text-lg" />
                                            <div className="text-yellow-600 font-bold text-lg">This will update your Home Location</div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400">
                                    <div>No location data available.</div>
                                    Click &quot;<span className="font-bold">Update Location</span>&quot; to set a new home location.
                                </div>
                            )}
                        </div>

                        {/* Update Button */}
                        <motion.button 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }} 
                            type="submit" 
                            disabled={loading || (!userLocation && !formData.homeLocation.latitude)}
                            className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-medium mt-6 ${loading || (!userLocation && !formData.homeLocation.latitude) ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"}`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaCheck className="mr-2" /> Update Device
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
}