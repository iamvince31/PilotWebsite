/* ══════════════════════════════════════════════════════
   Admin Dashboard JavaScript
   ══════════════════════════════════════════════════════ */

import './styles.css';
import { getCurrentUser, getUsers, getOrders, logoutUser, getUserOrders } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
});

/* ── Check if current user is admin ── */
function checkAdminAccess() {
  const user = getCurrentUser();

  if (!user || user.role !== 'admin') {
    document.getElementById('access-denied')?.classList.remove('hidden');
    document.getElementById('admin-dashboard')?.classList.add('hidden');
    return;
  }

  document.getElementById('access-denied')?.classList.add('hidden');
  document.getElementById('admin-dashboard')?.classList.remove('hidden');

  loadStats();
  loadUsersTable();
  loadOrdersTable();
  initAdminTabs();
  initAdminLogout();
}

/* ══════════════════════════════════════════════════════
   Stats Overview
   ══════════════════════════════════════════════════════ */
function loadStats() {
  const users = getUsers().filter((u) => u.role !== 'admin');
  const orders = getOrders();
  const pending = orders.filter((o) => o.status === 'pending');
  const completed = orders.filter((o) => o.status === 'completed');

  document.getElementById('stat-users').textContent = users.length;
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-pending').textContent = pending.length;
  document.getElementById('stat-completed').textContent = completed.length;
}

/* ══════════════════════════════════════════════════════
   Users Table
   ══════════════════════════════════════════════════════ */
function loadUsersTable() {
  const users = getUsers();
  const tbody = document.getElementById('users-table-body');
  const emptyDiv = document.getElementById('users-empty');

  const customers = users.filter((u) => u.role !== 'admin');

  if (customers.length === 0) {
    emptyDiv?.classList.remove('hidden');
    return;
  }

  emptyDiv?.classList.add('hidden');
  tbody.innerHTML = '';

  customers.forEach((user) => {
    const orders = getUserOrders(user.id);
    const date = new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    const row = document.createElement('tr');
    row.className = 'border-b border-gaming-border/50 hover:bg-white/5 transition-colors';
    row.innerHTML = `
      <td class="p-4 font-medium">${escapeHtml(user.name)}</td>
      <td class="p-4 text-gaming-cyan">${escapeHtml(user.email)}</td>
      <td class="p-4"><span class="px-2 py-1 rounded-full text-xs bg-gaming-cyan/10 text-gaming-cyan">${user.role}</span></td>
      <td class="p-4 text-gaming-muted">${date}</td>
      <td class="p-4"><span class="text-gaming-purple-light font-semibold">${orders.length}</span></td>
    `;
    tbody.appendChild(row);
  });
}

/* ══════════════════════════════════════════════════════
   Orders Table
   ══════════════════════════════════════════════════════ */
function loadOrdersTable() {
  const orders = getOrders();
  const tbody = document.getElementById('orders-table-body');
  const emptyDiv = document.getElementById('orders-empty');

  if (orders.length === 0) {
    emptyDiv?.classList.remove('hidden');
    return;
  }

  emptyDiv?.classList.add('hidden');
  tbody.innerHTML = '';

  // Show newest orders first
  const sortedOrders = [...orders].reverse();

  sortedOrders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const gameLabels = {
      valorant: 'Valorant', lol: 'League of Legends', apex: 'Apex Legends',
      overwatch: 'Overwatch 2', fortnite: 'Fortnite', other: 'Other',
    };

    const statusColors = {
      pending: 'bg-yellow-500/10 text-yellow-400',
      'in-progress': 'bg-blue-500/10 text-blue-400',
      completed: 'bg-green-500/10 text-green-400',
      cancelled: 'bg-red-500/10 text-red-400',
    };

    const row = document.createElement('tr');
    row.className = 'border-b border-gaming-border/50 hover:bg-white/5 transition-colors';
    row.innerHTML = `
      <td class="p-4 font-mono text-xs text-gaming-purple-light">${order.id}</td>
      <td class="p-4">
        <div class="font-medium text-sm">${escapeHtml(order.userName || order.name)}</div>
        <div class="text-xs text-gaming-muted">${escapeHtml(order.userEmail || order.email)}</div>
      </td>
      <td class="p-4">${gameLabels[order.game] || order.game}</td>
      <td class="p-4 text-gaming-muted text-xs max-w-[200px] truncate">${escapeHtml(order.message)}</td>
      <td class="p-4 text-gaming-muted text-xs">${date}</td>
      <td class="p-4"><span class="px-2 py-1 rounded-full text-xs ${statusColors[order.status] || statusColors.pending}">${order.status}</span></td>
      <td class="p-4">
        <select class="order-status-select bg-gaming-dark border border-gaming-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-gaming-purple" data-order-id="${order.id}">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="in-progress" ${order.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Add status change listeners
  document.querySelectorAll('.order-status-select').forEach((select) => {
    select.addEventListener('change', (e) => {
      updateOrderStatus(e.target.dataset.orderId, e.target.value);
    });
  });
}

/* ── Update order status in localStorage ── */
function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus;
    localStorage.setItem('eliteboost_orders', JSON.stringify(orders));
    loadStats(); // Refresh stat counts
    loadOrdersTable(); // Refresh table
  }
}

/* ══════════════════════════════════════════════════════
   Admin Tabs
   ══════════════════════════════════════════════════════ */
function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = {
    users: document.getElementById('panel-users'),
    orders: document.getElementById('panel-orders'),
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tab styles
      tabs.forEach((t) => {
        t.classList.remove('bg-gaming-purple/20', 'text-gaming-purple-light');
        t.classList.add('text-gaming-muted');
      });
      tab.classList.add('bg-gaming-purple/20', 'text-gaming-purple-light');
      tab.classList.remove('text-gaming-muted');

      // Show target panel, hide others
      Object.entries(panels).forEach(([key, panel]) => {
        if (key === target) {
          panel?.classList.remove('hidden');
        } else {
          panel?.classList.add('hidden');
        }
      });
    });
  });
}

/* ── Admin Logout ── */
function initAdminLogout() {
  document.getElementById('admin-logout')?.addEventListener('click', () => {
    logoutUser();
    window.location.href = '/';
  });
}

/* ── HTML Escape Utility ── */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
