"use client";

import dynamic from "next/dynamic";

// load leaflet ONLY on client
const Map = dynamic(() => import("./MapCore"), {
  ssr: false,
});

export default function MapWrapper(props) {
  return <Map {...props} />;
}