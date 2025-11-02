import React, { useState } from 'react';
import type { FuelRecord } from '../types';
import EditIcon from './icons/EditIcon';

interface HistoryListProps {
  records: FuelRecord[];
  deleteRecord: (id: string) => void;
  updateRecord: (record: FuelRecord) => void;
}

// FIX: Define a type for the record being edited, to hold form values as strings.
type EditableFuelRecord = Omit<FuelRecord, 'liters' | 'odometer'> & {
    liters: string;
    odometer: string;
};

const HistoryList: React.FC<HistoryListProps> = ({ records, deleteRecord, updateRecord }) => {
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  // FIX: Use the correct type for the state holding the record being edited.
  const [editedRecord, setEditedRecord] = useState<EditableFuelRecord | null>(null);
  const [error, setError] = useState('');

  if (records.length === 0) {
    return (
      <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">
        <h2 className="text-xl">No records found.</h2>
        <p>Add a new fuel record to get started!</p>
      </div>
    );
  }

  // Display records in reverse chronological order (newest first)
  const sortedRecordsForDisplay = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.odometer - a.odometer);
  
  const handleEdit = (record: FuelRecord) => {
    setEditingRecordId(record.id);
    // Use string values for form inputs for better control
    setEditedRecord({ 
        ...record, 
        liters: record.liters.toString(), 
        odometer: record.odometer.toString() 
    });
    setError('');
  };

  const handleCancel = () => {
    setEditingRecordId(null);
    setEditedRecord(null);
    setError('');
  };

  const handleSave = () => {
    if (!editedRecord || !editingRecordId) return;

    // FIX: Parse from string values, no longer need to cast since the state type is correct.
    const litersNum = parseFloat(editedRecord.liters);
    const odometerNum = parseInt(editedRecord.odometer, 10);

    if (!editedRecord.date || !editedRecord.liters || !editedRecord.odometer) {
      setError('All fields are required.');
      return;
    }
    
    if (isNaN(litersNum) || isNaN(odometerNum) || litersNum <= 0 || odometerNum <= 0) {
      setError('Liters and odometer must be positive numbers.');
      return;
    }
    
    // Odometer validation against neighbors
    const originalRecordsSorted = [...records].sort((a, b) => a.odometer - b.odometer);
    const recordIndex = originalRecordsSorted.findIndex(r => r.id === editingRecordId);
    
    const prevOdometer = recordIndex > 0 ? originalRecordsSorted[recordIndex - 1].odometer : 0;
    const nextOdometer = recordIndex < originalRecordsSorted.length - 1 ? originalRecordsSorted[recordIndex + 1].odometer : Infinity;

    if (odometerNum <= prevOdometer) {
        setError(`Odometer must be > previous entry (${prevOdometer} km).`);
        return;
    }
    if (odometerNum >= nextOdometer) {
        setError(`Odometer must be < next entry (${nextOdometer} km).`);
        return;
    }

    updateRecord({
        id: editingRecordId,
        date: editedRecord.date,
        liters: litersNum,
        odometer: odometerNum,
    });
    handleCancel(); // Reset state after saving
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editedRecord) {
        setEditedRecord({ ...editedRecord, [name]: value });
    }
  };

  return (
    <div className="space-y-4">
      {sortedRecordsForDisplay.map((record) => (
        <div key={record.id} className="bg-gray-800 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-102 duration-300">
          {editingRecordId === record.id ? (
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                        <input type="date" name="date" value={editedRecord?.date || ''} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Liters</label>
                        <input type="number" name="liters" value={editedRecord?.liters || ''} onChange={handleInputChange} step="0.01" min="0" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Odometer (km)</label>
                        <input type="number" name="odometer" value={editedRecord?.odometer || ''} onChange={handleInputChange} min="0" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500"/>
                    </div>
                </div>
                 {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md transition-colors">Save</button>
                </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg text-cyan-300">{new Date(record.date).toLocaleDateString('en-CA')}</p>
                <p className="text-gray-300"><span className="font-medium">Liters:</span> {record.liters.toFixed(2)} L</p>
                <p className="text-gray-300"><span className="font-medium">Odometer:</span> {record.odometer.toLocaleString()} km</p>
              </div>
              <div className="flex items-center gap-2">
                 <button
                    onClick={() => handleEdit(record)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-md transition-colors flex items-center justify-center"
                    aria-label={`Edit record from ${record.date}`}
                  >
                   <EditIcon />
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md transition-colors"
                    aria-label={`Delete record from ${record.date}`}
                  >
                    &#x1F5D1;
                  </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistoryList;