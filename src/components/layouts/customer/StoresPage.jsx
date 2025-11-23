import { useNavigate } from "react-router-dom";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { useState, useEffect } from "react";
import { api, getImageUrl } from "../../../services/api";
import Loading from "../admin/loading/Loading"

export default function StoresPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stores from backend
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const result = await api.getAllStores();
        setStores(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleStoreClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-[#EEF5FF] !text-slate-800">
      {/* Navbar is now global in App.jsx */}

      {/* Store Selection */}
      <main className="!flex-1 !max-w-6xl !mx-auto !p-6">
        <div className="!text-center !mb-8">
          <h1 className="!text-3xl !font-bold !text-[#176B87] !mb-4">
            🏰 Shop at Velocity Valley
          </h1>
          <p className="!text-lg !text-gray-700">
            Browse our merchandise stores and find the perfect souvenirs!
          </p>
        </div>

        {loading && (
          <div className="!text-center !py-10">
            <Loading />
            <p className="!text-lg !text-[#176B87]">Loading stores...</p>
          </div>
        )}

        {error && (
          <div className="!bg-red-100 !border !border-red-400 !text-red-700 !px-4 !py-3 !rounded !mb-6">
            <p>Error loading stores: {error}</p>
          </div>
        )}

        {!loading && !error && stores.length === 0 && (
          <div className="!text-center !py-10">
            <p className="!text-lg !text-slate-600">No stores available at the moment.</p>
          </div>
        )}

        {!loading && !error && stores.length > 0 && (
          <div className="!grid sm:!grid-cols-2 lg:!grid-cols-3 !gap-6">
            {stores.map((store) => (
              <div
                key={store.store_id}
                onClick={() => handleStoreClick(store.store_id)}
                className="!bg-white !rounded-2xl !shadow-lg hover:!shadow-2xl !overflow-hidden !border !border-[#B4D4FF] !transition-all hover:!scale-[1.02] !group !cursor-pointer"
              >
                <div className="!relative !w-full !h-56 !overflow-hidden !bg-[#749BC2]">
                  <img
                    src={getImageUrl(store.photo_path, store.name)}
                    alt={store.name}
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  {/* Overlay for better text contrast */}
                  <div className="!absolute !inset-0 !bg-[#176B87]/20 !pointer-events-none"></div>

                  {/* Status Badge */}
                  <div className="!absolute !top-3 !right-3 !px-3 !py-1 !bg-white/95 backdrop-blur-sm !rounded-full !text-xs !font-bold !shadow-lg">
                    {store.status === 'open' ? (
                      <span className="!text-green-600">✅ Open</span>
                    ) : store.status === 'maintenance' ? (
                      <span className="!text-orange-600">🔧 Maintenance</span>
                    ) : (
                      <span className="!text-red-600">🔒 Closed</span>
                    )}
                  </div>
                </div>

                <div className="!p-6">
                  <div className="!flex !items-start !justify-between !mb-3">
                    <h3 className="!text-xl !font-bold !text-[#176B87] !leading-tight">
                      {store.name}
                    </h3>
                    <span className="!text-sm !font-semibold !text-gray-500 !ml-2 !capitalize">
                      {store.type.replace('_', ' ')}
                    </span>
                  </div>

                  {store.description && (
                    <p className="!text-sm !text-gray-600 !mb-4 !line-clamp-2 !leading-relaxed">
                      {store.description}
                    </p>
                  )}

                  <div className="!text-sm !text-gray-500 !mb-4 !space-y-2">
                    <div className="!flex !items-center !gap-2">
                      <span>🕐</span>
                      <span>{store.open_time.slice(0,5)} - {store.close_time.slice(0,5)}</span>
                    </div>

                    {/* Online/In-Park Badge */}
                    <div className="!flex !items-center !gap-2">
                      {store.available_online ? (
                        <span className="!inline-flex !items-center !gap-1 !px-2 !py-1 !bg-green-100 !text-green-700 !rounded-md !text-xs !font-semibold">
                          🌐 Shop Online
                        </span>
                      ) : (
                        <span className="!inline-flex !items-center !gap-1 !px-2 !py-1 !bg-blue-100 !text-blue-700 !rounded-md !text-xs !font-semibold">
                          🎢 In-Park Only
                        </span>
                      )}
                    </div>
                  </div>

                  <button className="!w-full !px-4 !py-2 !bg-[#176B87] !text-white !rounded-lg !font-semibold hover:!opacity-90 !transition !border-none">
                    {store.available_online ? 'Browse Store' : 'View Menu (Visit Park to Order)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PageFooter />
    </div>
  );
}
