
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaPlus,
  FaArrowRight,
  FaSearch,
  FaEdit
} from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUserSecret } from "react-icons/fa";

const Profile = () => {
  const { user, loading, token } = useSelector((state) => state.auth);

  const userName = user?.userName || "User Name";
  const userEmail = user?.emailId || "user@example.com";
  const userPhone = user?.phoneNo || "Not provided";
  const fullName = user?.fullName || "Not provided";

  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [place, setPlace] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [message, setMessage] = useState("");
  const [del, setDel] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user data and devices
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch devices
        const response = await fetch(`${backendUrl}/device/${userEmail}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch devices");

        const deviceData = await response.json();
        setDevices(deviceData);

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && userEmail) {
      fetchUserData();
    }
  }, [backendUrl, token, userEmail]);

  // Fetch Places for devices
  useEffect(() => {
    const getPlace = async () => {
      const placeData = {};

      for (const device of devices) {
        const lat = device.homeLocation?.latitude;
        const lng = device.homeLocation?.longitude;

        if (lat && lng) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );
            const apiData = await response.json();

            if (apiData.status === "OK" && apiData.results.length > 0) {
              placeData[device.deviceId] = apiData.results[0].formatted_address;
            } else {
              placeData[device.deviceId] = "Address not found";
            }
          } catch (error) {
            console.error(`Error fetching location for device ${device.deviceId}:`, error);
            placeData[device.deviceId] = "Error fetching location";
          }
        } else {
          placeData[device.deviceId] = "Location not available";
        }
      }

      setPlace(placeData);
    };

    if (devices.length > 0) {
      getPlace();
    }
  }, [devices]);

  // Navigate to Device Detail
  const handleDeviceClick = (deviceId) => {
    navigate(`/device/${deviceId}`);
  };

  // Navigate to Add Device
  const addNewDevice = () => {
    navigate(`/addDevice`);
  };

  // Navigate to Edit Device
  const editDevice = (deviceId) => {
    setModal(!modal);
    navigate(`/editDevice/${deviceId}`);
    setActiveDropdownId(null); // Close dropdown after action
  };

  // Delete Device
  const deleteDevice = async (deviceId) => {
    setModal(!modal);
    try {
      const response = await fetch(`${backendUrl}/device/${deviceId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log("Device deleted successfully!");
        // Update UI after deletion
        setDevices((prevDevices) => prevDevices.filter(device => device.deviceId !== deviceId));

        setActiveDropdownId(null);
      } else {
        console.error("Failed to delete device");
      }
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  // Toggle dropdown for a specific device
  const toggleDropdown = (deviceId) => {
    setActiveDropdownId(prevId => prevId === deviceId ? null : deviceId);
  };

  const setForUpdation = (deviceId) => {
    setDeviceId(deviceId);
    setDel(false);
    setModal(!modal);
    setMessage("Are you Sure!! \n\n You want to Update details of this Device");
  };

  const setForDeletion = (deviceId) => {
    setDeviceId(deviceId);
    setDel(true);
    setModal(!modal);
    setMessage("Are you Sure!!\n You want to Delete this Device");
  };

  // Search Filter
  const filteredDevices = devices.filter(device =>
    (device.deviceName || "Unnamed Device").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 max-w-screen-xl mx-auto mt-5">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Card */}
        <div className="w-full lg:w-1/3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Cover Image */}
            <div className="h-40 bg-gradient-to-r from-blue-400 to-yellow-200"></div>

            {/* Profile Info */}
            <motion.div className="relative px-6 pb-6" >
              <div className="flex justify-between items-start">
                <div className="-mt-16 relative">
                  <motion.div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg hover:border-green-500" whileHover={{scale:1.22}}>
                    <FaUserSecret size={85} className="text-gray-900" />
                  </motion.div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/editProfile')}
                  className="mt-4 flex items-center space-x-1 bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400 text-black px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <MdEdit size={18} />
                  <span>Edit Profile</span>
                </motion.button>
              </div>

              <motion.h1 className="mt-4 text-2xl font-bold text-gray-800" whileHover={{scale:1.08}}>{userName}</motion.h1>

              <div className="mt-6 space-y-4">
                <motion.div className="flex items-center text-gray-600" whileHover={{scale:1.08}}>
                  <FaUserSecret className="mr-3 text-blue-500" size={18} />
                  <span>{fullName}</span>
                </motion.div>
                <motion.div className="flex items-center text-gray-600" whileHover={{scale:1.08}}>
                  <FaEnvelope className="mr-3 text-blue-500" size={18} />
                  <span>{userEmail}</span>
                </motion.div>
                <motion.div className="flex items-center text-gray-600" whileHover={{scale:1.08}}>
                  <FaPhone className="mr-3 text-blue-500" size={18} />
                  <span>{userPhone}</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column (Devices and Activity) */}
        <div className="w-full lg:w-2/3">
          {/* Devices Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            {/* UPPER DEVICE SECTION */}
            <div className="bg-gradient-to-r from-blue-400 to-yellow-200 rounded-2xl shadow-xl mb-4 overflow-hidden">
              <div className="px-6 py-6 md:px-8">
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h1 className="text-2xl md:text-2xl font-bold text-black mb-1">Your Devices</h1>
                    <p className="text-gray-700 text-sm font-medium">
                      {devices.length} device{devices.length !== 1 ? 's' : ''} connected to your account
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addNewDevice}
                    className="flex items-center font-bold gap-2 px-5 py-2 shadow-lg rounded-full bg-white hover:bg-gray-50 text-black transition-colors duration-200"
                  >
                    <FaPlus size={14} />
                    <span>Add Device</span>
                  </motion.button>
                </motion.div>
              </div>

              {/* SEARCH BAR */}
              <div className="bg-white px-4 py-3 border-t border-blue-100">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="search"
                    className="block w-full p-2 pl-10 text-sm text-gray-700 border border-gray-200 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search for devices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* DEVICES LIST */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col justify-center items-center h-40 bg-white rounded-xl shadow-md p-8"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading devices...</p>
                </motion.div>
              ) : filteredDevices.length > 0 ? (
                <motion.div
                  key="devices"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {filteredDevices.map((device, index) => {
                    const location = place[device.deviceId] || "Loading Location...";
                    const isDropdownOpen = activeDropdownId === device.deviceId;

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                        key={device.deviceId || index}
                        className="bg-white hover:bg-gray-50 shadow-lg rounded-xl overflow-hidden transition-all duration-300 border border-gray-100"
                      >
                        <div className="p-4">
                          {/* Name and Options Menu */}
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {device.deviceName || "Unnamed Device"}
                            </h3>
                            <div className="relative">
                              <BsThreeDotsVertical
                                className="text-blue-500 cursor-pointer hover:text-blue-700"
                                size={22}
                                onClick={() => toggleDropdown(device.deviceId)}
                              />

                              {/* Dropdown Menu */}
                              {isDropdownOpen && (
                                <div
                                  ref={dropdownRef}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200"
                                >
                                  <AnimatePresence>
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {/* Edit Option */}
                                      <button
                                        onClick={() => setForUpdation(device.deviceId)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                                      >
                                        <FaEdit size={14} className="text-green-500" />
                                        <span>Edit Device</span>
                                      </button>

                                      {/* Delete Option */}
                                      <button
                                        onClick={() => setForDeletion(device.deviceId)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <MdDelete size={14} className="text-red-500" />
                                        <span>Delete Device</span>
                                      </button>
                                    </motion.div>
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <FaMapMarkerAlt className="mr-2 text-blue-500" size={14} />
                            <span className="truncate">{location}</span>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              <span className={`w-2 h-2 mr-1 rounded-full ${device.active ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                              {device.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        {/* Detail Button */}
                        <div className="flex justify-end p-3 bg-gray-50 border-t border-gray-100">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeviceClick(device.deviceId)}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-200 to-blue-400 text-black hover:from-blue-400 hover:to-yellow-200 transition-colors duration-200 text-sm font-medium"
                          >
                            View Details
                            <FaArrowRight size={12} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="no-devices"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-40 bg-white rounded-xl shadow-md p-8"
                >
                  <p className="text-gray-600 font-medium text-lg">No devices found.</p>
                  <button
                    onClick={addNewDevice}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Your First Device
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Device Confirmation Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Dimmed Background Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setModal(!modal)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl z-10 w-full max-w-md m-4 overflow-hidden transition-all transform"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">{del ? "Delete Device" : "Edit Device"}</h3>
              <button
                onClick={() => setModal(!modal)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600">
                {message}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setModal(!modal)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={del ? () => deleteDevice(deviceId) : () => editDevice(deviceId)}
                className="px-4 py-2 bg-gradient-to-r from-blue-400 to-yellow-200 text-black font-bold rounded-md hover:from-yellow-200 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;