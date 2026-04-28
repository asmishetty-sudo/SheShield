"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUser } from "@/contexts/UserContext";
import MarkerClusterGroup from "react-leaflet-cluster";
// Custom profile marker
const createIcon = (img) =>
  L.divIcon({
    html: `
      <div style="
        width:40px;
        height:40px;
        border-radius:50%;
        overflow:hidden;
        border:3px solid #ec4899;
        box-shadow:0 0 10px rgba(236,72,153,0.6);
        background:#fff;
      ">
        <img 
          src="${img}" 
          onerror="this.onerror=null;this.src='/default.png';"
          style="
            width:100%;
            height:100%;
            object-fit:cover;
            display:block;
          "
        />
      </div>
    `,
    className: "",
    iconSize: [40, 40],
  });

export default function MapCore({
  userLocation,
  volunteers = [],
  victimLocation,
  isSOS,
}) {
  const { user } = useUser();
  const profileImg =
    user?.profilePic && user.profilePic.trim() !== ""
      ? user.profilePic
      : "/default.png";
  if (!userLocation) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        Fetching location...
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] min-h-[300px] min-w-0 rounded-2xl overflow-hidden bg-gray-500">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }} // 🔥 IMPORTANT
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* USER */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createIcon(profileImg)}
        >
          <Popup>You</Popup>
        </Marker>

        {/* SOS RADIUS */}
        {isSOS && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={200}
            pathOptions={{ color: "red" }}
          />
        )}

        {/* VOLUNTEERS */}
        {isSOS && volunteers.length > 0 &&
        <MarkerClusterGroup>
          {volunteers.map((v, i) => {
            if (!v?.location?.coordinates) return null; // guard

            const [lng, lat] = v.location.coordinates;

            return (
              <Marker
                key={i}
                position={[lat, lng]}
                icon={createIcon(v.profilePic || "/default.png")}
              >
                <Popup>{v.name || "Volunteer"}</Popup>
              </Marker>
            );
          })}</MarkerClusterGroup>}
        {/* victim marker */}
        {isSOS && victimLocation?.coordinates && (
          <Marker
            position={[
              victimLocation.coordinates[1],
              victimLocation.coordinates[0],
            ]}
            icon={createIcon("/default.png")}
          >
            <Popup>Victim</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
