import GameScene from "./scenes/GameScene.js";


new Phaser.Game({
type: Phaser.AUTO,
parent: "game",
width: window.innerWidth,
height: window.innerHeight,
backgroundColor: "#6bb0ff",
pixelArt: true,
physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
scene: [GameScene]
});