import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ issues }) {
  const map = useMap();

  useEffect(() => {
    // Only extract issues physically Open or In Progress to map current live density zones
    const points = issues
      .filter(i => (i.status === 'Open' || i.status === 'In Progress') && i.location?.coordinates)
      .map(i => [i.location.coordinates[1], i.location.coordinates[0], 1]); // [lat, lng, intensity]

    if (points.length === 0) return;

    // Utilize leaflet.heat custom rendering engine injected into the map DOM
    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, issues]);

  return null;
}
