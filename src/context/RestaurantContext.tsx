import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  User,
  UserRole,
  Table,
  Reservation,
  InventoryItem,
  MenuItem,
  Order,
  SystemStats
} from '../types';
import { api } from '../services/api';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

interface RestaurantContextType {
  currentUser: User | null;
  loginAs: (role: UserRole, customName?: string, email?: string, tableNumber?: number) => void;
  logout: () => void;
  tables: Table[];
  reservations: Reservation[];
  inventory: InventoryItem[];
  menu: MenuItem[];
  orders: Order[];
  stats: SystemStats | null;
  loading: boolean;
  isLiveConnected: boolean;
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: MenuItem, notes?: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  // Actions
  placeOrder: (options: {
    type: 'dine-in' | 'takeout';
    tableNumber?: number;
    customerName?: string;
  }) => Promise<Order>;
  bookReservation: (data: Partial<Reservation>) => Promise<Reservation>;
  updateTableStatus: (tableId: string, updates: Partial<Table>) => Promise<void>;
  adjustInventory: (
    id: string,
    updates: { currentStock?: number; restockAmount?: number; minThreshold?: number }
  ) => Promise<void>;
  updateOrderStatus: (
    id: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  seatReservation: (id: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshAll: () => Promise<void>;
  activeNotification: { title: string; message: string; type: 'info' | 'success' | 'warning' } | null;
  dismissNotification: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

// Default guest user
const defaultCustomer: User = {
  id: 'usr-customer-1',
  name: 'Sarah Jenkins',
  email: 'sarah.j@example.com',
  role: 'customer',
  phone: '+1 (555) 234-5678'
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bistro_user');
    return saved ? JSON.parse(saved) : defaultCustomer;
  });

  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning';
  } | null>(null);

  const showNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setActiveNotification({ title, message, type });
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  }, []);

  const dismissNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [tData, rData, iData, mData, oData, sData] = await Promise.all([
        api.getTables(),
        api.getReservations(),
        api.getInventory(),
        api.getMenu(),
        api.getOrders(),
        api.getStats()
      ]);
      setTables(tData);
      setReservations(rData);
      setInventory(iData);
      setMenu(mData);
      setOrders(oData);
      setStats(sData);
    } catch (err) {
      console.error('Failed to load restaurant data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Live SSE connection & polling fallback
  useEffect(() => {
    let evtSource: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    try {
      evtSource = new EventSource('/api/stream');

      evtSource.addEventListener('connected', () => {
        setIsLiveConnected(true);
      });

      evtSource.addEventListener('table_updated', (e) => {
        const updatedTable: Table = JSON.parse(e.data);
        setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
      });

      evtSource.addEventListener('tables_updated', (e) => {
        const newTables: Table[] = JSON.parse(e.data);
        setTables(newTables);
      });

      evtSource.addEventListener('reservation_created', (e) => {
        const newRes: Reservation = JSON.parse(e.data);
        setReservations((prev) => [newRes, ...prev.filter((r) => r.id !== newRes.id)]);
        showNotification('New Reservation', `${newRes.customerName} reserved Table ${newRes.tableNumber} for ${newRes.partySize} guests`, 'info');
      });

      evtSource.addEventListener('reservation_updated', (e) => {
        const updatedRes: Reservation = JSON.parse(e.data);
        setReservations((prev) => prev.map((r) => (r.id === updatedRes.id ? updatedRes : r)));
      });

      evtSource.addEventListener('reservation_deleted', (e) => {
        const id: string = JSON.parse(e.data);
        setReservations((prev) => prev.filter((r) => r.id !== id));
      });

      evtSource.addEventListener('inventory_updated', (e) => {
        const updatedItem: InventoryItem = JSON.parse(e.data);
        setInventory((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
      });

      evtSource.addEventListener('inventory_updated_all', (e) => {
        const allInv: InventoryItem[] = JSON.parse(e.data);
        setInventory(allInv);
      });

      evtSource.addEventListener('order_created', (e) => {
        const newOrder: Order = JSON.parse(e.data);
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        showNotification(
          'New Order Ticket #' + newOrder.orderNumber,
          `${newOrder.items.length} items (${newOrder.type === 'dine-in' ? `Table ${newOrder.tableNumber}` : 'Takeout'})`,
          'success'
        );
      });

      evtSource.addEventListener('order_updated', (e) => {
        const updatedOrder: Order = JSON.parse(e.data);
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      });

      evtSource.addEventListener('inventory_depleted', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.items && payload.items.length > 0) {
          const lowStockItem = payload.items.find((i: { remaining: number }) => i.remaining <= 5);
          if (lowStockItem) {
            showNotification(
              'Low Inventory Alert',
              `Stock for "${lowStockItem.itemName}" dropped to ${lowStockItem.remaining} units!`,
              'warning'
            );
          }
        }
      });

      evtSource.addEventListener('system_reset', () => {
        refreshAll();
        showNotification('System Reset', 'All database tables, orders, and stock have been refreshed', 'info');
      });

      evtSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect, using fallback sync:', e);
    }

    // Light polling every 12 seconds to ensure fresh stats & offline fallback
    pollInterval = setInterval(() => {
      refreshAll();
    }, 12000);

    return () => {
      if (evtSource) evtSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [refreshAll, showNotification]);

  // Auth methods
  const loginAs = useCallback((role: UserRole, customName?: string, email?: string, tableNumber?: number) => {
    let user: User;
    if (role === 'customer') {
      user = {
        id: `usr-cust-${Date.now()}`,
        name: customName || 'Sarah Jenkins',
        email: email || 'sarah.j@example.com',
        role: 'customer',
        tableNumber: tableNumber || 4
      };
    } else if (role === 'staff_waiter') {
      user = {
        id: 'usr-staff-waiter',
        name: customName || 'Julian Waiter',
        email: email || 'julian@bistrosync.internal',
        role: 'staff_waiter'
      };
    } else if (role === 'staff_chef') {
      user = {
        id: 'usr-staff-chef',
        name: customName || 'Chef Marco',
        email: email || 'marco.chef@bistrosync.internal',
        role: 'staff_chef'
      };
    } else {
      user = {
        id: 'usr-staff-gm',
        name: customName || 'Diana Vance',
        email: email || 'diana.gm@bistrosync.internal',
        role: 'staff_manager'
      };
    }

    setCurrentUser(user);
    localStorage.setItem('bistro_user', JSON.stringify(user));
    showNotification('Switched Profile', `Logged in as ${user.name} (${role.replace('staff_', 'Staff - ')})`, 'success');
  }, [showNotification]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('bistro_user');
  }, []);

  // Cart operations
  const addToCart = useCallback((item: MenuItem, notes?: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id && ci.notes === (notes || ''));
      if (existing) {
        return prev.map((ci) =>
          ci === existing ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1, notes: notes || '' }];
    });
    showNotification('Added to Order', `${item.name} added to your selection`, 'info');
  }, [showNotification]);

  const removeFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== menuItemId));
  }, []);

  const updateCartQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((ci) => ci.item.id !== menuItemId));
    } else {
      setCart((prev) =>
        prev.map((ci) => (ci.item.id === menuItemId ? { ...ci, quantity } : ci))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, curr) => acc + curr.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0),
    [cart]
  );

  // Business Actions
  const placeOrder = useCallback(
    async (options: {
      type: 'dine-in' | 'takeout';
      tableNumber?: number;
      customerName?: string;
    }) => {
      if (cart.length === 0) {
        throw new Error('Your cart is empty');
      }

      const orderItems = cart.map((ci) => ({
        menuItemId: ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
        notes: ci.notes
      }));

      const res = await api.createOrder({
        type: options.type,
        tableNumber: options.tableNumber,
        customerName: options.customerName || currentUser?.name || 'Guest Customer',
        items: orderItems,
        serverName: currentUser?.role.startsWith('staff') ? currentUser.name : undefined
      });

      clearCart();
      await refreshAll();
      showNotification(
        'Order Confirmed!',
        `Ticket #${res.order.orderNumber} sent to kitchen. Inventory updated in real-time.`,
        'success'
      );
      return res.order;
    },
    [cart, currentUser, clearCart, refreshAll, showNotification]
  );

  const bookReservation = useCallback(
    async (data: Partial<Reservation>) => {
      const res = await api.createReservation(data);
      await refreshAll();
      showNotification(
        'Reservation Confirmed',
        `Table ${res.tableNumber} reserved for ${res.partySize} guests at ${res.reservationTime}`,
        'success'
      );
      return res;
    },
    [refreshAll, showNotification]
  );

  const updateTableStatus = useCallback(
    async (tableId: string, updates: Partial<Table>) => {
      await api.updateTable(tableId, updates);
      await refreshAll();
    },
    [refreshAll]
  );

  const adjustInventory = useCallback(
    async (
      id: string,
      updates: { currentStock?: number; restockAmount?: number; minThreshold?: number }
    ) => {
      const updated = await api.updateInventory(id, updates);
      await refreshAll();
      showNotification('Inventory Updated', `${updated.name}: Stock is now ${updated.currentStock} ${updated.unit}`, 'info');
    },
    [refreshAll, showNotification]
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
      await api.updateOrderStatus(id, status, paymentStatus);
      await refreshAll();
    },
    [refreshAll]
  );

  const cancelReservation = useCallback(
    async (id: string) => {
      await api.updateReservation(id, { status: 'cancelled' });
      await refreshAll();
      showNotification('Reservation Cancelled', 'The table has been freed and marked available', 'info');
    },
    [refreshAll, showNotification]
  );

  const seatReservation = useCallback(
    async (id: string) => {
      await api.updateReservation(id, { status: 'seated' });
      await refreshAll();
      showNotification('Party Seated', 'Table marked as occupied and guests welcomed', 'success');
    },
    [refreshAll, showNotification]
  );

  const resetDemoData = useCallback(async () => {
    await api.resetDatabase();
    await refreshAll();
  }, [refreshAll]);

  return (
    <RestaurantContext.Provider
      value={{
        currentUser,
        loginAs,
        logout,
        tables,
        reservations,
        inventory,
        menu,
        orders,
        stats,
        loading,
        isLiveConnected,
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        bookReservation,
        updateTableStatus,
        adjustInventory,
        updateOrderStatus,
        cancelReservation,
        seatReservation,
        resetDemoData,
        refreshAll,
        activeNotification,
        dismissNotification
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within a RestaurantProvider');
  return ctx;
};
