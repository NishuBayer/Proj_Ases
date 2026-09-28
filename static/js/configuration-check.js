(() => {
  const minimumWidth = 1024;
  // Browser chrome consumes part of the operating-system screen height.
  // The assessment itself needs a 720px logical canvas, which is supplied by
  // the expanded popup canvas; a 540px visible browser viewport is sufficient.
  const minimumViewportHeight = 540;
  const dialog = document.getElementById('configuration-check');
  const resolutionStatus = document.getElementById('resolution-status');
  const zoomStatus = document.getElementById('zoom-status');
  const resolutionDetail = document.getElementById('resolution-detail');
  const zoomDetail = document.getElementById('zoom-detail');
  const retry = document.getElementById('configuration-retry');

  function zoomIsNormal() {
    const pageScaleOK = !window.visualViewport || Math.abs(window.visualViewport.scale - 1) < 0.01;
    const baselineDpr = Number(document.body.dataset.baseDpr);
    const dprOK = !baselineDpr || Math.abs((window.devicePixelRatio || 1) - baselineDpr) < 0.02;
    return pageScaleOK && dprOK;
  }

  function statusIcon(ok) {
    return `<span class="configuration-icon ${ok ? 'ok' : 'fail'}">${ok ? '✓' : '×'}</span>`;
  }

  function evaluateConfiguration() {
    const isLauncher = document.body.dataset.popup !== 'true';
    if (isLauncher) {
      dialog.classList.add('hidden');
      return;
    }
    const requestedWidth = Number(document.body.dataset.screenWidth) || 0;
    const requestedHeight = Number(document.body.dataset.screenHeight) || 0;
    const resolutionOK = window.innerWidth >= minimumWidth && window.innerHeight >= minimumViewportHeight;
    const zoomOK = zoomIsNormal();
    const compatible = resolutionOK && zoomOK;

    resolutionStatus.innerHTML = `${statusIcon(resolutionOK)} Screen resolution`;
    zoomStatus.innerHTML = `${statusIcon(zoomOK)} Browser zoom`;
    const requestedResolution = requestedWidth && requestedHeight ? `; popup target: ${requestedWidth} × ${requestedHeight}` : '';
    resolutionDetail.textContent = resolutionOK
      ? `Screen Resolution ${window.innerWidth} × ${window.innerHeight}${requestedResolution}`
      : `Screen Resolution ${minimumWidth} × 720 or Above Required (current browser viewport: ${window.innerWidth} × ${window.innerHeight})`;
    zoomDetail.textContent = zoomOK ? 'Zoom Level (100%)' : 'Zoom Level must be 100%';
    dialog.classList.toggle('hidden', compatible);
  }

  retry.addEventListener('click', evaluateConfiguration);
  window.addEventListener('resize', evaluateConfiguration);
  window.addEventListener('orientationchange', evaluateConfiguration);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', evaluateConfiguration);
  evaluateConfiguration();
})();
