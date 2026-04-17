import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import WarpModel from '../../geometry/WarpModel.js';

export function readGlb(file, closed, context) {
  // 创建一个指向该文件的临时 URL
  const reader = new FileReader();
  reader.onload = function (e) {
    const contents = e.target.result; // 这是一个 ArrayBuffer
    const loader = new GLTFLoader();

    // 使用 .parse 而不是 .load，它不需要 URL，因此不受 connect-src 限制
    loader.parse(
      contents,
      '',
      (gltf) => {
        const wrap = new WarpModel(file.name, gltf.scene);
        window.scene.add(wrap);

        if (context && context.data) {
          context.data.addModel({
            id: wrap.id,
            name: wrap.name,
            visible: wrap.visible,
            instance: wrap
          });
        }

        closed();
      },
      (error) => {
        console.error(error);
      }
    );
  };
  reader.readAsArrayBuffer(file);
}
