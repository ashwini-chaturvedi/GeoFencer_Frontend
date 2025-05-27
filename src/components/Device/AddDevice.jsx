import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DeviceDetector from "device-detector-js";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaArrowLeft, FaMobileAlt, FaEnvelope, FaCheck, FaExclamation } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { LuRadius } from "react-icons/lu";
import { setUniqueId } from "../../Features/Slices/authSlice";// Import the new action (update path as needed)

export default function AddDevice() {
    const [userLocation, setUserLocation] = useState(null);//Managing the State of the userLocation
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);//State of Loading
    const [location, setLocation] = useState("");//State of Loading
    const [deviceInfo, setDeviceInfo] = useState(null);//Device Info

    const backendUrl = import.meta.env.VITE_BACKEND_URL;//Backend URL
    const navigate = useNavigate();//React-router for navigation

    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const jwtToken = useSelector((state) => state.auth.token)
    const dispatch = useDispatch();
    const [newEmailId, setNewEmailId] = useState("")
    const emailId = isAuthenticated ? user.emailId : newEmailId


    //this will store the form data and then send it collectively to the backEND
    const [formData, setFormData] = useState({
        uniqueId: "",
        deviceName: "",
        geofenceRadius: "",
        homeLocation: {
            latitude: "",
            longitude: "",
            distance: "",
            dataTime: ""
        }, currentLocation: {
            latitude: "",
            longitude: "",
            distance: "",
            dataTime: ""
        }
    });

    useEffect(() => {
        //Device Detection 
        const deviceDetector = new DeviceDetector();
        const detectedDevice = deviceDetector.parse(navigator.userAgent);//"navigator" it is given by chrome/browser etc

        setDeviceInfo(detectedDevice);//setting the device infos

        // Auto-suggest device name based on detected info
        if (detectedDevice && detectedDevice.device) {
            const suggestedName = `${detectedDevice.device.brand || ''} ${detectedDevice.device.model || ''}`
                .trim() || detectedDevice.client.name || 'My Device';

            //Setting the suggested name in the form Data.spreading the previous data and then Inserting the suggested name in place of deviceName 
            setFormData(prev => ({
                ...prev,
                deviceName: suggestedName
            }));
        }
    }, []);

    function getFormattedDateTime() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    //get the location details 
    const getLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        distance: "0",
                        dateTime: getFormattedDateTime()
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

    //Using google maps API to fetch the location from latitude and longitude
    const fetchPlaceName = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );

            const apiData = await response.json();

            // Use the first formatted address if available
            if (apiData.status === "OK" && apiData.results.length > 0) {
                setLocation(apiData.results[6].formatted_address);
                setFormData(prev => ({
                    ...prev
                }));
            }
        } catch (error) {
            console.error("Error fetching place name:", error);
        }
    };

    //this method will dynamically add the data into the correct place...
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    //aysnc-await method to submit the form data to the backend
    async function saveLocation(e) {
        e.preventDefault();
        try {
            setLoading(true);

            //⚠️IMPORTANT
            //Generating Unique Id 
            const uniqueId = crypto.randomUUID();
            console.log("uniqueId:", uniqueId);

            // Update form data with uniqueId
            setFormData((prev) => ({
                ...prev,
                "uniqueId": uniqueId
            }));

            // Dispatch action to update Redux store with uniqueId
            dispatch(setUniqueId({ uniqueId }));
            

            const response = await fetch(`${backendUrl}/device/${emailId}`, {//POST request to the backend 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwtToken}`
                },
                body: JSON.stringify({
                    ...formData,
                    uniqueId: uniqueId // Ensure the updated uniqueId is sent
                }),
                mode: "cors",
            });

            console.log("Response:", response);

            if (response.ok) {//if respose is correct navigate to the dashboard page
                isAuthenticated ? navigate(`/profile`) : navigate("/");
            } else {
                setError(`Incorrect Email Id or User with "${user.emailId}" doesn't Exist`);
            }
        } catch (error) {
            console.log(error);
            setError("Failed to register device");
        } finally {
            setLoading(false);
        }
    }

    //this will fix the coordinate to a limited number of digits...
    const formatCoordinate = (coord) => {
        if (!coord) return "N/A";
        return parseFloat(coord).toFixed(6);
    };

    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8 mt-16 mb-16 max-w-lg" >

            {/* Back Button */}
            <motion.button className="text-gray-600 mb-6 flex items-center hover:text-blue-500 transition-colors" onClick={() => navigate(-1)} /*⚠️ IMPORTANT: "navigate(-1)" will take you to the previous page...*/ whileHover={{ x: -5 }}>
                <FaArrowLeft className="mr-2" /> Back
            </motion.button>

            <motion.div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-400 to-yellow-200 p-6">
                    <h1 className="text-2xl font-bold text-black flex items-center">
                        <FaMobileAlt className="mr-3" /> Register New Device
                    </h1>
                    <p className="text-black mt-2">
                        Connect and monitor a new device to your account
                    </p>
                </div>

                {/* Form */}
                <motion.div className="p-6">
                    {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded" > <p>{error}</p> </motion.div>)}

                    {/* Device Info area this will give the detected device */}

                    <motion.div whileHover={{ scale: 1.08 }}>
                        {deviceInfo && deviceInfo.device && (<motion.div className="mb-6 p-3 text-black font-bold bg-gradient-to-r from-blue-400 to-yellow-200 dark:bg-opacity-20 rounded-lg " ><p className="font-bold text-black text-lg dark:text-gray-300"><span className="font-bold text-lg text-black">Detected device:</span> {deviceInfo.device.brand || ''} {deviceInfo.device.model || ''}{deviceInfo.os && ` (${deviceInfo.os.name} ${deviceInfo.os.version})`}</p></motion.div>)}
                    </motion.div>


                    {/* Form */}
                    <form className="space-y-5" onSubmit={saveLocation}>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                <FaEnvelope className="inline mr-2 text-gray-500" />
                                Email Address
                            </label>
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="email"
                                name="email"
                                value={isAuthenticated ? user.emailId : newEmailId}
                                onChange={isAuthenticated ? null : (e) => setNewEmailId(e.target.value)}
                                placeholder={isAuthenticated ? user.emailId : "xyz123@gmail.com"}
                                disabled={isAuthenticated}
                                className={`w-full p-3 ${isAuthenticated
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"} 
            border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                                required={!isAuthenticated}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FaMobileAlt className="inline mr-2 text-gray-500" />Device Name
                            </label>
                            <motion.input whileFocus={{ scale: 1.01 }} type="text" name="deviceName" placeholder="My iPhone, Work Laptop, etc." value={formData.deviceName} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <LuRadius className="inline mr-2 text-gray-500" size={18} />Geo-Fence Distance/Radius
                                <span className="text-red-500">(in km)</span>
                            </label>
                            <motion.input whileFocus={{ scale: 1.01 }} type="number" name="geofenceRadius" placeholder="10,20,30,..." value={formData.geofenceRadius} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" required />
                        </div>


                        {/* Location Section */}
                        <div className="mt-8 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-red-500" /> Location
                                </h3>

                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={getLocation} disabled={loading} className={`flex items-center px-4 py-2 rounded-lg text-black ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400 font-bold"}`}>
                                    {loading ? (<>
                                        {/* Green Dot Div */}
                                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                        Detecting...</>
                                    ) : (
                                        <>Detect Location</>
                                    )}
                                </motion.button>
                            </div>

                            {userLocation ? (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-green-600 dark:text-green-400 font-medium">Location detected</span>
                                </div>
                                <div className="text-lg font-semibold">{location}</div>

                                <div className="flex-col grid grid-cols-2 gap-3 mt-3">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Latitude</p>
                                        <p className="font-mono text-sm">{formatCoordinate(userLocation.latitude)}</p>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Longitude</p>
                                        <p className="font-mono text-sm">{formatCoordinate(userLocation.longitude)}</p>
                                    </div>
                                </div>
                                <div className="flex mt-5 bg-red-100 rounded-xl p-3 ">
                                    <FaExclamation className="text-red-600 mt-1 text-lg" />
                                    <div className="text-red-600 dark:text-green-400 font-bold text-lg">This will be your Home Location</div>
                                </div>

                            </motion.div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400">
                                    <div> No location data.</div>
                                    Click &quot;<span className="font-bold">Detect Location</span>&quot; to get your current Location.
                                </div>
                            )}
                        </div>

                        {/* Register Button */}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading || !userLocation}/*if it is loading or userlocation is not found disable the button*/ className={`w-full flex items-center justify-center p-3 rounded-lg text-black font-bold mt-6 ${loading || !userLocation ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-400 to-yellow-200 text-black hover:from-yellow-200 hover:to-blue-400"}`}>
                            {loading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaCheck className="mr-2 " /> Register Device
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}