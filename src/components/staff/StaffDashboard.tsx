import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  LayoutGrid,
  ShoppingBag,
  ChefHat,
  Boxes,
  CalendarCheck,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  UserCheck,
  Check,
  X,
  Coffee,
  Shield,
  Utensils
} from 'lucide-react';
import type { Table, TableStatus, InventoryItem, Order, Reservation, MenuItem } from '../../types';

interface StaffDashboardProps {
  onOpenCart: () => void;
  activeStaffSubTab: string;
  setActiveStaffSubTab: (tab: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onOpenCart,
  activeStaffSubTab,
  setActiveStaffSubTab
}) => {
  const {
    currentUser,
    tables,
    reservations,
    inventory,
    menu,
    orders,
    stats,
    updateTableStatus,
    adjustInventory,
    updateOrderStatus,
    seatReservation,
    cancelReservation,
    addToCart,
    placeOrder,
    cart,
    clearCart,
    bookReservation
  } = useRestaurant();

  // POS Order Entry state for staff
  const [posTable, setPosTable] = useState<number>(1);
  const [posCustomer, setPosCustomer] = useState('Table Guest');
  const [posType, setPosType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [posCategory, setPosCategory] = useState<string>('All');
  const [posSearch, setPosSearch] = useState('');

  // Table management modal state
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [seatPartyName, setSeatPartyName] = useState('');
  const [seatPartyGuests, setSeatPartyGuests] = useState(2);

  // Inventory Restock modal state
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // New reservation modal
  const [newResModal, setNewResModal] = useState(false);
  const [newResName, setNewResName] = useState('');
  const [newResPhone, setNewResPhone] = useState('');
  const [newResGuests, setNewResGuests] = useState(2);
  const [newResTable, setNewResTable] = useState(1);
  const [newResTime, setNewResTime] = useState('19:00');
  const [newResDate, setNewResDate] = useState(new Date().toISOString().split('T')[0]);

  // Inventory Filter state
  const [invSearch, setInvSearch] = useState('');
  const [invCategory, setInvCategory] = useState('All');

  // Reservation Date filter
  const [resFilterDate, setResFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'served' && o.status !== 'paid' && o.status !== 'cancelled').length;

  // Handle Quick Seating at table
  const handleSeatWalkIn = async () => {
    if (!selectedTable) return;
    await updateTableStatus(selectedTable.id, {
      status: 'occupied',
      customerName: seatPartyName || 'Walk-In Guests',
      seatedGuests: seatPartyGuests,
      assignedServer: currentUser?.name || 'Staff',
      occupiedSince: new Date().toISOString()
    });
    setSelectedTable(null);
    setSeatPartyName('');
  };

  // Handle Clear / Clean Table
  const handleClearTable = async (table: Table) => {
    await updateTableStatus(table.id, {
      status: 'available',
      customerName: undefined,
      seatedGuests: undefined,
      occupiedSince: undefined,
      currentOrderId: undefined
    });
  };

  // Handle Take Order directly for Table
  const handleTakeOrderForTable = (table: Table) => {
    setPosTable(table.tableNumber);
    setPosCustomer(table.customerName || `Table ${table.tableNumber} Guest`);
    setPosType('dine-in');
    setActiveStaffSubTab('pos');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Staff Workspace Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold uppercase tracking-wider">
                Staff Control Center
              </span>
              <span className="text-xs text-stone-400">• Authenticated as {currentUser?.name}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Operations & Inventory Hub
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Live seat availability, ticket dispatch, and automated recipe inventory depletion.
            </p>
          </div>

          {/* KPI Pills */}
          <div className="flex items-center gap-3">
            <div className="bg-stone-800/80 border border-stone-700 rounded-xl px-4 py-2 text-center">
              <span className="block text-[11px] font-medium text-stone-400 uppercase">Available Tables</span>
              <span className="text-lg font-bold text-emerald-400">
                {tables.filter((t) => t.status === 'available').length} / {tables.length}
              </span>
            </div>

            <div className="bg-stone-800/80 border border-stone-700 rounded-xl px-4 py-2 text-center">
              <span className="block text-[11px] font-medium text-stone-400 uppercase">Active Tickets</span>
              <span className="text-lg font-bold text-amber-400">{activeOrdersCount}</span>
            </div>

            <div className="bg-stone-800/80 border border-stone-700 rounded-xl px-4 py-2 text-center">
              <span className="block text-[11px] font-medium text-stone-400 uppercase">Low Stock Alerts</span>
              <span className={`text-lg font-bold ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lowStockCount}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Sub-navigation Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-5 mt-4 border-t border-stone-800">
          <button
            onClick={() => setActiveStaffSubTab('tables')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeStaffSubTab === 'tables'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Floor Plan & Tables</span>
          </button>

          <button
            onClick={() => setActiveStaffSubTab('pos')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeStaffSubTab === 'pos'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Take Orders (POS)</span>
          </button>

          <button
            onClick={() => setActiveStaffSubTab('kitchen')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeStaffSubTab === 'kitchen'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Display (KDS)</span>
            {activeOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-950 text-amber-300 text-[10px] rounded-full font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveStaffSubTab('inventory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeStaffSubTab === 'inventory'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Food Inventory Database</span>
            {lowStockCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-bold">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveStaffSubTab('reservations')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeStaffSubTab === 'reservations'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Reservations Roster</span>
            <span className="ml-1 px-1.5 py-0.2 bg-stone-800 text-stone-300 text-[10px] rounded-full font-bold">
              {reservations.length}
            </span>
          </button>
        </div>
      </div>

      {/* 1. FLOOR PLAN & TABLES */}
      {activeStaffSubTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h2 className="text-base font-bold text-stone-900">Interactive Restaurant Floor Plan</h2>
              <p className="text-xs text-stone-500">
                Click any table to manage seating status, assign orders, or mark for cleaning.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Reserved
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" /> Occupied
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500" /> Cleaning
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table) => {
              let borderClass = 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-500';
              let badgeBg = 'bg-emerald-100 text-emerald-800';
              if (table.status === 'reserved') {
                borderClass = 'border-amber-300 bg-amber-50/40 hover:border-amber-500';
                badgeBg = 'bg-amber-100 text-amber-800';
              } else if (table.status === 'occupied') {
                borderClass = 'border-rose-300 bg-rose-50/40 hover:border-rose-500';
                badgeBg = 'bg-rose-100 text-rose-800';
              } else if (table.status === 'cleaning') {
                borderClass = 'border-purple-300 bg-purple-50/40 hover:border-purple-500';
                badgeBg = 'bg-purple-100 text-purple-800';
              }

              // Associated active order if any
              const activeOrder = orders.find(
                (o) => o.tableNumber === table.tableNumber && o.status !== 'served' && o.status !== 'paid' && o.status !== 'cancelled'
              );

              return (
                <div
                  key={table.id}
                  className={`p-4 rounded-xl border-2 transition-all bg-white flex flex-col justify-between shadow-xs ${borderClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-extrabold text-stone-900">
                          Table #{table.tableNumber}
                        </span>
                        <span className="text-[11px] text-stone-500 capitalize">
                          ({table.shape})
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeBg}`}>
                        {table.status}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Section:</span>
                        <span className="font-medium text-stone-800">{table.section}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Capacity:</span>
                        <span className="font-medium text-stone-800">{table.capacity} Persons</span>
                      </div>

                      {table.customerName && (
                        <div className="flex justify-between pt-1 border-t border-stone-100">
                          <span className="text-stone-400">Guest:</span>
                          <span className="font-semibold text-stone-900 truncate max-w-[130px]">
                            {table.customerName}
                          </span>
                        </div>
                      )}

                      {table.occupiedSince && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400">Seated Since:</span>
                          <span className="text-stone-600">
                            {new Date(table.occupiedSince).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      {activeOrder && (
                        <div className="mt-2 p-1.5 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex justify-between items-center">
                          <span>Active Ticket #{activeOrder.orderNumber}</span>
                          <span className="capitalize font-bold">{activeOrder.status}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                    {table.status === 'available' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedTable(table);
                            setSeatPartyGuests(table.capacity);
                          }}
                          className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold text-center transition-colors"
                        >
                          Seat Walk-In
                        </button>
                        <button
                          onClick={() => handleTakeOrderForTable(table)}
                          className="py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold text-center transition-colors"
                        >
                          Take Order
                        </button>
                      </div>
                    )}

                    {table.status === 'occupied' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleTakeOrderForTable(table)}
                          className="py-1.5 px-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-semibold text-center"
                        >
                          Add Dish
                        </button>
                        <button
                          onClick={() => updateTableStatus(table.id, { status: 'cleaning' })}
                          className="py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold text-center"
                        >
                          Mark Clean
                        </button>
                      </div>
                    )}

                    {table.status === 'reserved' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            updateTableStatus(table.id, {
                              status: 'occupied',
                              occupiedSince: new Date().toISOString()
                            })
                          }
                          className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold text-center"
                        >
                          Seat Guest
                        </button>
                        <button
                          onClick={() => handleClearTable(table)}
                          className="py-1.5 px-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-semibold text-center"
                        >
                          Release
                        </button>
                      </div>
                    )}

                    {table.status === 'cleaning' && (
                      <button
                        onClick={() => handleClearTable(table)}
                        className="w-full py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold text-center"
                      >
                        Finish Cleaning (Make Available)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TAKE ORDERS / POS INTERFACE */}
      {activeStaffSubTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu Selector Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search dishes to ring up..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto">
                  {['All', 'Starters', 'Mains', 'Pasta & Pizza', 'Desserts', 'Drinks'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPosCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        posCategory === cat
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick POS Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {menu
                .filter(
                  (m) =>
                    (posCategory === 'All' || m.category === posCategory) &&
                    (m.name.toLowerCase().includes(posSearch.toLowerCase()) ||
                      m.category.toLowerCase().includes(posSearch.toLowerCase()))
                )
                .map((dish) => (
                  <button
                    key={dish.id}
                    disabled={!dish.available}
                    onClick={() => addToCart(dish)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-28 transition-all relative ${
                      dish.available
                        ? 'bg-white border-stone-200 hover:border-amber-500 hover:shadow-xs cursor-pointer'
                        : 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900 line-clamp-1">
                        {dish.name}
                      </div>
                      <div className="text-[11px] text-stone-500 capitalize">{dish.category}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      <span className="font-extrabold text-xs text-amber-800">
                        ${dish.price.toFixed(2)}
                      </span>
                      {dish.available ? (
                        <span className="p-1 rounded-md bg-stone-900 text-white">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold">Out of stock</span>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* POS Ticket Cart Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm sticky top-24 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-bold text-sm text-stone-900">Current Table Order Ticket</h3>
                <span className="text-xs text-stone-500">Waitstaff POS</span>
              </div>

              {/* Order Target Options */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPosType('dine-in')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border ${
                      posType === 'dine-in'
                        ? 'bg-amber-50 border-amber-600 text-amber-900'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Dine-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosType('takeout')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border ${
                      posType === 'takeout'
                        ? 'bg-amber-50 border-amber-600 text-amber-900'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Takeout
                  </button>
                </div>

                {posType === 'dine-in' ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Assigned Table
                    </label>
                    <select
                      value={posTable}
                      onChange={(e) => setPosTable(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.tableNumber}>
                          Table #{t.tableNumber} - {t.section} ({t.status.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Customer Pickup Name
                    </label>
                    <input
                      type="text"
                      value={posCustomer}
                      onChange={(e) => setPosCustomer(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Items in Staff Cart */}
              <div className="border-t border-stone-200 pt-3">
                <div className="flex justify-between text-xs font-semibold text-stone-700 mb-2">
                  <span>Selected Dishes ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-stone-400 hover:text-rose-600 text-[11px]"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-6 text-stone-400 text-xs">
                    Select dishes from the menu to ring up order.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {cart.map((ci) => (
                      <div
                        key={ci.item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-semibold text-stone-900 truncate">{ci.item.name}</p>
                          <p className="text-[11px] text-stone-500">
                            ${ci.item.price.toFixed(2)} x {ci.quantity}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-stone-900 shrink-0">
                          ${(ci.item.price * ci.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals & Submit */}
              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">
                        ${cart.reduce((s, i) => s + i.item.price * i.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Tax (8%):</span>
                      <span className="font-mono">
                        $
                        {(
                          cart.reduce((s, i) => s + i.item.price * i.quantity, 0) * 0.08
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                      <span>Total:</span>
                      <span className="font-mono text-amber-800">
                        $
                        {(
                          cart.reduce((s, i) => s + i.item.price * i.quantity, 0) * 1.08
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        await placeOrder({
                          type: posType,
                          tableNumber: posType === 'dine-in' ? posTable : undefined,
                          customerName: posCustomer
                        });
                        setActiveStaffSubTab('kitchen');
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    Fire Order Ticket to Kitchen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. KITCHEN DISPLAY SYSTEM (KDS) */}
      {activeStaffSubTab === 'kitchen' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h2 className="text-base font-bold text-stone-900">Kitchen Display System (KDS)</h2>
              <p className="text-xs text-stone-500">
                Live order tickets stream directly from customer app and waiter POS.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-stone-600">
              <ChefHat className="w-4 h-4 text-amber-600" />
              <span>Chef Marco Station Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: Pending / New */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  New Orders ({orders.filter((o) => o.status === 'pending').length})
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>

              {orders
                .filter((o) => o.status === 'pending')
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border-2 border-amber-300 p-4 shadow-xs space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white font-mono text-xs font-bold">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {order.type === 'dine-in' ? `Table ${order.tableNumber}` : 'Takeout'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500">
                      {order.customerName} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-stone-800 font-medium">
                          <span>
                            {it.quantity}x {it.name}
                          </span>
                          {it.notes && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded">
                              {it.notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'in-kitchen')}
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Start Cooking</span>
                    </button>
                  </div>
                ))}
            </div>

            {/* Column 2: In Kitchen */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-blue-500">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  Cooking in Kitchen ({orders.filter((o) => o.status === 'in-kitchen').length})
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>

              {orders
                .filter((o) => o.status === 'in-kitchen')
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-blue-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-mono text-xs font-bold">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {order.type === 'dine-in' ? `Table ${order.tableNumber}` : 'Takeout'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-stone-800 font-medium">
                          <span>
                            {it.quantity}x {it.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Ready for Server</span>
                    </button>
                  </div>
                ))}
            </div>

            {/* Column 3: Ready */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                  Ready to Serve ({orders.filter((o) => o.status === 'ready').length})
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              {orders
                .filter((o) => o.status === 'ready')
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-white font-mono text-xs font-bold">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-900">
                        {order.type === 'dine-in' ? `Table ${order.tableNumber}` : 'Takeout'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-stone-700">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="truncate">
                          {it.quantity}x {it.name}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="w-full py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
                    >
                      Mark Served to Guest
                    </button>
                  </div>
                ))}
            </div>

            {/* Column 4: Completed / Paid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-stone-300">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-500">
                  Served / Closed ({orders.filter((o) => o.status === 'served' || o.status === 'paid').length})
                </span>
              </div>

              {orders
                .filter((o) => o.status === 'served' || o.status === 'paid')
                .slice(0, 6)
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-stone-50 rounded-xl border border-stone-200 p-3 text-xs text-stone-600 space-y-1.5 opacity-80"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold">#{order.orderNumber}</span>
                      <span className="text-stone-500">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {order.type === 'dine-in' ? `Table ${order.tableNumber}` : 'Takeout'} •{' '}
                      {order.items.length} items
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOD INVENTORY DATABASE */}
      {activeStaffSubTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search raw ingredients, meats, sauces..."
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto">
              {[
                'All',
                'Meat & Seafood',
                'Produce & Herbs',
                'Dairy & Cheese',
                'Bakery & Grains',
                'Beverages',
                'Sauces & Pantry'
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setInvCategory(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    invCategory === c
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Low Stock Warning Banner */}
          {lowStockCount > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Real-Time Threshold Warning: {lowStockCount} Items Below Minimum Stock!
                </h4>
                <p className="text-xs mt-0.5 text-rose-700">
                  Dishes relying on these ingredients will automatically be marked "Sold Out" on the
                  customer menu once depleted. Use quick restock to replenishing supplies.
                </p>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ingredient / Raw Stock</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Min Threshold</th>
                    <th className="py-3 px-4">Stock Health</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {inventory
                    .filter(
                      (item) =>
                        (invCategory === 'All' || item.category === invCategory) &&
                        item.name.toLowerCase().includes(invSearch.toLowerCase())
                    )
                    .map((item) => {
                      const isLow = item.currentStock <= item.minThreshold;
                      const percentage = Math.min(100, Math.round((item.currentStock / (item.minThreshold * 2.5)) * 100));

                      return (
                        <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-stone-900">{item.name}</span>
                            <span className="block text-[11px] text-stone-400">
                              Unit cost: ${item.costPerUnit.toFixed(2)} / {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-600 font-medium">{item.category}</td>
                          <td className="py-3 px-4">
                            <span className={`font-mono font-bold text-sm ${isLow ? 'text-rose-600' : 'text-stone-900'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-stone-500">
                            {item.minThreshold} {item.unit}
                          </td>
                          <td className="py-3 px-4 w-44">
                            <div className="space-y-1">
                              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isLow ? 'bg-rose-500' : percentage < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.max(8, percentage)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-stone-400">
                                {isLow ? 'Restock Required' : 'Adequate Supply'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-500">{item.supplier}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => adjustInventory(item.id, { restockAmount: 10 })}
                                className="px-2.5 py-1 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] transition-colors"
                              >
                                +10 {item.unit}
                              </button>
                              <button
                                onClick={() => {
                                  setRestockItem(item);
                                  setRestockAmount(15);
                                }}
                                className="px-2 py-1 rounded-md border border-stone-300 hover:bg-stone-100 text-stone-700 text-[11px]"
                              >
                                Custom...
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TABLE RESERVATIONS ROSTER */}
      {activeStaffSubTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h2 className="text-base font-bold text-stone-900">Table Reservations Roster</h2>
              <p className="text-xs text-stone-500">
                Manage upcoming customer bookings, check-in guests, and seat parties.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={resFilterDate}
                onChange={(e) => setResFilterDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => setNewResModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Reservation</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Guest Name</th>
                    <th className="py-3 px-4">Table</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Party Size</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Special Requests</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400">
                        No reservations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900">{res.customerName}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                            Table #{res.tableNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-700">
                          {res.reservationDate} at {res.reservationTime}
                        </td>
                        <td className="py-3 px-4">{res.partySize} Guests</td>
                        <td className="py-3 px-4 text-stone-500">
                          <div>{res.customerPhone}</div>
                          <div className="text-[10px] text-stone-400">{res.customerEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 max-w-xs">
                          {res.specialRequests || <span className="text-stone-300">None</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              res.status === 'confirmed'
                                ? 'bg-amber-100 text-amber-800'
                                : res.status === 'seated'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {res.status === 'confirmed' && (
                              <button
                                onClick={() => seatReservation(res.id)}
                                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                              >
                                Seat Party
                              </button>
                            )}
                            {res.status !== 'cancelled' && (
                              <button
                                onClick={() => cancelReservation(res.id)}
                                className="px-2 py-1 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px]"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Seat Party Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-stone-200 animate-in fade-in">
            <h3 className="font-bold text-base text-stone-900">
              Seat Party at Table #{selectedTable.tableNumber}
            </h3>
            <p className="text-xs text-stone-500">
              Section: {selectedTable.section} (Max Capacity: {selectedTable.capacity} guests)
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Party Name</label>
                <input
                  type="text"
                  value={seatPartyName}
                  onChange={(e) => setSeatPartyName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Miller Walk-In"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedTable.capacity}
                  value={seatPartyGuests}
                  onChange={(e) => setSeatPartyGuests(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setSelectedTable(null)}
                className="w-1/2 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSeatWalkIn}
                className="w-1/2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Confirm Seating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900">Restock {restockItem.name}</h3>
            <p className="text-xs text-stone-500">
              Current stock: {restockItem.currentStock} {restockItem.unit} (Min Threshold:{' '}
              {restockItem.minThreshold} {restockItem.unit})
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Quantity to Add ({restockItem.unit})
              </label>
              <input
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setRestockItem(null)}
                className="w-1/2 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await adjustInventory(restockItem.id, { restockAmount });
                  setRestockItem(null);
                }}
                className="w-1/2 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
              >
                Apply Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal for Staff */}
      {newResModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200 animate-in fade-in">
            <h3 className="font-bold text-base text-stone-900">Book Phone / Walk-in Reservation</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Richard Hendricks"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newResPhone}
                  onChange={(e) => setNewResPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  placeholder="+1 (555) 444-5555"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newResDate}
                    onChange={(e) => setNewResDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newResTime}
                    onChange={(e) => setNewResTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newResGuests}
                    onChange={(e) => setNewResGuests(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Table #</label>
                  <select
                    value={newResTable}
                    onChange={(e) => setNewResTable(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.tableNumber}>
                        Table #{t.tableNumber} ({t.section} • {t.capacity}p)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setNewResModal(false)}
                className="w-1/2 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newResName) return;
                  await bookReservation({
                    customerName: newResName,
                    customerPhone: newResPhone,
                    reservationDate: newResDate,
                    reservationTime: newResTime,
                    partySize: newResGuests,
                    tableNumber: newResTable
                  });
                  setNewResModal(false);
                  setNewResName('');
                }}
                className="w-1/2 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
              >
                Save Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
