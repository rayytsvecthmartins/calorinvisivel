document.addEventListener('DOMContentLoaded', () => {
  const tempInput = document.getElementById('tempInput');
  const tempVal = document.getElementById('tempVal');
  const airInput = document.getElementById('airInput');
  const airVal = document.getElementById('airVal');
  const radReadout = document.getElementById('radReadout');
  const thermalOverlay = document.getElementById('thermalOverlay');

  function updateThermalCalculations() {
    const tWater = parseFloat(tempInput.value);
    const tAir = parseFloat(airInput.value);

    tempVal.textContent = tWater;
    airVal.textContent = tAir;

    const kWater = tWater + 273.15;
    const kAir = tAir + 273.15;

    const deltaT4 = (Math.pow(kWater, 4) - Math.pow(kAir, 4)) / 1e8;
    const estimatedFlux = Math.round(deltaT4 * 2.8);

    radReadout.textContent = `${estimatedFlux} W/m²`;

    const opacityFactor = Math.min(1, estimatedFlux / 300);
    thermalOverlay.style.opacity = opacityFactor;
  }

  tempInput.addEventListener('input', updateThermalCalculations);
  airInput.addEventListener('input', updateThermalCalculations);
  updateThermalCalculations();
});
