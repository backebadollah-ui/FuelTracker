
import React from 'react';

interface SettingsProps {
  resetData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ resetData }) => {
  return (
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
  );
};

export default Settings;
