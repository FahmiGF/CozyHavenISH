import { describe, it, expect, beforeEach } from 'vitest';
import { GridPathfinder } from '../game/ai/Pathfinder';
import { gameState, TUTORIAL_STAGES } from '../domain/GameState';

describe('Grid A* Pathfinder', () => {
  it('finds a direct path on an empty grid', () => {
    const pathfinder = new GridPathfinder(10, 10, () => true);
    const path = pathfinder.findPath(1, 1, 1, 4);

    expect(path.length).toBe(3);
    expect(path[0]).toEqual({ x: 1, y: 2 });
    expect(path[1]).toEqual({ x: 1, y: 3 });
    expect(path[2]).toEqual({ x: 1, y: 4 });
  });

  it('navigates around an obstacle wall', () => {
    // 5x5 grid with wall at (2, 1), (2, 2), (2, 3)
    const isWalkable = (tx: number, ty: number) => {
      if (tx === 2 && ty >= 1 && ty <= 3) return false;
      return true;
    };

    const pathfinder = new GridPathfinder(5, 5, isWalkable);
    const path = pathfinder.findPath(1, 2, 3, 2);

    expect(path.length).toBeGreaterThan(0);
    // Path must not step into the wall at (2, 2)
    path.forEach((pt) => {
      expect(isWalkable(pt.x, pt.y)).toBe(true);
    });
    // Final point must reach target (3, 2)
    expect(path[path.length - 1]).toEqual({ x: 3, y: 2 });
  });

  it('finds nearest walkable tile if destination is blocked', () => {
    const isWalkable = (tx: number, ty: number) => {
      if (tx === 2 && ty === 2) return false;
      return true;
    };

    const pathfinder = new GridPathfinder(5, 5, isWalkable);
    const nearest = pathfinder.findNearestWalkable(2, 2, 2);

    expect(nearest).not.toBeNull();
    expect(isWalkable(nearest!.x, nearest!.y)).toBe(true);
  });

  it('picks a random walkable neighbor within radius', () => {
    const pathfinder = new GridPathfinder(10, 10, () => true);
    const wanderPoint = pathfinder.findRandomWalkableAround(5, 5, 2);

    expect(wanderPoint).not.toBeNull();
    expect(Math.abs(wanderPoint!.x - 5)).toBeLessThanOrEqual(2);
    expect(Math.abs(wanderPoint!.y - 5)).toBeLessThanOrEqual(2);
  });
});

describe('Newcomer Tutorial System', () => {
  beforeEach(() => {
    gameState.resetToNewGame('Tester');
  });

  it('initializes tutorial at stage 1', () => {
    expect(gameState.data.tutorial).toBeDefined();
    expect(gameState.data.tutorial?.currentStage).toBe(1);
    expect(gameState.data.tutorial?.isCompleted).toBe(false);
  });

  it('advances tutorial progress and awards coins on stage completion', () => {
    const initialCoins = gameState.data.player.coins;
    const stage1 = TUTORIAL_STAGES[0];

    // Stage 1 target count is 15 moves
    gameState.advanceTutorial('move', 15);

    expect(gameState.data.tutorial?.currentStage).toBe(2);
    expect(gameState.data.player.coins).toBe(initialCoins + stage1.rewardCoins);
  });

  it('completes entire tutorial sequence through stage 8', () => {
    for (let i = 0; i < TUTORIAL_STAGES.length; i++) {
      const stage = TUTORIAL_STAGES[i];
      gameState.advanceTutorial(stage.targetAction, stage.targetCount);
    }

    expect(gameState.data.tutorial?.isCompleted).toBe(true);
  });
});

describe('Mining & Energy Regeneration Mechanics', () => {
  beforeEach(() => {
    gameState.resetToNewGame('Miner');
  });

  it('consumes energy and adds minerals when mining ore nodes', () => {
    gameState.data.player.energy = 50;

    const result = gameState.mineRockNode('iron');

    expect(result.success).toBe(true);
    expect(gameState.data.player.energy).toBe(47);
    expect(gameState.data.statistics.oresMined).toBe(1);

    const hasIron = gameState.data.inventory.some((s) => s.item?.id === 'mat_iron');
    expect(hasIron).toBe(true);
  });

  it('prevents mining when energy is depleted', () => {
    gameState.data.player.energy = 2; // Needs at least 3

    const result = gameState.mineRockNode('gold');

    expect(result.success).toBe(false);
    expect(gameState.data.player.energy).toBe(2);
  });

  it('restores energy over time up to maximum capacity', () => {
    gameState.data.player.energy = 40;
    gameState.data.player.maxEnergy = 100;

    const restored = gameState.restoreEnergy(3);

    expect(restored).toBe(true);
    expect(gameState.data.player.energy).toBe(43);

    gameState.restoreEnergy(100);
    expect(gameState.data.player.energy).toBe(100);

    const fullRestored = gameState.restoreEnergy(5);
    expect(fullRestored).toBe(false);
    expect(gameState.data.player.energy).toBe(100);
  });
});
