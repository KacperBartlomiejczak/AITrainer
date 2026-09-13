import { createId } from "../create-id";
import { WorkoutPhotoFileNameSchema } from "@/schemas/workout-history.schema";

describe("createId", () => {
  it("prefixes ids and keeps them unique", () => {
    const ids = Array.from({ length: 500 }, () => createId("wks"));
    expect(ids.every((id) => /^wks_[a-z0-9]+$/.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("produces ids usable in a workout photo file name", () => {
    expect(WorkoutPhotoFileNameSchema.safeParse(`${createId("wks")}-1.jpg`).success).toBe(true);
  });
});
