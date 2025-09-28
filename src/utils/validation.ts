// ===== Validation utilities for candidate information ===== //
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// ===== Validates email address format and basic structure ===== //
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === "") {
    return {
      isValid: false,
      errorMessage: "Email address is required. Please provide a valid email.",
    };
  }

  // ===== Basic email regex pattern ===== //
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      errorMessage:
        "Please enter a valid email address (e.g., john.doe@example.com)",
    };
  }

  // ===== Check for common invalid patterns ===== //
  const trimmedEmail = email.trim().toLowerCase();

  // ===== Check for obviously fake emails ===== //
  const fakeEmailPatterns = [
    /^test@/,
    /^example@/,
    /^fake@/,
    /^dummy@/,
    /^sample@/,
    /@test\.com$/,
    /@fake\.com$/,
    /@dummy\.com$/,
    /@sample\.com$/,
    /@localhost/,
    /@\./,
    /^[a-z]+@[a-z]+$/, // ===== Too simple like "a@b" ===== //
  ];

  for (const pattern of fakeEmailPatterns) {
    if (pattern.test(trimmedEmail)) {
      return {
        isValid: false,
        errorMessage:
          "Please provide a real email address, not a test or example email.",
      };
    }
  }

  // ===== Check for random characters and invalid patterns ===== //
  const specialCharCount = (email.match(/[._%+-]/g) || []).length;
  const numberCount = (email.match(/[0-9]/g) || []).length;

  // ===== Check for random character sequences (no vowels, too many consonants in a row) ===== //
  const hasVowels = /[aeiou]/i.test(email);
  const consonantSequence = email.match(/[bcdfghjklmnpqrstvwxyz]{4,}/gi);

  // ===== Check for keyboard mashing patterns ===== //
  const keyboardMashPatterns = [
    /^[qwertyuiop]+@/i, // Top row before @
    /^[asdfghjkl]+@/i, // Middle row before @
    /^[zxcvbnm]+@/i, // Bottom row before @
    /^[qwerty]+@/i, // Left side before @
    /^[uiop]+@/i, // Right side before @
  ];

  // ===== Check for obviously random strings ===== //
  if (!hasVowels && email.length > 6) {
    return {
      isValid: false,
      errorMessage:
        "This doesn't look like a real email address. Please provide a valid email with proper formatting.",
    };
  }

  // ===== Check for keyboard mashing ===== //
  for (const pattern of keyboardMashPatterns) {
    if (pattern.test(email)) {
      return {
        isValid: false,
        errorMessage:
          "This doesn't look like a real email address. Please provide a valid email.",
      };
    }
  }

  // ===== Check for long consonant sequences ===== //
  if (consonantSequence && consonantSequence.some((seq) => seq.length > 5)) {
    return {
      isValid: false,
      errorMessage:
        "This doesn't look like a real email address. Please provide a valid email.",
    };
  }

  if (specialCharCount > 3 || numberCount > email.length * 0.7) {
    return {
      isValid: false,
      errorMessage:
        "This doesn't look like a real email address. Please provide a valid email.",
    };
  }

  return { isValid: true };
};

// ===== Validates phone number format and basic structure ===== //
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      errorMessage:
        "Phone number is required. Please provide a valid phone number.",
    };
  }

  // ===== Check if input contains only numeric characters ===== //
  if (!/^\d+$/.test(phone)) {
    return {
      isValid: false,
      errorMessage:
        "Phone number should contain only numbers. Please enter digits only.",
    };
  }

  // ===== Check if it's too short or too long ===== //
  if (phone.length < 10) {
    return {
      isValid: false,
      errorMessage:
        "Phone number is too short. Please provide a complete phone number.",
    };
  }

  if (phone.length > 15) {
    return {
      isValid: false,
      errorMessage:
        "Phone number is too long. Please provide a valid phone number.",
    };
  }

  // ===== Check for obviously fake patterns ===== //
  const fakePhonePatterns = [
    /^0000000000$/, // All zeros
    /^1111111111$/, // All ones
    /^(\d)\1{6,}$/, // Repeated digits (7+ times)
    /^2222222222$/, // Specific repeated digits
    /^0000000$/, // All zeros short
    /^1111111$/, // All ones short
  ];

  for (const pattern of fakePhonePatterns) {
    if (pattern.test(phone)) {
      return {
        isValid: false,
        errorMessage:
          "This doesn't look like a real phone number. Please provide a valid phone number.",
      };
    }
  }

  return { isValid: true };
};

// ===== Validates name format and basic structure ===== //
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      errorMessage: "Name is required. Please provide your full name.",
    };
  }

  const trimmedName = name.trim();

  // ===== Check minimum length ===== //
  if (trimmedName.length < 3) {
    return {
      isValid: false,
      errorMessage: "Name is too short. Please provide your full name.",
    };
  }

  // ===== Check for obviously fake names first ===== //
  const fakeNamePatterns = [
    /^[0-9]+$/, // All numbers
    /^[^a-zA-Z\s]+$/, // No letters
    /^(.)\1+$/, // Repeated characters
    /^test$/i,
    /^example$/i,
    /^fake$/i,
    /^dummy$/i,
    /^sample$/i,
  ];

  for (const pattern of fakeNamePatterns) {
    if (pattern.test(trimmedName)) {
      return {
        isValid: false,
        errorMessage:
          "Please provide your real name, not a test or example name.",
      };
    }
  }

  // ===== Check for proper name format (should have at least first and last name) ===== //
  const nameParts = trimmedName.split(/\s+/);
  if (nameParts.length < 2) {
    return {
      isValid: false,
      errorMessage: "Please provide your full name (first and last name).",
    };
  }

  // ===== Check if each part is reasonable length ===== //
  for (const part of nameParts) {
    if (part.length < 2) {
      return {
        isValid: false,
        errorMessage:
          "Each part of your name should be at least 2 characters long.",
      };
    }
  }

  return { isValid: true };
};

// ===== Validates all candidate information at once ===== //
export const validateCandidateInfo = (info: {
  name?: string;
  email?: string;
  phone?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (info.name !== undefined) {
    const nameValidation = validateName(info.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errorMessage || "Invalid name";
      isValid = false;
    }
  }

  if (info.email !== undefined) {
    const emailValidation = validateEmail(info.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errorMessage || "Invalid email";
      isValid = false;
    }
  }

  if (info.phone !== undefined) {
    const phoneValidation = validatePhone(info.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.errorMessage || "Invalid phone";
      isValid = false;
    }
  }

  return { isValid, errors };
};
