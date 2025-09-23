import * as THREE from "three";
import { latLonToVector3 } from "../../../utils/coords";

const MIN_DISTANCE_KM = 200;

const displayedPinsMap = new Map();
const proximityPinsMap = new Map();

function haversineDistance(loc1, loc2) {
  const R = 6371;
  const dLat = THREE.MathUtils.degToRad(loc2.lat - loc1.lat);
  const dLon = THREE.MathUtils.degToRad(loc2.lon - loc1.lon);
  const lat1 = THREE.MathUtils.degToRad(loc1.lat);
  const lat2 = THREE.MathUtils.degToRad(loc2.lat);

  const a = Math.sin(dLat / 2) ** 2 +
            Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isTooClose(existingPins, newLoc) {
  return existingPins.some(pin => {
    const distance = haversineDistance(pin, newLoc);
    return distance < MIN_DISTANCE_KM;
  });
}

export function resetChart(
  chart,
  initialScaleRef,
  initialRotationRef,
  clearLabels,
  highlightRegion
) {
  if (!chart) return;

  if (chart._flyRaf) {
    cancelAnimationFrame(chart._flyRaf);
    chart._flyRaf = null;
  }

  chart.options.autoRotate = true;
  chart.options.rotateSpeed = 0.01;

  if (initialScaleRef.current) {
    chart.mainContainer.scale.copy(initialScaleRef.current);
  }

  if (initialRotationRef.current) {
    chart.mainContainer.rotation.copy(initialRotationRef.current);
  }

  clearLabels();
  chart.clearData?.();
  highlightRegion(null);
  chart.camera.lookAt(0, 0, 0);
  displayedPinsMap.clear();
}

export function flyToLocation({
  chart,
  initialScaleRef,
  label,
  loc,
  country,
  reference, // ✅ on ajoute une référence unique
  clearLabels,
  highlightRegion,
  createLabel,
  setSelectedCountry,
  duration = 1600,
}) {
  if (!chart) return;

  if (chart._flyRaf) {
    cancelAnimationFrame(chart._flyRaf);
    chart._flyRaf = null;
  }

  chart.mainContainer.scale.copy(initialScaleRef.current);
  clearLabels();
  chart.clearData?.();

  chart.options.autoRotate = false;
  chart.options.rotateSpeed = 0;

  const pinId = `${reference}-pin`; // ✅ unique par référence

  const existingPins = displayedPinsMap.get(country) || [];
  const existingProximityPins = proximityPinsMap.get(country) || [];

  const alreadyExists = existingPins.some(p => p.id === pinId);

  const tooClose = isTooClose(existingProximityPins, loc);
  const canAddPin = !alreadyExists && !tooClose;

  if (canAddPin) {
    chart.addData("point", [{
      id: pinId,
      lat: loc.lat,
      lon: loc.lon,
      style: { color: "#F83D46", size: 4 }
    }]);

    const updatedDisplay = [...existingPins, { id: pinId, lat: loc.lat, lon: loc.lon }];
    displayedPinsMap.set(country, updatedDisplay);

    const updatedProximity = [...existingProximityPins, { id: pinId, lat: loc.lat, lon: loc.lon }];
    proximityPinsMap.set(country, updatedProximity);

    console.log(`[Globe] ✅ Pin ajouté pour ${country} (${updatedDisplay.length})`);
  } else {
    if (alreadyExists) {
      console.warn(`[Globe] ❌ Le pin "${pinId}" (ref=${reference}) existe déjà.`);
    } else if (tooClose) {
      console.warn(`[Globe] ❌ Trop proche d’un autre pin (< ${MIN_DISTANCE_KM} km).`);
    }
  }

  setSelectedCountry(country);

  const startRot = chart.mainContainer.rotation.clone();
  const targetRot = new THREE.Euler(
    THREE.MathUtils.degToRad(loc.lat) * 0.5,
    -THREE.MathUtils.degToRad(loc.lon) - 1.5,
    0
  );

  const startQuat = new THREE.Quaternion().setFromEuler(startRot);
  const targetQuat = new THREE.Quaternion().setFromEuler(targetRot);

  const startScale = chart.mainContainer.scale.clone();
  const targetScale = startScale.clone().multiplyScalar(1.6);

  const t0 = performance.now();

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function animate() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easeInOut(t);

    const currentQuat = new THREE.Quaternion();
    currentQuat.copy(startQuat).slerp(targetQuat, easedT);
    chart.mainContainer.quaternion.copy(currentQuat);

    chart.mainContainer.scale.lerpVectors(startScale, targetScale, easedT);
    chart.camera.lookAt(0, 0, 0);

    if (t < 1) {
      chart._flyRaf = requestAnimationFrame(animate);
    }
  }

  chart._flyRaf = requestAnimationFrame(animate);

  highlightRegion(country);
  const coord = latLonToVector3(loc.lat, loc.lon, 100);
  createLabel(label, coord);
}

export function reapplyPins(chart) {
  if (!chart) return;

  for (const [country, pins] of proximityPinsMap.entries()) {
    pins.forEach(pin => {
      chart.addData("point", [{
        id: pin.id,
        lat: pin.lat,
        lon: pin.lon,
        style: { color: "#F83D46", size: 4 }
      }]);
    });
  }

  console.log("[Globe] 🔁 Pins réappliqués après changement de thème.");
}
