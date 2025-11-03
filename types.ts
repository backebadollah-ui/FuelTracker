
export interface FuelRecord {
  id: string;
  date: string; // Stored as YYYY-MM-DD
  liters: number;
  odometer: number;
  price: number; // Total price in Toman
}

export type AppView = 'home' | 'history' | 'reports' | 'settings';