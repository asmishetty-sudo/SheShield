export const sendLocation = (token) => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/update/update-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      });
    },
    (err) => {
      console.log("Location error:", err.message);
    }
  );
};