// SpriteFactory.js — reusable procedural pixel textures for Phaser 3
// Usage from a Scene: import * as SF from "../systems/SpriteFactory.js";
//
// === Character (16x16 px) ===
// Generates 2 walking frames for each direction (down/left/right/up).
// Palette is customizable.
//
export function makeCharacterFrames(scene, { baseKey = "ch", palette = {} } = {}) {
  const COLORS = {
    outline: 0x0e0f13,
    skin: 0xffdab9,
    hair: 0x4b3621,
    shirt: 0xffa07a,
    pants: 0x87cefa,
    shoe: 0x1b1b1b,
    blush: 0xff69b4,
    eyeHighlight: 0xffffff,
    ...palette,
  };
  const makeCharFrame = (key, dir, step) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const px = 1;
    const R = (x, y, w, h, c, a = 1) => { g.fillStyle(c, a); g.fillRect(x * px, y * px, w * px, h * px); };
    const S = (x, y, w, h, c = COLORS.outline) => { g.lineStyle(px, c, 1); g.strokeRect(x * px, y * px, w * px, h * px); };
    const bob = step ? 1 : 0;
    const hx = 0;
    const hy = 0 + bob;
    const by = 7 + bob;
    const armUp = step ? 0 : 1;
    let lSwing = 0, rSwing = 0;
    if (dir === 'left' || dir === 'right') {
      lSwing = (dir === 'left' ? (step ? 2 : 0) : (step ? 0 : 2));
      rSwing = (dir === 'left' ? (step ? 0 : 2) : (step ? 2 : 0));
    } else {
      lSwing = armUp;
      rSwing = 1 - armUp;
    }
    const armLY = by + lSwing;
    const armRY = by + rSwing;
    const py = by + 4;
    const stride = (dir === 'left' || dir === 'right') ? (step ? 2 : -2) : (step ? 1 : -1);
    const ly = py + 3;
    const leftLegOffset = step ? 0 : stride / 2;
    const rightLegOffset = step ? stride / 2 : 0;
    const leftLegY = ly + leftLegOffset;
    const rightLegY = ly + rightLegOffset;
    const sy = ly + 2;
    const leftShoeY = sy + leftLegOffset;
    const rightShoeY = sy + rightLegOffset;

    // Head
    R(0, hy+0,1,1,0x5b4b3e);
    R(1, hy+0,1,1,0x2c2522);
    R(2, hy+0,1,1,0x5f4e46);
    R(11, hy+0,1,1,0x4a3f48);
    R(12, hy+0,1,1,0x4d3a32);
    R(13, hy+0,1,1,0x695542);
    R(14, hy+0,1,1,0x302332);
    R(0, hy+1,1,1,0x564749);
    R(1, hy+1,1,1,0xb59175);
    R(2, hy+1,1,1,0xc89971);
    R(3, hy+1,1,1,0x6d5858);
    R(4, hy+1,1,1,0x754a36);
    R(5, hy+1,1,1,0x734735);
    R(6, hy+1,1,1,0x764537);
    R(7, hy+1,1,1,0x764739);
    R(8, hy+1,2,1,0x74463c);
    R(10, hy+1,1,1,0x8d6152);
    R(11, hy+1,1,1,0x533231);
    R(12, hy+1,1,1,0xc5936b);
    R(13, hy+1,1,1,0xad8c6b);
    R(14, hy+1,1,1,0x292236);
    R(2, hy+2,1,1,0x8d7455);
    R(3, hy+2,1,1,0x9a694d);
    R(4, hy+2,1,1,0x764439);
    R(5, hy+2,1,1,0x744438);
    R(6, hy+2,1,1,0x7a473d);
    R(7, hy+2,1,1,0x7a453d);
    R(8, hy+2,1,1,0x724036);
    R(9, hy+2,1,1,0x774539);
    R(10, hy+2,1,1,0x764135);
    R(11, hy+2,1,1,0xc0845a);
    R(12, hy+2,1,1,0x6d5542);
    R(13, hy+2,1,1,0x28253e);
    R(3, hy+3,1,1,0x432c33);
    R(4, hy+3,1,1,0x764541);
    R(5, hy+3,1,1,0x592620);
    R(6, hy+3,1,1,0x773d33);
    R(7, hy+3,1,1,0x7a3b33);
    R(8, hy+3,1,1,0x5c2e21);
    R(9, hy+3,1,1,0x77473a);
    R(10, hy+3,1,1,0x754536);
    R(11, hy+3,1,1,0x78403e);
    R(3, hy+4,1,1,0x4f3b3f);
    R(4, hy+4,1,1,0xb98374);
    R(5, hy+4,1,1,0xd8544d);
    R(6, hy+4,1,1,0xd30404);
    R(7, hy+4,1,1,0xce2e2e);
    R(8, hy+4,1,1,0xc57b6f);
    R(9, hy+4,1,1,0xae796d);
    R(10, hy+4,1,1,0x885649);
    R(11, hy+4,1,1,0x72413d);
    R(3, hy+5,1,1,0x664c52);
    R(4, hy+5,1,1,0xa66d5d);
    let ex1 = 5, ex2 = 8;
    if (dir === 'left') { ex1--; ex2--; }
    if (dir === 'right') { ex1++; ex2++; }
    R(ex1 + 1, hy+5,1,1,0x000000); // Adjusted for the single pixel in row5 (original at 6 and 8)
    R(7, hy+5,1,1,0xb16356);
    R(10, hy+5,1,1,0xa66c61);
    R(11, hy+5,1,1,0x72403b);
    R(3, hy+6,1,1,0x413132);
    R(4, hy+6,1,1,0xd3afa1);
    R(ex1, hy+6,2,1,0x000000); // row6 eyes
    R(7, hy+6,1,1,0x8b6e55);
    R(ex2, hy+6,2,1,0x000000);
    R(10, hy+6,1,1,0x9f6b5f);
    R(11, hy+6,1,1,0x6f3f40);

    // Body central
    R(3, by,1,1,0x382c35);
    R(4, by,1,1,0xefe2d1);
    R(5, by,1,1,0x536161);
    R(6, by,1,1,0xeac19c);
    R(7, by,1,1,0x746b61);
    R(8, by,1,1,0xc8cfcc);
    R(9, by,1,1,0xca9977);
    R(10, by,1,1,0x906c5e);
    R(11, by,1,1,0x382b27);
    R(3, by+1,1,1,0x442639);
    R(4, by+1,1,1,0x8e6b65);
    R(5, by+1,1,1,0xb5806f);
    R(6, by+1,1,1,0xb4886e);
    R(7, by+1,1,1,0xb28871);
    R(8, by+1,1,1,0xa2735c);
    R(9, by+1,1,1,0x895845);
    R(10, by+1,1,1,0x573329);
    R(11, by+1,1,1,0x422620);
    R(3, by+2,1,1,0x38262e);
    R(4, by+2,1,1,0x724b48);
    R(5, by+2,1,1,0xb07971);
    R(6, by+2,2,1,0xbc867d);
    R(8, by+2,1,1,0xbb857c);
    R(9, by+2,2,1,0x856060);
    R(11, by+2,1,1,0x482824);
    R(3, by+3,1,1,0x292935);
    R(4, by+3,1,1,0x704745);
    R(5, by+3,1,1,0xb67f6f);
    R(6, by+3,1,1,0xc0897e);
    R(7, by+3,1,1,0xc0897f);
    R(8, by+3,1,1,0xbe867e);
    R(9, by+3,2,1,0x856060);
    R(11, by+3,1,1,0x442527);
    R(4, by+4,1,1,0x5f3f46);
    R(5, by+4,1,1,0xad786d);
    R(6, by+4,1,1,0xbd877c);
    R(7, by+4,1,1,0xb78477);
    R(8, by+4,1,1,0xb38777);
    R(9, by+4,2,1,0x856060);
    R(4, by+5,1,1,0x3f222a);
    R(5, by+5,1,1,0x552e27);
    R(6, by+5,1,1,0x7f5753);
    R(7, by+5,1,1,0x43323f);
    R(8, by+5,1,1,0x3e2323);
    R(9, by+5,1,1,0x43231d);
    R(10, by+5,1,1,0x3d231f);

    // Left arm
    R(1, armLY,2,1,0x5c4242);
    R(1, armLY+1,2,1,0x5c4242);
    R(1, armLY+2,1,1,0x29435a);
    R(2, armLY+2,1,1,0x312b34);
    R(3, armLY+3,1,1,0x292935);

    // Right arm
    R(12, armRY,2,1,0x5c4242);
    R(12, armRY+1,2,1,0x5c4242);
    R(12, armRY+2,1,1,0x382729);
    R(13, armRY+2,1,1,0x3d374e);
    R(11, armRY+3,1,1,0x442527);

    // Left leg
    R(4, leftLegY,1,1,0x6c5a47);
    R(5, leftLegY,2,1,0x4e300e);
    R(4, leftLegY+1,1,1,0x6c5a47);
    R(5, leftLegY+1,2,1,0x4e300e);
    R(4, leftLegY+2,3,1,0x6c5a47);

    // Right leg
    R(8, rightLegY,2,1,0x4e300e);
    R(10, rightLegY,1,1,0x6c5a47);
    R(8, rightLegY+1,2,1,0x4e300e);
    R(10, rightLegY+1,1,1,0x6c5a47);
    R(8, rightLegY+2,3,1,0x6c5a47);

    g.generateTexture(key,16*px,16*px);
    g.destroy();
  };
  const dirs = ['down','left','right','up'];
  dirs.forEach(dir=>{
    makeCharFrame(`${baseKey}_${dir}_0`, dir, 0);
    makeCharFrame(`${baseKey}_${dir}_1`, dir, 1);
    scene.anims.create({
      key: `walk_${dir}`,
      frames: [{ key: `${baseKey}_${dir}_0` }, { key: `${baseKey}_${dir}_1` }],
      frameRate: 6,
      repeat: -1
    });
  });
  // Return a handy map of keys you can use for sprites
  return {
    idleDown: `${baseKey}_down_0`,
    idleLeft: `${baseKey}_left_0`,
    idleRight:`${baseKey}_right_0`,
    idleUp: `${baseKey}_up_0`
  };
}
//
// === Tree (16x16 px) ===
//
export function makeTreeTexture(scene, { key = "pixelTree" } = {}) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const px = 1;
  // Trunk
  g.fillStyle(0x654321, 1); g.fillRect(6*px, 9*px, 4*px, 7*px);
  g.fillStyle(0x8B6914, 1); g.fillRect(6*px, 9*px, 2*px, 7*px);
  // Foliage layers
  g.fillStyle(0x2D5016, 1); g.fillRect(5*px, 7*px, 6*px, 3*px); g.fillRect(4*px, 4*px, 8*px, 3*px); g.fillRect(6*px, 1*px, 4*px, 3*px);
  g.fillStyle(0x3A7C1F, 1); g.fillRect(5*px, 7*px, 5*px, 2*px); g.fillRect(4*px, 4*px, 7*px, 2*px); g.fillRect(6*px, 1*px, 3*px, 2*px);
  g.fillStyle(0x4CAF50, 1); g.fillRect(5*px, 7*px, 3*px, 1*px); g.fillRect(4*px, 4*px, 4*px, 1*px); g.fillRect(6*px, 1*px, 2*px, 1*px);
  // Berries
  g.fillStyle(0xFF6B6B, 0.8); g.fillRect(5*px, 6*px, 1*px, 1*px); g.fillRect(9*px, 5*px, 1*px, 1*px);
  g.generateTexture(key, 16*px, 16*px);
  g.destroy();
}
//
// === Crops (16x16 px) ===
// Generates stage textures: cropStage1/2/3 by default.
//
export function makeCropTexture(scene, { stage = 1, keyPrefix = "cropStage" } = {}) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const px = 1;
  if (stage === 1) { // Seedling
    g.fillStyle(0x6B4423, 1); g.fillRect(6*px, 8*px, 4*px, 3*px);
    g.fillStyle(0x8BC34A, 1); g.fillRect(7*px, 7*px, 2*px, 1*px);
  } else if (stage === 2) { // Growing
    g.fillStyle(0x558B2F, 1); g.fillRect(7*px, 6*px, 2*px, 5*px);
    g.fillStyle(0x66BB6A, 1); g.fillRect(5*px, 6*px, 2*px, 3*px); g.fillRect(9*px, 7*px, 2*px, 3*px); g.fillRect(6*px, 5*px, 4*px, 2*px);
    g.fillStyle(0x7CB342, 1); g.fillRect(5*px, 6*px, 1*px, 1*px); g.fillRect(6*px, 5*px, 2*px, 1*px);
  } else if (stage === 3) { // Mature
    g.fillStyle(0x558B2F, 1); g.fillRect(7*px, 4*px, 2*px, 7*px);
    g.fillStyle(0x66BB6A, 1); g.fillRect(4*px, 4*px, 3*px, 4*px); g.fillRect(9*px, 5*px, 3*px, 4*px); g.fillRect(6*px, 3*px, 4*px, 3*px);
    g.fillStyle(0x7CB342, 1); g.fillRect(4*px, 4*px, 2*px, 1*px); g.fillRect(6*px, 3*px, 2*px, 1*px);
    g.fillStyle(0xFFA000, 1); g.fillRect(6*px, 5*px, 4*px, 3*px);
    g.fillStyle(0xFFD54F, 1); g.fillRect(6*px, 5*px, 3*px, 1*px); g.fillRect(7*px, 6*px, 2*px, 1*px);
  }
  g.generateTexture(`${keyPrefix}${stage}`, 16*px, 16*px);
  g.destroy();
}
//
// === Tent/House (16x16 px) ===
//
export function makeTentTexture(scene, { key = "pixelTent" } = {}) {
  const g = scene.make.graphics({ x:0, y:0, add:false });
  const px = 1;
  // Stone foundation
  g.fillStyle(0x808080, 1); g.fillRect(1*px, 11*px, 14*px, 5*px);
  g.fillStyle(0x696969, 1); g.fillRect(1*px, 13*px, 14*px, 1*px);
  // Wooden walls
  g.fillStyle(0xD2691E, 1); g.fillRect(2*px, 8*px, 12*px, 3*px);
  g.fillStyle(0xA0522D, 1); g.fillRect(3*px, 8*px, 1*px, 3*px); g.fillRect(6*px, 8*px, 1*px, 3*px); g.fillRect(9*px, 8*px, 1*px, 3*px); g.fillRect(12*px, 8*px, 1*px, 3*px);
  // Door
  g.fillStyle(0x654321, 1); g.fillRect(6*px, 11*px, 4*px, 5*px);
  g.fillStyle(0xFFD700, 0.8); g.fillRect(7*px, 13*px, 1*px, 1*px);
  // Windows
  g.fillStyle(0x87CEEB, 0.6); g.fillRect(3*px, 9*px, 2*px, 2*px); g.fillRect(11*px, 9*px, 2*px, 2*px);
  g.lineStyle(0.5*px, 0x4A4A4A, 1); g.strokeRect(3*px, 9*px, 2*px, 2*px); g.strokeRect(11*px, 9*px, 2*px, 2*px);
  // Roof
  g.fillStyle(0x8B4513, 1); g.fillRect(0*px, 5*px, 16*px, 3*px); g.fillRect(1*px, 3*px, 14*px, 2*px); g.fillRect(3*px, 1*px, 10*px, 2*px);
  g.fillStyle(0xA0522D, 1); g.fillRect(0*px, 5*px, 16*px, 1*px); g.fillRect(1*px, 3*px, 14*px, 1*px); g.fillRect(3*px, 1*px, 10*px, 1*px);
  // Chimney + smoke
  g.fillStyle(0x8B0000, 1); g.fillRect(11*px, 0*px, 3*px, 5*px);
  g.fillStyle(0xA52A2A, 1); g.fillRect(11*px, 1*px, 1*px, 1*px); g.fillRect(13*px, 3*px, 1*px, 1*px);
  g.fillStyle(0xC0C0C0, 0.4); g.fillRect(11*px, -2*px, 2*px, 2*px); g.fillRect(10*px, -4*px, 3*px, 2*px);
  g.generateTexture(key, 16*px, 16*px);
  g.destroy();
}
