import HUD from '../ui/HUD.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { EnergySystem } from '../systems/EnergySystem.js';
import { InteractionSystem } from '../systems/InteractionSystem.js';
import * as SF from '../systems/SpriteFactory.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  preload() {
    // Load JSON content
    this.load.json('crops', 'content/crops.json');
    this.load.json('items', 'content/items.json');
    this.load.json('quests', 'content/quests.json');
  }

  create() {
    
    // Content
    this.cropsDef  = this.cache.json.get('crops');
    this.itemsDef  = this.cache.json.get('items');
    this.questsDef = this.cache.json.get('quests');

    // State & systems
    this.inventory = { wood: 0, crops: 0 };
    this.coins = 0;
    this.energySystem = new EnergySystem(this, 100);
    this.hud = new HUD(this);
    this.hud.drawEnergy(this.energySystem.energy, this.energySystem.max);
    this.interact = new InteractionSystem(this);

    // Time/day
    this.day = 1;
    this.timeHours = 8;

    // Ground texture (simple speckle)
    const groundGraphics = this.make.graphics({ x:0, y:0, add:false });
    groundGraphics.fillStyle(0x228B22, 0.3);
    for (let i = 0; i < 1000; i++) {
      groundGraphics.fillRect(Phaser.Math.Between(0, 2000), Phaser.Math.Between(0, 2000), 2, 2);
    }
    groundGraphics.generateTexture('groundTexture', 2000, 2000);
    groundGraphics.destroy();
    this.add.image(0, 0, 'groundTexture').setOrigin(0, 0).setDepth(-1);

    // === Generate all procedural textures via SpriteFactory ===
    SF.makeCharacterFrames(this, { baseKey: 'ch' });
    SF.makeTreeTexture(this, { key: 'pixelTree' });
    SF.makeCropTexture(this, { stage: 1 });
    SF.makeCropTexture(this, { stage: 2 });
    SF.makeCropTexture(this, { stage: 3 });
    SF.makeTentTexture(this, { key: 'pixelTent' });

    // Player & camera
    this.player = this.physics.add.sprite(1000, 1000, 'ch_down_0')
      .setScale(3)
      .setOrigin(0.5, 0.5)
      .setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.08);

    // Input (keyboard + virtual stick)
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

    // Resources (trees)
    this.resources = this.physics.add.group();
    this.addResource(1200, 1200);
    this.addResource(800, 900);
    this.addResource(1500, 1100);

    // === Farming plot (as a physics Zone) ===
    const plotZone = this.add.zone(1000, 900, 64, 64);
    this.physics.add.existing(plotZone, true);
    this.plot = plotZone;

    // Soil texture display
    const soilGraphics = this.make.graphics({ x:0, y:0, add:false });
    soilGraphics.fillStyle(0x6B4423, 1); soilGraphics.fillRect(0, 0, 64, 64);
    soilGraphics.fillStyle(0x5A3A1F, 1); for (let i = 0; i < 30; i++) soilGraphics.fillRect(Phaser.Math.Between(0, 64), Phaser.Math.Between(0, 64), 2, 2);
    soilGraphics.fillStyle(0x8B5A2B, 1); for (let i = 0; i < 20; i++) soilGraphics.fillRect(Phaser.Math.Between(0, 64), Phaser.Math.Between(0, 64), 1, 1);
    soilGraphics.lineStyle(2, 0x4A2F1A, 1); soilGraphics.strokeRect(0, 0, 64, 64);
    soilGraphics.generateTexture('soilTexture', 64, 64); soilGraphics.destroy();
    this.plotDisplay = this.add.image(1000, 900, 'soilTexture').setOrigin(0.5, 0.5).setInteractive();

    this.plotState = 'empty';
    this.cropSprite = null;

    // Crop interaction (plant → grow → ready → harvest)
    this.plotDisplay.on('pointerdown', () => {
      if (!this.physics.overlap(this.player, this.plot)) return;

      if (this.plotState === 'empty') {
        const cost = this.cropsDef?.wheat?.plantEnergy ?? 5;
        if (!this.energySystem.spend(cost)) return;

        this.plotState = 'planted';
        this.cropSprite = this.add.sprite(1000, 900, 'cropStage1').setScale(3).setOrigin(0.5, 0.5);

        const g1 = this.cropsDef?.wheat?.growthMs?.[1] ?? 3000;
        const g2 = this.cropsDef?.wheat?.growthMs?.[2] ?? 6000;

        this.time.delayedCall(g1, () => {
          if (this.plotState === 'planted' && this.cropSprite) this.cropSprite.setTexture('cropStage2');
        });
        this.time.delayedCall(g2, () => {
          if (this.plotState === 'planted' && this.cropSprite) {
            this.cropSprite.setTexture('cropStage3');
            this.plotState = 'ready';
          }
        });
      } else if (this.plotState === 'ready') {
        const yieldAmt = this.cropsDef?.wheat?.harvestYield ?? 1;
        this.inventory.crops += yieldAmt;
        this.hud.setInventory(this.inventory.wood, this.inventory.crops);
        if (this.cropSprite) this.cropSprite.destroy();
        this.plotState = 'empty';
        this.cropSprite = null;
      }
    });

    // === Tent (as a physics Zone) + energy restore on tap ===
    const tentZone = this.add.zone(1000, 800, 64, 64);
    this.physics.add.existing(tentZone, true);
    this.tent = tentZone;

    this.tentDisplay = this.add.sprite(1000, 800, 'pixelTent')
      .setScale(4)
      .setOrigin(0.5, 0.5)
      .setInteractive();

    // restore energy when tapping the tent while overlapping
    this.tentDisplay.on('pointerdown', () => {
      if (this.physics.overlap(this.player, this.tent)) {
        this.energySystem.restoreFull();
        this.showDialogue('You feel rested!');
      }
    });

    // Dialogue UI
    this.dialogueBox = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY + 200, 400, 100, 0xFFFFFF, 0.8).setOrigin(0.5).setScrollFactor(0).setVisible(false);
    this.dialogueText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200, '', { font: '16px Arial', fill: '#000000', wordWrap: { width: 380 } }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    // NPCs (simple quest)
    this.npcs = this.physics.add.group();
    this.addNPC(1100, 1100, {shirt: 0x00FF00, pants: 0xFF0000}, this.questsDef?.[0]?.text || "Bring 3 wood for 2 crops");

    // World bounds
    this.physics.world.setBounds(0,0,2000,2000);
    this.cameras.main.setBounds(0,0,2000,2000);

    // Autosave
    this.time.addEvent({ delay: 5000, loop: true, callback: () => SaveSystem.save(SaveSystem.serialize(this)) });

    // Hydrate (basic)
    const save = SaveSystem.load();
    if (save) SaveSystem.hydrate(this, save);
  }

  // Helper to spawn crop visuals by state
  spawnCropSpriteForState(state) {
    if (this.cropSprite) { this.cropSprite.destroy(); this.cropSprite = null; }
    const key = state === 'ready' ? 'cropStage3' : 'cropStage2';
    this.cropSprite = this.add.sprite(1000, 900, key).setScale(3).setOrigin(0.5, 0.5);
  }

  addNPC(x, y, colors, questText) {
    SF.makeCharacterFrames(this, { baseKey: 'villager1', palette: { shirt: colors.shirt ?? 0xffa07a } }); // ensure frames exist
    const npc = this.physics.add.sprite(x, y, 'villager1_down_0');
    npc.setScale(3).setOrigin(0.5, 0.5).setTint(colors.shirt).setInteractive();
    npc.questText = questText; npc.questActive = false; npc.questRequiredWood = 3;
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
    this.time.delayedCall(2000, () => { this.dialogueBox.setVisible(false); this.dialogueText.setVisible(false); });
  }

  stickVector(){ if(!this.stick.active) return new Phaser.Math.Vector2(0,0); return new Phaser.Math.Vector2(this.stick.cur.x-this.stick.start.x,this.stick.cur.y-this.stick.start.y); }

  addResource(x, y) {
    const tree = this.resources.create(x, y, 'pixelTree');
    tree.setScale(4).setOrigin(0.5, 0.5).setInteractive();
    tree.on('pointerdown', () => {
      if (!this.physics.overlap(this.player, tree)) return;
      const cost = 10;
      if (!this.energySystem.spend(cost)) return;
      tree.destroy();
      this.inventory.wood += 1; this.hud.setInventory(this.inventory.wood, this.inventory.crops);
      this.time.delayedCall(5000, () => this.addResource(x, y));
    });
  }

  update(time, delta) {
    // Clock
    const minutes = delta / 1000; // ~1 minute / real second
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

    // Prompt near tent
    if (this.physics.overlap(this.player, this.tent)) this.interact.setPrompt('Tap tent to rest (restore energy)');
    else this.interact.hide();
  }
}
