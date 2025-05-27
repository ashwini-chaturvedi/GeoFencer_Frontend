
import { motion } from "framer-motion";
import { FaArrowLeft, FaSatelliteDish, FaMapMarkerAlt, FaExclamationTriangle, FaSignal, FaStop, FaSearch } from "react-icons/fa";
import MapComponent from "../MapComponent/MapComponent";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useSelector } from "react-redux";

export default function Device() {
  const navigate = useNavigate();//React-router

  const { deviceId } = useParams();//props that was passed by the dashboard component spelling of the props should be same

  const [homeLocationData, setHomeLocationData] = useState({ latitude: "23.3222", longitude: "23.2333" });//for location 
  const [locationData, setLocationData] = useState({ latitude: "", longitude: "",distance:"",dateTime:"" });//for location 

  const [homePlace, setHomePlace] = useState("");//for location 
  const [currPlace, setCurrPlace] = useState("");//for location 
  const [deviceName, setDeviceName] = useState("");
  const [geofenceRadius, setGeofenceRadius] = useState("");
  const [deviceUniqueId, setdeviceUniqueId] = useState("");

  const [error, setError] = useState(null);

  const [connected, setConnected] = useState(false);//maintains the state of connection

  const [tracking, setTracking] = useState(false);//maintaining the state of tracking

  const [loading, setLoading] = useState(true);

  const client = useRef(null);//Websocket client this client will subscribe to the location "${backendUrl}/topic/location"

  const [lastUpdated, setLastUpdated] = useState(null);//las updation

  const currentDeviceUniqueId = useSelector((state) => state.auth.uniqueId);

  const jwtToken = useSelector((state) => state.auth.token);


  //WebSocket Connection 
  const stompClient = useRef(null);//maintain the web socket refrence

  const locationIntervalRef = useRef(null);//reference of the location interval which is being refreshed after every 3 Seconds

  const backendUrl = import.meta.env.VITE_BACKEND_URL;//backend url

  // Check if device is outside geofence
  const isOutsideGeofence = geofenceRadius < locationData.distance;

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch(`${backendUrl}/location/home/${deviceId}`, {
          headers: { "Authorization": `Bearer ${jwtToken}` }
        });

        if (!response.ok) throw new Error("Failed to fetch location data");


        const data = await response.json();


        if (data && data.location.latitude && data.location.longitude) {
          // Set location data
          setHomeLocationData({
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          });

        

          setGeofenceRadius(data.geofenceRadius)
          setdeviceUniqueId(data.uniqueId)

          // Set device name from the response
          if (data.device && data.device.deviceName) {
            setDeviceName(data.device.deviceName);
          } else if (data.deviceName) {
            setDeviceName(data.deviceName);
          }

          // Set last updated time
          setLastUpdated(new Date().toLocaleTimeString());
        } else {
          setError("No valid location data available");
        }

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) fetchLocation();
  }, [deviceId, backendUrl, jwtToken, deviceName]);

  const checkForUniqueId = () => {
    return currentDeviceUniqueId === deviceUniqueId
  }



  // ⚠️IMPORTANT:WebSocket Implementation
  useEffect(() => {
    stompClient.current = new Client({//we are creating a STOMP client which will take an object as a parameter.
      webSocketFactory: () => new SockJS(`${backendUrl}/ws`),//Websocket Connection setup this will cause the websocket to gets connected to the backend which have /ws as prefix mentioned 

      connectHeaders: { "Authorization": `Bearer ${jwtToken}` },
      onConnect: () => setConnected(true),//when connection is On
      onStompError: () => setConnected(false),
      onDisconnect: () => setConnected(false),
      reconnectDelay: 5000,//try to reconnect after every 5 seconds if the connection has failed or any error is there
    });

    stompClient.current.activate();//activating the STOMP client now the websocket connection will start

    return () => {
      if (stompClient.current) stompClient.current.deactivate();//when returning disconnect the socket
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);//clear the Interval
    };
  }, [backendUrl, jwtToken]);


  //Starting the live tracking 
  const startLiveTracking = () => {
    if (tracking) return;//if tracking is going on, so return from here
    setTracking(true);

    locationIntervalRef.current = setInterval(() => {//Set Interval
      //using "navigator" by browser
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (stompClient.current && stompClient.current.connected) {
            stompClient.current.publish({//publish the position data(i.e. latitude & longitude) on to the given channel/place/endpoint destination and the server would be listening to it in the backend and also the map component which will take this 
              destination: "/app/update-location",//this is the destination where the json file will be published
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                device: { deviceId },
              }),
            });
            setLastUpdated(new Date().toLocaleTimeString());//change the last update timing
          }
        },
        (error) => setError(`Geolocation error: ${error.message}`)
      );
    }, 3000);//interval is for 3000 seconds
  };

  //Stop the live tracking
  const stopLiveTracking = () => {
    setTracking(false);
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
  };

  // Format coordinates to be more readable
  const formatCoordinate = (coord) => {
    if (!coord) return "N/A";
    return parseFloat(coord).toFixed(6);
  };





  useEffect(() => {

    client.current = new Client({
      webSocketFactory: () => new SockJS(`${backendUrl}/ws`),
      connectHeaders: { "Authorization": `Bearer ${jwtToken}` },

      onConnect: () => {
        console.log("Connected to WebSocket");

        client.current.subscribe("/topic/location", (message) => {
          try {
            const parsedData = JSON.parse(message.body);

            if (parsedData.latitude && parsedData.longitude) {
              setLocationData({
                latitude: parsedData.latitude,
                longitude: parsedData.longitude,
                distance: parsedData.distance,
                dateTime: parsedData.dataTime
              });
            } else {
              console.warn("Unexpected location format:", parsedData);
            }
          } catch (error) {
            console.error("Error parsing location data:", error, message.body);
          }
        });
      },

      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },

      onDisconnect: () => {
        console.log("WebSocket Disconnected");
      },

      reconnectDelay: 5000,
    });

    client.current.activate();

    return () => {
      if (client.current) {
        client.current.deactivate();
      }
    };
  }, [backendUrl, jwtToken]);

  //Using google maps API to fetch the location from latitude and longitude
  useEffect(() => {
    const fetchPlaceName = async () => {
      const lat = locationData.latitude
      const lng = locationData.longitude

      if (lat != "" && lng != "") {
        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);

          const apiData = await response.json();

          // Use the first formatted address if available
          if (apiData.status === "OK" && apiData.results.length > 0) {

            setCurrPlace(apiData.results[6].formatted_address)
          }
        } catch (error) {
          console.error("Error fetching place name:", error);
        }
      }


      let homeLat = String(homeLocationData.latitude)
      let homeLng = String(homeLocationData.longitude)

      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${homeLat},${homeLng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);

        const apiData = await response.json();

        // Use the first formatted address if available
        if (apiData.status === "OK" && apiData.results.length > 0) {

          setHomePlace(apiData.results[2].formatted_address)
        }
      } catch (error) {
        console.error("Error fetching place name:", error);
      }

    }

    fetchPlaceName()
  }, [homeLocationData, locationData])

  return (
    <motion.div className="max-w-4xl mx-auto p-4 md:p-6 mt-20 md:mt-20 bg-gradient-to-b from-gray-50 to-gray-100:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>

      {/* Header with Back Button */}
      <div className="flex justify-between items-center">
        <motion.button className="text-gray-700 dark:text-gray-200 hover:text-blue-500 flex items-center px-3 py-2 rounded-lg transition-colors" onClick={() => navigate(-1)}/*navigate(-1) will make you go to previous */ pagewhilehover={{ x: -5, scale: 1.05 }}>
          <FaArrowLeft className="mr-2" /> Back</motion.button>

        {/*Last Updated block */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {lastUpdated && `Last updated: ${lastUpdated}`}
        </div>
      </div>

      {/* Geofence Warning Banner */}
      {isOutsideGeofence && locationData.distance && (
        <motion.div
          className="mt-6 mb-4 p-4 bg-red-500 text-white rounded-lg shadow-lg flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ 
            opacity: 1, 
            scale: [1, 1.05, 1],
            y: 0
          }}
          transition={{ 
            duration: 0.5,
            scale: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut"
            }}
          >
            <FaExclamationTriangle className="mr-3 text-yellow-300" size={24} />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">⚠️ GEOFENCE BREACH ALERT!</span>
            <span className="text-sm">Device &quot;{deviceName}&quot; is outside the safe zone ({locationData.distance}m from home, limit: {geofenceRadius}m)</span>
          </div>
        </motion.div>
      )}

      {/* Device Info Card */}
      <motion.div
        className="mt-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-400 to-yellow-200 text-black px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.h2 className="text-xl md:text-2xl font-bold flex items-center">
              <FaSatelliteDish className="mr-3" /><span className=" text-2xl font-bold">&quot;{deviceName}&quot;</span>
            </motion.h2>

            {/* Connection Status */}
            <div className="flex items-center mx-12">
              <FaSignal className={`mr-2 ${connected ? "text-green-600" : "text-red-600"}`} size={25} />
              <span className={`px-5 py-1 rounded-full text-sm font-medium ${connected ? "bg-gradient-to-r from-green-400 to-green-500 bg-opacity-50" : "bg-red-600 bg-opacity-50 text-white"
                }`}>
                {connected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error Handling */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-700 dark:text-red-300 rounded-lg flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaExclamationTriangle className="mr-3 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-gray-500 dark:text-gray-400">Fetching location data...</p>
            </div>
          )}

          {/* Location Details */}
          {homeLocationData && !loading && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Location Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white flex items-center mb-4">
                  <FaMapMarkerAlt className="mr-2 text-red-500" /> Location Details
                </h3>


                <motion.div>
                  <motion.div>

                    {/* Home Location Details div */}
                    <span className=" md:mx-24 text-lg font-bold text-gray-400">Home Location:</span>
                    <div className="mx-2 text-xl font-bold">{homePlace}</div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <motion.div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border-black border "
                        whileHover={{ scale: 1.08 }}
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400">Latitude</p>
                        <p className="text-lg font-mono font-semibold text-gray-800 dark:text-white">
                          {formatCoordinate(homeLocationData.latitude)}
                        </p>
                      </motion.div>

                      <motion.div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border-black border"
                        whileHover={{ scale: 1.08 }}
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400">Longitude</p>
                        <p className="text-lg font-mono font-semibold text-gray-800 dark:text-white">
                          {formatCoordinate(homeLocationData.longitude)}
                        </p>
                      </motion.div>
                    </div>


                    {/* Current Location Details div */}
                    <div className="mt-5">
                      <span className=" md:mx-24  text-lg font-bold text-gray-400">Current Location:</span>
                      <div className="mx-2 text-xl font-bold">{currPlace}</div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <motion.div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border-black border"
                          whileHover={{ scale: 1.08 }}
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">Latitude</p>
                          <p className="text-lg font-mono font-semibold text-gray-800 dark:text-white">
                            {formatCoordinate(locationData.latitude)}
                          </p>
                        </motion.div>

                        <motion.div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border-black border"
                          whileHover={{ scale: 1.08 }}
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">Longitude</p>
                          <p className="text-lg font-mono font-semibold text-gray-800 dark:text-white">
                            {formatCoordinate(locationData.longitude)}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <div className="mt-5 mx-3">
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      className={isOutsideGeofence 
                        ? `bg-red-100 dark:bg-red-900 w-52 md:w-80 p-4 rounded-lg shadow-2xl border-red-500 border-4` 
                        : `bg-green-100 dark:bg-green-900 w-52 md:w-80 p-4 rounded-lg shadow-lg border-green-500 border-2`
                      }
                      initial={{ scale: 1 }}
                      animate={isOutsideGeofence ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          "0 20px 25px -5px rgba(239, 68, 68, 0.4)",
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        ]
                      } : { scale: 1 }}
                      transition={isOutsideGeofence ? {
                        scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                        boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                      } : {}}
                      whileHover={{ scale: 1.15 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Distance from Home</p>
                          <p className={`text-2xl font-bold ${isOutsideGeofence ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {locationData.distance}m
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Limit: {geofenceRadius}m
                          </p>
                        </div>
                        {isOutsideGeofence && (
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            <FaExclamationTriangle className="text-red-500" size={28} />
                          </motion.div>
                        )}
                      </div>
                      
                      {isOutsideGeofence && (
                        <motion.div 
                          className="mt-2 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                            🚨 OUTSIDE SAFE ZONE!
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>


                
                {/* Tracking Button - Only shown if user owns the device */}
                {checkForUniqueId() && (
                  <motion.button
                    className={`mt-6 w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center ${!connected
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : tracking
                          ? "bg-gradient-to-r from-red-400 to-red-600 hover:from-red-600 hover:to-red-400 text-black"
                          : "text-black bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400"
                      }`}
                    onClick={tracking ? stopLiveTracking : startLiveTracking}
                    whileHover={{ scale: connected ? 1.08 : 1 }}
                    disabled={!connected}
                  >
                    {!tracking
                      ? <FaSearch className="mr-2" size={20} />
                      : <FaStop className="mr-2" size={20} />
                    }
                    {tracking ? "Stop Live Tracking" : "Start Live Tracking"}
                  </motion.button>
                )}

                {/* Connection status message - Only shown if the user not owns the device and not connected */}
                {checkForUniqueId() && !connected && (
                  <p className="mt-2 text-xl text-center text-red-500 dark:text-gray-400">
                    Device isn&apos;t Available to track
                  </p>
                )}
              </div>

              {/* Map Display */}
              <motion.div
                className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md h-full w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Props are being sent to the Map Component */}
                <MapComponent
                  coordinates={{
                    lat: Number(homeLocationData.latitude),
                    lng: Number(homeLocationData.longitude)
                  }}
                  geofenceRadius={geofenceRadius}
                />
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}