import { cn } from "../utils";

describe("cn utility", () => {
  it("should merge simple class names", () => {
    expect(cn("bg-black", "text-white")).toBe("bg-black text-white");
  });

  it("should resolve tailwind conflicts properly", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("should handle conditional and falsy classes", () => {
    const isPrimary = true;
    const isSecondary = false;
    expect(cn("base-class", isPrimary && "text-primary", isSecondary && "text-secondary", undefined, null)).toBe(
      "base-class text-primary"
    );
  });
});
