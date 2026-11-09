export type AnimalType = 'chicken' | 'cow';

export interface FarmAnimal {
  id: string;
  name: string;
  type: AnimalType;
  x: number;
  y: number;
  friendship: number; // 0 to 1000
  petToday: boolean;
  fedToday: boolean;
  hasProduct: boolean; // egg or milk ready to collect
  productItemId: string;
}

export const INITIAL_FARM_ANIMALS: FarmAnimal[] = [
  {
    id: 'chicken_1',
    name: 'Daisy',
    type: 'chicken',
    x: 480,
    y: 380,
    friendship: 200,
    petToday: false,
    fedToday: true,
    hasProduct: true,
    productItemId: 'item_egg',
  },
  {
    id: 'chicken_2',
    name: 'Pippin',
    type: 'chicken',
    x: 520,
    y: 400,
    friendship: 200,
    petToday: false,
    fedToday: true,
    hasProduct: true,
    productItemId: 'item_egg',
  },
  {
    id: 'cow_1',
    name: 'Buttercup',
    type: 'cow',
    x: 600,
    y: 360,
    friendship: 300,
    petToday: false,
    fedToday: true,
    hasProduct: true,
    productItemId: 'item_milk',
  },
];
