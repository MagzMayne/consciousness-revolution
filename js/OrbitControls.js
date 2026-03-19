// RootIB: RB-20260319142113-B1BD5AA0
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
 * File: OrbitControls.js
 * Declaration ID: IP-6416A8F7-MLL28ZV2
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

// Simple OrbitControls implementation for Three.js
THREE.OrbitControls = function(camera, domElement) {
  this.camera = camera;
  this.domElement = domElement !== undefined ? domElement : document;
  
  this.enabled = true;
  this.enableDamping = false;
  this.dampingFactor = 0.05;
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.minZoom = 0;
  this.maxZoom = Infinity;
  
  // Internal state
  var scope = this;
  var rotateStart = new THREE.Vector2();
  var rotateEnd = new THREE.Vector2();
  var rotateDelta = new THREE.Vector2();
  var panStart = new THREE.Vector2();
  var panEnd = new THREE.Vector2();
  var panDelta = new THREE.Vector2();
  var dollyStart = new THREE.Vector2();
  var dollyEnd = new THREE.Vector2();
  var dollyDelta = new THREE.Vector2();
  
  var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5 };
  var state = STATE.NONE;
  
  var spherical = new THREE.Spherical();
  var sphericalDelta = new THREE.Spherical();
  var scale = 1;
  var target = new THREE.Vector3();
  var panOffset = new THREE.Vector3();
  
  this.update = function() {
    var position = scope.camera.position;
    var offset = position.clone().sub(target);
    
    if (scope.enableDamping) {
      sphericalDelta.theta *= (1 - scope.dampingFactor);
      sphericalDelta.phi *= (1 - scope.dampingFactor);
    }
    
    spherical.setFromVector3(offset);
    spherical.theta += sphericalDelta.theta;
    spherical.phi += sphericalDelta.phi;
    spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi));
    spherical.radius *= scale;
    spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
    
    target.add(panOffset);
    offset.setFromSpherical(spherical);
    position.copy(target).add(offset);
    scope.camera.lookAt(target);
    
    if (!scope.enableDamping) {
      sphericalDelta.set(0, 0, 0);
    }
    
    scale = 1;
    panOffset.set(0, 0, 0);
    
    return false;
  };
  
  function onMouseDown(event) {
    if (!scope.enabled) return;
    event.preventDefault();
    
    if (event.button === 0) {
      state = STATE.ROTATE;
      rotateStart.set(event.clientX, event.clientY);
    } else if (event.button === 2) {
      state = STATE.PAN;
      panStart.set(event.clientX, event.clientY);
    }
    
    scope.domElement.addEventListener('mousemove', onMouseMove, false);
    scope.domElement.addEventListener('mouseup', onMouseUp, false);
  }
  
  function onMouseMove(event) {
    if (!scope.enabled) return;
    event.preventDefault();
    
    if (state === STATE.ROTATE) {
      rotateEnd.set(event.clientX, event.clientY);
      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(0.01);
      sphericalDelta.theta -= 2 * Math.PI * rotateDelta.x / scope.domElement.clientHeight;
      sphericalDelta.phi -= 2 * Math.PI * rotateDelta.y / scope.domElement.clientHeight;
      rotateStart.copy(rotateEnd);
    } else if (state === STATE.PAN) {
      panEnd.set(event.clientX, event.clientY);
      panDelta.subVectors(panEnd, panStart).multiplyScalar(0.01);
      var panLeft = new THREE.Vector3();
      var panUp = new THREE.Vector3();
      panLeft.setFromMatrixColumn(scope.camera.matrix, 0);
      panUp.setFromMatrixColumn(scope.camera.matrix, 1);
      panLeft.multiplyScalar(-panDelta.x);
      panUp.multiplyScalar(panDelta.y);
      panOffset.add(panLeft).add(panUp);
      panStart.copy(panEnd);
    }
  }
  
  function onMouseUp(event) {
    if (!scope.enabled) return;
    scope.domElement.removeEventListener('mousemove', onMouseMove, false);
    scope.domElement.removeEventListener('mouseup', onMouseUp, false);
    state = STATE.NONE;
  }
  
  function onMouseWheel(event) {
    if (!scope.enabled) return;
    event.preventDefault();
    event.stopPropagation();
    
    if (event.deltaY < 0) {
      scale /= 0.95;
    } else if (event.deltaY > 0) {
      scale *= 0.95;
    }
  }
  
  function onTouchStart(event) {
    if (!scope.enabled) return;
    
    switch (event.touches.length) {
      case 1:
        state = STATE.TOUCH_ROTATE;
        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        break;
      case 2:
        state = STATE.TOUCH_DOLLY_PAN;
        var dx = event.touches[0].pageX - event.touches[1].pageX;
        var dy = event.touches[0].pageY - event.touches[1].pageY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        dollyStart.set(0, distance);
        panStart.set(
          (event.touches[0].pageX + event.touches[1].pageX) / 2,
          (event.touches[0].pageY + event.touches[1].pageY) / 2
        );
        break;
    }
  }
  
  function onTouchMove(event) {
    if (!scope.enabled) return;
    event.preventDefault();
    event.stopPropagation();
    
    switch (event.touches.length) {
      case 1:
        if (state === STATE.TOUCH_ROTATE) {
          rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
          rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(0.01);
          sphericalDelta.theta -= 2 * Math.PI * rotateDelta.x / scope.domElement.clientHeight;
          sphericalDelta.phi -= 2 * Math.PI * rotateDelta.y / scope.domElement.clientHeight;
          rotateStart.copy(rotateEnd);
        }
        break;
      case 2:
        if (state === STATE.TOUCH_DOLLY_PAN) {
          var dx = event.touches[0].pageX - event.touches[1].pageX;
          var dy = event.touches[0].pageY - event.touches[1].pageY;
          var distance = Math.sqrt(dx * dx + dy * dy);
          dollyEnd.set(0, distance);
          dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, 0.95));
          scale *= dollyDelta.y;
          dollyStart.copy(dollyEnd);
          
          panEnd.set(
            (event.touches[0].pageX + event.touches[1].pageX) / 2,
            (event.touches[0].pageY + event.touches[1].pageY) / 2
          );
          panDelta.subVectors(panEnd, panStart).multiplyScalar(0.01);
          var panLeft = new THREE.Vector3();
          var panUp = new THREE.Vector3();
          panLeft.setFromMatrixColumn(scope.camera.matrix, 0);
          panUp.setFromMatrixColumn(scope.camera.matrix, 1);
          panLeft.multiplyScalar(-panDelta.x);
          panUp.multiplyScalar(panDelta.y);
          panOffset.add(panLeft).add(panUp);
          panStart.copy(panEnd);
        }
        break;
    }
  }
  
  function onTouchEnd(event) {
    if (!scope.enabled) return;
    state = STATE.NONE;
  }
  
  // Add event listeners
  this.domElement.addEventListener('mousedown', onMouseDown, false);
  this.domElement.addEventListener('wheel', onMouseWheel, false);
  this.domElement.addEventListener('touchstart', onTouchStart, false);
  this.domElement.addEventListener('touchmove', onTouchMove, false);
  this.domElement.addEventListener('touchend', onTouchEnd, false);
  this.domElement.addEventListener('contextmenu', function(event) { event.preventDefault(); }, false);
  
  this.update();
};
