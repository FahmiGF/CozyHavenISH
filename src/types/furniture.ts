export interface PlacedFurniture {
  id: string;
  furnitureKey: string;
  itemId: string;
  mapId: 'farm' | 'house';
  gridX: number;
  gridY: number;
  rotation: 0 | 90 | 180 | 270;
  width: number;
  height: number;
  placedAt: number;
}
