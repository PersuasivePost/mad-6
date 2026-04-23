import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  users: "qb_users",
  user: "user",
};

const DEFAULT_USERS = [
  {
    name: "Student",
    email: "student@example.com",
    role: "student",
    password: "123456",
  },
  {
    name: "Employee",
    email: "employee@example.com",
    role: "employee",
    password: "123456",
  },
  {
    name: "Manager",
    email: "manager@example.com",
    role: "manager",
    password: "123456",
  },
];

async function readUsers() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.users);
  if (!raw) return [...DEFAULT_USERS];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_USERS];
  } catch {
    return [...DEFAULT_USERS];
  }
}

async function writeUsers(users) {
  await AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export async function signIn(email, password) {
  const e = normalizeEmail(email);
  if (!e || !password) throw new Error("INVALID_CREDENTIALS");

  const users = await readUsers();
  const user = users.find((u) => normalizeEmail(u.email) === e);
  if (!user) throw new Error("USER_NOT_FOUND");
  if (String(password) !== String(user.password))
    throw new Error("INVALID_CREDENTIALS");

  const sessionUser = { name: user.name, email: user.email, role: user.role };
  await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(sessionUser));
  return sessionUser;
}

export async function signUp(name, email, password, role = "student") {
  const n = String(name || "").trim();
  const e = normalizeEmail(email);
  const p = String(password || "");
  const r = ["student", "employee", "manager"].includes(role)
    ? role
    : "student";

  if (!n || !e || p.length < 6) throw new Error("INVALID_INPUT");

  const users = await readUsers();
  const exists = users.some((u) => normalizeEmail(u.email) === e);
  if (exists) throw new Error("EMAIL_EXISTS");

  const newUser = { name: n, email: e, role: r, password: p };
  await writeUsers([...users, newUser]);

  const sessionUser = {
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
  await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(sessionUser));
  return sessionUser;
}

export async function logout() {
  // Requirement said: clear AsyncStorage.
  await AsyncStorage.clear();
}

export async function getCurrentUser() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
