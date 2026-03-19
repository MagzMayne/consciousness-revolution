// RootIB: RB-20260319142113-D2FBD3CC
/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: STLLoader.js
 * Declaration ID: IP-55F6D8C7-MLL28ZV8
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * STLLoader - Loads STL files and parses them into BufferGeometry
 * Supports both ASCII and Binary STL formats
 */
class STLLoader {
  constructor(manager) {
    this.manager = manager || THREE.DefaultLoadingManager;
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setResponseType('arraybuffer');
    loader.load(url, (data) => {
      try {
        onLoad(this.parse(data));
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }
        this.manager.itemError(url);
      }
    }, onProgress, onError);
  }

  parse(data) {
    function isBinary(data) {
      const reader = new DataView(data);
      const numFaces = reader.getUint32(80, true);
      const expectedBytes = 80 + 4 + numFaces * 50;
      if (expectedBytes === reader.byteLength) {
        return true;
      }
      const solid = [115, 111, 108, 105, 100]; // 'solid'
      for (let i = 0; i < 5; i++) {
        if (solid[i] !== reader.getUint8(i)) return true;
      }
      return false;
    }

    function parseBinary(data) {
      const reader = new DataView(data);
      const faces = reader.getUint32(80, true);
      const dataOffset = 84;
      const faceLength = 12 * 4 + 2;

      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(faces * 3 * 3);
      const normals = new Float32Array(faces * 3 * 3);

      for (let face = 0; face < faces; face++) {
        const start = dataOffset + face * faceLength;
        const normalX = reader.getFloat32(start, true);
        const normalY = reader.getFloat32(start + 4, true);
        const normalZ = reader.getFloat32(start + 8, true);

        for (let i = 0; i < 3; i++) {
          const vertexstart = start + 12 + i * 12;
          const index = face * 9 + i * 3;

          vertices[index] = reader.getFloat32(vertexstart, true);
          vertices[index + 1] = reader.getFloat32(vertexstart + 4, true);
          vertices[index + 2] = reader.getFloat32(vertexstart + 8, true);

          normals[index] = normalX;
          normals[index + 1] = normalY;
          normals[index + 2] = normalZ;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

      return geometry;
    }

    function parseASCII(data) {
      const geometry = new THREE.BufferGeometry();
      const patternSolid = /solid([\s\S]*?)endsolid/g;
      const patternFace = /facet([\s\S]*?)endfacet/g;
      const patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source;
      const patternVertex = new RegExp('vertex' + patternFloat + patternFloat + patternFloat, 'g');
      const patternNormal = new RegExp('normal' + patternFloat + patternFloat + patternFloat, 'g');

      const vertices = [];
      const normals = [];

      const text = new TextDecoder().decode(data);
      let result;

      while ((result = patternSolid.exec(text)) !== null) {
        const solid = result[0];
        
        while ((result = patternFace.exec(solid)) !== null) {
          let vertexCountPerFace = 0;
          let normalCountPerFace = 0;

          const face = result[0];

          while ((result = patternNormal.exec(face)) !== null) {
            normals.push(
              parseFloat(result[1]),
              parseFloat(result[2]),
              parseFloat(result[3])
            );
            normalCountPerFace++;
          }

          while ((result = patternVertex.exec(face)) !== null) {
            vertices.push(
              parseFloat(result[1]),
              parseFloat(result[2]),
              parseFloat(result[3])
            );
            vertexCountPerFace++;
          }

          // Copy normal for each vertex
          if (normalCountPerFace === 1 && vertexCountPerFace === 3) {
            const n = normals.slice(-3);
            normals.push(n[0], n[1], n[2]);
            normals.push(n[0], n[1], n[2]);
          }
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

      return geometry;
    }

    return isBinary(data) ? parseBinary(data) : parseASCII(data);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = STLLoader;
}
