/* ══════════════════════════════════════════════════════
   Auth Module — localStorage-based authentication
   ══════════════════════════════════════════════════════ */

const USERS_KEY = 'eliteboost_users';
const CURRENT_USER_KEY = 'eliteboost_current_user';
const ORDERS_KEY = 'eliteboost_orders';

// ── Seed default admin account on first load ──
function seedAdmin() {
  const users = getUsers();
  const adminExists = users.some((u) => u.role === 'admin');
  if (!adminExists) {
    users.push({
      id: 'admin-001',
      name: 'Admin',
      email: 'admin@eliteboost.gg',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// ── Get all users from localStorage ──
export function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// ── Get all orders from localStorage ──
export function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
}

// ── Save a new order ──
export function saveOrder(order) {
  const orders = getOrders();
  order.id = 'ORD-' + Date.now();
  order.createdAt = new Date().toISOString();
  order.status = 'pending';
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return order;
}

// ── Get current logged-in user ──
export function getCurrentUser() {
  const userData = localStorage.getItem(CURRENT_USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

// ── Register a new user ──
export function registerUser(name, email, password) {
  const users = getUsers();

  // Check if email already exists
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  // Validate
  if (!name.trim() || name.trim().length < 2) {
    return { success: false, message: 'Name must be at least 2 characters.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Auto-login after registration
  const { password: _, ...safeUser } = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return { success: true, user: safeUser };
}

// ── Login user ──
export function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  const { password: _, ...safeUser } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return { success: true, user: safeUser };
}

// ── Logout ──
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ── Get orders for a specific user ──
export function getUserOrders(userId) {
  return getOrders().filter((o) => o.userId === userId);
}

// ── Initialize (seed admin) ──
seedAdmin();
