// "Email once" gate for aiby.ro prompt pages.
// First visit: ask for an email, send it to Kit, then show the prompt right here.
// After that the browser remembers (aiby_sub), so every other prompt page opens straight away.
(function () {
  const KIT_FORM_ID = '10000785'; // "Prompt library" form in Kit
  const KEY = 'aiby_sub';
  const root = document.documentElement;

  function remembered() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return true; } // storage blocked: don't lock people out
  }
  function remember() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  }
  function unlock() {
    root.classList.remove('locked');
    root.classList.add('unlocked');
  }

  if (remembered()) { unlock(); return; }
  root.classList.add('locked');

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gate-form');
    if (!form) { unlock(); return; }
    const msg = document.getElementById('gate-msg');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email_address.value.trim();
      if (!email) return;
      const btn = form.querySelector('button');
      btn.disabled = true; btn.textContent = 'Opening...';
      if (!KIT_FORM_ID.startsWith('KIT_')) {
        try {
          const body = new FormData();
          body.append('email_address', email);
          await fetch('https://app.kit.com/forms/' + KIT_FORM_ID + '/subscriptions', {
            method: 'POST', body, headers: { Accept: 'application/json' }
          });
        } catch (err) { /* network hiccup: still give them the prompt */ }
      }
      remember();
      unlock();
      if (msg) msg.textContent = '';
    });
  });
})();
