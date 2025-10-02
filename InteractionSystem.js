export class InteractionSystem {
constructor(scene, radius = 64) {
this.scene = scene;
this.radius = radius;
this.text = scene.add.text(12, scene.scale.height - 30, '', { font: '16px Arial', fill: '#ffffff' })
.setScrollFactor(0)
.setDepth(9999);
this.hide();


scene.scale.on('resize', () => {
this.text.y = scene.scale.height - 30;
});
}


setPrompt(msg) { this.text.setText(msg).setVisible(true); }
hide() { this.text.setVisible(false); }


within(a, b) {
return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) <= this.radius;
}
}


export default InteractionSystem;