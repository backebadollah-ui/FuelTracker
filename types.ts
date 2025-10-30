
export interface FuelRecord {
  id: string;
  date: string; // Stored as YYYY-MM-DD
  liters: number;
  odometer: number;
}

export type AppView = 'home' | 'history' | 'reports' | 'settings';
