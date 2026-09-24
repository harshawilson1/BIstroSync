export type UserRole = 'customer' | 'staff_waiter' | 'staff_chef' | 'staff_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  tableNumber?: number;
}

export type TableStatus = 'available' | 'reserved' | 'occupied' | 'cleaning';
export type TableSection = 'Main Dining' | 'Patio Garden' | 'Bar Area' | 'Private Lounge';
export type TableShape = 'round' | 'square' | 'booth';

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  section: TableSection;
  shape: TableShape;
  status: TableStatus;
  currentOrderId?: string;
  assignedServer?: string;
  customerName?: string;
  seatedGuests?: number;
  occupiedSince?: string;
}

export type ReservationStatus = 'confirmed' | 'seated' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  tableId: string;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
}

export type InventoryCategory =
  | 'Meat & Seafood'
  | 'Produce & Herbs'
  | 'Dairy & Cheese'
  | 'Bakery & Grains'
  | 'Beverages'
  | 'Sauces & Pantry';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
}

export interface RecipeIngredient {
  inventoryId: string;
  name: string;
  quantity: number;
  unit: string;
}

export type MenuCategory = 'Starters' | 'Mains' | 'Pasta & Pizza' | 'Desserts' | 'Drinks';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  image: string;
  prepTimeMinutes: number;
  dietary: string[];
  ingredients: RecipeIngredient[];
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'in-kitchen' | 'ready' | 'served' | 'paid' | 'cancelled';
export type OrderType = 'dine-in' | 'takeout';

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  tableNumber?: number;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paymentStatus: 'unpaid' | 'paid';
  serverName?: string;
}

export interface SystemStats {
  totalTables: number;
  availableTables: number;
  activeOrdersCount: number;
  todayReservationsCount: number;
  lowStockCount: number;
  revenueToday: number;
}
