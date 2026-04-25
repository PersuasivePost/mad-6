import AsyncStorage from "@react-native-async-storage/async-storage";

// For Android emulator use: http://10.0.2.2:4000
// For Expo Go on phone: use your PC's LAN IP (same Wi‑Fi), e.g. http://192.168.1.34:4000
export const API_BASE_URL = "http://localhost:4000";

export async function authHeaders() {
  // Lightweight role check for employee endpoints.
  // Backend expects x-user-role: employee
  try {
    const raw = await AsyncStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    const role = String(u?.role || "").trim();
    return role ? { "x-user-role": role } : {};
  } catch {
    return {};
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const extra = await authHeaders();

  const mergedHeaders = {
    ...(options.headers || {}),
    ...extra,
  };

  return fetch(url, { ...options, headers: mergedHeaders });
}
