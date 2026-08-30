/**
 * unit/utils/privacy.test.js
 * Converted from node:test to Jest.
 *
 * This is the core "anonymous messaging" identity-masking test:
 * maskUserForViewer hides a private user's name/email from anyone
 * except themselves.
 *
 * NOTE: the original messageSecurity.test.js also had three placeholder
 * tests (sendMessage stores encrypted text / join_conversation rejects
 * non-participant / startConversation rejects self-message) that only
 * asserted `assert.ok(true)` — they didn't actually exercise any code.
 * Those are intentionally NOT carried over here. Once messageController.js
 * and the socket handler in server.js are shared, real tests for those
 * three behaviors should replace them in unit/controllers/ and
 * integration/routes/ respectively.
 */

import { maskUserForViewer } from "../../../src/utils/privacy.js";

describe("privacy — maskUserForViewer", () => {
  const privateUser = {
    _id: "private-user",
    fullName: "Private User",
    email: "private@example.com",
    privacyMode: true,
  };

  test("reveals full identity when the viewer is the user themselves", () => {
    expect(maskUserForViewer(privateUser, "private-user")).toEqual({
      _id: "private-user",
      fullName: "Private User",
      email: "private@example.com",
    });
  });

  test("hides identity (name -> 'Anonymous', email -> undefined) from other viewers", () => {
    expect(maskUserForViewer(privateUser, "other-user")).toEqual({
      _id: "private-user",
      fullName: "Anonymous",
      email: undefined,
    });
  });
});