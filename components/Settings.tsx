
import React, { useRef } from 'react';
import type { FuelRecord } from '../types';

interface SettingsProps {
  resetData: () => void;
  records: FuelRecord[];
  importData: (records: FuelRecord[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ resetData, records, importData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (records.length === 0) {
      alert("No data to export.");
      return;
    }
    try {
      const dataStr = JSON.stringify(records, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `fuel_records_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data", error);
      alert("An error occurred during export.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const isValidFuelRecord = (record: any): record is FuelRecord => {
    return (
        typeof record === 'object' &&
        record !== null &&
        !Array.isArray(record) &&
        typeof record.id === 'string' &&
        typeof record.date === 'string' && !isNaN(new Date(record.date).getTime()) &&
        typeof record.liters === 'number' &&
        typeof record.odometer === 'number'
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const parsedData = JSON.parse(text);

        if (!Array.isArray(parsedData) || !parsedData.every(isValidFuelRecord)) {
          throw new Error("Invalid file format. Please import a valid JSON export file.");
        }
        
        if (window.confirm("This will replace all current data with the imported records. This action cannot be undone. Continue?")) {
            importData(parsedData);
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : "An error occurred during import.");
      } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
        alert("Failed to read the file.");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-400">Import / Export Data</h2>
        <div className="space-y-4">
          <p className="text-gray-300 text-center">
            Backup your fuel records to a file, or import records from a backup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 duration-300"
              aria-label="Export all fuel records to a JSON file"
            >
              Export Data
            </button>
            <button
              onClick={handleImportClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 duration-300"
              aria-label="Import fuel records from a JSON file"
            >
              Import Data
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-center text-red-400">Danger Zone</h2>
        <div className="border-t border-gray-700 pt-6">
          <p className="text-gray-300 mb-4">
            This action will permanently delete all your fuel records. This cannot be undone. Please be certain before you proceed.
          </p>
          <button
            onClick={resetData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 duration-300"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
