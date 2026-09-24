import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { CustomerView } from './components/customer/CustomerView';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { CartDrawer } from './components/CartDrawer';
import {
  UtensilsCrossed,
  Shield,
  User,
  Coffee,
  ChefHat,
  Bell,
  X,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import type { UserRole } from './types';

function MainApp() {
  const {
    currentUser,
    loginAs,
    activeNotification,
    dismissNotification,
    loading
  } = useRestaurant();

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('auto');
  const [staffSubTab, setStaffSubTab] = useState<string>('tables');

  const isStaff = currentUser?.role.startsWith('staff');

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Notification Toast */}
      {activeNotification && (
        <div className="fixed top-18 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-xl border border-stone-200 p-4 animate-in slide-in-from-top-3 flex items-start space-x-3">
          {activeNotification.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : activeNotification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-stone-900">{activeNotification.title}</h4>
            <p className="text-xs text-stone-600 mt-0.5 leading-snug">
              {activeNotification.message}
            </p>
          </div>

          <button
            onClick={dismissNotification}
            className="text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          if (v.startsWith('staff_')) {
            setStaffSubTab(v.replace('staff_', ''));
          }
        }}
      />

      {/* Perspective Quick Switch Banner */}
      <div className="bg-white border-b border-stone-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-stone-800">Current View Mode:</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                isStaff ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isStaff ? 'Staff Management' : 'Customer Dining'}
            </span>
          </div>

          {/* 1-Click Toggle between Customer and Staff */}
          <div className="flex items-center space-x-2">
            <span className="text-stone-400">Switch mode:</span>
            {isStaff ? (
              <button
                onClick={() => loginAs('customer', 'Sarah Jenkins', 'sarah.j@example.com', 4)}
                className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 font-semibold text-stone-800 transition-colors flex items-center space-x-1"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Switch to Customer View</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    loginAs('staff_waiter', 'Julian Waiter');
                    setStaffSubTab('tables');
                  }}
                  className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 font-semibold text-stone-800 transition-colors flex items-center space-x-1"
                >
                  <Coffee className="w-3.5 h-3.5 text-blue-600" />
                  <span>Waitstaff (POS)</span>
                </button>

                <button
                  onClick={() => {
                    loginAs('staff_chef', 'Chef Marco');
                    setStaffSubTab('kitchen');
                  }}
                  className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 font-semibold text-stone-800 transition-colors flex items-center space-x-1"
                >
                  <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kitchen (KDS)</span>
                </button>

                <button
                  onClick={() => {
                    loginAs('staff_manager', 'Diana Vance');
                    setStaffSubTab('inventory');
                  }}
                  className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 font-semibold text-stone-800 transition-colors flex items-center space-x-1"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Manager (Inventory)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-stone-500">
              Synchronizing restaurant database & inventory...
            </p>
          </div>
        ) : isStaff ? (
          <StaffDashboard
            onOpenCart={() => setCartDrawerOpen(true)}
            activeStaffSubTab={staffSubTab}
            setActiveStaffSubTab={setStaffSubTab}
          />
        ) : (
          <CustomerView onOpenCart={() => setCartDrawerOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-700" />
            <span className="font-bold text-stone-900">BistroSync System</span>
            <span>• Full-Stack Restaurant Operations & Real-Time Inventory Control</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Real-time SSE Event Stream Active</span>
            <span>•</span>
            <span>Express Backend Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(role) => {
          if (role.startsWith('staff')) {
            setStaffSubTab('tables');
          }
        }}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onOrderPlaced={() => {
          if (isStaff) {
            setStaffSubTab('kitchen');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <MainApp />
    </RestaurantProvider>
  );
}
