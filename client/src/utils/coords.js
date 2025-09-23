import * as THREE from "three";

/**
 * Convertit lat/lon en THREE.Vector3 sur une sphère de rayon donné.
 */
export function latLonToVector3(lat, lon, radius = 100) {
  const latR = THREE.MathUtils.degToRad(lat);
  const lonR = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.cos(latR) * Math.cos(lonR),
    radius * Math.sin(latR),
    radius * Math.cos(latR) * Math.sin(lonR)
  );
}
