import * as THREE from 'three';
import { MathUtils } from '../utils/MathUtils.js';

/**
 * Cycle Rush: Kolkata Alleyways
 * Heroic Arcade Camera Controller
 *
 * Calibrated so the Rickshaw occupies 28%-35% of the screen height,
 * delivering an immediate, cinematic, visually prominent arcade experience.
 * Smoothly follows vehicle heading with zero lateral snapping.
 */
export class CameraController {
  constructor(camera, targetController) {
    this.camera = camera;
    this.target = targetController; // RickshawController

    // Heroic third-person chase offsets: close enough to admire rickshaw details,
    // positioned with clear sightline over the roof down the street.
    this.defaultOffset = new THREE.Vector3(0, 2.05, 3.75);
    this.lookAtOffset = new THREE.Vector3(0, 1.15, -4.2);

    // Dynamic state
    this.smoothPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // Trauma & Shake
    this.trauma = 0.0;
    this.shakeOffset = new THREE.Vector3();

    // Modes: 'CHASE', 'GARAGE', 'MENU'
    this.mode = 'MENU';
    this.orbitAngle = 0.0;

    // Base FOV
    this.baseFov = 62.0;
    this.boostFov = 76.0;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'GARAGE') {
      this.orbitAngle = Math.PI * 0.28;
    }
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(deltaTime) {
    if (!this.target || !this.target.mesh) return;

    if (this.mode === 'CHASE') {
      this.updateChaseCamera(deltaTime);
    } else if (this.mode === 'GARAGE') {
      this.updateGarageCamera(deltaTime);
    } else if (this.mode === 'MENU') {
      this.updateMenuCamera(deltaTime);
    }
  }

  updateChaseCamera(deltaTime) {
    const targetMesh = this.target.mesh;
    const targetPos = targetMesh.position;
    const posX = (targetPos && Number.isFinite(targetPos.x)) ? targetPos.x : 0.0;
    const posY = (targetPos && Number.isFinite(targetPos.y)) ? targetPos.y : 0.0;
    const posZ = (targetPos && Number.isFinite(targetPos.z)) ? targetPos.z : 0.0;
    const speed = (this.target && Number.isFinite(this.target.speed)) ? this.target.speed : 0.0;
    const speedRatio = Math.min(1.0, speed / 26.0);

    // 1. Dynamic FOV during boost / top speed
    const isBoosting = this.target ? this.target.isBoosting : false;
    const targetFov = isBoosting ? this.boostFov : (this.baseFov + speedRatio * 5.0);
    this.camera.fov = MathUtils.damp(this.camera.fov, targetFov, 4.5, deltaTime);
    this.camera.updateProjectionMatrix();

    // 2. Stable Camera follow aligned with true vehicle heading
    const yaw = (this.target && Number.isFinite(this.target.heading))
      ? this.target.heading
      : ((targetMesh && Number.isFinite(targetMesh.rotation.y)) ? targetMesh.rotation.y : 0.0);

    // Gently filtered camera heading eliminates whipping
    if (!Number.isFinite(this.cameraHeading)) this.cameraHeading = yaw;
    this.cameraHeading = MathUtils.damp(this.cameraHeading, yaw, 3.2, deltaTime);

    const chaseDist = 3.85 + (isBoosting ? 0.45 : 0.0);
    // Subtle lateral camera offset (reduced to 35% to prevent camera sway)
    const desiredX = posX + Math.sin(this.cameraHeading) * (chaseDist * 0.35);
    const desiredY = posY + this.defaultOffset.y + speedRatio * 0.12;
    const desiredZ = posZ + Math.cos(this.cameraHeading) * chaseDist;

    // Spring-damped smooth follow
    this.smoothPos.x = MathUtils.damp(Number.isFinite(this.smoothPos.x) ? this.smoothPos.x : desiredX, desiredX, 7.5, deltaTime);
    this.smoothPos.y = MathUtils.damp(Number.isFinite(this.smoothPos.y) ? this.smoothPos.y : desiredY, desiredY, 9.5, deltaTime);
    this.smoothPos.z = MathUtils.damp(Number.isFinite(this.smoothPos.z) ? this.smoothPos.z : desiredZ, desiredZ, 12.0, deltaTime);

    if (!Number.isFinite(this.smoothPos.x)) this.smoothPos.x = desiredX;
    if (!Number.isFinite(this.smoothPos.y)) this.smoothPos.y = desiredY;
    if (!Number.isFinite(this.smoothPos.z)) this.smoothPos.z = desiredZ;

    // 3. Trauma shake
    this.shakeOffset.set(0, 0, 0);
    if (this.trauma > 0.001) {
      const shakeAmt = this.trauma * this.trauma * 0.25;
      this.shakeOffset.x = (Math.random() - 0.5) * shakeAmt;
      this.shakeOffset.y = (Math.random() - 0.5) * shakeAmt;
      this.shakeOffset.z = (Math.random() - 0.5) * shakeAmt;
      this.trauma = Math.max(0, this.trauma - deltaTime * 2.0);
    }

    this.camera.position.copy(this.smoothPos).add(this.shakeOffset);

    // 4. Look-at target: focused steadily down the road ahead (no aggressive viewpoint swing)
    const lookDist = 7.5;
    const lookTargetX = posX - Math.sin(this.cameraHeading) * (lookDist * 0.25);
    const lookTargetY = posY + this.lookAtOffset.y;
    const lookTargetZ = posZ - Math.cos(this.cameraHeading) * lookDist;

    this.currentLookAt.x = MathUtils.damp(Number.isFinite(this.currentLookAt.x) ? this.currentLookAt.x : lookTargetX, lookTargetX, 8.5, deltaTime);
    this.currentLookAt.y = MathUtils.damp(Number.isFinite(this.currentLookAt.y) ? this.currentLookAt.y : lookTargetY, lookTargetY, 8.5, deltaTime);
    this.currentLookAt.z = MathUtils.damp(Number.isFinite(this.currentLookAt.z) ? this.currentLookAt.z : lookTargetZ, lookTargetZ, 14.0, deltaTime);

    if (!Number.isFinite(this.currentLookAt.x)) this.currentLookAt.x = lookTargetX;
    if (!Number.isFinite(this.currentLookAt.y)) this.currentLookAt.y = lookTargetY;
    if (!Number.isFinite(this.currentLookAt.z)) this.currentLookAt.z = lookTargetZ;

    this.camera.lookAt(this.currentLookAt);
  }

  updateGarageCamera(deltaTime) {
    const targetMesh = this.target ? this.target.mesh : null;
    const posX = (targetMesh && Number.isFinite(targetMesh.position.x)) ? targetMesh.position.x : 0.0;
    const posY = (targetMesh && Number.isFinite(targetMesh.position.y)) ? targetMesh.position.y : 0.0;
    const posZ = (targetMesh && Number.isFinite(targetMesh.position.z)) ? targetMesh.position.z : 0.0;
    const center = new THREE.Vector3(posX, posY + 1.05, posZ);

    // Turntable showcase around the rickshaw
    this.orbitAngle += deltaTime * 0.4;
    const dist = 3.3;
    const height = 1.45;

    const camX = center.x + Math.sin(this.orbitAngle) * dist;
    const camZ = center.z + Math.cos(this.orbitAngle) * dist;

    this.camera.position.set(camX, center.y + height, camZ);
    this.camera.lookAt(center);

    this.camera.fov = MathUtils.damp(this.camera.fov, 50.0, 4.0, deltaTime);
    this.camera.updateProjectionMatrix();
  }

  updateMenuCamera(deltaTime) {
    const targetMesh = this.target ? this.target.mesh : null;
    const posX = (targetMesh && Number.isFinite(targetMesh.position.x)) ? targetMesh.position.x : 0.0;
    const posY = (targetMesh && Number.isFinite(targetMesh.position.y)) ? targetMesh.position.y : 0.0;
    const posZ = (targetMesh && Number.isFinite(targetMesh.position.z)) ? targetMesh.position.z : 0.0;
    const center = new THREE.Vector3(posX, posY + 0.95, posZ);

    this.orbitAngle += deltaTime * 0.4;
    // Hero 3/4 rear cinematic perspective matching reference screenshot
    const swayAngle = Math.sin(this.orbitAngle * 0.5) * 0.15;
    const dist = 3.6;
    const height = 1.25;

    const camX = center.x + Math.sin(Math.PI * 0.10 + swayAngle) * dist;
    const camZ = center.z + Math.cos(Math.PI * 0.10 + swayAngle) * dist;

    this.camera.position.set(camX, center.y + height, camZ);
    this.camera.lookAt(center);

    this.camera.fov = MathUtils.damp(this.camera.fov, 54.0, 4.0, deltaTime);
    this.camera.updateProjectionMatrix();
  }

  snapToTarget() {
    if (!this.target || !this.target.mesh) return;
    const pos = this.target.mesh.position;
    const posX = Number.isFinite(pos.x) ? pos.x : 0.0;
    const posY = Number.isFinite(pos.y) ? pos.y : 0.0;
    const posZ = Number.isFinite(pos.z) ? pos.z : 0.0;
    const yaw = (this.target && Number.isFinite(this.target.heading)) ? this.target.heading : 0.0;

    const chaseDist = 3.85;
    const desiredX = posX + Math.sin(yaw) * chaseDist;
    const desiredY = posY + this.defaultOffset.y;
    const desiredZ = posZ + Math.cos(yaw) * chaseDist;

    this.smoothPos.set(desiredX, desiredY, desiredZ);
    this.camera.position.copy(this.smoothPos);

    const lookDist = 7.5;
    this.currentLookAt.set(
      posX - Math.sin(yaw) * lookDist,
      posY + this.lookAtOffset.y,
      posZ - Math.cos(yaw) * lookDist
    );
    this.camera.lookAt(this.currentLookAt);
  }
}
