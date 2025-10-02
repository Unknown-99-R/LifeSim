export default class HUD {
constructor(scene) {
this.scene = scene;
this.inventoryText = scene.add.text(10, 10, 'Wood: 0 | Crops: 0', { font: '16px Arial', fill: '#ffffff' }).setScrollFactor(0);
this.coinsText = scene.add.text(10, 28, 'Coins: 0', { font: '16px Arial', fill: '#ffffff' }).setScrollFactor(0);
this.clockText = scene.add.text(scene.scale.width - 10, 10, 'Day 1 08:00', { font: '16px Arial', fill: '#ffffff' }).setOrigin(1, 0).setScrollFactor(0);
this.energyBar = scene.add.graphics().setScrollFactor(0);


scene.scale.on('resize', () => {
this.clockText.x = scene.scale.width - 10;
this.drawEnergy(scene.energySystem.energy, scene.energySystem.max);
});
}


setInventory(wood, crops) { this.inventoryText.setText(`Wood: ${wood} | Crops: ${crops}`); }
setCoins(n) { this.coinsText.setText(`Coins: ${n}`); }
setClock(day, timeHours) {
const hh = Math.floor(timeHours).toString().padStart(2, '0');
const mm = Math.floor((timeHours % 1) * 60).toString().padStart(2, '0');
this.clockText.setText(`Day ${day} ${hh}:${mm}`);
}


drawEnergy(energy, max) {
const x = 10, y = 50, w = 204, h = 24;
const pct = energy / max;
let color = 0x00ff00; // green
if (energy < max * 0.3) color = 0xff0000; else if (energy < max * 0.6) color = 0xffff00;


this.energyBar.clear();
this.energyBar.fillStyle(0x333333, 0.8);
this.energyBar.fillRect(x, y, w, h);
this.energyBar.fillStyle(color, 1);
this.energyBar.fillRect(x + 2, y + 2, (w - 4) * pct, h - 4);
this.energyBar.lineStyle(2, 0xffffff, 1);
this.energyBar.strokeRect(x, y, w, h);
}
}