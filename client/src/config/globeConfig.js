// config/globeConfig.js
import * as THREE from "three";

export const LIGHT_THEME = {
  bgColor:        "#E8E8E8",
  earthColor:     "#DEDEDE",
  areaColor:      "#B2B5FF",
  lineColor:      "#909199",
  spriteColor:    "#797eff",
  pathColor:      "#cd79ff",
  flyLineColor:   "#cd79ff",
  scatterColor:   "#cd79ff",
  hoverAreaColor: "#797EFF",
  hoverOpacity:   1,
  highlightColor: "#EAC05C",
  lightPositions: [[20,0,10],[0,30,10],[0,-30,10],[-20,0,10]]
};

export const DARK_THEME = {
  bgColor:        "#0d0f21",
  earthColor:     "#13162c",
  areaColor:      "#2e3564",
  lineColor:      "#797eff",
  spriteColor:    "#797eff",
  pathColor:      "#cd79ff",
  flyLineColor:   "#cd79ff",
  scatterColor:   "#cd79ff",
  hoverAreaColor: "#797EFF",
  hoverOpacity:   1,
  highlightColor: "#FFD166",
  lightPositions: [[10,10,10]]
};

/**
 * Génère la config pour earthFlyLine.init() en fonction du thème.
 */
export function getGlobeInitConfig(isLight) {
  const theme = isLight ? LIGHT_THEME : DARK_THEME;
  return {
    bgStyle:         { color: theme.bgColor, opacity: 1 },
    earth:           { color: theme.earthColor },
    mapStyle:        { areaColor: theme.areaColor, lineColor: theme.lineColor },
    spriteStyle:     { color: theme.spriteColor },
    pathStyle:       { color: theme.pathColor },
    flyLineStyle:    { color: theme.flyLineColor },
    scatterStyle:    { color: theme.scatterColor },
    hoverRegionStyle:{ areaColor: theme.hoverAreaColor, opacity: theme.hoverOpacity, show: true },
    regions:         {}
  };
}

/**
 * Applique les lights sur la scène, avec garde-fou si scene est undefined.
 */
export function applyLights(scene, isLight) {
  if (!scene || typeof scene.traverse !== "function") {
    console.warn("applyLights: scene non disponible, éclairage ignoré");
    return;
  }
  // supprime les anciennes lights
  const lightsToRemove = [];
  scene.traverse(o => {
    if (o.isDirectionalLight) lightsToRemove.push(o);
  });
  lightsToRemove.forEach(light => scene.remove(light));
  // ajoute selon le thème
  const positions = isLight ? LIGHT_THEME.lightPositions : DARK_THEME.lightPositions;
  positions.forEach(([x, y, z]) => {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(x, y, z);
    scene.add(light);
  });
}

/**
 * Retourne la couleur de surlignage selon le thème.
 */
export function getHighlightColor(isLight) {
  return isLight ? LIGHT_THEME.highlightColor : DARK_THEME.highlightColor;
}
