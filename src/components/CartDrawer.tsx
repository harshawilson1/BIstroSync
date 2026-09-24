import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Layers,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderPlaced }) => {
  const {
    cart,
    cartSubtotal,
    cartCount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    currentUser,
    tables,
    inventory
  } = useRestaurant();

  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [selectedTable, setSelectedTable] = useState<number>(currentUser?.tableNumber || 1);
  const [guestName, setGuestName] = useState(currentUser?.name || 'Valued Guest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depletionSummary, setDepletionSummary] = useState<any>(null);

  if (!isOpen) return null;

  const tax = Math.round(cartSubtotal * 0.08 * 100) / 100;
  const total = Math.round((cartSubtotal + tax) * 100) / 100;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        type: orderType,
        tableNumber: orderType === 'dine-in' ? selectedTable : undefined,
        customerName: guestName
      });

      // Find ingredients used for this order
      const affectedIngredients: { name: string; currentStock: number; unit: string }[] = [];
      cart.forEach((ci) => {
        if (ci.item.ingredients) {
          ci.item.ingredients.forEach((ing) => {
            const inv = inventory.find((i) => i.id === ing.inventoryId);
            if (inv && !affectedIngredients.find((a) => a.name === inv.name)) {
              affectedIngredients.push({
                name: inv.name,
                currentStock: inv.currentStock,
                unit: inv.unit
              });
            }
          });
        }
      });

      setDepletionSummary({
        orderNumber: order.orderNumber,
        itemsCount: cart.length,
        affectedIngredients
      });

      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-5 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-base font-bold tracking-tight">Order Tray</h2>
                <p className="text-xs text-stone-400">
                  {cartCount} {cartCount === 1 ? 'dish' : 'dishes'} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content or Depletion Receipt */}
          {depletionSummary ? (
            <div className="p-6 flex-1 overflow-y-auto space-y-5 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  Ticket #{depletionSummary.orderNumber} Dispatched!
                </h3>
                <p className="text-xs text-stone-500">
                  Kitchen received the order ticket and raw ingredients were depleted from the backend database in real-time.
                </p>
              </div>

              {/* Real-time Inventory Impact Card */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>Real-Time Database Inventory Depletion</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Our recipe engine dynamically deducted inventory units based on this order:
                </p>
                <div className="space-y-1.5 pt-1">
                  {depletionSummary.affectedIngredients.map((ing: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-xs bg-white/80 p-2 rounded-lg border border-amber-200/60"
                    >
                      <span className="font-semibold text-stone-800">{ing.name}</span>
                      <span className="font-mono text-[11px] text-amber-900">
                        Remaining: {ing.currentStock} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setDepletionSummary(null);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
              >
                Close & Return to Menu
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-stone-400 space-y-3">
                  <UtensilsCrossed className="w-12 h-12 mx-auto text-stone-300" />
                  <p className="text-sm font-semibold text-stone-600">Your order tray is empty.</p>
                  <p className="text-xs text-stone-400">
                    Add handcrafted entrees, starters, or wines from our menu.
                  </p>
                </div>
              ) : (
                <>
                  {/* Order Options */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700">Order Style</span>
                      <div className="flex rounded-lg bg-stone-200 p-0.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setOrderType('dine-in')}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            orderType === 'dine-in'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600'
                          }`}
                        >
                          Dine-In Table
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderType('takeout')}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            orderType === 'takeout'
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-600'
                          }`}
                        >
                          Takeout
                        </button>
                      </div>
                    </div>

                    {orderType === 'dine-in' ? (
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Select Table
                        </label>
                        <select
                          value={selectedTable}
                          onChange={(e) => setSelectedTable(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-amber-500"
                        >
                          {tables.map((t) => (
                            <option key={t.id} value={t.tableNumber}>
                              Table #{t.tableNumber} ({t.section} • {t.capacity}p • {t.status.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Name for Pickup
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>Order Items ({cartCount})</span>
                      <button
                        onClick={clearCart}
                        className="text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        Clear Tray
                      </button>
                    </div>

                    {cart.map((ci) => (
                      <div
                        key={ci.item.id}
                        className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between space-x-3 shadow-xs"
                      >
                        <img
                          src={ci.item.image}
                          alt={ci.item.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-stone-100"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-stone-900 truncate">
                            {ci.item.name}
                          </h4>
                          <span className="font-mono text-xs text-amber-800 font-semibold">
                            ${ci.item.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controller */}
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => updateCartQuantity(ci.item.id, ci.quantity - 1)}
                            className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs font-mono">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(ci.item.id, ci.quantity + 1)}
                            className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromCart(ci.item.id)}
                            className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer Checkout Summary */}
          {!depletionSummary && cart.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Order Total</span>
                  <span className="font-mono text-base text-amber-800">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Transmitting to Kitchen...' : 'Fire Order Ticket'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
