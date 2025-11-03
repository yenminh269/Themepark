import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { round } from "../../../utils/money";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { useState } from "react";
import { api } from "../../../services/api";
import { toast } from "react-toastify";

export default function StoreCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeCart, storeTotal, clearStoreCart } = useCart();
  const TAX_RATE = 0.0825;
  const tax = round(storeTotal * TAX_RATE);
  const grandTotal = round(storeTotal + tax);

  const { user } = useAuth();

  const { storeId, storeName } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);

  const handleSubmitOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!storeCart.length) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessing(true);

    try {
      // Create the store order
      const orderData = {
        cart: storeCart,
        subtotal: storeTotal,
        tax,
        total: grandTotal,        // send total WITH tax
        payment_method: paymentMethod,
        store_id: storeId,
      };


      const result = await api.createStoreOrder(orderData);

      // Clear the store cart
      clearStoreCart();

      // Show success message and redirect
      toast.success('Order placed successfully!');
      navigate('/order-confirmation', {
        state: {
          order: result.order,
          orderType: 'store',
          storeName: storeName
        }
      });

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (!storeCart.length) {
    return (
      <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
        <main className="!flex-1 !flex !items-center !justify-center">
          <div className="!text-center">
            <p className="!text-lg !text-slate-600 !mb-4">Your store cart is empty</p>
            <button
              onClick={() => navigate('/stores')}
              className="!px-4 !py-2 !bg-[#176B87] !text-white !rounded-lg !font-semibold hover:!opacity-90 !transition !border-none"
            >
              Browse Stores
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

      <main className="!flex-1 !max-w-4xl !mx-auto !p-6">
        <div className="!mb-8">
          <h1 className="!text-3xl !font-bold !text-[#176B87] !mb-2">
            Checkout - {storeName}
          </h1>
          <p className="!text-gray-600">Review your order and complete your purchase</p>
        </div>

        <div className="!grid lg:!grid-cols-2 !gap-8">
          {/* Order Summary */}
          <div className="!bg-white !rounded-2xl !p-6 !shadow-lg">
            <h2 className="!text-xl !font-bold !text-[#176B87] !mb-4">Order Summary</h2>

            <div className="!space-y-4">
              {storeCart.map((item) => (
                <div key={item.id} className="!flex !justify-between !items-center !py-2 !border-b !border-gray-100">
                  <div>
                    <p className="!font-semibold !text-[#176B87]">{item.name}</p>
                    <p className="!text-sm !text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="!font-bold !text-[#176B87]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="!mt-6 !pt-4 !border-t !border-gray-200">
              <div className="!flex !justify-between !text-slate-700">
                <span>Subtotal</span>
                <span>${storeTotal.toFixed(2)}</span>
              </div>
              <div className="!flex !justify-between !text-slate-700">
                <span>Tax (8.25%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="!flex !justify-between !items-center !text-xl !font-bold !text-[#176B87] !mt-2">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

          </div>

          {/* Payment & Customer Info */}
          <div className="!space-y-6">
            {/* Customer Information */}
            <div className="!bg-white !rounded-2xl !p-6 !shadow-lg">
              <h2 className="!text-xl !font-bold !text-[#176B87] !mb-4">Customer Information</h2>

              {user ? (
                <div className="!space-y-3">
                  <div>
                    <label className="!block !text-sm !font-medium !text-gray-700 !mb-1">Name</label>
                    <p className="!text-[#176B87] !font-semibold">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="!block !text-sm !font-medium !text-gray-700 !mb-1">Email</label>
                    <p className="!text-[#176B87] !font-semibold">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="!text-center !py-4">
                  <p className="!text-gray-600 !mb-4">Please log in to continue with your order</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="!px-4 !py-2 !bg-[#176B87] !text-white !rounded-lg !font-semibold hover:!opacity-90 !transition !border-none"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="!bg-white !rounded-2xl !p-6 !shadow-lg">
              <h2 className="!text-xl !font-bold !text-[#176B87] !mb-4">Payment Method</h2>

              <div className="!flex justify-between">
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className=""
                  /> <span className="!text-gray-700">💵 Cash</span>
                </label>

                <label >
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  /><span className="!text-gray-700">💳 Credit Card</span>
                </label>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="!bg-white !rounded-2xl !p-6 !shadow-lg">
              <button
                onClick={handleSubmitOrder}
                disabled={processing || !user}
                className="!w-full !px-6 !py-4 !bg-[#176B87] !text-white !rounded-xl !font-bold !text-lg hover:!opacity-90 !transition !border-none !disabled:opacity-50 !disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : `Complete Order - $${grandTotal.toFixed(2)}`}
              </button>

              {!user && (
                <p className="!text-center !text-sm !text-gray-500 !mt-2">
                  Please log in to place your order
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
