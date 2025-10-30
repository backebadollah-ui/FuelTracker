
import React from 'react';
import type { FuelRecord } from '../types';

interface HistoryListProps {
  records: FuelRecord[];
  deleteRecord: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ records, deleteRecord }) => {
  if (records.length === 0) {
    return (
      <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">
        <h2 className="text-xl">No records found.</h2>
        <p>Add a new fuel record to get started!</p>
      </div>
    );
  }

  // Display records in reverse chronological order (newest first)
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.odometer - a.odometer);

  return (
    <div className="space-y-4">
      {sortedRecords.map((record, index) => (
        <div key={record.id} className="bg-gray-800 p-4 rounded-lg shadow-lg flex justify-between items-center transition-transform transform hover:scale-102 duration-300">
          <div>
            <p className="font-semibold text-lg text-cyan-300">{new Date(record.date).toLocaleDateString('en-CA')}</p>
            <p className="text-gray-300"><span className="font-medium">Liters:</span> {record.liters.toFixed(2)} L</p>
            <p className="text-gray-300"><span className="font-medium">Odometer:</span> {record.odometer.toLocaleString()} km</p>
          </div>
          <button
            onClick={() => deleteRecord(record.id)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md transition-colors"
            aria-label={`Delete record from ${record.date}`}
          >
            &#x1F5D1;
          </button>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
