/* ══════════════════════════════════════════════════════
   Main JavaScript — Game Piloting Website
   ══════════════════════════════════════════════════════ */

import './styles.css';
import { getCurrentUser, loginUser, registerUser, logoutUser, saveOrder, getUserOrders } from './auth.js';

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initFaqAccordion();
  initScrollReveal();
  initStatsCounter();
  initContactForm();
  initAuth();
  initOrderGating();
  initFeedback();
});

/* ══════════════════════════════════════════════════════
   1. Sticky Navbar — Changes background on scroll
   ══════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('bg-gaming-darker/95', 'backdrop-blur-lg', 'shadow-lg', 'shadow-gaming-purple/5');
      navbar.classList.remove('bg-transparent');
    } else {
      navbar.classList.remove('bg-gaming-darker/95', 'backdrop-blur-lg', 'shadow-lg', 'shadow-gaming-purple/5');
      navbar.classList.add('bg-transparent');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ══════════════════════════════════════════════════════
   2. Mobile Menu Toggle
   ══════════════════════════════════════════════════════ */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');

    if (isOpen) {
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    } else {
      mobileMenu.classList.remove('hidden');
      menuIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
    }
  });

  // Close mobile menu when a nav link is clicked
  mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    });
  });
}

/* ══════════════════════════════════════════════════════
   3. Smooth Scroll Navigation
   ══════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });
}

/* ══════════════════════════════════════════════════════
   4. FAQ Accordion
   ══════════════════════════════════════════════════════ */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-toggle');

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const icon = button.querySelector('.faq-icon');
      const isOpen = !content.classList.contains('hidden');

      // Close all other FAQ items
      faqButtons.forEach((otherBtn) => {
        const otherContent = otherBtn.nextElementSibling;
        const otherIcon = otherBtn.querySelector('.faq-icon');
        if (otherBtn !== button) {
          otherContent.classList.add('hidden');
          otherContent.style.maxHeight = '0';
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      // Toggle the clicked item
      if (isOpen) {
        content.classList.add('hidden');
        content.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
      } else {
        content.classList.remove('hidden');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

/* ══════════════════════════════════════════════════════
   5. Scroll Reveal (Intersection Observer)
   ══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ══════════════════════════════════════════════════════
   6. Stats Counter Animation
   ══════════════════════════════════════════════════════ */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');

  const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const suffix = element.dataset.suffix || '';

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(easeOut * (end - start) + start).toLocaleString() + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.target);
          animateValue(entry.target, 0, target, 2000);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((stat) => observer.observe(stat));
}

/* ══════════════════════════════════════════════════════
   7. Contact / Order Form
   ══════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      openAuthModal('login');
      return;
    }

    const name = form.querySelector('#form-name');
    const email = form.querySelector('#form-email');
    const game = form.querySelector('#form-game');
    const message = form.querySelector('#form-message');

    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.error-msg').forEach((el) => el.remove());
    form.querySelectorAll('.border-red-500').forEach((el) => {
      el.classList.remove('border-red-500');
      el.classList.add('border-gaming-border');
    });

    // Validate game selection
    if (!game.value) {
      showError(game, 'Please select a game');
      isValid = false;
    }

    // Validate message
    if (!message.value.trim()) {
      showError(message, 'Please describe your order');
      isValid = false;
    }

    if (isValid) {
      // Save order
      const order = saveOrder({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        name: name.value || user.name,
        email: email.value || user.email,
        game: game.value,
        message: message.value,
      });

      // Show success
      const successDiv = document.createElement('div');
      successDiv.className = 'mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center';
      successDiv.innerHTML = `✅ Order <strong>${order.id}</strong> placed successfully! We'll get back to you within 24 hours.`;
      form.appendChild(successDiv);
      form.reset();

      // Pre-fill name/email for next order
      name.value = user.name;
      email.value = user.email;

      setTimeout(() => successDiv.remove(), 5000);
    }
  });

  function showError(input, message) {
    input.classList.remove('border-gaming-border');
    input.classList.add('border-red-500');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-msg text-red-400 text-sm mt-1';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
  }
}

/* ══════════════════════════════════════════════════════
   8. Auth System — Modal, Login, Register, Logout
   ══════════════════════════════════════════════════════ */
function initAuth() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  // ── Open modal triggers ──
  document.getElementById('nav-login-btn')?.addEventListener('click', () => openAuthModal('login'));
  document.getElementById('nav-register-btn')?.addEventListener('click', () => openAuthModal('register'));
  document.querySelector('.mobile-login-btn')?.addEventListener('click', () => openAuthModal('login'));
  document.querySelector('.mobile-register-btn')?.addEventListener('click', () => openAuthModal('register'));

  // ── Close modal ──
  document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal-overlay')?.addEventListener('click', closeAuthModal);

  // ── Tab switching ──
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
  });
  document.querySelectorAll('.switch-to-register').forEach((btn) => {
    btn.addEventListener('click', () => switchAuthTab('register'));
  });
  document.querySelectorAll('.switch-to-login').forEach((btn) => {
    btn.addEventListener('click', () => switchAuthTab('login'));
  });

  // ── Login form submit ──
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    const result = loginUser(email, password);
    if (result.success) {
      closeAuthModal();
      updateAuthUI();
      document.getElementById('login-form').reset();
      errorDiv.classList.add('hidden');
    } else {
      errorDiv.textContent = result.message;
      errorDiv.classList.remove('hidden');
    }
  });

  // ── Register form submit ──
  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const errorDiv = document.getElementById('register-error');

    if (password !== confirm) {
      errorDiv.textContent = 'Passwords do not match.';
      errorDiv.classList.remove('hidden');
      return;
    }

    const result = registerUser(name, email, password);
    if (result.success) {
      closeAuthModal();
      updateAuthUI();
      document.getElementById('register-form').reset();
      errorDiv.classList.add('hidden');
    } else {
      errorDiv.textContent = result.message;
      errorDiv.classList.remove('hidden');
    }
  });

  // ── Logout ──
  document.getElementById('nav-logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('mobile-logout-btn')?.addEventListener('click', handleLogout);

  // ── User dropdown toggle ──
  document.getElementById('user-dropdown-btn')?.addEventListener('click', () => {
    document.getElementById('user-dropdown-menu')?.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const container = document.getElementById('user-dropdown-container');
    const menu = document.getElementById('user-dropdown-menu');
    if (container && menu && !container.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

  // ── Initialize UI state on load ──
  updateAuthUI();
}

function handleLogout() {
  logoutUser();
  updateAuthUI();
  // Close mobile menu if open
  document.getElementById('mobile-menu')?.classList.add('hidden');
  document.getElementById('menu-icon')?.classList.remove('hidden');
  document.getElementById('close-icon')?.classList.add('hidden');
}

/* ── Open auth modal ── */
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  switchAuthTab(tab);
}

/* ── Close auth modal ── */
function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
  // Clear errors
  document.getElementById('login-error')?.classList.add('hidden');
  document.getElementById('register-error')?.classList.add('hidden');
}

/* ── Switch between login/register tabs ── */
function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const modalTitle = document.getElementById('auth-modal-title');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('border-gaming-purple', 'text-white');
    tabLogin.classList.remove('border-transparent', 'text-gaming-muted');
    tabRegister.classList.remove('border-gaming-purple', 'text-white');
    tabRegister.classList.add('border-transparent', 'text-gaming-muted');
    modalTitle.textContent = 'Welcome Back';
  } else {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabRegister.classList.add('border-gaming-purple', 'text-white');
    tabRegister.classList.remove('border-transparent', 'text-gaming-muted');
    tabLogin.classList.remove('border-gaming-purple', 'text-white');
    tabLogin.classList.add('border-transparent', 'text-gaming-muted');
    modalTitle.textContent = 'Create Account';
  }
}

/* ── Update navbar UI based on auth state ── */
function updateAuthUI() {
  const user = getCurrentUser();

  // Desktop
  const guestNav = document.getElementById('nav-auth-guest');
  const userNav = document.getElementById('nav-auth-user');
  const userName = document.getElementById('nav-user-name');
  const userAvatar = document.getElementById('nav-user-avatar');
  const adminLink = document.getElementById('nav-admin-link');

  // Mobile
  const mobileGuest = document.getElementById('mobile-auth-guest');
  const mobileUser = document.getElementById('mobile-auth-user');
  const mobileUserName = document.getElementById('mobile-user-name');
  const mobileAdminLink = document.getElementById('mobile-admin-link');

  // Contact form pre-fill
  const formName = document.getElementById('form-name');
  const formEmail = document.getElementById('form-email');

  if (user) {
    // Logged in
    guestNav?.classList.add('hidden');
    userNav?.classList.remove('hidden');
    userNav?.classList.add('flex');
    mobileGuest?.classList.add('hidden');
    mobileUser?.classList.remove('hidden');
    mobileUser?.classList.add('flex');

    const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = initials;
    if (mobileUserName) mobileUserName.textContent = `👤 ${user.name}`;

    // Show admin link if admin
    if (user.role === 'admin') {
      adminLink?.classList.remove('hidden');
      mobileAdminLink?.classList.remove('hidden');
    } else {
      adminLink?.classList.add('hidden');
      mobileAdminLink?.classList.add('hidden');
    }

    // Pre-fill contact form
    if (formName) formName.value = user.name;
    if (formEmail) formEmail.value = user.email;
  } else {
    // Logged out
    guestNav?.classList.remove('hidden');
    guestNav?.classList.add('flex');
    userNav?.classList.add('hidden');
    userNav?.classList.remove('flex');
    mobileGuest?.classList.remove('hidden');
    mobileGuest?.classList.add('flex');
    mobileUser?.classList.add('hidden');
    mobileUser?.classList.remove('flex');

    adminLink?.classList.add('hidden');
    mobileAdminLink?.classList.add('hidden');

    if (formName) formName.value = '';
    if (formEmail) formEmail.value = '';
  }
}

/* ══════════════════════════════════════════════════════
   9. Order Button Gating — Require login to order
   ══════════════════════════════════════════════════════ */
function initOrderGating() {
  document.querySelectorAll('.order-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (!user) {
        openAuthModal('register');
        return;
      }

      // Scroll to contact/order section
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
        const targetPosition = contactSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });

        // Pre-select game if data-game attribute exists
        const game = btn.dataset.game;
        if (game) {
          const gameSelect = document.getElementById('form-game');
          if (gameSelect) gameSelect.value = game;
        }
      }
    });
  });
}

/* ══════════════════════════════════════════════════════
   10. Feedback System — Modal and Form Handling
   ══════════════════════════════════════════════════════ */
function initFeedback() {
  const feedbackBtn = document.getElementById('feedback-btn');
  const feedbackModal = document.getElementById('feedback-modal');
  const feedbackClose = document.getElementById('feedback-modal-close');
  const feedbackOverlay = document.getElementById('feedback-modal-overlay');
  const feedbackForm = document.getElementById('feedback-form');

  if (!feedbackBtn || !feedbackModal) return;

  // Open modal
  feedbackBtn.addEventListener('click', () => {
    feedbackModal.classList.remove('hidden');
    feedbackModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  });

  // Close modal
  const closeModal = () => {
    feedbackModal.classList.add('hidden');
    feedbackModal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  feedbackClose?.addEventListener('click', closeModal);
  feedbackOverlay?.addEventListener('click', closeModal);

  // Form submit
  feedbackForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const section = document.getElementById('feedback-section').value;
    const message = document.getElementById('feedback-message').value;

    console.log('Feedback Received:', { section, message, timestamp: new Date().toISOString() });

    // Show success state
    const originalContent = feedbackForm.innerHTML;
    feedbackForm.innerHTML = `
      <div class="text-center py-8">
        <div class="text-4xl mb-4">✅</div>
        <h3 class="text-xl font-bold mb-2">Feedback Received!</h3>
        <p class="text-gaming-muted text-sm">Thank you for your input. We'll review this shortly.</p>
      </div>
    `;

    setTimeout(() => {
      closeModal();
      // Reset form after closing
      setTimeout(() => {
        feedbackForm.innerHTML = originalContent;
        // Re-attach listener if we were to keep the app running without reload
        // Since it's a simple site, we just re-init everything if needed or assume reload
        initFeedback(); 
      }, 500);
    }, 2000);
  });
}

// Make openAuthModal available globally for edge cases
window.openAuthModal = openAuthModal;
