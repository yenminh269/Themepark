import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export default function RainOutManagement() {
  const [rainOuts, setRainOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRainOut, setNewRainOut] = useState({
    rain_out_date: '',
    note: ''
  });

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

  // Create new rain out (will close all rides automatically via trigger)
  const handleCreateRainOut = async (e) => {
    e.preventDefault();
    try {
      await api.createRainOut(newRainOut);
      alert('Rain out activated! All rides have been closed.');
      setShowAddModal(false);
      setNewRainOut({ rain_out_date: '', note: '' });
      fetchRainOuts();
    } catch (err) {
      console.error('Error creating rain out:', err);
      alert(err.message || 'Failed to create rain out');
    }
  };

  // Clear rain out (will open all rides automatically via trigger)
  const handleClearRainOut = async (id) => {
    if (!confirm('Clear this rain out? All closed rides will be reopened.')) return;

    try {
      await api.updateRainOut(id, { status: 'cleared' });
      alert('Rain out cleared! All rides have been reopened.');
      fetchRainOuts();
    } catch (err) {
      console.error('Error clearing rain out:', err);
      alert('Failed to clear rain out');
    }
  };

  if (loading) {
    return (
      <div className="!flex !items-center !justify-center !min-h-screen">
        <div className="!text-xl !text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-blue-50 !via-blue-100 !to-indigo-100 !p-6">
      {/* Header */}
      <div className="!max-w-6xl !mx-auto !mb-8">
        <div className="!bg-white !rounded-2xl !shadow-xl !p-8">
          <div className="!flex !justify-between !items-center">
            <div>
              <h1 className="!text-4xl !font-black !text-blue-900 !mb-2">
                ☔ Rain Out Management
              </h1>
              <p className="!text-gray-600">
                Control park operations during bad weather. All rides will automatically close/open.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="!px-6 !py-3 !bg-red-600 !text-white !rounded-lg !font-bold hover:!bg-red-700 !transition !border-none !shadow-lg"
            >
              ☔ Activate Rain Out
            </button>
          </div>
        </div>
      </div>

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
            <div className="!space-y-4">
              {rainOuts.map((rainOut) => (
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
                            {new Date(rainOut.rain_out_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
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

                      {rainOut.resolved_at && (
                        <p className="!text-sm !text-gray-500 !ml-11 !mt-2">
                          Cleared at: {new Date(rainOut.resolved_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {rainOut.status === 'active' && (
                      <button
                        onClick={() => handleClearRainOut(rainOut.rain_out_id)}
                        className="!px-4 !py-2 !bg-green-600 !text-white !rounded-lg !font-bold hover:!bg-green-700 !transition !border-none"
                      >
                        ☀️ Clear Rain Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Rain Out Modal */}
      {showAddModal && (
        <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50">
          <div className="!bg-white !rounded-2xl !p-8 !max-w-md !w-full !mx-4 !shadow-2xl">
            <h2 className="!text-2xl !font-bold !text-gray-800 !mb-6">☔ Activate Rain Out</h2>

            <form onSubmit={handleCreateRainOut}>
              <div className="!mb-4">
                <label className="!block !text-sm !font-bold !text-gray-700 !mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={newRainOut.rain_out_date}
                  onChange={(e) => setNewRainOut({ ...newRainOut, rain_out_date: e.target.value })}
                  className="!w-full !px-4 !py-2 !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                />
              </div>

              <div className="!mb-6">
                <label className="!block !text-sm !font-bold !text-gray-700 !mb-2">
                  Note (optional)
                </label>
                <textarea
                  value={newRainOut.note}
                  onChange={(e) => setNewRainOut({ ...newRainOut, note: e.target.value })}
                  placeholder="Heavy rain expected..."
                  className="!w-full !px-4 !py-2 !border !border-gray-300 !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="!bg-yellow-50 !border !border-yellow-300 !rounded-lg !p-4 !mb-6">
                <p className="!text-sm !text-yellow-800 !font-semibold">
                  ⚠️ Warning: This will automatically close ALL rides in the park!
                </p>
              </div>

              <div className="!flex !gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="!flex-1 !px-4 !py-2 !bg-gray-300 !text-gray-700 !rounded-lg !font-bold hover:!bg-gray-400 !transition !border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="!flex-1 !px-4 !py-2 !bg-red-600 !text-white !rounded-lg !font-bold hover:!bg-red-700 !transition !border-none"
                >
                  Activate Rain Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
