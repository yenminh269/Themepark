import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "./CartContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { useState, useEffect } from "react";
import { api, getImageUrl } from "../../../services/api";

export default function StorePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, total, storeCart, addToStoreCart, removeFromStoreCart, storeTotal, clearStoreCart } = useCart();

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
    // For online stores, check unified cart; for in-park stores, check storeCart
    if (store?.available_online) {
      const item = cart.find((i) => i.id === itemId && i.storeId === parseInt(storeId) && i.type === 'store');
      return item ? item.quantity : 0;
    } else {
      const item = storeCart.find((i) => i.id === itemId);
      return item ? item.quantity : 0;
    }
  };

  const handleAddItem = (item) => {
    if (store?.available_online) {
      // Add to unified cart with type 'store'
      addToCart({
        id: item.item_id,
        name: item.item_name,
        price: parseFloat(item.price),
        storeId: parseInt(storeId),
        storeName: store.name,
        type: 'store'
      });
    } else {
      // Add to legacy storeCart for in-park only stores
      addToStoreCart({
        id: item.item_id,
        name: item.item_name,
        price: parseFloat(item.price),
        storeId: parseInt(storeId)
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    if (store?.available_online) {
      // Remove from unified cart
      removeFromCart(itemId, parseInt(storeId));
    } else {
      // Remove from legacy storeCart
      removeFromStoreCart(itemId);
    }
  };

  const handleCheckout = () => {
    if (store?.available_online) {
      navigate('/checkout'); // Go to unified checkout
    } else {
      navigate('/store-checkout', { state: { storeId: parseInt(storeId), storeName: store?.name } });
    }
  };

  // Get current store cart items and total
  const getCurrentStoreCart = () => {
    if (store?.available_online) {
      return cart.filter(item => item.type === 'store' && item.storeId === parseInt(storeId));
    } else {
      return storeCart;
    }
  };

  const getCurrentStoreTotal = () => {
    if (store?.available_online) {
      return cart
        .filter(item => item.type === 'store' && item.storeId === parseInt(storeId))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    } else {
      return storeTotal;
    }
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
        {/* In-Park Only Notice for Food Stores */}
        {!store.available_online && (
          <div className="!mb-6 !bg-gradient-to-r !from-blue-50 !to-indigo-50 !border-2 !border-blue-300 !rounded-xl !p-6 !shadow-lg">
            <div className="!flex !items-start !gap-4">
              <div className="!text-4xl">🎢</div>
              <div>
                <h3 className="!text-xl !font-bold !text-blue-900 !mb-2">In-Park Purchase Only</h3>
                <p className="!text-blue-800 !mb-2">
                  This food & beverage menu is available for <strong>in-park orders only</strong>.
                  Browse our delicious items here, then visit us at the park to place your order!
                </p>
                <p className="!text-sm !text-blue-700">
                  💡 Tip: Save this menu to quickly order when you arrive at the park
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="!mb-6">
          <h2 className="!text-2xl !font-bold !text-[#176B87]">
            {store.available_online ? 'Available Items' : 'Menu'}
          </h2>
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
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.item_name}
                      className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                    />
                  ) : (
                    <div className="!w-full !h-full !bg-gray-200 !flex !items-center !justify-center">
                      <span className="!text-gray-500 !text-sm">📦</span>
                    </div>
                  )}

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
                        onClick={() => handleRemoveItem(item.item_id)}
                        disabled={getQuantity(item.item_id) === 0}
                        className="!px-3 !py-1 !bg-white !border !border-[#176B87] !text-[#176B87] !rounded-lg hover:!bg-[#EEF5FF] !transition !disabled:opacity-50 !disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="!px-2 !font-semibold !text-[#176B87] !min-w-[20px] !text-center">
                        {getQuantity(item.item_id)}
                      </span>
                      <button
                        onClick={() => handleAddItem(item)}
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
        {getCurrentStoreCart().length > 0 && (
          <div className="!mt-10 !bg-white/70 !p-6 !rounded-xl !shadow">
            <div className="!flex !justify-between !items-center !mb-4">
              <div>
                <p className="!text-lg !font-semibold !text-[#176B87]">
                  Store Total: ${getCurrentStoreTotal().toFixed(2)}
                </p>
                <p className="!text-sm !text-gray-600">
                  {getCurrentStoreCart().reduce((sum, item) => sum + item.quantity, 0)} items from {store.name}
                </p>
              </div>
              {store.available_online ? (
                <button
                  onClick={handleCheckout}
                  className="!px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none"
                >
                  Go to Checkout
                </button>
              ) : (
                <button
                  disabled
                  className="!px-6 !py-3 !bg-gray-400 !text-white !rounded-lg !font-bold !cursor-not-allowed !border-none"
                >
                  🎢 Purchase at Park
                </button>
              )}
            </div>
            {!store.available_online && (
              <div className="!bg-blue-50 !border !border-blue-200 !rounded-lg !p-4 !text-sm !text-blue-800">
                <p className="!font-semibold !mb-1">🎢 In-Park Purchase Only</p>
                <p>
                  This is a food/beverage store. Please visit <strong>{store.name}</strong> at the park to complete your order.
                  You can browse the menu here and order when you arrive!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <PageFooter />
    </div>
  );
}
