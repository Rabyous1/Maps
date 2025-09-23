import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import earthFlyLine from 'earth-flyline';
import geojson from '@/utils/world.json';
import {
  getGlobeInitConfig,
  applyLights,
  getHighlightColor,
} from '../../../config/globeConfig';

export function useGlobeTheme(globeRef, setIsGlobeLoading, onClickOutsideCountry) {
  const [chart, setChart] = useState(null);
  const [isLight, setIsLight] = useState(() => {
    if (typeof document === 'undefined') return false;
    const match = document.cookie.match(/(^| )theme=([^;]+)/);
    const theme = match ? match[2] : document.documentElement.getAttribute('data-theme');
    return theme === 'light';
  });

  const regionGroupRef = useRef({});
  const defaultColorRef = useRef({});
  const defaultRaycastRef = useRef({});
  const currentRegionRef = useRef(null);
  const labelsRef = useRef([]);
  const globeInstanceRef = useRef(null);
  const onCountryClickRef = useRef(null);

  const setOnCountryClickHandler = useCallback((handler) => {
    onCountryClickRef.current = handler;
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsGlobeLoading(true);
      setTimeout(() => {
        setIsLight(theme === 'light');
      }, 50);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;

    const wrapper = globeRef.current;

    const timeout = setTimeout(() => {
      globeInstanceRef.current?.destroy?.();

      const config = getGlobeInitConfig(isLight);
      earthFlyLine.registerMap('world', geojson);

      const instance = earthFlyLine.init({
        dom: wrapper,
        map: 'world',
        config,
      });

      instance.options.autoRotate = true;
      instance.options.rotateSpeed = 0.01;
      instance.mainContainer.position.y = 0;

      applyLights(instance.scene, isLight);
      instance.scene.background = new THREE.Color(config.bgStyle.color);
      instance.renderer.setClearColor(config.bgStyle.color);
      wrapper.style.backgroundColor = config.bgStyle.color;

      regionGroupRef.current = {};
      defaultColorRef.current = {};
      defaultRaycastRef.current = {};

      instance.scene.traverse((obj) => {
        if (obj.isGroup && obj.name.startsWith('countryGroup-')) {
          const country = obj.name.replace('countryGroup-', '');
          regionGroupRef.current[country] = obj;

          const mesh = obj.children.find((c) => c.isMesh);
          if (mesh) {
            defaultColorRef.current[country] = mesh.material.color.getHex();
            defaultRaycastRef.current[country] = mesh.raycast.bind(mesh);

            obj.userData = { countryCode: country };
            obj.callback = () => {
              console.log('[🌍] Clicked on country:', country);
              onCountryClickRef.current?.(country);
            };
          }
        }
      });

      instance.renderer.domElement.addEventListener('click', (event) => {
        const { clientX, clientY } = event;
        const rect = instance.renderer.domElement.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const mouse = new THREE.Vector2(x, y);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, instance.camera);

        const intersects = raycaster.intersectObjects(instance.scene.children, true);
        let countryClicked = false;

        for (const intersect of intersects) {
          const parent = intersect.object?.parent;
          if (parent?.callback) {
            parent.callback();
            countryClicked = true;
            break;
          }
        }

        if (!countryClicked && typeof onClickOutsideCountry === 'function') {
          onClickOutsideCountry();
        }
      });

      globeInstanceRef.current = instance;
      setChart(instance);
      setTimeout(() => setIsGlobeLoading(false), 300);
    }, 300);

    return () => clearTimeout(timeout);
  }, [isLight, onClickOutsideCountry]);

  const highlightRegion = useCallback(
    (countryName) => {
      if (!chart) return;

      const prev = currentRegionRef.current;
      if (prev && regionGroupRef.current[prev]) {
        regionGroupRef.current[prev].traverse((c) => {
          if (c.isMesh) {
            c.material.color.setHex(defaultColorRef.current[prev]);
            c.raycast = defaultRaycastRef.current[prev];
          }
        });
      }

      const group = regionGroupRef.current[countryName];
      if (group) {
        const col = getHighlightColor(isLight);
        group.traverse((c) => {
          if (c.isMesh) {
            c.material.color.set(col);
            c.material.needsUpdate = true;
            c.raycast = () => {};
          }
        });
        currentRegionRef.current = countryName;
      } else {
        currentRegionRef.current = null;
      }
    },
    [chart, isLight]
  );

  const clearLabels = useCallback(() => {
    labelsRef.current.forEach((sprite) => {
      chart?.scene.remove(sprite);
      sprite.material.dispose();
      sprite.geometry?.dispose();
    });
    labelsRef.current = [];
  }, [chart]);

  const createLabel = useCallback(
    (text, coord) => {
      if (!chart?.scene) return;
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = '48px Arial';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(10, 5, 1);
      sprite.position.copy(coord);

      chart.scene.add(sprite);
      labelsRef.current.push(sprite);
    },
    [chart]
  );

  return {
    chart,
    isLight,
    highlightRegion,
    createLabel,
    clearLabels,
    setOnCountryClickHandler,
  };
}
