import {
  NavTabIdSchema,
  NavItemSchema,
  NavTabListSchema,
} from "../navigation.schema";

describe("navigation.schema", () => {
  it("validates valid nav tab ids", () => {
    expect(NavTabIdSchema.safeParse("home").success).toBe(true);
    expect(NavTabIdSchema.safeParse("workouts").success).toBe(true);
    expect(NavTabIdSchema.safeParse("profile").success).toBe(true);
    expect(NavTabIdSchema.safeParse("unknown").success).toBe(false);
  });

  it("validates valid nav item object", () => {
    const item = {
      id: "home",
      label: "Start",
      iconName: "Home",
      route: "/",
      testID: "pill-nav-home",
    };
    const parsed = NavItemSchema.safeParse(item);
    expect(parsed.success).toBe(true);
  });

  it("fails on invalid iconName or missing fields", () => {
    const invalidItem = {
      id: "home",
      label: "",
      iconName: "InvalidIcon",
      route: "/",
      testID: "pill-nav-home",
    };
    const parsed = NavItemSchema.safeParse(invalidItem);
    expect(parsed.success).toBe(false);
  });

  it("validates exactly 3 items in NavTabListSchema", () => {
    const threeItems = [
      { id: "home", label: "Start", iconName: "Home", route: "/", testID: "pill-nav-home" },
      { id: "workouts", label: "Trening", iconName: "Dumbbell", route: "/workouts", testID: "pill-nav-workouts" },
      { id: "profile", label: "Profil", iconName: "User", route: "/user-profile", testID: "pill-nav-profile" },
    ];
    expect(NavTabListSchema.safeParse(threeItems).success).toBe(true);

    // 2 items should fail
    expect(NavTabListSchema.safeParse(threeItems.slice(0, 2)).success).toBe(false);
  });
});
