/**
 * Oxomsoft Contact Form Handler
 * Real-time validation & async AJAX submission with user feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const alertContainer = document.getElementById('formAlert');

  if (!form) return;

  function showAlert(message, type = 'success') {
    if (!alertContainer) return;

    const isSuccess = type === 'success';
    alertContainer.className = `p-4 rounded-xl mb-6 text-sm font-medium transition-all duration-300 ${
      isSuccess
        ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
        : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
    }`;

    alertContainer.innerHTML = `
      <div class="flex items-start gap-3">
        <i class="fa-solid ${isSuccess ? 'fa-circle-check text-emerald-400' : 'fa-triangle-exclamation text-rose-400'} text-lg mt-0.5"></i>
        <div>
          <div class="font-semibold">${isSuccess ? 'Message Sent Successfully!' : 'Action Required'}</div>
          <div class="text-xs opacity-90 mt-1">${message}</div>
        </div>
      </div>
    `;
    alertContainer.classList.remove('hidden');
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset alert
    if (alertContainer) alertContainer.classList.add('hidden');

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Basic Client validation
    if (!data.name || data.name.trim().length < 2) {
      showAlert('Please enter your full name (minimum 2 characters).', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      showAlert('Please enter a valid email address.', 'error');
      return;
    }

    if (!data.subject || data.subject.trim().length < 3) {
      showAlert('Please select or enter a valid subject / service interest.', 'error');
      return;
    }

    if (!data.message || data.message.trim().length < 10) {
      showAlert('Please provide project details in your message (at least 10 characters).', 'error');
      return;
    }

    // Set Loading State
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Transmitting Message...</span>
      </span>
    `;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert(result.message || 'Your inquiry has been submitted! Our engineering team will review it and reply within 24 hours.', 'success');
        form.reset();
      } else {
        const errorMsg = result.errors && result.errors.length > 0
          ? result.errors.map(err => err.msg).join(' ')
          : (result.message || 'Submission error. Please check your inputs and try again.');
        showAlert(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Contact submit network error:', err);
      showAlert('Unable to reach server. Please check your connection or contact us directly at support@oxomsoft.com.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
});
