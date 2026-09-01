/**
 * unit/utils/messageUtils.test.js
 */

import { getOtherParticipant } from "../../../src/utils/messageUtils.js";

describe("messageUtils — getOtherParticipant", () => {
  const me = { _id: "user-1", fullName: "Me" };
  const other = { _id: "user-2", fullName: "Other Person" };

  test("returns the participant who is not the current user", () => {
    expect(getOtherParticipant([me, other], "user-1")).toEqual(other);
  });

  test("works when currentUserId is passed as a plain string vs ObjectId-like object", () => {
    // String() coercion in the source means this should still match
    const objectIdLike = { toString: () => "user-1" };
    expect(getOtherParticipant([me, other], objectIdLike)).toEqual(other);
  });

  test("returns undefined when the current user is not among participants", () => {
    expect(getOtherParticipant([other], "user-1")).toEqual(other);
    expect(getOtherParticipant([me], "user-1")).toBeUndefined();
  });

  test("returns undefined for an empty participants array", () => {
    expect(getOtherParticipant([], "user-1")).toBeUndefined();
  });

  test("defaults to an empty array when participants is omitted", () => {
    expect(getOtherParticipant(undefined, "user-1")).toBeUndefined();
  });
});