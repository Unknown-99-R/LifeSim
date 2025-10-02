export class EnergySystem {
constructor(scene, max = 100) {
this.scene = scene;
this.max = max;
this.energy = max;
}
canSpend(cost) { return this.energy >= cost; }
spend(cost) {
if (!this.canSpend(cost)) return false;
this.energy -= cost;
this.energy = Math.max(0, this.energy);
this.scene.hud.drawEnergy(this.energy, this.max);
return true;
}
restoreFull() {
this.energy = this.max;
this.scene.hud.drawEnergy(this.energy, this.max);
}
set(v) {
this.energy = Phaser.Math.Clamp(v, 0, this.max);
this.scene.hud.drawEnergy(this.energy, this.max);
}
}


export default EnergySystem;