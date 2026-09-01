/**
 * Returns a copy of a populated user object with identity hidden if
 * privacyMode is on and the viewer isn't the user themselves.
 * Always strips privacyMode from the output so the flag itself isn't leaked.
 */
export const maskUserForViewer = (userObj, viewerId) => {
  if (!userObj) return userObj;

  const isSelf = String(userObj._id) === String(viewerId);
  const masked = { ...userObj };

  if (masked.privacyMode && !isSelf) {
    masked.fullName = "Anonymous";
    // fullName alone isn't enough — email identifies them just as well
    if ("email" in masked) masked.email = undefined;
  }

  delete masked.privacyMode;
  return masked;
};