import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePhone,
  validateName,
  validateCandidateInfo,
} from "../../utils/validation";
import { validationTestCases } from "../../test-utils/mockData";

describe("validateEmail", () => {
  it("should validate correct email addresses", () => {
    validationTestCases.validEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
  });

  it("should reject invalid email addresses", () => {
    validationTestCases.invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });

  it("should reject empty or whitespace-only emails", () => {
    const testCases = ["", "   ", "\t", "\n"];
    testCases.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("required");
    });
  });

  it("should reject emails with invalid format", () => {
    const invalidFormats = ["user@", "@domain.com", "user@domain"];

    invalidFormats.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("valid email address");
    });
  });

  it("should reject fake/test email patterns", () => {
    const fakeEmails = [
      "test@test.com",
      "fake@fake.com",
      "dummy@dummy.com",
      "sample@sample.com",
    ];

    fakeEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("real email address");
    });
  });

  it("should reject keyboard mashing patterns", () => {
    const keyboardMashEmails = [
      "qwerty@domain.com",
      "asdfgh@domain.com",
      "zxcvbn@domain.com",
    ];

    keyboardMashEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("real email address");
    });
  });

  it("should reject emails without vowels", () => {
    const noVowelEmails = ["bcdfgh@domain.com", "qwrty@domain.com"];

    noVowelEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("real email address");
    });
  });
});

describe("validatePhone", () => {
  it("should validate correct phone numbers", () => {
    validationTestCases.validPhones.forEach((phone) => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
  });

  it("should reject invalid phone numbers", () => {
    validationTestCases.invalidPhones.forEach((phone) => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });

  it("should reject empty or whitespace-only phones", () => {
    const testCases = ["", "   ", "\t", "\n"];
    testCases.forEach((phone) => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("required");
    });
  });

  it("should reject non-numeric phone numbers", () => {
    const nonNumericPhones = [
      "123-456-7890",
      "123.456.7890",
      "123 456 7890",
      "abc1234567",
      "123456789a",
    ];

    nonNumericPhones.forEach((phone) => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("only numbers");
    });
  });

  it("should reject phones that are too short", () => {
    const shortPhones = ["123", "123456"];
    shortPhones.forEach((phone) => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("too short");
    });
  });

  it("should reject phones that are too long", () => {
    const longPhones = ["1234567890123456", "12345678901234567890"];
    longPhones.forEach((phone) => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("too long");
    });
  });

  it("should reject fake phone patterns", () => {
    const fakePhones = [
      "0000000000", // All zeros
      "1111111111", // All ones
      "2222222222", // Repeated digits
    ];

    fakePhones.forEach((phone) => {
      const result = validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("real phone number");
    });
  });
});

describe("validateName", () => {
  it("should validate correct names", () => {
    validationTestCases.validNames.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
  });

  it("should reject invalid names", () => {
    validationTestCases.invalidNames.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });

  it("should reject empty or whitespace-only names", () => {
    const testCases = ["", "   ", "\t", "\n"];
    testCases.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("required");
    });
  });

  it("should reject names that are too short", () => {
    const shortNames = ["a", "ab"];
    shortNames.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("too short");
    });
  });

  it("should reject single names (require first and last name)", () => {
    const singleNames = ["John", "Jane", "Smith"];
    singleNames.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("full name");
    });
  });

  it("should reject fake/test names", () => {
    const fakeNames = ["test", "example", "fake", "dummy", "sample"];
    fakeNames.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("real name");
    });
  });

  it("should reject names with invalid patterns", () => {
    const invalidPatterns = [
      "john123", // Contains numbers
      "aaaaaa", // Repeated characters
      "123456", // All numbers
    ];

    invalidPatterns.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });

  it("should reject names with parts that are too short", () => {
    const shortPartNames = ["J D", "A B", "X Y"];
    shortPartNames.forEach((name) => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("2 characters long");
    });
  });
});

describe("validateCandidateInfo", () => {
  it("should validate complete candidate information", () => {
    const validInfo = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "1234567890",
    };

    const result = validateCandidateInfo(validInfo);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("should validate partial candidate information", () => {
    const partialInfo = {
      name: "John Doe",
      email: "john.doe@example.com",
    };

    const result = validateCandidateInfo(partialInfo);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("should return errors for invalid information", () => {
    const invalidInfo = {
      name: "John", // Too short
      email: "invalid-email", // Invalid format
      phone: "123", // Too short
    };

    const result = validateCandidateInfo(invalidInfo);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.phone).toBeDefined();
  });

  it("should handle empty candidate information", () => {
    const emptyInfo = {};

    const result = validateCandidateInfo(emptyInfo);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("should handle undefined values", () => {
    const undefinedInfo = {
      name: undefined,
      email: undefined,
      phone: undefined,
    };

    const result = validateCandidateInfo(undefinedInfo);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("should accumulate multiple errors", () => {
    const multipleErrorsInfo = {
      name: "test", // Fake name
      email: "fake@fake.com", // Fake email
      phone: "0000000000", // Fake phone
    };

    const result = validateCandidateInfo(multipleErrorsInfo);
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(3);
  });
});
