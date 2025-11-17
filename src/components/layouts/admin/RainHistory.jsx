import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export default function RainHistory() {
  const [rainOuts, setRainOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllRainOuts, setShowAllRainOuts] = useState(false);

  // Fetch all rain outs
  const fetchRainOuts = async () => {
    try {
      setLoading(true);
      const data = await api.getAllRainOuts();
      setRainOuts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rain outs:', err);
      setError('Failed to load rain out records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRainOuts();
  }, []);


  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !min-h-screen">
        <div className="!text-xl !text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !p-6">
      {error && (
        <div className="!max-w-6xl !mx-auto !mb-4 !bg-red-100 !border !border-red-400 !text-red-700 !px-4 !py-3 !rounded">
          {error}
        </div>
      )}

      {/* Rain Out Records */}
      <div className="!max-w-6xl !mx-auto">
        <div className="!bg-white !rounded-2xl !shadow-xl !p-8">
          <h2 className="!text-2xl !font-bold !text-gray-800 !mb-6">Rain Out History</h2>

          {rainOuts.length === 0 ? (
            <div className="!text-center !py-12 !text-gray-500">
              <p className="!text-lg">No rain outs recorded. Park is operating normally! ☀️</p>
            </div>
          ) : (
            <>
              <div className="!space-y-4">
                {(showAllRainOuts ? rainOuts : rainOuts.slice(0, 3)).map((rainOut) => (
                  <div
                    key={rainOut.rain_out_id}
                    className={`!p-6 !rounded-xl !border-2 !transition ${
                      rainOut.status === 'active'
                        ? '!bg-red-50 !border-red-300'
                        : '!bg-green-50 !border-green-300'
                    }`}
                  >
                    <div className="!flex !justify-between !items-start">
                      <div className="!flex-1">
                        <div className="!flex !items-center !gap-3 !mb-2">
                          <span className="!text-2xl">
                            {rainOut.status === 'active' ? '☔' : '☀️'}
                          </span>
                          <div>
                            <h3 className="!text-xl !font-bold !text-gray-800">
                              {(() => {
                                // Parse date as local time to avoid timezone issues
                                const dateParts = rainOut.rain_out_date.split('-');
                                const year = parseInt(dateParts[0], 10);
                                const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
                                const day = parseInt(dateParts[2], 10);
                                const localDate = new Date(year, month, day);
                                return localDate.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                              })()}
                            </h3>
                            <span
                              className={`!inline-block !px-3 !py-1 !rounded-full !text-sm !font-bold !mt-1 ${
                                rainOut.status === 'active'
                                  ? '!bg-red-600 !text-white'
                                  : '!bg-green-600 !text-white'
                              }`}
                            >
                              {rainOut.status === 'active' ? '🔴 ACTIVE - Rides Closed' : '✅ Cleared - Rides Open'}
                            </span>
                          </div>
                        </div>

                        {rainOut.note && (
                          <p className="!text-gray-700 !ml-11 !mt-2">
                            <strong>Note:</strong> {rainOut.note}
                          </p>
                        )}

                        {/* Display employee information */}
                        <div className="!ml-11 !mt-2">
                          {rainOut.activate_emp_first_name && (
                            <p className="!text-sm !text-gray-600 !my-1">
                              <strong>Activated by:</strong> {rainOut.activate_emp_first_name} {rainOut.activate_emp_last_name}
                            </p>
                          )}
                          {rainOut.status === 'cleared' && rainOut.clear_emp_first_name && (
                            <p className="!text-sm !text-gray-600 !my-1">
                              <strong>Cleared by:</strong> {rainOut.clear_emp_first_name} {rainOut.clear_emp_last_name}
                              <strong> At:</strong> {(() => {
                                const date = new Date(rainOut.resolved_at);
                                return date.toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true
                                });
                              })()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More / Show Less Button */}
              {rainOuts.length > 3 && (
                <div className="!text-center !mt-5">
                  <button
                    onClick={() => setShowAllRainOuts(!showAllRainOuts)}
                    className="!px-6 !py-3 !bg-[#A7C1A8] !text-white !rounded-lg !font-bold hover:!bg-[#819A91] !transition !border-none"
                  >
                    {showAllRainOuts ? 'Show Less' : `Show More (${rainOuts.length - 3} more)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>


    </div>
  );
}
