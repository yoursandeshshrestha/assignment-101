import type { ResumeData } from "../types";
import mammoth from "mammoth";
import { apiClient } from "./apiClient";
import { API_CONFIG } from "../config/api";

class ResumeService {
  async parseResume(file: File): Promise<ResumeData> {
    const fileType = file.type;

    if (fileType === "application/pdf") {
      return this.parsePDF(file);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      return this.parseDOCX(file);
    } else {
      throw new Error(
        "Unsupported file type. Please upload a PDF or DOCX file."
      );
    }
  }

  private async parsePDF(file: File): Promise<ResumeData> {
    try {
      // Use Python backend for PDF parsing
      return await this.parseWithBackend(file);
    } catch (error) {
      console.error("PDF parsing error:", error);
      // Fallback to manual input if backend is not available
      const fallbackData: ResumeData = {
        name: undefined,
        email: undefined,
        phone: undefined,
        text: "PDF parsing service is not available. Please provide your information manually below.",
      };
      return fallbackData;
    }
  }

  private async parseDOCX(file: File): Promise<ResumeData> {
    try {
      // Try Python backend first
      return await this.parseWithBackend(file);
    } catch (error) {
      console.warn("Backend parsing failed, using client-side parsing:", error);
      // Fallback to client-side parsing
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });

      const fullText = result.value;

      // Extract contact information from the text
      const contactInfo = this.extractContactInfo(fullText);

      return {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        text: fullText,
      };
    }
  }

  private async parseWithBackend(file: File): Promise<ResumeData> {
    const formData = new FormData();
    formData.append("file", file);

    return await apiClient.postFormData(
      API_CONFIG.ENDPOINTS.PARSE_RESUME,
      formData
    );
  }

  extractContactInfo(text: string): Partial<ResumeData> {
    // Enhanced email regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex);
    const email = emails?.[0];

    // Enhanced phone regex - supports various formats
    const phoneRegex =
      /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const phones = text.match(phoneRegex);
    const phone = phones?.[0];

    // Enhanced name extraction - look for common patterns at the beginning
    const namePatterns = [
      /^([A-Z][a-z]+ [A-Z][a-z]+)/m, // First Last
      /^([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)/m, // First Middle Last
      /^([A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+)/m, // First M. Last
    ];

    let name: string | undefined;
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        name = match[1];
        break;
      }
    }

    // If no name found at the beginning, try to find it in the first few lines
    if (!name) {
      const lines = text.split("\n").slice(0, 5);
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0 && trimmedLine.length < 50) {
          const nameMatch = trimmedLine.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/);
          if (nameMatch) {
            name = nameMatch[1];
            break;
          }
        }
      }
    }

    return {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
    };
  }
}

export const resumeService = new ResumeService();
