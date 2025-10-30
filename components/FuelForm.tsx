
import React, { useState, useEffect } from 'react';
import type { FuelRecord } from '../types';

interface FuelFormProps {
  addRecord: (record: Omit<FuelRecord, 'id'>) => void;
  lastOdometer: number;
}

const FuelForm: React.FC<FuelFormProps> = ({ addRecord, lastOdometer }) => {
  const [date, setDate] = useState('');
  const [liters, setLiters] = useState('');
  const [odometer, setOdometer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Set default date to today in YYYY-MM-DD format
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const litersNum = parseFloat(liters);
    const odometerNum = parseInt(odometer, 10);

    if (!date || !liters || !odometer) {
      setError('All fields are required.');
      return;
    }

    if (isNaN(litersNum) || isNaN(odometerNum) || litersNum <= 0 || odometerNum <= 0) {
      setError('Liters and odometer must be positive numbers.');
      return;
    }

    if (lastOdometer > 0 && odometerNum <= lastOdometer) {
      setError(`Odometer must be greater than the last entry (${lastOdometer} km).`);
      return;
    }
    
    addRecord({
      date,
      liters: litersNum,
      odometer: odometerNum,
    });

    setLiters('');
    setOdometer('');
    setError('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-400">Add New Fuel Record</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          />
        </div>
        <div>
          <label htmlFor="liters" className="block text-sm font-medium text-gray-300 mb-2">Liters</label>
          <input
            type="number"
            id="liters"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
            placeholder="e.g., 45.5"
            step="0.01"
            min="0"
            className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          />
        </div>
        <div>
          <label htmlFor="odometer" className="block text-sm font-medium text-gray-300 mb-2">Odometer (km)</label>
          <input
            type="number"
            id="odometer"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder={`e.g., > ${lastOdometer}`}
            min="0"
            className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 duration-300"
        >
          Save Record
        </button>
      </form>
    </div>
  );
};

export default FuelForm;
