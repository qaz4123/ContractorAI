import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '../types';

declare const google: any;

interface MapViewProps {
  leads: Lead[];
  onMapClick?: (coords: { lat: number; lng: number }) => void;
}

const MapView: React.FC<MapViewProps> = ({ leads, onMapClick }) => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const markers = useRef<any[]>([]);
    const [isMapApiLoaded, setIsMapApiLoaded] = useState(false);

    // Effect to check when Google Maps API is loaded
    useEffect(() => {
        const checkApi = () => {
            // FIX: Replaced 'window.google' with 'google' to resolve TypeScript error.
            if (typeof google !== 'undefined' && google.maps) {
                setIsMapApiLoaded(true);
                return true;
            }
            return false;
        };
        
        if (checkApi()) return;

        const intervalId = setInterval(() => {
            if (checkApi()) {
                clearInterval(intervalId);
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, []);
    
    // Effect to initialize the map and update markers
    useEffect(() => {
        if (!isMapApiLoaded) return;

        if (mapRef.current && !mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lat: 39.7817, lng: -89.6501 }, // Default to Springfield, IL
                zoom: 10,
                mapId: 'PROJECT_PROSPECT_MAP'
            });

            if (onMapClick) {
                mapInstance.current.addListener("click", (mapsMouseEvent: any) => {
                     if (mapsMouseEvent.latLng) {
                         onMapClick({
                             lat: mapsMouseEvent.latLng.lat(),
                             lng: mapsMouseEvent.latLng.lng()
                         });
                     }
                });
            }
        }

        // Clear existing markers
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
        
        if (mapInstance.current && leads.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            
            leads.forEach(lead => {
                const marker = new google.maps.Marker({
                    position: lead.coords,
                    map: mapInstance.current,
                    title: lead.address,
                });

                const contentString = `
                    <div style="font-family: sans-serif;">
                        <p style="font-weight: 600; margin: 0 0 4px 0; color: #1e293b;">${lead.dossier.ownerName}</p>
                        <p style="margin: 0; color: #475569; font-size: 12px;">${lead.address}</p>
                        <button onclick="document.getElementById('hidden-nav-${lead.id}').click()" style="margin-top: 8px; font-size: 12px; color: #4f46e5; font-weight: 600; background: none; border: none; padding: 0; cursor: pointer;">View Dossier &rarr;</button>
                    </div>`;

                const infoWindow = new google.maps.InfoWindow({
                    content: contentString,
                });

                marker.addListener('click', () => {
                    infoWindow.open(mapInstance.current, marker);
                });
                
                markers.current.push(marker);
                bounds.extend(lead.coords);
            });

            if (leads.length > 1) {
              mapInstance.current.fitBounds(bounds);
            } else if (leads.length === 1) {
              mapInstance.current.setCenter(bounds.getCenter());
              mapInstance.current.setZoom(14);
            }
        }
    }, [leads, isMapApiLoaded, onMapClick]);

    if (!isMapApiLoaded) {
        return (
            <div className="relative h-96 bg-slate-200 rounded-lg flex items-center justify-center">
                <p className="text-slate-500">Loading Map...</p>
            </div>
        );
    }
    
    // Always render map to allow clicks even if no leads are present.
    return (
        <div className="relative h-96 bg-slate-200 rounded-lg overflow-hidden border-4 border-white shadow-inner">
             {/* Hidden links for InfoWindow navigation */}
            <div style={{ display: 'none' }}>
                {leads.map(lead => (
                    <button key={lead.id} id={`hidden-nav-${lead.id}`} onClick={() => navigate(`/dossier/${lead.id}`)} />
                ))}
            </div>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default MapView;