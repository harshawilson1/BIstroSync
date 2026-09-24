import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Utensils,
  CalendarDays,
  Clock,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  ShoppingBag,
  Info,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';
import type { MenuCategory, MenuItem, TableSection } from '../../types';

interface CustomerViewProps {
  onOpenCart: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ onOpenCart }) => {
  const {
    menu,
    tables,
    reservations,
    orders,
    currentUser,
    addToCart,
    cart,
    bookReservation
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'menu' | 'seats' | 'orders'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<string>('All');

  // Reservation form state
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('19:00');
  const [resPartySize, setResPartySize] = useState(2);
  const [resSection, setResSection] = useState<TableSection>('Main Dining');
  const [resPhone, setResPhone] = useState(currentUser?.phone || '+1 (555) 234-5678');
  const [resNotes, setResNotes] = useState('');
  const [resSuccessModal, setResSuccessModal] = useState<any>(null);
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);

  // Filtered menu
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDietary =
      dietaryFilter === 'All' || item.dietary.includes(dietaryFilter);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDietary && matchesSearch;
  });

  const categories: string[] = ['All', 'Starters', 'Mains', 'Pasta & Pizza', 'Desserts', 'Drinks'];
  const dietaryOptions: string[] = ['All', 'Vegetarian', 'Gluten-Free', 'Pescatarian', 'Chef Special'];

  // Handle table reservation
  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRes(true);
    try {
      // Find matching available table if possible
      const availableTable = tables.find(
        (t) => t.status === 'available' && t.section === resSection && t.capacity >= resPartySize
      ) || tables.find((t) => t.status === 'available' && t.capacity >= resPartySize);

      const res = await bookReservation({
        tableNumber: availableTable ? availableTable.tableNumber : 1,
        customerName: currentUser?.name || 'Valued Guest',
        customerPhone: resPhone,
        customerEmail: currentUser?.email || 'guest@example.com',
        partySize: resPartySize,
        reservationDate: resDate,
        reservationTime: resTime,
        specialRequests: resNotes
      });

      setResSuccessModal(res);
      setResNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to book reservation');
    } finally {
      setIsSubmittingRes(false);
    }
  };

  // Find user's orders (by name or seated table)
  const myOrders = orders.filter((o) => {
    if (currentUser?.tableNumber && o.tableNumber === currentUser.tableNumber) return true;
    return o.customerName.toLowerCase() === (currentUser?.name || '').toLowerCase();
  });

  // Table summary counts
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Dining Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome, {currentUser?.name || 'Guest'}
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Browse our artisanal seasonal menu, check real-time seat availability to reserve a table,
            and monitor your orders prepared fresh from scratch.
          </p>

          {/* Quick status bar */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-stone-700/60 text-xs">
            <div className="flex items-center space-x-1.5 text-stone-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>{availableCount} Tables Available Now</span>
            </div>
            {currentUser?.tableNumber && currentUser.tableNumber > 0 ? (
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-700/40">
                <Utensils className="w-3.5 h-3.5" />
                <span>Seated at Table #{currentUser.tableNumber}</span>
              </div>
            ) : (
              <div className="text-stone-400">Not seated at a table (Takeout Mode)</div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'menu'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Browse Menu & Take Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('seats')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'seats'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Seat Availability & Reservations</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 font-bold">
            {availableCount} free
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Orders & Kitchen Status</span>
          {myOrders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800 font-bold">
              {myOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MENU & ORDERING */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Controls: Search, Categories, Dietary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search dishes, ingredients, pizzas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            {/* Dietary Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-stone-500 shrink-0">Dietary:</span>
              {dietaryOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDietaryFilter(opt)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    dietaryFilter === opt
                      ? 'bg-amber-800 text-white'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-stone-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((dish) => {
              const inCartItem = cart.find((ci) => ci.item.id === dish.id);
              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Dish Image */}
                    <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                        <span className="px-2.5 py-1 rounded-full bg-stone-900/85 backdrop-blur-xs text-white text-xs font-bold shadow-xs">
                          ${dish.price.toFixed(2)}
                        </span>
                        {!dish.available && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                            Sold Out (Low Stock)
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        {dish.dietary.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-stone-900 text-base leading-snug">
                          {dish.name}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>

                      <div className="flex items-center space-x-3 text-[11px] text-stone-500 pt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>~{dish.prepTimeMinutes} mins prep</span>
                        </span>
                        <span>•</span>
                        <span className="capitalize">{dish.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                    {dish.available ? (
                      <button
                        onClick={() => addToCart(dish)}
                        className="w-full mt-3 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Order Tray</span>
                        {inCartItem && (
                          <span className="ml-1 px-1.5 py-0.2 bg-amber-900 text-[11px] rounded-full">
                            x{inCartItem.quantity}
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="w-full mt-3 py-2 text-center text-xs font-medium text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
                        Unavailable due to low ingredient stock
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Floating Cart CTA */}
          {cart.length > 0 && (
            <div className="sticky bottom-6 z-30 flex justify-center">
              <button
                onClick={onOpenCart}
                className="flex items-center space-x-3 px-6 py-3 rounded-full bg-stone-900 text-white font-semibold text-sm shadow-xl hover:bg-stone-800 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>View Order Tray ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span className="text-amber-300">
                  ${cart.reduce((s, i) => s + i.item.price * i.quantity, 0).toFixed(2)}
                </span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEAT AVAILABILITY & RESERVATIONS */}
      {activeTab === 'seats' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual Table Map */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Live Restaurant Seat Availability</h2>
                  <p className="text-xs text-stone-500">Real-time status of all tables across our dining zones</p>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-stone-600 font-medium">Available ({availableCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-stone-600 font-medium">Reserved ({reservedCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-stone-600 font-medium">Occupied ({occupiedCount})</span>
                  </div>
                </div>
              </div>

              {/* Sections Breakdown */}
              {(['Main Dining', 'Patio Garden', 'Bar Area', 'Private Lounge'] as TableSection[]).map(
                (section) => {
                  const sectionTables = tables.filter((t) => t.section === section);
                  if (sectionTables.length === 0) return null;

                  return (
                    <div key={section} className="pt-2">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          {section}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {sectionTables.filter((t) => t.status === 'available').length} of{' '}
                          {sectionTables.length} tables open
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                        {sectionTables.map((table) => {
                          let statusBg = 'border-emerald-300 bg-emerald-50/60 text-emerald-900';
                          let dotColor = 'bg-emerald-500';
                          if (table.status === 'reserved') {
                            statusBg = 'border-amber-300 bg-amber-50/60 text-amber-900';
                            dotColor = 'bg-amber-500';
                          } else if (table.status === 'occupied') {
                            statusBg = 'border-rose-300 bg-rose-50/60 text-rose-900';
                            dotColor = 'bg-rose-500';
                          } else if (table.status === 'cleaning') {
                            statusBg = 'border-purple-300 bg-purple-50/60 text-purple-900';
                            dotColor = 'bg-purple-500';
                          }

                          return (
                            <div
                              key={table.id}
                              className={`p-3 rounded-xl border transition-all ${statusBg} flex flex-col justify-between`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">Table #{table.tableNumber}</span>
                                <div className="flex items-center space-x-1">
                                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                  <span className="text-[10px] uppercase font-bold tracking-tight">
                                    {table.status}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 text-xs flex items-center justify-between text-stone-600">
                                <span className="flex items-center space-x-1">
                                  <Users className="w-3.5 h-3.5 text-stone-400" />
                                  <span>{table.capacity} seats</span>
                                </span>
                                <span className="text-[11px] capitalize text-stone-500">
                                  {table.shape}
                                </span>
                              </div>

                              {table.customerName && (
                                <div className="mt-2 text-[10px] font-medium text-stone-500 truncate border-t border-stone-200/50 pt-1">
                                  Guest: {table.customerName}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Right Column: Reservation Booking Engine */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs sticky top-24">
              <div className="flex items-center space-x-2 text-amber-800 mb-1">
                <CalendarCheck className="w-5 h-5" />
                <h3 className="font-bold text-base text-stone-900">Book Table Reservation</h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Instant confirmation saved directly into our backend database.
              </p>

              <form onSubmit={handleReservationSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={resDate}
                      onChange={(e) => setResDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Time Slot</label>
                    <select
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="17:30">5:30 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Party Size
                    </label>
                    <select
                      value={resPartySize}
                      onChange={(e) => setResPartySize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={5}>5 Guests</option>
                      <option value={6}>6 Guests</option>
                      <option value={8}>8 Guests (Private Lounge)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Preferred Section
                    </label>
                    <select
                      value={resSection}
                      onChange={(e) => setResSection(e.target.value as TableSection)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Main Dining">Main Dining</option>
                      <option value="Patio Garden">Patio Garden</option>
                      <option value="Bar Area">Bar Area</option>
                      <option value="Private Lounge">Private Lounge</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Special Occasion or Seating Requests
                  </label>
                  <textarea
                    rows={2}
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Birthday celebration, high chair needed, anniversary wine..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRes}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center space-x-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>{isSubmittingRes ? 'Confirming...' : 'Reserve Table Instantly'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER'S ACTIVE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <h2 className="text-lg font-bold text-stone-900 mb-1">Your Order Status & Pipeline</h2>
            <p className="text-xs text-stone-500 mb-6">
              Track your dishes in real-time as they move through kitchen preparation.
            </p>

            {myOrders.length === 0 ? (
              <div className="text-center py-12 text-stone-500 space-y-3">
                <Utensils className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-sm font-medium">No active orders placed yet.</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="px-4 py-2 bg-amber-700 text-white text-xs font-semibold rounded-lg hover:bg-amber-800"
                >
                  Browse Menu & Place First Order
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  const getStepIndex = (st: string) => {
                    switch (st) {
                      case 'pending':
                        return 1;
                      case 'in-kitchen':
                        return 2;
                      case 'ready':
                        return 3;
                      case 'served':
                      case 'paid':
                        return 4;
                      default:
                        return 1;
                    }
                  };

                  const currentStep = getStepIndex(order.status);

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold bg-stone-900 text-white px-2 py-0.5 rounded">
                            Ticket #{order.orderNumber}
                          </span>
                          <span className="text-xs font-medium text-stone-600">
                            {order.type === 'dine-in' ? `Table #${order.tableNumber}` : 'Takeout Order'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500">
                          Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Status Pipeline Progress bar */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div
                          className={`p-2 rounded-lg font-medium ${
                            currentStep >= 1 ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          1. Placed
                        </div>
                        <div
                          className={`p-2 rounded-lg font-medium ${
                            currentStep >= 2 ? 'bg-amber-200 text-amber-900 font-bold' : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          2. In Kitchen
                        </div>
                        <div
                          className={`p-2 rounded-lg font-medium ${
                            currentStep >= 3 ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          3. Ready
                        </div>
                        <div
                          className={`p-2 rounded-lg font-medium ${
                            currentStep >= 4 ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          4. Served / Complete
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="space-y-1.5 pt-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-stone-700">
                            <span>
                              {it.quantity}x {it.name}
                              {it.notes && (
                                <span className="block text-[10px] text-stone-400 italic">
                                  Note: {it.notes}
                                </span>
                              )}
                            </span>
                            <span className="font-mono">${(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold text-stone-900 pt-2 border-t border-stone-200">
                        <span>Total (inc. tax):</span>
                        <span className="font-mono text-sm">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reservation Success Modal */}
      {resSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Reservation Confirmed!</h3>
            <div className="bg-stone-50 rounded-xl p-4 text-xs text-left space-y-2 border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Table:</span>
                <span className="font-bold text-stone-900">Table #{resSuccessModal.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date & Time:</span>
                <span className="font-bold text-stone-900">
                  {resSuccessModal.reservationDate} at {resSuccessModal.reservationTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Party Size:</span>
                <span className="font-bold text-stone-900">{resSuccessModal.partySize} Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Reserved For:</span>
                <span className="font-bold text-stone-900">{resSuccessModal.customerName}</span>
              </div>
            </div>
            <button
              onClick={() => setResSuccessModal(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs"
            >
              Great, thank you!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
