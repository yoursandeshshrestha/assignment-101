// ===== Input sanitization utilities for security ===== //


// ===== Sanitizes text input by removing potentially dangerous characters ===== // 
export const sanitizeTextInput = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  return (
    input
      .trim()
      // ===== Remove HTML tags ===== //
      .replace(/<[^>]*>/g, "")
      // ===== Remove script tags and their content ===== //
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // ===== Remove potentially dangerous characters ===== //
      .replace(/[<>'"&]/g, "")
      // ===== Remove excessive whitespace ===== //
      .replace(/\s+/g, " ")
      // ===== Limit length to prevent DoS ===== //
      .substring(0, 10000)
  );
};


