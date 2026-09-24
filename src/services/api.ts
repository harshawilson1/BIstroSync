import type {
  Table,
  Reservation,
  InventoryItem,
  MenuItem,
  Order,
  SystemStats
} from '../types';

export const api = {
  async getStats(): Promise<SystemStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getTables(): Promise<Table[]> {
    const res = await fetch('/api/tables');
    if (!res.ok) throw new Error('Failed to fetch tables');
    return res.json();
  },

  async updateTable(id: string, updates: Partial<Table>): Promise<Table> {
    const res = await fetch(`/api/tables/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update table');
    return res.json();
  },

  async getReservations(): Promise<Reservation[]> {
    const res = await fetch('/api/reservations');
    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
  },

  async createReservation(data: Partial<Reservation>): Promise<Reservation> {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create reservation');
    }
    return res.json();
  },

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update reservation');
    return res.json();
  },

  async deleteReservation(id: string): Promise<void> {
    const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete reservation');
  },

  async getMenu(): Promise<MenuItem[]> {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async getInventory(): Promise<InventoryItem[]> {
    const res = await fetch('/api/inventory');
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async updateInventory(
    id: string,
    updates: { currentStock?: number; minThreshold?: number; restockAmount?: number }
  ): Promise<InventoryItem> {
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update inventory');
    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async createOrder(data: {
    type: 'dine-in' | 'takeout';
    tableNumber?: number;
    customerName: string;
    items: { menuItemId: string; name: string; price: number; quantity: number; notes?: string }[];
    serverName?: string;
  }): Promise<{ order: Order; inventoryDepleted: { itemName: string; deducted: number; remaining: number }[] }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async updateOrderStatus(id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async resetDatabase(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
  }
};
