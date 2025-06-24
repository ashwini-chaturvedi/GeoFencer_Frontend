/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import house from "../../icons/house.png";
import pointer from "../../icons/placeholder.png";
import GeofenceOverlay from "../GeoFence/GeoFenceOverlay";
import RoadPathOverlay from "../RoadPath/RoadPathOverlay";
import { useSelector } from "react-redux";

const MapComponent = ({ coordinates,lastLocation, geofenceRadius }) => {
  const [currLocation, setCurrLocation] = useState(lastLocation);
  const [distanceValue, setDistanceValue] = useState("0.00");
  const client = useRef(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;//backend url
  const jwtToken=useSelector((state)=>state.auth.token);

  useEffect(() => {
    client.current = new Client({
      webSocketFactory: () => new SockJS(`${backendUrl}/ws`),
      connectHeaders: {"Authorization": `Bearer ${jwtToken}`},

      onConnect: () => {

        client.current.subscribe("/topic/location", (message) => {
          try {
            const parsedData = JSON.parse(message.body);

            if (parsedData.latitude && parsedData.longitude && parsedData.distance) {
              setCurrLocation({
                lat: Number(parsedData.latitude),
                lng: Number(parsedData.longitude),
              });
              setDistanceValue(parsedData.distance)
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

  return (
    <div>
      <div className="mb-2">
        <strong>Distance:</strong> {distanceValue} km
      </div>
      <APIProvider apiKey={apiKey}>
        <div className="h-screen ">
          <Map
            defaultCenter={coordinates}
            defaultZoom={17}
            mapId={apiKey}
            options={{
              disableDefaultUI: false,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true,
              rotateControl: false,
              scaleControl: true,
            }}
          >
            {/* Home Marker */}
            <AdvancedMarker position={coordinates}>
              <img src={house} alt="Home" style={{ width: "40px" }} />
            </AdvancedMarker>

            {/* Device Marker */}
            <AdvancedMarker position={currLocation}>
              <img src={pointer} alt="Device" style={{ width: "40px" }} />
            </AdvancedMarker>

            {/* Road Path between Home and Device */}
            <RoadPathOverlay homeCoordinates={coordinates} deviceCoordinates={currLocation} />

            {/* Geofence */}
            <GeofenceOverlay coordinates={coordinates} radiusInMeters={geofenceRadius*1000} />
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

export default MapComponent;