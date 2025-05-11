import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaPlus, FaMapMarkerAlt, FaSearch, FaEdit } from "react-icons/fa";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [message, setMessage] = useState("");
  const [del, setDel] = useState(false);
  const [modal, setModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [place, setPlace] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const jwtToken = useSelector((state) => state.auth.token);
  const reduxEmail=useSelector((state)=>state.auth.email)
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

  // Fetch Devices
  useEffect(() => {
    const fetchDevices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/device/${reduxEmail}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch devices");

        const adminData = await response.json();
        setDevices(adminData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices();
  }, [backendUrl, jwtToken, reduxEmail]);

  // Fetch Places
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
    setModal(!modal)
    navigate(`/editDevice/${deviceId}`);
    setActiveDropdownId(null); // Close dropdown after action
  };

  // Delete Device
  const deleteDevice = async (deviceId) => {
    setModal(!modal)
    try {
      const response = await fetch(`${backendUrl}/device/${deviceId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        console.log("Device deleted successfully!");
        // Update UI after deletion
        setDevices((prevDevices) => prevDevices.filter(device => device.deviceId !== deviceId));
        setActiveDropdownId(null); // Close dropdown after action
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
    setDeviceId(deviceId)
    setDel(false)
    setModal(!modal)
    setMessage("Are you Sure!! \n\n You want to Update details of this Device")
  };
  const setForDeletion = (deviceId) => {
    setDeviceId(deviceId)
    setDel(true)
    setModal(!modal)
    setMessage("Are you Sure!!\n You want to Delete this Device")
  };

  // Search Filter
  const filteredDevices = devices.filter(device =>
    (device.deviceName || "Unnamed Device").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 py-8 mt-20"
    >
      {/* UPPER BLUE SECTION */}
      <div className="bg-gradient-to-r from-blue-400 to-yellow-200 rounded-2xl shadow-xl mb-8 overflow-hidden">
        <div className="px-6 py-8 md:px-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">Your Devices</h1>
              <p className="text-green-100 text-lg font-bold md:text-base">
                {devices.length} device{devices.length !== 1 ? 's' : ''} connected to your account
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addNewDevice}
              className="flex items-center font-bold gap-2 px-5 py-3 shadow-2xl shadow-black rounded-full bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400 transition-colors duration-200"
            >
              <FaPlus size={16} />
              <span>Add New Device</span>
            </motion.button>
          </motion.div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white px-6 py-4 border-t border-blue-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch size={16} />
            </div>
            <input
              type="search"
              className="block w-full p-3 pl-10 text-sm text-gray-700 border border-gray-200 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
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
            className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-8"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your devices...</p>
          </motion.div>
        ) : filteredDevices.length > 0 ? (
          <motion.div
            key="devices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredDevices.map((device, index) => {
              const location = place[device.deviceId] || "Loading Location...";
              const isDropdownOpen = activeDropdownId === device.deviceId;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                  key={device.deviceId || index}
                  className="bg-white hover:bg-gray-50 shadow-xl rounded-xl overflow-hidden transition-all duration-300 border border-gray-100"
                >
                  <div className="p-5">
                    {/* Name and Options Menu */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {device.deviceName || "Unnamed Device"}
                      </h3>
                      <div className="relative">
                        <BsThreeDotsVertical
                          className="text-blue-500 cursor-pointer hover:text-blue-700"
                          size={25}
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
                                  onClick={()=>setForUpdation(device.deviceId)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <FaEdit size={14} className="text-green-500" />
                                  <span>Edit Device</span>
                                </button>

                                {/* Delete Option */}
                                <button
                                  // onClick={() => deleteDevice(device.deviceId)}

                                  onClick={()=>setForDeletion(device.deviceId)}
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
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" size={16} />
                      <span className="truncate">{location}</span>
                    </div>
                  </div>

                  {/* Detail Button */}
                  <div className="flex justify-end p-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeviceClick(device.deviceId)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-200 to-blue-400 text-black hover:from-blue-400 hover:to-yellow-200 transition-colors duration-200transition-colors duration-200"
                    >
                      View Details
                      <FaArrowRight size={14} />
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
            className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-8"
          >
            <p className="text-gray-600 font-medium text-lg">No devices found.</p>
          </motion.div>
        )}

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            
            {/* Dimmed Background Overlay */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
              onClick={() => setModal(!modal)}
            />
          

            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl z-10 w-full max-w-md m-4 overflow-hidden transition-all transform">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">{del?"Delete":"Edit"}</h3>
                <button
                  onClick={() => setModal(!modal)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >

                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-600 mt-4">
                  {message}
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                <button
                  onClick={() => setModal(!modal)}
                  className="px-4 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={del? ()=>deleteDevice(deviceId):()=>editDevice(deviceId)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-400 to-yellow-200 text-black font-bold rounded-md hover:from-yellow-200 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          </div>

        )}
      </AnimatePresence>

    </motion.div>


  );
}