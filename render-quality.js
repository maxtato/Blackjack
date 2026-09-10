/* Native rendering stays independent of UI size and monitor scaling. */
(() => {
 let densityQuery;
 function syncPixelDensity() {
  const ratio = window.devicePixelRatio || 1;
  document.documentElement.style.setProperty('--device-pixel', `${1 / ratio}px`);
  densityQuery?.removeEventListener('change', syncPixelDensity);
  densityQuery = window.matchMedia(`(resolution: ${ratio}dppx)`);
  densityQuery.addEventListener('change', syncPixelDensity);
 }
 window.addEventListener('resize', syncPixelDensity);
 syncPixelDensity();
})();
