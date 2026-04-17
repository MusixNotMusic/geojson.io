import * as THREE from 'three';
import { applyMercator } from '@cdyw/asd-3d';

export default class WarpModel {
  constructor(id, mesh) {
    this.id = id;

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

    window.scene.map.flyTo({
      center: center,
      zoom: 13,
      duration: 3000
    });
  }

  render() {}

  updateCameraPosition() {
    // if (this.particles) this.particles.update(this.clock.getDelta());
  }
}
