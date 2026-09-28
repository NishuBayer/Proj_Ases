(() => {
  const popupMode = document.body.dataset.popup === 'true';
  if (popupMode) return;

  const width = Math.max(1024, Math.min(screen.availWidth || 1280, window.screen.width || 1280));
  const height = Math.max(720, Math.min(screen.availHeight || 800, window.screen.height || 800));
  const features = [
    'popup=yes',
    `width=${width}`,
    `height=${height}`,
    'left=0',
    'top=0',
    'resizable=yes',
    'scrollbars=no',
    'toolbar=no',
    'menubar=no',
    'location=no',
    'status=no',
  ].join(',');

  function openAssessmentWindow() {
    const target = new URL(window.location.href);
    target.searchParams.set('popup', '1');
    target.searchParams.set('screen_width', String(screen.availWidth || screen.width || window.innerWidth));
    target.searchParams.set('screen_height', String(screen.availHeight || screen.height || window.innerHeight));
    target.searchParams.set('base_dpr', String(window.devicePixelRatio || 1));
    const popup = window.open(target.toString(), 'assessment_center_window', features);
    if (popup) {
      popup.focus();
      document.body.classList.add('popup-launch-pending');
    } else {
      document.body.classList.add('popup-blocked');
    }
  }

  // Browser security rules permit popup creation only as a direct user action.
  // The initial page therefore provides a single launch control rather than
  // attempting an unreliable automatic window.open() on page load.
  document.addEventListener('click', event => {
    const launch = event.target.closest('[data-launch-popup]');
    if (!launch) return;
    event.preventDefault();
    openAssessmentWindow();
  });
})();
