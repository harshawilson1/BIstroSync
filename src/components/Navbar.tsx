import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  UtensilsCrossed,
  Radio,
  ShoppingBag,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Shield,
  User,
  Coffee,
  ChefHat
} from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenCart: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenCart,
  activeView,
  setActiveView
}) => {
  const {
    currentUser,
    loginAs,
    cartCount,
    isLiveConnected,
    resetDemoData,
    inventory
  } = useRestaurant();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'staff_manager':
        return { label: 'General Manager', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Shield };
      case 'staff_chef':
        return { label: 'Kitchen Chef', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: ChefHat };
      case 'staff_waiter':
        return { label: 'Waitstaff', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Coffee };
      case 'customer':
      default:
        return { label: 'Customer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: User };
    }
  };

  const badge = getRoleBadge(currentUser?.role);
  const BadgeIcon = badge.icon;
  const isStaff = currentUser?.role.startsWith('staff');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveView(isStaff ? 'staff_tables' : 'customer_menu')}
              className="flex items-center space-x-2 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
                  BistroSync
                </span>
                <span className="block text-xs font-medium text-stone-500 tracking-wide uppercase">
                  Restaurant Management System
                </span>
              </div>
            </button>

            {/* Live SSE Status Pill */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-xs text-stone-600 border border-stone-200">
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-mono text-[11px] font-medium">
                {isLiveConnected ? 'LIVE DATABASE SYNC' : 'CONNECTING...'}
              </span>
            </div>
          </div>

          {/* Quick Portal Switcher & Action controls */}
          <div className="flex items-center space-x-3">
            {/* Staff / Customer Quick Switch Pill */}
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${badge.color}`}
              >
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{currentUser?.name || 'Select Profile'}</span>
                <span className="text-[10px] opacity-75 font-normal">({badge.label})</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div
                  id="role-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>

                  <button
                    onClick={() => {
                      loginAs('customer', 'Sarah Jenkins', 'sarah.j@example.com', 4);
                      setActiveView('customer_menu');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between text-stone-700"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-stone-900">Customer Guest</p>
                        <p className="text-[11px] text-stone-500">Sarah Jenkins (Table 4)</p>
                      </div>
                    </div>
                    {currentUser?.role === 'customer' && <UserCheck className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      loginAs('staff_waiter', 'Julian Waiter');
                      setActiveView('staff_tables');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between text-stone-700"
                  >
                    <div className="flex items-center space-x-2">
                      <Coffee className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-semibold text-stone-900">Waitstaff / POS</p>
                        <p className="text-[11px] text-stone-500">Julian (Floor & Tables)</p>
                      </div>
                    </div>
                    {currentUser?.role === 'staff_waiter' && <UserCheck className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => {
                      loginAs('staff_chef', 'Chef Marco');
                      setActiveView('staff_kitchen');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between text-stone-700"
                  >
                    <div className="flex items-center space-x-2">
                      <ChefHat className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="font-semibold text-stone-900">Kitchen Display (KDS)</p>
                        <p className="text-[11px] text-stone-500">Chef Marco (Station Orders)</p>
                      </div>
                    </div>
                    {currentUser?.role === 'staff_chef' && <UserCheck className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => {
                      loginAs('staff_manager', 'Diana Vance');
                      setActiveView('staff_inventory');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between text-stone-700"
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="font-semibold text-stone-900">General Manager</p>
                        <p className="text-[11px] text-stone-500">Diana (Inventory & Roster)</p>
                      </div>
                    </div>
                    {currentUser?.role === 'staff_manager' && <UserCheck className="w-4 h-4 text-purple-600" />}
                  </button>

                  <div className="border-t border-stone-100 my-1"></div>

                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 font-medium"
                  >
                    Login with Custom Credentials...
                  </button>
                </div>
              )}
            </div>

            {/* Reset Database Button */}
            <button
              id="reset-db-btn"
              onClick={resetDemoData}
              title="Reset all tables, inventory stock, and orders to default seed state"
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Cart Button (Always accessible) */}
            <button
              id="cart-drawer-toggle"
              onClick={onOpenCart}
              className="relative flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Order Tray</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white ml-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
