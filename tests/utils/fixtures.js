import { FAKE_USER_ID } from "./buildTestApp.js";

export const VALID_FOUND_ITEM = {
  title: "Found black wallet",
  description: "Found near the library entrance, contains a student ID.",
  category: "Accessories",
  type: "Found",
  location: "Universiti Malaya (UM)",
  date: "2026-08-20",
  user: "Jane Doe",
  images: [],
};

export const mockSavedDoc = (overrides = {}) => ({
  _id: "64f000000000000000000099",
  ...VALID_FOUND_ITEM,
  status: "Approved",
  reportedBy: FAKE_USER_ID,
  ...overrides,
});