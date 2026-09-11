import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "../button";
import { Card, CardTitle, CardDescription } from "../card";
import { Badge } from "../badge";
import { Progress } from "../progress";
import { Avatar, AvatarFallback } from "../avatar";
import { Separator } from "../separator";
import { H1, TextMuted } from "../typography";

describe("Shadcn UI Components for React Native", () => {
  describe("Button", () => {
    it("renders button label and handles onPress event", async () => {
      const onPressMock = jest.fn();
      await render(<Button onPress={onPressMock}>Rozpocznij Trening</Button>);

      const buttonText = screen.getByText("Rozpocznij Trening");
      expect(buttonText).toBeTruthy();

      fireEvent.press(buttonText);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it("does not trigger onPress when disabled", async () => {
      const onPressMock = jest.fn();
      await render(
        <Button disabled onPress={onPressMock}>
          Zablokowany
        </Button>
      );

      fireEvent.press(screen.getByText("Zablokowany"));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe("Card", () => {
    it("renders card with title and description", async () => {
      await render(
        <Card>
          <CardTitle>Trening Dnia</CardTitle>
          <CardDescription>FBW A - Klatka + Triceps</CardDescription>
        </Card>
      );

      expect(screen.getByText("Trening Dnia")).toBeTruthy();
      expect(screen.getByText("FBW A - Klatka + Triceps")).toBeTruthy();
    });
  });

  describe("Badge", () => {
    it("renders PR badge correctly", async () => {
      await render(<Badge variant="pr">🏆 Rekord Życiowy</Badge>);
      expect(screen.getByText("🏆 Rekord Życiowy")).toBeTruthy();
    });
  });

  describe("Progress", () => {
    it("renders progress bar with clamped value", async () => {
      await render(<Progress value={75} testID="custom-progress" />);
      const progressBar = screen.getByTestId("custom-progress");
      expect(progressBar.props.accessibilityValue.now).toBe(75);
    });
  });

  describe("Avatar", () => {
    it("renders avatar fallback initials", async () => {
      await render(
        <Avatar>
          <AvatarFallback>KB</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText("KB")).toBeTruthy();
    });
  });

  describe("Separator & Typography", () => {
    it("renders separator and typography elements", async () => {
      await render(
        <>
          <H1>Cześć, Kacper!</H1>
          <Separator />
          <TextMuted>Wersja 1.0.0</TextMuted>
        </>
      );
      expect(screen.getByText("Cześć, Kacper!")).toBeTruthy();
      expect(screen.getByText("Wersja 1.0.0")).toBeTruthy();
    });
  });
});
