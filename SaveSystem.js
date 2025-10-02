const KEY = 'lifesim_save_v1';

export class SaveSystem {
  static load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Save load failed', e);
      return null;
    }
  }

  static save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Save write failed', e);
    }
  }

  static clear() {
    localStorage.removeItem(KEY);
  }

  static serialize(scene) {
    const resources = [];
    scene.resources.children.each(tree => {
      if (tree.active) resources.push({ x: tree.x, y: tree.y });
    });

    return {
      v: 1,
      player: {
        x: scene.player.x,
        y: scene.player.y,
        energy: scene.energySystem.energy,
        coins: scene.coins ?? 0
      },
      // consider picking explicit fields instead of spreading the whole inventory
      inv: { ...scene.inventory },
      world: {
        day: scene.day,
        time: scene.timeHours,
        plots: [{ state: scene.plotState }],
        resources
      },
      quests: {}
    };
  }

  static hydrate(scene, data) {
    if (!data) return;

    // Player
    scene.player.setPosition(data.player.x, data.player.y);
    scene.energySystem.set(data.player.energy ?? 100);
    scene.coins = data.player.coins ?? 0;

    // Inventory
    scene.inventory.wood = data.inv?.wood ?? 0;
    scene.inventory.crops = data.inv?.crops ?? 0;
    scene.hud.setInventory(scene.inventory.wood, scene.inventory.crops);
    scene.hud.setCoins(scene.coins);

    // World time
    scene.day = data.world?.day ?? 1;
    scene.timeHours = data.world?.time ?? 8.0;
    scene.hud.setClock(scene.day, scene.timeHours);

    // Plot
    scene.plotState = data.world?.plots?.[0]?.state ?? 'empty';
    if (scene.plotState !== 'empty') {
      scene.spawnCropSpriteForState(scene.plotState);
    }
  }
}

// (Optional) default export in addition to the named export above
export default SaveSystem;
