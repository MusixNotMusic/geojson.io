import * as THREE from 'three';
import { Base3D } from '@cdyw/asd-3d';

export default class Cube {
  constructor(id) {
    this.id = id;

    this.initMesh();
  }

  initMesh() {
    const size = 1e2 * 5;
    const cube = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshNormalMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      opacity: 0.5
    });

    const mesh = new THREE.Mesh(cube, material);

    this.mesh = new Base3D.WGS84Object3D(mesh);

    this.mesh.WGS84Position = new THREE.Vector3(
      100.14884,
      30.029775,
      6000 * 1.1
    );

    this.mesh.translateZ(size + 10);
    this.mesh.rotateX(Math.PI / 2);

    this.mesh.add(new THREE.AxesHelper(size));
    this.mesh.add(new THREE.GridHelper(size, 50));

    window.scene.map.flyTo({
      center: [100.14884, 30.029775],
      zoom: 15,
      duration: 3000
    });
  }

  render() {}

  updateCameraPosition() {
    // if (this.particles) this.particles.update(this.clock.getDelta());
  }
}
