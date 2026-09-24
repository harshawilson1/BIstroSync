import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  X,
  User,
  Shield,
  Coffee,
  ChefHat,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { loginAs, tables } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'customer' | 'staff'>('customer');

  // Customer form state
  const [customerName, setCustomerName] = useState('Sarah Jenkins');
  const [customerEmail, setCustomerEmail] = useState('sarah.j@example.com');
  const [customerTable, setCustomerTable] = useState<number>(4);

  // Staff form state
  const [staffRole, setStaffRole] = useState<UserRole>('staff_waiter');
  const [staffName, setStaffName] = useState('Julian Waiter');
  const [staffPin, setStaffPin] = useState('1234');

  if (!isOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs('customer', customerName, customerEmail, customerTable);
    onLoginSuccess('customer');
    onClose();
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(staffRole, staffName);
    onLoginSuccess(staffRole);
    onClose();
  };

  const handleQuickLogin = (role: UserRole, name: string, email?: string, table?: number) => {
    loginAs(role, name, email, table);
    onLoginSuccess(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-600/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Restaurant Portal Access</h3>
              <p className="text-xs text-stone-400">Authenticate as a guest diner or staff member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('customer')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'customer'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Portal</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'staff'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Staff Management</span>
          </button>
        </div>

        <div className="p-6">
          {/* Quick Demo Logins Bar */}
          <div className="mb-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>One-Click Preset Access:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer', 'Sarah Jenkins', 'sarah.j@example.com', 4)}
                className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-stone-800 transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">Customer (Guest)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff_waiter', 'Julian Waiter')}
                className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-200 hover:border-blue-500 hover:bg-blue-50/50 text-stone-800 transition-colors text-left"
              >
                <Coffee className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate font-medium">Waitstaff (POS)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff_chef', 'Chef Marco')}
                className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 text-stone-800 transition-colors text-left"
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate font-medium">Kitchen Chef (KDS)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('staff_manager', 'Diana Vance')}
                className="flex items-center space-x-1.5 p-2 rounded-lg bg-white border border-stone-200 hover:border-purple-500 hover:bg-purple-50/50 text-stone-800 transition-colors text-left"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate font-medium">Manager (Inventory)</span>
              </button>
            </div>
          </div>

          {activeTab === 'customer' ? (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Table Number (Optional if ordering takeout)
                </label>
                <select
                  value={customerTable}
                  onChange={(e) => setCustomerTable(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={0}>Takeout / Walk-in / Not seated yet</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      Table #{t.tableNumber} ({t.section} • {t.capacity} seats • {t.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm transition-colors shadow-xs"
                >
                  <span>Enter Customer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Staff Role Department
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('staff_waiter');
                      setStaffName('Julian Waiter');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      staffRole === 'staff_waiter'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Coffee className="w-4 h-4" />
                    <span>Waitstaff</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('staff_chef');
                      setStaffName('Chef Marco');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      staffRole === 'staff_chef'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Kitchen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStaffRole('staff_manager');
                      setStaffName('Diana Vance');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      staffRole === 'staff_manager'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Manager</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Staff Member Name
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Station Passcode PIN
                </label>
                <input
                  type="password"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter 4-digit PIN (default 1234)"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-colors shadow-xs"
                >
                  <span>Authenticate Staff Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
