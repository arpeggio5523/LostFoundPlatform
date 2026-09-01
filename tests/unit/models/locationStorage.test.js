import { describe, it, expect } from "vitest";
import Item from "../../../src/models/Item.js";

const validItem = (reportLocation) => ({
  title: "Black wallet",
  description: "A black wallet with a student card inside.",
  category: "Accessories",
  location: "Universiti Malaya (UM)",
  date: new Date(),
  user: "Test User",
  reportedBy: "507f1f77bcf86cd799439011",
  type: "Lost",
  status: "Approved",
  reportLocation,
});

describe("Item location storage", () => {
  // Checks that a valid map location can be stored by the Item model.
  it("accepts a valid location tag", () => {
    const item = new Item(validItem({
      type: "Point",
      coordinates: [101.65, 3.12],
      formattedAddress: "Library area",
    }));

    expect(item.validateSync()?.errors?.reportLocation).toBeUndefined();
    expect(item.toObject().reportLocation.coordinates).toEqual([101.65, 3.12]);
  });

  // Checks that invalid coordinate data is not accepted for storage.
  it("rejects a location tag with invalid coordinates", () => {
    const item = new Item(validItem({
      type: "Point",
      coordinates: [250, 3.12],
      formattedAddress: "Invalid area",
    }));

    // Mongoose reports coordinate validation errors on the nested coordinates path.
    expect(item.validateSync()?.errors?.["reportLocation.coordinates"]).toBeDefined();
  });
});
