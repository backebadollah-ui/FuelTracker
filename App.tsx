<<<<<<< HEAD

=======
>>>>>>> 0853ba9 (Test Commit)
import React, { useState, useEffect, useCallback } from 'react';
import type { FuelRecord, AppView } from './types';
import BottomNav from './components/BottomNav';
import FuelForm from './components/FuelForm';
import HistoryList from './components/HistoryList';
import Report from './components/Report';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [activeView, setActiveView] = useState<AppView>('home');

  useEffect(() => {
    try {
      const storedRecords = localStorage.getItem('fuelRecords');
      if (storedRecords) {
<<<<<<< HEAD
        setFuelRecords(JSON.parse(storedRecords));
=======
        const parsedRecords: FuelRecord[] = JSON.parse(storedRecords);
        const sortedRecords = parsedRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.odometer - b.odometer);
        setFuelRecords(sortedRecords);
>>>>>>> 0853ba9 (Test Commit)
      }
    } catch (error) {
      console.error("Failed to load fuel records from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('fuelRecords', JSON.stringify(fuelRecords));
    } catch (error) {
      console.error("Failed to save fuel records to localStorage", error);
    }
  }, [fuelRecords]);

  const addRecord = useCallback((record: Omit<FuelRecord, 'id'>) => {
    const newRecord: FuelRecord = { ...record, id: Date.now().toString() };
    const sortedRecords = [...fuelRecords, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.odometer - b.odometer);
    setFuelRecords(sortedRecords);
    setActiveView('history');
  }, [fuelRecords]);

  const deleteRecord = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setFuelRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    }
  }, []);

  const resetData = useCallback(() => {
    if (window.confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
      setFuelRecords([]);
      setActiveView('home');
    }
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <FuelForm addRecord={addRecord} lastOdometer={fuelRecords.length > 0 ? fuelRecords[fuelRecords.length - 1].odometer : 0} />;
      case 'history':
        return <HistoryList records={fuelRecords} deleteRecord={deleteRecord} />;
      case 'reports':
        return <Report records={fuelRecords} />;
      case 'settings':
        return <Settings resetData={resetData} />;
      default:
        return <FuelForm addRecord={addRecord} lastOdometer={fuelRecords.length > 0 ? fuelRecords[fuelRecords.length - 1].odometer : 0} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="bg-gray-800 shadow-md p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-cyan-400 capitalize">{activeView}</h1>
      </header>

      <main className="flex-grow p-4 md:p-6 pb-24">
        <div className="max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 0853ba9 (Test Commit)
