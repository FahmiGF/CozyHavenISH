/**
 * CozyHaven Grid A* Pathfinder
 * Efficient, obstacle-aware navigation for NPCs and agents across 32x32 tile maps.
 */

export interface Point {
  x: number;
  y: number;
}

export interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class GridPathfinder {
  private widthInTiles: number;
  private heightInTiles: number;
  private isWalkableFn: (tileX: number, tileY: number) => boolean;

  constructor(
    widthInTiles: number,
    heightInTiles: number,
    isWalkableFn: (tileX: number, tileY: number) => boolean
  ) {
    this.widthInTiles = widthInTiles;
    this.heightInTiles = heightInTiles;
    this.isWalkableFn = isWalkableFn;
  }

  /**
   * Finds a path of tile coordinates from start to target.
   * Returns empty array if no path is possible.
   */
  public findPath(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    maxSearchNodes: number = 600
  ): Point[] {
    // Clamp start and target
    startX = Math.max(0, Math.min(this.widthInTiles - 1, Math.floor(startX)));
    startY = Math.max(0, Math.min(this.heightInTiles - 1, Math.floor(startY)));
    targetX = Math.max(0, Math.min(this.widthInTiles - 1, Math.floor(targetX)));
    targetY = Math.max(0, Math.min(this.heightInTiles - 1, Math.floor(targetY)));

    if (startX === targetX && startY === targetY) {
      return [];
    }

    // If destination is blocked, find nearest walkable neighbor
    if (!this.isWalkableFn(targetX, targetY)) {
      const altTarget = this.findNearestWalkable(targetX, targetY, 4);
      if (!altTarget) return [];
      targetX = altTarget.x;
      targetY = altTarget.y;
    }

    const openList: PathNode[] = [];
    const openMap = new Map<string, PathNode>();
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: this.heuristic(startX, startY, targetX, targetY),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);
    openMap.set(`${startX},${startY}`, startNode);

    let nodesChecked = 0;
    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 },  // Right
    ];

    while (openList.length > 0 && nodesChecked < maxSearchNodes) {
      nodesChecked++;

      // Pick node with lowest f
      let lowestIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openList.splice(lowestIndex, 1)[0];
      const key = `${current.x},${current.y}`;
      openMap.delete(key);
      closedSet.add(key);

      // Reached destination?
      if (current.x === targetX && current.y === targetY) {
        return this.reconstructPath(current);
      }

      // Check neighbors
      for (const dir of directions) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;

        if (nx < 0 || nx >= this.widthInTiles || ny < 0 || ny >= this.heightInTiles) {
          continue;
        }

        const nKey = `${nx},${ny}`;
        if (closedSet.has(nKey)) continue;

        if (!this.isWalkableFn(nx, ny)) {
          continue;
        }

        const tentativeG = current.g + 1;
        let neighbor = openMap.get(nKey);

        if (!neighbor) {
          const h = this.heuristic(nx, ny, targetX, targetY);
          neighbor = {
            x: nx,
            y: ny,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current,
          };
          openList.push(neighbor);
          openMap.set(nKey, neighbor);
        } else if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          neighbor.f = tentativeG + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    // No direct path found
    return [];
  }

  /**
   * Searches spiraling outwards for the closest walkable tile within a given radius.
   */
  public findNearestWalkable(tileX: number, tileY: number, maxRadius: number = 3): Point | null {
    if (this.isWalkableFn(tileX, tileY)) return { x: tileX, y: tileY };

    for (let r = 1; r <= maxRadius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) === r || Math.abs(dy) === r) {
            const checkX = tileX + dx;
            const checkY = tileY + dy;
            if (
              checkX >= 0 &&
              checkX < this.widthInTiles &&
              checkY >= 0 &&
              checkY < this.heightInTiles &&
              this.isWalkableFn(checkX, checkY)
            ) {
              return { x: checkX, y: checkY };
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Finds a random walkable neighbor within radius around (originX, originY) for natural wandering.
   */
  public findRandomWalkableAround(
    originX: number,
    originY: number,
    radius: number = 3
  ): Point | null {
    const candidates: Point[] = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const tx = originX + dx;
        const ty = originY + dy;
        if (
          tx >= 0 &&
          tx < this.widthInTiles &&
          ty >= 0 &&
          ty < this.heightInTiles &&
          this.isWalkableFn(tx, ty)
        ) {
          candidates.push({ x: tx, y: ty });
        }
      }
    }

    if (candidates.length === 0) return null;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return picked;
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  private reconstructPath(endNode: PathNode): Point[] {
    const path: Point[] = [];
    let curr: PathNode | null = endNode;
    while (curr) {
      path.unshift({ x: curr.x, y: curr.y });
      curr = curr.parent;
    }
    // Remove the starting node (since character is already there)
    if (path.length > 0) {
      path.shift();
    }
    return path;
  }
}
