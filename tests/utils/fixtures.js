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
  reportLocation: {
    type: "Point",
    coordinates: [101.65, 3.12],
    formattedAddress: "Universiti Malaya"
  },
};

export const mockSavedDoc = (overrides = {}) => {
  const doc = {
    _id: "64f000000000000000000099",
    ...VALID_FOUND_ITEM,
    status: "Pending",
    reportedBy: FAKE_USER_ID,
    ...overrides,
  };
  Object.defineProperty(doc, 'save', {
    value: vi.fn().mockResolvedValue(doc),
    enumerable: false,
    writable: true,
    configurable: true
  });
  return doc;
};
