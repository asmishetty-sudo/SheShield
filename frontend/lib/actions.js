export const getGuestId = () => {
  if (typeof window === "undefined") return null; // prevent SSR crash

  let guestId = localStorage.getItem("guestId");

  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }

  return guestId;
};


