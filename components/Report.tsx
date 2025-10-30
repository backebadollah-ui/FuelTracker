
import React, { useState, useMemo } from 'react';
import type { FuelRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportProps {
  records: FuelRecord[];
}

const Report: React.FC<ReportProps> = ({ records }) => {
  const today = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);

  const { reportData, chartData, totalDistance, totalLiters, overallConsumption } = useMemo(() => {
    const filteredRecords = records
      .filter(r => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.odometer - b.odometer);

    if (filteredRecords.length < 2) {
      return { reportData: [], chartData: [], totalDistance: 0, totalLiters: 0, overallConsumption: 0 };
    }
    
    const reportItems: { distance: number; liters: number; consumption: number; date: string }[] = [];
    
    for (let i = 1; i < filteredRecords.length; i++) {
        const prev = filteredRecords[i-1];
        const curr = filteredRecords[i];
        
        const distance = curr.odometer - prev.odometer;
        const liters = curr.liters; // Consumption is calculated on fill-up
        
        if (distance > 0) {
            const consumption = (liters / distance) * 100;
            reportItems.push({
                distance,
                liters,
                consumption,
                date: curr.date
            });
        }
    }
    
    const totalDistance = filteredRecords[filteredRecords.length - 1].odometer - filteredRecords[0].odometer;
    const totalLiters = reportItems.reduce((sum, item) => sum + item.liters, 0);
    const overallConsumption = totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
    
    const chartData = reportItems.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        'L/100km': parseFloat(item.consumption.toFixed(2)),
    }));

    return { reportData: reportItems, chartData, totalDistance, totalLiters, overallConsumption };
  }, [records, startDate, endDate]);

  if (records.length < 2) {
    return (
      <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">
        <h2 className="text-xl">Not Enough Data for a Report</h2>
        <p>You need at least two fuel records to calculate consumption.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-center">Select Date Range</h3>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <div>
            <label htmlFor="start-date" className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-cyan-500" />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm text-gray-400 mb-1">End Date</label>
            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-cyan-500" />
          </div>
        </div>
      </div>

      {reportData.length > 0 ? (
        <>
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Overall Average</h3>
            <p className="text-4xl font-light">{overallConsumption.toFixed(2)} <span className="text-2xl text-gray-400">L/100km</span></p>
            <p className="text-gray-400 mt-2">({totalLiters.toFixed(2)} L / {totalDistance.toLocaleString()} km)</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Consumption Trend</h3>
             <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" domain={['dataMin - 1', 'dataMax + 1']}/>
                <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                <Legend />
                <Line type="monotone" dataKey="L/100km" stroke="#2DD4BF" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
         <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">
            <h2 className="text-xl">No Data in Selected Range</h2>
            <p>Please select a different date range to generate a report.</p>
        </div>
      )}
    </div>
  );
};

export default Report;
