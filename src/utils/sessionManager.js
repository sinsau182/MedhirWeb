export const updateSessionActivity = () => {
  const now = new Date().getTime();
  sessionStorage.setItem("lastActivity", now.toString());
};

export const isSessionExpiredDueToInactivity = () => {
  const lastActivity = sessionStorage.getItem("lastActivity");
  if (!lastActivity) return true;

  const now = new Date().getTime();
  const oneMinute = 60 * 60 * 1000; // 1 minute in ms
  return now - parseInt(lastActivity) > oneMinute;
};

export const clearSession = () => {
  sessionStorage.removeItem("lastActivity");
};