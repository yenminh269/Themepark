import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "./CartContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { useState, useEffect } from "react";
import { api, getImageUrl } from "../../../services/api";

export default function StorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { storeCart, addToStoreCart, removeFromStoreCart, storeTotal, clearStoreCart } = useCart();

  const [store, setStore] = useState(null);
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch store and merchandise data
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);

        // Fetch store details
        const stores = await api.getAllStores();
        const currentStore = stores.find(s => s.store_id == storeId);
        if (!currentStore) {
          throw new Error('Store not found');
        }
        setStore(currentStore);

        // Fetch inventory for this store
        const inventory = await api.getStoreInventory(storeId);
        setMerchandise(inventory);

        setError(null);
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const getQuantity = (itemId) => {
    const item = storeCart.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleCheckout = () => {
    navigate('/store-checkout', { state: { storeId: parseInt(storeId), storeName: store?.name } });
  };

  if (loading) {
    return (
      <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
        <main className="!flex-1 !flex !items-center !justify-center">
          <p className="!text-lg !text-[#176B87]">Loading store...</p>
        </main>
        <PageFooter />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
        <main className="!flex-1 !flex !items-center !justify-center">
          <div className="!text-center">
            <p className="!text-lg !text-red-600 !mb-4">Error: {error || 'Store not found'}</p>
            <button
              onClick={() => navigate('/stores')}
              className="!px-4 !py-2 !bg-[#176B87] !text-white !rounded-lg !font-semibold hover:!opacity-90 !transition !border-none"
            >
              Back to Stores
            </button>
          </div>
        </main>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
      {/* Navbar is now global in App.jsx */}

      {/* Store Header */}
      <div className="!bg-white/70 !py-8">
        <div className="!max-w-6xl !mx-auto !px-6">
          <div className="!flex !items-center !gap-4 !mb-4">
            <button
              onClick={() => navigate('/stores')}
              className="!px-4 !py-2 !bg-white !border !border-[#176B87] !text-[#176B87] !rounded-lg hover:!bg-[#EEF5FF] !transition !border-solid"
            >
              ← Back to Stores
            </button>
          </div>

          <div className="!flex !items-center !gap-6">
            <div className="!w-24 !h-24 !rounded-2xl !overflow-hidden !bg-gradient-to-br !from-[#176B87] !to-[#86B6F6] !flex-shrink-0">
              <img
                src={getImageUrl(store.photo_path, store.name)}
                alt={store.name}
                className="!w-full !h-full !object-cover"
              />
            </div>
            <div>
              <h1 className="!text-3xl !font-bold !text-[#176B87] !mb-2">
                {store.name}
              </h1>
              <p className="!text-gray-600 !mb-2">{store.description}</p>
              <div className="!flex !items-center !gap-4 !text-sm !text-gray-500">
                <span className="!capitalize">{store.type.replace('_', ' ')}</span>
                <span>🕐 {store.open_time} - {store.close_time}</span>
                <span className={`!px-2 !py-1 !rounded-full !text-xs !font-bold ${
                  store.status === 'open' ? '!bg-green-100 !text-green-700' :
                  store.status === 'maintenance' ? '!bg-orange-100 !text-orange-700' :
                  '!bg-red-100 !text-red-700'
                }`}>
                  {store.status === 'open' ? '✅ Open' :
                   store.status === 'maintenance' ? '🔧 Maintenance' : '🔒 Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merchandise Grid */}
      <main className="!flex-1 !max-w-6xl !mx-auto !p-6">
        <div className="!mb-6">
          <h2 className="!text-2xl !font-bold !text-[#176B87]">Available Items</h2>
        </div>

        {merchandise.length === 0 && (
          <div className="!text-center !py-10">
            <p className="!text-lg !text-slate-600">No items available in this store at the moment.</p>
          </div>
        )}

        {merchandise.length > 0 && (
          <div className="!grid sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4 !gap-6">
            {merchandise.map((item) => (
              <div
                key={item.item_id}
                className="!bg-white !rounded-2xl !shadow-lg hover:!shadow-2xl !overflow-hidden !border !border-[#B4D4FF] !transition-all hover:!scale-[1.02] !group"
              >
                <div className="!relative !w-full !h-48 !overflow-hidden !bg-gradient-to-br !from-[#176B87] !to-[#86B6F6]">
                  <div className="!w-full !h-full !bg-gray-200 !flex !items-center !justify-center">
                    <span className="!text-gray-500 !text-sm">📦</span>
                  </div>

                  {/* Stock Badge */}
                  <div className="!absolute !top-3 !right-3 !px-3 !py-1 !bg-white/95 backdrop-blur-sm !rounded-full !text-xs !font-bold !shadow-lg">
                    {item.stock_quantity > 10 ? (
                      <span className="!text-green-600">In Stock</span>
                    ) : item.stock_quantity > 0 ? (
                      <span className="!text-orange-600">Low Stock</span>
                    ) : (
                      <span className="!text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>

                <div className="!p-4">
                  <div className="!flex !items-start !justify-between !mb-2">
                    <h3 className="!text-lg !font-bold !text-[#176B87] !leading-tight">
                      {item.item_name}
                    </h3>
                    <span className="!text-xl !font-black !text-[#176B87] !ml-2">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>

                  <p className="!text-xs !text-gray-500 !mb-2 !capitalize">
                    {item.item_type}
                  </p>

                  {item.description && (
                    <p className="!text-sm !text-gray-600 !mb-3 !line-clamp-2 !leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="!flex !items-center !justify-between">
                    <div className="!text-xs !text-gray-500">
                      Stock: {item.stock_quantity}
                    </div>
                    <div className="!flex !gap-2 !items-center">
                      <button
                        onClick={() => removeFromStoreCart(item.item_id)}
                        disabled={getQuantity(item.item_id) === 0}
                        className="!px-3 !py-1 !bg-white !border !border-[#176B87] !text-[#176B87] !rounded-lg hover:!bg-[#EEF5FF] !transition !disabled:opacity-50 !disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="!px-2 !font-semibold !text-[#176B87] !min-w-[20px] !text-center">
                        {getQuantity(item.item_id)}
                      </span>
                      <button
                        onClick={() => addToStoreCart({
                          id: item.item_id,
                          name: item.item_name,
                          price: parseFloat(item.price),
                          storeId: parseInt(storeId)
                        })}
                        disabled={item.stock_quantity === 0 || getQuantity(item.item_id) >= item.stock_quantity}
                        className="!px-3 !py-1 !bg-[#176B87] !text-white !rounded-lg hover:!opacity-90 !transition !disabled:opacity-50 !disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Store Cart Summary */}
        {storeCart.length > 0 && (
          <div className="!mt-10 !bg-white/70 !p-6 !rounded-xl !shadow !flex !justify-between !items-center">
            <div>
              <p className="!text-lg !font-semibold !text-[#176B87]">
                Store Total: ${storeTotal.toFixed(2)}
              </p>
              <p className="!text-sm !text-gray-600">
                {storeCart.reduce((sum, item) => sum + item.quantity, 0)} items from {store.name}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="!px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none"
            >
              Checkout from {store.name}
            </button>
          </div>
        )}
      </main>

      <PageFooter />
    </div>
  );
}
