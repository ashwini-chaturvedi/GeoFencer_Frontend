/* eslint-disable react/prop-types */
import {useMap} from "@vis.gl/react-google-maps"
import { useEffect, useRef } from "react";
const GeofenceOverlay = ({ coordinates, radiusInMeters }) => {
  const map = useMap();
  const circleRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    circleRef.current = new window.google.maps.Circle({
      center: coordinates,
      radius: radiusInMeters,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.1,
      map: map,
    });

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [map, coordinates, radiusInMeters]);

  return null;
};

export default GeofenceOverlay;