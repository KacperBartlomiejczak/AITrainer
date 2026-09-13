import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { WorkoutPhotoSourceSheet } from "../WorkoutPhotoSourceSheet";

async function renderSheet(overrides: Partial<React.ComponentProps<typeof WorkoutPhotoSourceSheet>> = {}) {
  const props: React.ComponentProps<typeof WorkoutPhotoSourceSheet> = {
    visible: true,
    title: "Trening zapisany 💪",
    description: "Dodaj zdjęcie (opcjonalnie)",
    hasPhoto: false,
    isSaving: false,
    errorMessage: null,
    dismissLabel: "Pomiń",
    onSelectSource: jest.fn(),
    onDismiss: jest.fn(),
    ...overrides,
  };
  const rendered = await render(<WorkoutPhotoSourceSheet {...props} />);
  return { props, ...rendered };
}

describe("WorkoutPhotoSourceSheet", () => {
  it("lets the user choose between the camera and the gallery", async () => {
    const { props } = await renderSheet();

    expect(screen.getByText("Trening zapisany 💪")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("photo-source-camera")));
    await act(async () => fireEvent.press(screen.getByTestId("photo-source-library")));

    expect(props.onSelectSource).toHaveBeenNthCalledWith(1, "camera");
    expect(props.onSelectSource).toHaveBeenNthCalledWith(2, "library");
  });

  it("can be skipped because the photo is optional", async () => {
    const { props } = await renderSheet();

    await act(async () => fireEvent.press(screen.getByText("Pomiń")));
    expect(props.onDismiss).toHaveBeenCalled();
  });

  it("does not offer removing a photo when the workout has none", async () => {
    await renderSheet({ hasPhoto: false, onRemovePhoto: jest.fn() });
    expect(screen.queryByTestId("photo-remove")).toBeNull();
  });

  it("offers removing the photo when the workout has one", async () => {
    const onRemovePhoto = jest.fn();
    await renderSheet({ hasPhoto: true, onRemovePhoto });
    await act(async () => fireEvent.press(screen.getByTestId("photo-remove")));
    expect(onRemovePhoto).toHaveBeenCalled();
  });

  it("shows the error message and blocks actions while saving", async () => {
    const { props } = await renderSheet({ isSaving: true, errorMessage: "Nie udało się zapisać zdjęcia." });

    expect(screen.getByText("Nie udało się zapisać zdjęcia.")).toBeTruthy();
    expect(screen.getByTestId("photo-sheet-saving")).toBeTruthy();
    await act(async () => fireEvent.press(screen.getByTestId("photo-source-camera")));
    expect(props.onSelectSource).not.toHaveBeenCalled();
  });
});
