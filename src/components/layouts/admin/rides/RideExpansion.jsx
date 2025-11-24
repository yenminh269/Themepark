import { useState, useEffect } from 'react';
import { api } from '../../../../services/api';
import Loading from '../loading/Loading';

export default function RideExpansion() {
  const [expansions, setExpansions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllExpansions, setShowAllExpansions] = useState(false);

  // Fetch all ride expansion history
  const fetchExpansions = async () => {
    try {
      setLoading(true);
      const data = await api.getRideExpansionHistory();
      setExpansions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching ride expansion history:', err);
      setError('Failed to load ride expansion records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpansions();
  }, []);


  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !min-h-screen">
        <Loading />
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

      {/* Expansion Records */}
      <div className="!max-w-6xl !mx-auto">
        <div className="!bg-white !rounded-2xl !shadow-xl !p-8">
          <h2 className="!text-2xl !font-bold !text-[#3A6F43] !mb-6">Ride Expansion History</h2>

          {expansions.length === 0 ? (
            <div className="!text-center !py-12 !text-gray-500">
              <p className="!text-lg">No ride expansions recorded yet.</p>
            </div>
          ) : (
            <>
              <div className="!space-y-4">
                {(showAllExpansions ? expansions : expansions.slice(0, 3)).map((expansion, index) => (
                  <div
                    key={index}
                    className="!p-6 !rounded-xl !border-2 !bg-blue-50 !border-blue-300 !transition"
                  >
                    <div className="!flex !justify-between !items-start">
                      <div className="!flex-1">
                        <div className="!flex !items-center !gap-3 !mb-2">
                          <div>
                            <h3 className="!text-xl !font-bold !text-gray-800">
                             ↗️ {expansion.name || 'Unknown Ride'}
                            </h3>
                            <span
                              className="!inline-block !px-3 !py-1 !rounded-full !text-md !font-bold !mt-1 bg-blue-600 text-white"
                            >Expansion Approved
                            </span>
                          </div>
                        </div>

                        {/* Display expansion date */}
                        <div className="!mt-2">
                          <p className="!text-md !text-gray-700 !my-1">
                            <strong>Expansion Date:</strong> {(() => {
                              // Parse date as local time to avoid timezone issues
                              const dateParts = expansion.expand_date.split('-');
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
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More / Show Less Button */}
              {expansions.length > 3 && (
                <div className="!text-center !mt-5">
                  <button
                    onClick={() => setShowAllExpansions(!showAllExpansions)}
                    className="!px-6 !py-3 !bg-[#A7C1A8] !text-white !rounded-lg !font-bold hover:!bg-[#819A91] !transition !border-none"
                  >
                    {showAllExpansions ? 'Show Less' : `Show More (${expansions.length - 3} more)`}
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
