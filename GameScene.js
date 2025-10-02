import HUD from '../ui/HUD.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { EnergySystem } from '../systems/EnergySystem.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  preload() {
    // Load JSON content as Phaser cache assets
    this.load.json('crops', 'content/crops.json');
    this.load.json('items', 'content/items.json');
    this.load.json('quests', 'content/quests.json');
  }

  create() {
    // Content
    this.cropsDef = this.cache.json.get('crops');
    this.itemsDef = this.cache.json.get('items');
    this.questsDef = this.cache.json.get('quests');

    // Inventory / coins
    this.inventory = { wood: 0, crops: 0 };
    this.coins = 0;

    // Systems
    this.energySystem = new EnergySystem(this, 100);
    this.hud = new HUD(this);
    this.hud.drawEnergy(this.energySystem.energy, this.energySystem.max);
    this.interact = new InteractionSystem(this);

    // Time/Day
    this.day = 1;        // day counter
    this.timeHours = 8;  // 8:00 start

    // Ground texture (scattered pixels)
    const groundGraphics = this.make.graphics({ x:0, y:0, add:false });
    groundGraphics.fillStyle(0x228B22, 0.3);
    for (let i = 0; i < 1000; i++) {
      const x = Phaser.Math.Between(0, 2000);
      const y = Phaser.Math.Between(0, 2000);
      groundGraphics.fillRect(x, y, 2, 2);
    }
    groundGraphics.generateTexture('groundTexture', 2000, 2000);
    groundGraphics.destroy();
    this.add.image(0, 0, 'groundTexture').setOrigin(0, 0).setDepth(-1);

    // Character frames + animations (procedural)
    const makeCharFrame = (key, dir, step)=>{
      const g = this.make.graphics({ x:0, y:0, add:false });
      const px = 1;
      const COLORS = {
        outline: 0x0e0f13,
        skin:    0xffdab9,
        hair:    0x4b3621,
        shirt:   0xffa07a,
        pants:   0x87cefa,
        shoe:    0x1b1b1b,
        blush:   0xff69b4,
        eyeHighlight: 0xffffff
      };
      const R = (x,y,w,h,c,a=1)=>{ g.fillStyle(c,a); g.fillRect(x*px, y*px, w*px, h*px); };
      const S = (x,y,w,h,c=COLORS.outline)=>{ g.lineStyle(px, c, 1); g.strokeRect(x*px,y*px,w*px,h*px); };
      const bob = step ? 1 : 0;
      const hx=3, hy=0;
      R(hx+1, hy+0, 8, 2, COLORS.hair);
      R(hx+0, hy+2,10, 1, COLORS.hair);
      R(hx+1, hy+3, 8, 5, COLORS.skin);
      R(hx+2, hy+8, 6, 1, COLORS.skin);
      R(hx+0, hy+3, 1, 6, COLORS.hair);
      R(hx+9, hy+3, 1, 6, COLORS.hair);
      let ex1=hx+3, ex2=hx+6;
      if (dir==='left'){ex1--;ex2--;} if (dir==='right'){ex1++;ex2++;}
      R(ex1, hy+4,1,1,COLORS.outline); R(ex2, hy+4,1,1,COLORS.outline);
      R(ex1, hy+4,0.5,0.5,COLORS.eyeHighlight,.8); R(ex2, hy+4,0.5,0.5,COLORS.eyeHighlight,.8);
      R(hx+2, hy+6,1,1,COLORS.blush,.5); R(hx+7, hy+6,1,1,COLORS.blush,.5);
      S(hx+0,hy+2,10,7); S(hx+1,hy+0,8,2);
      const by=9+bob; R(4,by,8,4,COLORS.shirt); S(4,by,8,4); R(7,by-1,2,1,COLORS.skin);
      const armUp=step?0:1;
      if (dir==='left'||dir==='right'){
        const lSwing=(dir==='left'?(step?2:0):(step?0:2));
        const rSwing=(dir==='left'?(step?0:2):(step?2:0));
        R(3,by+lSwing,1,3,COLORS.skin); S(3,by+lSwing,1,3);
        R(12,by+rSwing,1,3,COLORS.skin); S(12,by+rSwing,1,3);
      } else {
        R(3,by+armUp,1,3,COLORS.skin); S(3,by+armUp,1,3);
        R(12,by+(1-armUp),1,3,COLORS.skin); S(12,by+(1-armUp),1,3);
      }
      const py=by+4; R(4,py,8,3,COLORS.pants); S(4,py,8,3);
      const stride=(dir==='left'||dir==='right')?(step?2:-2):(step?1:-1);
      const ly=py+3; R(5,ly+(step?0:stride/2),2,2,COLORS.pants); S(5,ly+(step?0:stride/2),2,2);
      R(9,ly+(step?stride/2:0),2,2,COLORS.pants); S(9,ly+(step?stride/2:0),2,2);
      const sy=ly+2; R(5,sy,2,1,COLORS.shoe); S(5,sy,2,1); R(9,sy,2,1,COLORS.shoe); S(9,sy,2,1);
      R(11,by+1,2,3,0x8b4513); S(11,by+1,2,3);
      g.generateTexture(key,16*px,16*px); g.destroy();
    };

    ['down','left','right','up'].forEach(dir=>{
      makeCharFrame(`ch_${dir}_0`,dir,0);
      makeCharFrame(`ch_${dir}_1`,dir,1);
      this.anims.create({ key:`walk_${dir}`, frames:[{key:`ch_${dir}_0`},{key:`ch_${dir}_1`}], frameRate:6, repeat:-1 });
    });

    this.player = this.physics.add.sprite(1000, 1000, 'ch_down_0');
    this.player.setScale(3).setOrigin(0.5, 0.5).setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.08);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.stick={active:false,start:new Phaser.Math.Vector2(),cur:new Phaser.Math.Vector2()};
    this.stickBase=this.add.circle(0,0,36,0xffffff,0.07).setVisible(false).setScrollFactor(0);
    this.stickNub =this.add.circle(0,0,18,0xffffff,0.15).setVisible(false).setScrollFactor(0);

    this.input.on('pointerdown',(p)=>{
      if(p.y>this.scale.height*0.6){
        this.stick.active=true; this.stick.start.set(p.x,p.y); this.stick.cur.copy(this.stick.start);
        this.stickBase.setPosition(p.x,p.y).setVisible(true);
        this.stickNub.setPosition(p.x,p.y).setVisible(true);
      }
    });
    this.input.on('pointermove',(p)=>{
      if(!this.stick.active)return; this.stick.cur.set(p.x,p.y);
      const v=this.stickVector(); const cap=36; const clamped=Phaser.Math.Clamp(v.length(),0,cap);
      const dir=v.normalize().scale(clamped); this.stickNub.setPosition(this.stick.start.x+dir.x,this.stick.start.y+dir.y);
    });
    this.input.on('pointerup',()=>{ this.stick.active=false; this.stickBase.setVisible(false); this.stickNub.setVisible(false); });

    // Tree texture
    const makeTreeTexture = ()=>{
      const g = this.make.graphics({ x:0, y:0, add:false });
      const px = 1;
      g.fillStyle(0x654321, 1); g.fillRect(6*px, 9*px, 4*px, 7*px);
      g.fillStyle(0x8B6914, 1); g.fillRect(6*px, 9*px, 2*px, 7*px);
      g.fillStyle(0x2D5016, 1); g.fillRect(5*px, 7*px, 6*px, 3*px); g.fillRect(4*px, 4*px, 8*px, 3*px); g.fillRect(6*px, 1*px, 4*px, 3*px);
      g.fillStyle(0x3A7C1F, 1); g.fillRect(5*px, 7*px, 5*px, 2*px); g.fillRect(4*px, 4*px, 7*px, 2*px); g.fillRect(6*px, 1*px, 3*px, 2*px);
      g.fillStyle(0x4CAF50, 1); g.fillRect(5*px, 7*px, 3*px, 1*px); g.fillRect(4*px, 4*px, 4*px, 1*px); g.fillRect(6*px, 1*px, 2*px, 1*px);
      g.fillStyle(0xFF6B6B, 0.8); g.fillRect(5*px, 6*px, 1*px, 1*px); g.fillRect(9*px, 5*px, 1*px, 1*px);
      g.generateTexture('pixelTree', 16*px, 16*px); g.destroy();
    };
    makeTreeTexture();

    // Resources
    this.resources = this.physics.add.group();
    this.addResource(1200, 1200);
    this.addResource(800, 900);
    this.addResource(1500, 1100);

    // Farming plot (single) — use a physics zone instead of staticBody
const plotZone = this.add.zone(1000, 900, 64, 64);
this.physics.add.existing(plotZone, true);  // true = static
this.plot = plotZone;

const soilGraphics = this.make.graphics({ x:0, y:0, add:false });
    soilGraphics.fillStyle(0x6B4423, 1); soilGraphics.fillRect(0, 0, 64, 64);
    soilGraphics.fillStyle(0x5A3A1F, 1); for (let i = 0; i < 30; i++) soilGraphics.fillRect(Phaser.Math.Between(0, 64), Phaser.Math.Between(0, 64), 2, 2);
    soilGraphics.fillStyle(0x8B5A2B, 1); for (let i = 0; i < 20; i++) soilGraphics.fillRect(Phaser.Math.Between(0, 64), Phaser.Math.Between(0, 64), 1, 1);
    soilGraphics.lineStyle(2, 0x4A2F1A, 1); soilGraphics.strokeRect(0, 0, 64, 64);
    soilGraphics.generateTexture('soilTexture', 64, 64); soilGraphics.destroy();
    this.plotDisplay = this.add.image(1000, 900, 'soilTexture').setOrigin(0.5, 0.5).setInteractive();
    this.plotState = 'empty';
    this.cropSprite = null;

    const makeCropTexture = (stage) => {
      const g = this.make.graphics({ x:0, y:0, add:false });
      const px = 1;
      if (stage === 1) { g.fillStyle(0x6B4423, 1); g.fillRect(6*px, 8*px, 4*px, 3*px); g.fillStyle(0x8BC34A, 1); g.fillRect(7*px, 7*px, 2*px, 1*px); }
      else if (stage === 2) { g.fillStyle(0x558B2F, 1); g.fillRect(7*px, 6*px, 2*px, 5*px); g.fillStyle(0x66BB6A, 1); g.fillRect(5*px, 6*px, 2*px, 3*px); g.fillRect(9*px, 7*px, 2*px, 3*px); g.fillRect(6*px, 5*px, 4*px, 2*px); g.fillStyle(0x7CB342, 1); g.fillRect(5*px, 6*px, 1*px, 1*px); g.fillRect(6*px, 5*px, 2*px, 1*px); }
      else if (stage === 3) { g.fillStyle(0x558B2F, 1); g.fillRect(7*px, 4*px, 2*px, 7*px); g.fillStyle(0x66BB6A, 1); g.fillRect(4*px, 4*px, 3*px, 4*px); g.fillRect(9*px, 5*px, 3*px, 4*px); g.fillRect(6*px, 3*px, 4*px, 3*px); g.fillStyle(0x7CB342, 1); g.fillRect(4*px, 4*px, 2*px, 1*px); g.fillRect(6*px, 3*px, 2*px, 1*px); g.fillStyle(0xFFA000, 1); g.fillRect(6*px, 5*px, 4*px, 3*px); g.fillStyle(0xFFD54F, 1); g.fillRect(6*px, 5*px, 3*px, 1*px); g.fillRect(7*px, 6*px, 2*px, 1*px); }
      g.generateTexture(`cropStage${stage}`, 16*px, 16*px); g.destroy();
    };
    makeCropTexture(1); makeCropTexture(2); makeCropTexture(3);

    this.plotDisplay.on('pointerdown', () => {
      if (!this.physics.overlap(this.player, this.plot)) return;
      if (this.plotState === 'empty') {
        const cost = this.cropsDef?.wheat?.plantEnergy ?? 5;
        if (!this.energySystem.spend(cost)) return;
        this.plotState = 'planted';
        this.cropSprite = this.add.sprite(1000, 900, 'cropStage1').setScale(3).setOrigin(0.5, 0.5);
        const g1 = this.cropsDef?.wheat?.growthMs?.[1] ?? 3000;
        const g2 = this.cropsDef?.wheat?.growthMs?.[2] ?? 6000;
        this.time.delayedCall(g1, () => { if (this.plotState === 'planted' && this.cropSprite) this.cropSprite.setTexture('cropStage2'); });
        this.time.delayedCall(g2, () => { if (this.plotState === 'planted' && this.cropSprite) this.cropSprite.setTexture('cropStage3'); this.plotState = 'ready'; });
      } else if (this.plotState === 'ready') {
        const yieldAmt = this.cropsDef?.wheat?.harvestYield ?? 1;
        this.inventory.crops += yieldAmt;
        this.hud.setInventory(this.inventory.wood, this.inventory.crops);
        if (this.cropSprite) this.cropSprite.destroy();
        this.plotState = 'empty';
        this.cropSprite = null;
      }
    });

    // NPCs (simple quest)
    this.npcs = this.physics.add.group();
    this.addNPC(1100, 1100, {shirt: 0x00FF00, pants: 0xFF0000}, this.questsDef?.[0]?.text || "Bring 3 wood for 2 crops");

    // Tent (restore energy)
    const makeTentTexture = () => {
      const g = this.make.graphics({ x:0, y:0, add:false });
      const px = 1;
      g.fillStyle(0x808080, 1); g.fillRect(1*px, 11*px, 14*px, 5*px);
      g.fillStyle(0x696969, 1); g.fillRect(1*px, 13*px, 14*px, 1*px);
      g.fillStyle(0xD2691E, 1); g.fillRect(2*px, 8*px, 12*px, 3*px);
      g.fillStyle(0xA0522D, 1); g.fillRect(3*px, 8*px, 1*px, 3*px); g.fillRect(6*px, 8*px, 1*px, 3*px); g.fillRect(9*px, 8*px, 1*px, 3*px); g.fillRect(12*px, 8*px, 1*px, 3*px);
      g.fillStyle(0x654321, 1); g.fillRect(6*px, 11*px, 4*px, 5*px);
      g.fillStyle(0xFFD700, 0.8); g.fillRect(7*px, 13*px, 1*px, 1*px);
      g.fillStyle(0x87CEEB, 0.6); g.fillRect(3*px, 9*px, 2*px, 2*px); g.fillRect(11*px, 9*px, 2*px, 2*px);
      g.lineStyle(0.5*px, 0x4A4A4A, 1); g.strokeRect(3*px, 9*px, 2*px, 2*px); g.strokeRect(11*px, 9*px, 2*px, 2*px);
      g.fillStyle(0x8B4513, 1); g.fillRect(0*px, 5*px, 16*px, 3*px); g.fillRect(1*px, 3*px, 14*px, 2*px); g.fillRect(3*px, 1*px, 10*px, 2*px);
      g.fillStyle(0xA0522D, 1); g.fillRect(0*px, 5*px, 16*px, 1*px); g.fillRect(1*px, 3*px, 14*px, 1*px); g.fillRect(3*px, 1*px, 10*px, 1*px);
      g.fillStyle(0x8B0000, 1); g.fillRect(11*px, 0*px, 3*px, 5*px);
      g.fillStyle(0xA52A2A, 1); g.fillRect(11*px, 1*px, 1*px, 1*px); g.fillRect(13*px, 3*px, 1*px, 1*px);
      g.fillStyle(0xC0C0C0, 0.4); g.fillRect(11*px, -2*px, 2*px, 2*px); g.fillRect(10*px, -4*px, 3*px, 2*px);
      g.generateTexture('pixelTent', 16*px, 16*px); g.destroy();
    };
    makeTentTexture();
   // Tent (restore energy) — use a physics zone
const tentZone = this.add.zone(1000, 800, 64, 64);
this.physics.add.existing(tentZone, true);  // true = static
this.tent = tentZone;

this.tentDisplay = this.add.sprite(1000, 800, 'pixelTent')
  .setScale(4)
  .setOrigin(0.5, 0.5);

  // ✅ Add interaction to restore energy
this.tentDisplay.setInteractive();
this.tentDisplay.on('pointerdown', () => {
  if (this.physics.overlap(this.player, this.tent)) {
    this.energySystem.restoreFull();
    this.showDialogue("You feel rested!");
  }
});

    // Dialogue UI
    this.dialogueBox = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY + 200, 400, 100, 0xFFFFFF, 0.8).setOrigin(0.5).setScrollFactor(0).setVisible(false);
    this.dialogueText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200, '', { font: '16px Arial', fill: '#000000', wordWrap: { width: 380 } }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    // World bounds
    this.physics.world.setBounds(0,0,2000,2000);
    this.cameras.main.setBounds(0,0,2000,2000);

    // Autosave
    this.time.addEvent({ delay: 5000, loop: true, callback: () => SaveSystem.save(SaveSystem.serialize(this)) });

    // Try hydrate
    const save = SaveSystem.load();
    if (save) SaveSystem.hydrate(this, save);
  }

  spawnCropSpriteForState(state) {
    if (state === 'planted') {
      this.cropSprite = this.add.sprite(1000, 900, 'cropStage2').setScale(3).setOrigin(0.5, 0.5);
    } else if (state === 'ready') {
      this.cropSprite = this.add.sprite(1000, 900, 'cropStage3').setScale(3).setOrigin(0.5, 0.5);
    }
  }

  addNPC(x, y, colors, questText) {
    const npc = this.physics.add.sprite(x, y, 'ch_down_0');
    npc.setScale(3).setOrigin(0.5, 0.5).setTint(colors.shirt).setInteractive();
    npc.questText = questText;
    npc.questActive = false;
    npc.questRequiredWood = 3;
    npc.on('pointerdown', () => {
      if (!this.physics.overlap(this.player, npc)) return;
      this.showDialogue(npc.questText);
      if (!npc.questActive) { npc.questActive = true; return; }
      if ((this.inventory.wood ?? 0) >= npc.questRequiredWood) {
        this.inventory.wood -= npc.questRequiredWood;
        this.inventory.crops += 2;
        this.hud.setInventory(this.inventory.wood, this.inventory.crops);
        this.showDialogue('Quest complete! Thanks!');
        npc.questActive = false;
      }
    });
    this.npcs.add(npc);
  }

  showDialogue(text) {
    this.dialogueText.setText(text);
    this.dialogueBox.setVisible(true); this.dialogueText.setVisible(true);
    this.time.delayedCall(3000, () => { this.dialogueBox.setVisible(false); this.dialogueText.setVisible(false); });
  }

  update(time, delta) {
    // Time flow (1 real sec ≈ 1 in-game minute)
    const minutes = delta / 1000; // minutes per frame
    this.timeHours += minutes / 60;
    if (this.timeHours >= 24) { this.timeHours -= 24; this.day += 1; }
    this.hud.setClock(this.day, this.timeHours);

    // Movement
    const speed=140; let vx=0,vy=0;
    if(this.cursors.left.isDown)vx-=1; if(this.cursors.right.isDown)vx+=1; if(this.cursors.up.isDown)vy-=1; if(this.cursors.down.isDown)vy+=1;
    if(this.stick.active){ const v=this.stickVector(); if(v.length()>6){vx+=v.x;vy+=v.y;} }
    const v=new Phaser.Math.Vector2(vx,vy);
    if(v.lengthSq()>0){ v.normalize().scale(speed); this.player.setVelocity(v.x,v.y);
      if(Math.abs(v.x)>Math.abs(v.y)) this.player.anims.play(v.x>0?'walk_right':'walk_left',true);
      else this.player.anims.play(v.y>0?'walk_down':'walk_up',true);
    } else { this.player.setVelocity(0,0); const key=this.player.anims.currentAnim?.key||'walk_down'; const face=key.replace('walk_',''); this.player.setTexture(`ch_${face}_0`); this.player.anims.stop(); }

    // Depth sorting
    this.player.setDepth(this.player.y);
    if (this.cropSprite) this.cropSprite.setDepth(this.cropSprite.y);
    this.resources.children.each(tree => tree.setDepth(tree.y));
    this.npcs.children.each(npc => npc.setDepth(npc.y));
    if (this.tentDisplay) this.tentDisplay.setDepth(this.tentDisplay.y);

    // Interaction prompt (example for tent)
    if (this.physics.overlap(this.player, this.tent)) this.interact.setPrompt('Tap tent to sleep (restore)');
    else this.interact.hide();
  }

  stickVector(){ if(!this.stick.active) return new Phaser.Math.Vector2(0,0); return new Phaser.Math.Vector2(this.stick.cur.x-this.stick.start.x,this.stick.cur.y-this.stick.start.y); }

  addResource(x, y) {
    const tree = this.resources.create(x, y, 'pixelTree');
    tree.setScale(4).setOrigin(0.5, 0.5).setInteractive();
    tree.on('pointerdown', () => {
      if (!this.physics.overlap(this.player, tree)) return;
      const cost = 10; // TODO: move to constants
      if (!this.energySystem.spend(cost)) return;
      tree.destroy();
      this.inventory.wood += 1; this.hud.setInventory(this.inventory.wood, this.inventory.crops);
      this.time.delayedCall(5000, () => this.addResource(x, y));
    });
  }
}
