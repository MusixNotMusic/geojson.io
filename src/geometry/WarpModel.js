import * as THREE from 'three';
import { applyMercator } from '@cdyw/asd-3d';

export default class WarpModel {
  constructor(id, mesh) {
    this.id = id;
    this.name = id;
    this.visible = true;

    this.initMesh(mesh);
  }

  initMesh(mesh) {
    this.group = new THREE.Group();

    let { center, scale } = mesh.userData;

    center = center || [104, 30, 0];
    scale = scale || 1e-3;

    if (center) {
      const m = applyMercator({ x: center[0], y: center[1], z: center[2] });
      this.group.position.set(m.x, m.y, m.z);
    }

    if (scale) {
      this.group.scale.set(1 / scale, 1 / scale, 1 / scale);
    }

    this.group.add(mesh);

    this._storeOriginalTransform();

    window.scene.map.flyTo({
      center: center,
      zoom: 13,
      duration: 3000
    });
  }

  _storeOriginalTransform() {
    this._originalPosition = this.group.position.clone();
    this._originalScale = this.group.scale.clone();
    this._originalRotation = this.group.rotation.clone();
  }

  setVisible(visible) {
    this.visible = visible;
    if (this.group) {
      this.group.visible = visible;
    }
    if (window.scene && window.scene.map) {
      window.scene.map.triggerRepaint();
    }
  }

  setPosition(x, y, z) {
    if (this.group) {
      this.group.position.set(x, y, z);
    }
    if (window.scene && window.scene.map) {
      window.scene.map.triggerRepaint();
    }
  }

  setScale(x, y, z) {
    if (this.group) {
      this.group.scale.set(x, y, z);
    }
    if (window.scene && window.scene.map) {
      window.scene.map.triggerRepaint();
    }
  }

  setRotation(x, y, z) {
    if (this.group) {
      this.group.rotation.set(x, y, z);
    }
    if (window.scene && window.scene.map) {
      window.scene.map.triggerRepaint();
    }
  }

  getParams() {
    if (!this.group) return null;
    return {
      position: {
        x: this.group.position.x,
        y: this.group.position.y,
        z: this.group.position.z
      },
      scale: {
        x: this.group.scale.x,
        y: this.group.scale.y,
        z: this.group.scale.z
      },
      rotation: {
        x: this.group.rotation.x,
        y: this.group.rotation.y,
        z: this.group.rotation.z
      }
    };
  }

  dispose() {
    if (this.group) {
      this.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.group.clear();
    }
  }

  render() {}

  updateCameraPosition() {
    // if (this.particles) this.particles.update(this.clock.getDelta());
  }
}
