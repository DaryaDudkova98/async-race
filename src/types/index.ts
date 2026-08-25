export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface EngineStatus {
  velocity: number;
  distance: number;
}

export interface CarWithStatus extends Car {
  isDriving: boolean;
  isStopped: boolean;
  speed?: number;
}

export enum View {
  Garage = 'garage',
  Winners = 'winners'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum SortField {
  WINS = 'wins',
  TIME = 'time'
}