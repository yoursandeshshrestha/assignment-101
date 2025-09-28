// ===== Date formatting utilities for consistent date/time display ===== //

// ===== Format date to locale string with consistent options ===== //
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

// ===== Format date and time to locale string with consistent options ===== //
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ===== Format time to locale string with consistent options ===== //
export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ===== Format date for US locale with consistent options ===== //
export const formatDateUS = (date: string | Date): string => {
  return new Date(date).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
