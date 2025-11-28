import React, { useState, useMemo, useCallback } from 'react';
import type { FuelRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportProps {
  records: FuelRecord[];
}

type FilterType = 'dateRange' | 'month' | 'period';

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-700 p-3 rounded-md border border-gray-600 shadow-lg text-sm">
                <p className="label font-semibold text-cyan-400">{label}</p>
                <p className="text-white">{`Consumption: ${data['L/100km']} L/100km`}</p>
                <p className="text-gray-300">{`Distance: ${data.distance.toLocaleString()} km`}</p>
                <p className="text-gray-300">{`Fuel: ${data.liters.toFixed(2)} L`}</p>
                <p className="text-gray-300">{`Cost: ${(data.price || 0).toLocaleString()} Toman`}</p>
            </div>
        );
    }
    return null;
};


const Report: React.FC<ReportProps> = ({ records }) => {
  const today = new Date();
  const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));

  const [startDate, setStartDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<FilterType>('dateRange');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    records.forEach(r => {
      months.add(r.date.substring(0, 7)); // YYYY-MM
    });
    return Array.from(months).sort().reverse();
  }, [records]);

  const handleMonthChange = useCallback((yyyymm: string) => {
    if (!yyyymm) return;
    const [year, month] = yyyymm.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0); // Day 0 of next month is last day of current month
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const handlePeriodChange = useCallback((days: number) => {
    const newEndDate = new Date();
    const newStartDate = new Date();
    newStartDate.setDate(newEndDate.getDate() - days);
    setStartDate(newStartDate.toISOString().split('T')[0]);
    setEndDate(newEndDate.toISOString().split('T')[0]);
  }, []);


  const isDateRangeValid = useMemo(() => new Date(startDate) <= new Date(endDate), [startDate, endDate]);

  const { reportData, chartData, totalDistance, totalLiters, overallConsumption, totalCost, avgPricePerLiter, avgCostPerKm } = useMemo(() => {
    const emptyReport = { reportData: [], chartData: [], totalDistance: 0, totalLiters: 0, overallConsumption: 0, totalCost: 0, avgPricePerLiter: 0, avgCostPerKm: 0 };
    if (!isDateRangeValid) {
        return emptyReport;
    }
    const filteredRecords = records
      .filter(r => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.odometer - b.odometer);

    if (filteredRecords.length < 2) {
      return emptyReport;
    }
    
    const reportItems: { distance: number; liters: number; consumption: number; date: string; price: number; }[] = [];
    
    for (let i = 1; i < filteredRecords.length; i++) {
        const prev = filteredRecords[i-1];
        const curr = filteredRecords[i];
        
        const distance = curr.odometer - prev.odometer;
        const liters = curr.liters;
        const price = curr.price || 0; // handle potentially missing price on old records
        
        if (distance > 0) {
            const consumption = (liters / distance) * 100;
            reportItems.push({
                distance,
                liters,
                consumption,
                date: curr.date,
                price
            });
        }
    }
    
    const totalDistance = filteredRecords[filteredRecords.length - 1].odometer - filteredRecords[0].odometer;
    const totalLiters = reportItems.reduce((sum, item) => sum + item.liters, 0);
    const totalCost = reportItems.reduce((sum, item) => sum + item.price, 0);
    const overallConsumption = totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
    const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;
    
    const chartData = reportItems.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        'L/100km': parseFloat(item.consumption.toFixed(2)),
        distance: item.distance,
        liters: item.liters,
        price: item.price,
    }));

    return { reportData: reportItems, chartData, totalDistance, totalLiters, overallConsumption, totalCost, avgPricePerLiter, avgCostPerKm };
  }, [records, startDate, endDate, isDateRangeValid]);

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
        <h3 className="text-lg font-semibold mb-4 text-center">Filter Report</h3>
        <div className="flex justify-center gap-2 mb-4 border-b border-gray-700 pb-4">
            <FilterButton label="Date Range" isActive={filterType === 'dateRange'} onClick={() => setFilterType('dateRange')} />
            <FilterButton label="By Month" isActive={filterType === 'month'} onClick={() => setFilterType('month')} />
            <FilterButton label="By Period" isActive={filterType === 'period'} onClick={() => setFilterType('period')} />
        </div>

        <div className="min-h-[100px]">
            {filterType === 'dateRange' && (
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
            )}
            {filterType === 'month' && (
                <div className="flex flex-col items-center">
                     <label htmlFor="month-select" className="block text-sm text-gray-400 mb-1">Select Month</label>
                     <select
                        id="month-select"
                        onChange={e => handleMonthChange(e.target.value)}
                        className="w-full max-w-xs bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-cyan-500"
                        defaultValue=""
                     >
                        <option value="" disabled>-- Select a Month --</option>
                        {availableMonths.map(month => (
                            <option key={month} value={month}>
                                {new Date(`${month}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </option>
                        ))}
                     </select>
                </div>
            )}
            {filterType === 'period' && (
                <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={() => handlePeriodChange(30)} className="bg-gray-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Last 30 Days</button>
                    <button onClick={() => handlePeriodChange(90)} className="bg-gray-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Last 90 Days</button>
                    <button onClick={() => handlePeriodChange(365)} className="bg-gray-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Last Year</button>
                </div>
            )}
        </div>

        {!isDateRangeValid && filterType === 'dateRange' && (
          <p className="text-red-400 text-center mt-2">
            Start date cannot be after end date.
          </p>
        )}
      </div>

      {!isDateRangeValid ? (
        <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">
          <h2 className="text-xl text-red-400">Invalid Date Range</h2>
          <p>Please select a valid date range to generate a report.</p>
        </div>
      ) : reportData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg shadow-xl text-center">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">Total Distance</h3>
                  <p className="text-3xl font-light">{totalDistance.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">km</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-xl text-center">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">Total Fuel</h3>
                  <p className="text-3xl font-light">{totalLiters.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">Liters</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-xl text-center">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">Avg. Consumption</h3>
                  <p className="text-3xl font-light">{overallConsumption.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">L/100km</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-xl text-center">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">Total Cost</h3>
                  <p className="text-3xl font-light">{totalCost.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Toman</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-xl text-center sm:col-span-2 md:col-span-1">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">Cost Breakdown</h3>
                  <p className="text-xl font-light">{avgPricePerLiter.toFixed(0)} <span className="text-sm text-gray-400">Toman/L</span></p>
                  <p className="text-xl font-light mt-1">{avgCostPerKm.toFixed(0)} <span className="text-sm text-gray-400">Toman/km</span></p>
              </div>
          </div>


          <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Consumption Trend</h3>
             <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" domain={['dataMin - 1', 'dataMax + 1']}/>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="L/100km" stroke="#2DD4BF" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-center">Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-cyan-400 uppercase bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3 text-right">Distance (km)</th>
                    <th scope="col" className="px-6 py-3 text-right">Liters</th>
                    <th scope="col" className="px-6 py-3 text-right">Price (Toman)</th>
                    <th scope="col" className="px-6 py-3 text-right">L/100km</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-4 text-right">{item.distance.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{item.liters.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">{item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold">{item.consumption.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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