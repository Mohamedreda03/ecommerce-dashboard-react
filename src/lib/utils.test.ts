import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class strings and deduplicates conflicting Tailwind classes", () => {
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
      expect(cn("p-2", "p-4")).toBe("p-4");
      expect(cn("p-2", undefined, "p-4", null, false)).toBe("p-4");
    });
  });

  describe("formatCurrency", () => {
    it("formats numbers as USD currency", () => {
      expect(formatCurrency(79.99)).toBe("$79.99");
    });
    it("formats string numbers as USD currency", () => {
      expect(formatCurrency("79.99")).toBe("$79.99");
    });
  });

  describe("formatDate", () => {
    it("returns a non-empty localized string", () => {
      const result = formatDate("2024-01-01T12:00:00Z");
      expect(result).toBe("Jan 1, 2024");
    });
  });
});
