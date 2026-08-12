const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthUser(user, token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getAuthUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function getCurrentUserId() {
  const user = getAuthUser();
  return user?.id || user?._id || null;
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// export function isOwner(item) {
//   const userId = getCurrentUserId();
//   if (!userId || !item) return false;

//   const ownerId = item.owner || item.ownerId || item.userId;
//   if (!ownerId) return false;

//   return String(ownerId) === String(userId);
// }

export function isOwner(item) {
  const userId = getCurrentUserId();
  if (!userId || !item) return false;

  const ownerId =
    item.owner?._id ||
    item.owner ||
    item.ownerId ||
    item.userId ||
    item.reportedBy?._id ||
    item.reportedBy;

  if (!ownerId) return false;

  return String(ownerId) === String(userId);
}

export function isAdmin() {
  const user = getAuthUser();
  if (!user) return false;

  const role = user.role || user.user?.role || "";
  return String(role).toLowerCase() === "admin";
}

export function canEditItem(item) {
  return isOwner(item) || isAdmin();
}
