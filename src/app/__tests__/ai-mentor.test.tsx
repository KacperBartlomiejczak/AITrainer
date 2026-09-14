import React from "react";
import { render, screen } from "@testing-library/react-native";
import AiMentorScreen from "../(tabs)/ai-mentor";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe("AiMentorScreen (placeholder)", () => {
  it("renders the AI mentor title and a 'coming soon' message", async () => {
    await render(<AiMentorScreen />);

    expect(screen.getByText("AI Mentor")).toBeTruthy();
    expect(screen.getByText(/Wkrótce/i)).toBeTruthy();
  });
});
