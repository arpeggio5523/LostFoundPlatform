import { describe, it, expect } from "vitest";
import Item from "../../../src/models/Item.js";

const validItem = (status) => ({
  title: "Black wallet",
  description: "A black wallet with a student card inside.",
  category: "Accessories",
  location: "Universiti Malaya (UM)",
  date: new Date(),
  user: "Test User",
  reportedBy: "507f1f77bcf86cd799439011",
  type: "Lost",
  status,
  reportLocation: { type: "Point", coordinates: [101.65, 3.12] },
});

describe("Item status", () => {
  // Tests that Lost and Found are accepted as valid item statuses.
  it.each(["Lost", "Found"])("accepts %s as an item status", (status) => {
    const item = new Item(validItem(status));
    expect(item.status).toBe(status);
    expect(item.validateSync()?.errors?.status).toBeUndefined();
  });

  // Tests that an item's status remains available when the document is read.
  it("retains the assigned status when an item is read from its document", () => {
    const item = new Item(validItem("Found"));
    expect(item.toObject().status).toBe("Found");
  });
});
