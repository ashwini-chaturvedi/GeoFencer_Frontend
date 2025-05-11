/* eslint-disable react/prop-types */
import {useEffect,useRef} from 'react'
import {  useMap } from "@vis.gl/react-google-maps";
// Road Path component that displays actual road directions
const RoadPathOverlay = ({ homeCoordinates, deviceCoordinates }) => {
  const map = useMap();
  const directionsRendererRef = useRef(null);
  
  useEffect(() => {
    if (!map || !window.google || !homeCoordinates || !deviceCoordinates) return;

    const google = window.google;
    
    // Clean up previous renderer if it exists
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
    
    // Create new DirectionsService and DirectionsRenderer
    const directionsService = new google.maps.DirectionsService();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true, // Don't show default markers
      preserveViewport: true, // Add this line to prevent zoom override
      polylineOptions: {
        strokeColor: "blue",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [{
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            fillColor: "#FFFFFF",
            fillOpacity: 1,
            strokeWeight: 0
          },
          repeat: "10px"
        }]
      }
    });
    
    // Request directions
    directionsService.route({
      origin: homeCoordinates,
      destination: deviceCoordinates,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(response);
      } else {
        console.error("Directions request failed due to", status);
      }
    });
    
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [map, homeCoordinates, deviceCoordinates]);
  
  return null;
};

export default RoadPathOverlay