import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import type {
  Table,
  Reservation,
  InventoryItem,
  MenuItem,
  Order,
  User,
  SystemStats
} from './src/types';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'bistro_database.json');

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Initial Seed Data
const initialTables: Table[] = [
  { id: 't-1', tableNumber: 1, capacity: 2, section: 'Main Dining', shape: 'round', status: 'available' },
  { id: 't-2', tableNumber: 2, capacity: 2, section: 'Main Dining', shape: 'round', status: 'occupied', customerName: 'Alexander Hayes', seatedGuests: 2, occupiedSince: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: 't-3', tableNumber: 3, capacity: 4, section: 'Main Dining', shape: 'square', status: 'reserved', customerName: 'Elena Rostova', seatedGuests: 4 },
  { id: 't-4', tableNumber: 4, capacity: 4, section: 'Main Dining', shape: 'square', status: 'available' },
  { id: 't-5', tableNumber: 5, capacity: 6, section: 'Main Dining', shape: 'booth', status: 'occupied', customerName: 'TechCorp Dinner', seatedGuests: 5, occupiedSince: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: 't-6', tableNumber: 6, capacity: 6, section: 'Main Dining', shape: 'booth', status: 'cleaning' },
  { id: 't-7', tableNumber: 7, capacity: 4, section: 'Patio Garden', shape: 'round', status: 'available' },
  { id: 't-8', tableNumber: 8, capacity: 4, section: 'Patio Garden', shape: 'round', status: 'occupied', customerName: 'Sophia Miller', seatedGuests: 3, occupiedSince: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 't-9', tableNumber: 9, capacity: 2, section: 'Bar Area', shape: 'square', status: 'available' },
  { id: 't-10', tableNumber: 10, capacity: 2, section: 'Bar Area', shape: 'square', status: 'available' },
  { id: 't-11', tableNumber: 11, capacity: 8, section: 'Private Lounge', shape: 'booth', status: 'reserved', customerName: 'Marcus Vance Party', seatedGuests: 8 },
  { id: 't-12', tableNumber: 12, capacity: 4, section: 'Patio Garden', shape: 'square', status: 'available' }
];

const initialInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Prime Black Angus Ribeye', category: 'Meat & Seafood', currentStock: 28, unit: 'portions', minThreshold: 10, costPerUnit: 14.50, supplier: 'Cattleman Ranch', lastRestocked: '2026-09-20' },
  { id: 'inv-2', name: 'Norwegian King Salmon', category: 'Meat & Seafood', currentStock: 18, unit: 'portions', minThreshold: 8, costPerUnit: 12.00, supplier: 'Ocean Crest Foods', lastRestocked: '2026-09-21' },
  { id: 'inv-3', name: 'Artisan Fettuccine Pasta', category: 'Bakery & Grains', currentStock: 45, unit: 'portions', minThreshold: 15, costPerUnit: 2.20, supplier: 'Molino Pasta Co.', lastRestocked: '2026-09-18' },
  { id: 'inv-4', name: 'San Marzano Pizza Dough', category: 'Bakery & Grains', currentStock: 32, unit: 'crusts', minThreshold: 12, costPerUnit: 1.80, supplier: 'Molino Pasta Co.', lastRestocked: '2026-09-21' },
  { id: 'inv-5', name: 'Fresh Buffalo Mozzarella', category: 'Dairy & Cheese', currentStock: 22, unit: 'balls', minThreshold: 10, costPerUnit: 3.50, supplier: 'Lombardy Creamery', lastRestocked: '2026-09-21' },
  { id: 'inv-6', name: 'Aged Parmigiano Reggiano', category: 'Dairy & Cheese', currentStock: 5.4, unit: 'kg', minThreshold: 3.0, costPerUnit: 28.00, supplier: 'Lombardy Creamery', lastRestocked: '2026-09-15' },
  { id: 'inv-7', name: 'Hydroponic Sweet Basil', category: 'Produce & Herbs', currentStock: 6, unit: 'bunches', minThreshold: 8, costPerUnit: 1.50, supplier: 'Urban Greens', lastRestocked: '2026-09-21' }, // Low stock trigger
  { id: 'inv-8', name: 'Black Summer Truffle Butter', category: 'Sauces & Pantry', currentStock: 4, unit: 'tubs', minThreshold: 5, costPerUnit: 22.00, supplier: 'Alba Truffles', lastRestocked: '2026-09-12' }, // Low stock trigger
  { id: 'inv-9', name: 'San Marzano Tomato Sauce', category: 'Sauces & Pantry', currentStock: 35, unit: 'liters', minThreshold: 10, costPerUnit: 4.00, supplier: 'Campania Harvest', lastRestocked: '2026-09-19' },
  { id: 'inv-10', name: 'Belgian Dark Chocolate (70%)', category: 'Bakery & Grains', currentStock: 14, unit: 'bars', minThreshold: 6, costPerUnit: 7.20, supplier: 'Bruges Confections', lastRestocked: '2026-09-14' },
  { id: 'inv-11', name: 'Italian Espresso Roast Beans', category: 'Beverages', currentStock: 12, unit: 'kg', minThreshold: 4, costPerUnit: 18.00, supplier: 'Trieste Roasters', lastRestocked: '2026-09-18' },
  { id: 'inv-12', name: 'Chianti Classico Riserva', category: 'Beverages', currentStock: 26, unit: 'bottles', minThreshold: 12, costPerUnit: 19.50, supplier: 'Tuscan Vines', lastRestocked: '2026-09-10' }
];

const initialMenu: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Truffle Butter Angus Ribeye',
    category: 'Mains',
    price: 38.00,
    description: '12oz dry-aged ribeye seared with aromatic black summer truffle butter and roasted rosemary fingerling potatoes.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 22,
    dietary: ['Gluten-Free', 'Chef Special'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-1', name: 'Prime Black Angus Ribeye', quantity: 1, unit: 'portions' },
      { inventoryId: 'inv-8', name: 'Black Summer Truffle Butter', quantity: 0.1, unit: 'tubs' }
    ]
  },
  {
    id: 'm-2',
    name: 'Pan-Roasted Atlantic Salmon',
    category: 'Mains',
    price: 29.50,
    description: 'Crisp skin Norwegian salmon fillet, tender asparagus spears, citrus emulsion and fresh micro herbs.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 18,
    dietary: ['Gluten-Free', 'Pescatarian'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-2', name: 'Norwegian King Salmon', quantity: 1, unit: 'portions' },
      { inventoryId: 'inv-7', name: 'Hydroponic Sweet Basil', quantity: 0.2, unit: 'bunches' }
    ]
  },
  {
    id: 'm-3',
    name: 'Handcrafted Truffle Fettuccine',
    category: 'Pasta & Pizza',
    price: 24.00,
    description: 'Silky bronze-die fettuccine tossed in aged Parmigiano Reggiano wheel, cultured butter and shaved truffles.',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 15,
    dietary: ['Vegetarian', 'Staff Pick'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-3', name: 'Artisan Fettuccine Pasta', quantity: 1, unit: 'portions' },
      { inventoryId: 'inv-6', name: 'Aged Parmigiano Reggiano', quantity: 0.1, unit: 'kg' },
      { inventoryId: 'inv-8', name: 'Black Summer Truffle Butter', quantity: 0.1, unit: 'tubs' }
    ]
  },
  {
    id: 'm-4',
    name: 'Classic Margherita Napoletana',
    category: 'Pasta & Pizza',
    price: 19.00,
    description: 'Wood-fired sourdough crust, San Marzano D.O.P. tomatoes, fresh buffalo mozzarella, cold-pressed olive oil & sweet basil.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 14,
    dietary: ['Vegetarian'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-4', name: 'San Marzano Pizza Dough', quantity: 1, unit: 'crusts' },
      { inventoryId: 'inv-5', name: 'Fresh Buffalo Mozzarella', quantity: 1, unit: 'balls' },
      { inventoryId: 'inv-9', name: 'San Marzano Tomato Sauce', quantity: 0.2, unit: 'liters' },
      { inventoryId: 'inv-7', name: 'Hydroponic Sweet Basil', quantity: 0.3, unit: 'bunches' }
    ]
  },
  {
    id: 'm-5',
    name: 'Crispy Calamari Fritti',
    category: 'Starters',
    price: 15.50,
    description: 'Flash-fried tender calamari rings, charred Meyer lemon wedge, spicy Calabrian chili aioli.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 10,
    dietary: ['Pescatarian'],
    available: true,
    ingredients: []
  },
  {
    id: 'm-6',
    name: 'Burrata & Heirloom Caprese',
    category: 'Starters',
    price: 16.00,
    description: 'Creamy artisanal burrata, multi-colored heirloom tomatoes, aged balsamic reduction and basil drizzle.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 8,
    dietary: ['Vegetarian', 'Gluten-Free'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-5', name: 'Fresh Buffalo Mozzarella', quantity: 1, unit: 'balls' },
      { inventoryId: 'inv-7', name: 'Hydroponic Sweet Basil', quantity: 0.2, unit: 'bunches' }
    ]
  },
  {
    id: 'm-7',
    name: 'Molten Belgian Lava Cake',
    category: 'Desserts',
    price: 12.50,
    description: 'Warm dark chocolate sponge with a liquid ganache center, Madagascar vanilla gelato and cocoa dust.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 12,
    dietary: ['Vegetarian'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-10', name: 'Belgian Dark Chocolate (70%)', quantity: 1, unit: 'bars' }
    ]
  },
  {
    id: 'm-8',
    name: 'Tiramisù Tradizionale',
    category: 'Desserts',
    price: 11.00,
    description: 'Espresso-soaked Savoiardi biscuits, whipped mascarpone sabayon, dark Valrhona cocoa.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 5,
    dietary: ['Vegetarian'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-11', name: 'Italian Espresso Roast Beans', quantity: 0.1, unit: 'kg' }
    ]
  },
  {
    id: 'm-9',
    name: 'Chianti Classico DOCG (Glass)',
    category: 'Drinks',
    price: 14.00,
    description: 'Rich ruby-red notes of wild berry, dried herbs, and subtle toasted oak from Chianti Hills.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 3,
    dietary: ['Gluten-Free', 'Vegan'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-12', name: 'Chianti Classico Riserva', quantity: 0.2, unit: 'bottles' }
    ]
  },
  {
    id: 'm-10',
    name: 'Double Ristretto & Tonic',
    category: 'Drinks',
    price: 6.50,
    description: 'Chilled artisan tonic water topped with a double extraction of Italian roast espresso and lemon peel.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
    prepTimeMinutes: 4,
    dietary: ['Gluten-Free', 'Vegan'],
    available: true,
    ingredients: [
      { inventoryId: 'inv-11', name: 'Italian Espresso Roast Beans', quantity: 0.05, unit: 'kg' }
    ]
  }
];

const initialReservations: Reservation[] = [
  {
    id: 'res-101',
    tableId: 't-3',
    tableNumber: 3,
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 392-8819',
    customerEmail: 'elena.rostova@example.com',
    partySize: 4,
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '19:30',
    specialRequests: 'Anniversary celebration. Quiet table appreciated.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'res-102',
    tableId: 't-11',
    tableNumber: 11,
    customerName: 'Marcus Vance',
    customerPhone: '+1 (555) 720-4155',
    customerEmail: 'marcus.v@innovate.co',
    partySize: 8,
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '20:00',
    specialRequests: 'VIP client dinner. Pairing wine recommendations requested.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString()
  },
  {
    id: 'res-103',
    tableId: 't-7',
    tableNumber: 7,
    customerName: 'David & Sarah Chen',
    customerPhone: '+1 (555) 881-2090',
    customerEmail: 'david.chen@example.com',
    partySize: 2,
    reservationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reservationTime: '18:45',
    specialRequests: 'Outdoor patio preferred weather permitting.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 101,
    type: 'dine-in',
    tableNumber: 2,
    customerName: 'Alexander Hayes',
    items: [
      { menuItemId: 'm-1', name: 'Truffle Butter Angus Ribeye', price: 38.00, quantity: 2, notes: 'Medium rare please' },
      { menuItemId: 'm-9', name: 'Chianti Classico DOCG (Glass)', price: 14.00, quantity: 2 }
    ],
    subtotal: 104.00,
    tax: 8.32,
    totalAmount: 112.32,
    status: 'served',
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    paymentStatus: 'unpaid',
    serverName: 'Julian Waiter'
  },
  {
    id: 'ord-1002',
    orderNumber: 102,
    type: 'dine-in',
    tableNumber: 5,
    customerName: 'TechCorp Dinner',
    items: [
      { menuItemId: 'm-4', name: 'Classic Margherita Napoletana', price: 19.00, quantity: 2 },
      { menuItemId: 'm-3', name: 'Handcrafted Truffle Fettuccine', price: 24.00, quantity: 3 },
      { menuItemId: 'm-7', name: 'Molten Belgian Lava Cake', price: 12.50, quantity: 2 }
    ],
    subtotal: 135.00,
    tax: 10.80,
    totalAmount: 145.80,
    status: 'in-kitchen',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    paymentStatus: 'unpaid',
    serverName: 'Julian Waiter'
  },
  {
    id: 'ord-1003',
    orderNumber: 103,
    type: 'dine-in',
    tableNumber: 8,
    customerName: 'Sophia Miller',
    items: [
      { menuItemId: 'm-2', name: 'Pan-Roasted Atlantic Salmon', price: 29.50, quantity: 2 },
      { menuItemId: 'm-6', name: 'Burrata & Heirloom Caprese', price: 16.00, quantity: 1 }
    ],
    subtotal: 75.00,
    tax: 6.00,
    totalAmount: 81.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
    paymentStatus: 'unpaid',
    serverName: 'Julian Waiter'
  }
];

interface DatabaseSchema {
  tables: Table[];
  inventory: InventoryItem[];
  menu: MenuItem[];
  reservations: Reservation[];
  orders: Order[];
  nextOrderNumber: number;
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read database file, resetting to initial seed:', err);
  }

  const initialDb: DatabaseSchema = {
    tables: initialTables,
    inventory: initialInventory,
    menu: initialMenu,
    reservations: initialReservations,
    orders: initialOrders,
    nextOrderNumber: 104
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

let db = loadDatabase();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Real-time Event Clients (SSE for live broadcast)
  const sseClients: express.Response[] = [];

  const broadcastEvent = (eventType: string, payload: unknown) => {
    const dataString = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    sseClients.forEach((clientRes) => {
      try {
        clientRes.write(dataString);
      } catch (err) {
        // client disconnected
      }
    });
  };

  // SSE Stream
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.push(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ time: new Date() })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // System Stats
  app.get('/api/stats', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const stats: SystemStats = {
      totalTables: db.tables.length,
      availableTables: db.tables.filter((t) => t.status === 'available').length,
      activeOrdersCount: db.orders.filter((o) => o.status !== 'served' && o.status !== 'paid' && o.status !== 'cancelled').length,
      todayReservationsCount: db.reservations.filter((r) => r.reservationDate === today && r.status !== 'cancelled').length,
      lowStockCount: db.inventory.filter((i) => i.currentStock <= i.minThreshold).length,
      revenueToday: db.orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };
    res.json(stats);
  });

  // TABLES
  app.get('/api/tables', (req, res) => {
    res.json(db.tables);
  });

  app.patch('/api/tables/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const tableIndex = db.tables.findIndex((t) => t.id === id);
    if (tableIndex === -1) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    db.tables[tableIndex] = { ...db.tables[tableIndex], ...updates };
    saveDatabase(db);
    broadcastEvent('table_updated', db.tables[tableIndex]);
    res.json(db.tables[tableIndex]);
  });

  // RESERVATIONS
  app.get('/api/reservations', (req, res) => {
    res.json(db.reservations);
  });

  app.post('/api/reservations', (req, res) => {
    const { tableNumber, customerName, customerPhone, customerEmail, partySize, reservationDate, reservationTime, specialRequests } = req.body;

    if (!customerName || !partySize || !reservationDate || !reservationTime) {
      res.status(400).json({ error: 'Missing required reservation fields' });
      return;
    }

    // Match or find table
    let assignedTable = db.tables.find((t) => t.tableNumber === Number(tableNumber));
    if (!assignedTable) {
      // Pick first available table that fits party size
      assignedTable = db.tables.find((t) => t.status === 'available' && t.capacity >= Number(partySize));
    }

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      tableId: assignedTable ? assignedTable.id : 't-1',
      tableNumber: assignedTable ? assignedTable.tableNumber : 1,
      customerName,
      customerPhone: customerPhone || 'N/A',
      customerEmail: customerEmail || 'N/A',
      partySize: Number(partySize),
      reservationDate,
      reservationTime,
      specialRequests: specialRequests || '',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    db.reservations.unshift(newRes);

    // If reservation is for today within upcoming 2 hours, mark table as reserved
    const today = new Date().toISOString().split('T')[0];
    if (assignedTable && reservationDate === today && assignedTable.status === 'available') {
      assignedTable.status = 'reserved';
      assignedTable.customerName = customerName;
    }

    saveDatabase(db);
    broadcastEvent('reservation_created', newRes);
    broadcastEvent('tables_updated', db.tables);
    res.status(201).json(newRes);
  });

  app.patch('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const resIdx = db.reservations.findIndex((r) => r.id === id);
    if (resIdx === -1) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    db.reservations[resIdx] = { ...db.reservations[resIdx], ...updates };

    // If seated, update table status to occupied
    if (updates.status === 'seated') {
      const table = db.tables.find((t) => t.tableNumber === db.reservations[resIdx].tableNumber);
      if (table) {
        table.status = 'occupied';
        table.customerName = db.reservations[resIdx].customerName;
        table.seatedGuests = db.reservations[resIdx].partySize;
        table.occupiedSince = new Date().toISOString();
      }
    } else if (updates.status === 'cancelled') {
      const table = db.tables.find((t) => t.tableNumber === db.reservations[resIdx].tableNumber);
      if (table && table.status === 'reserved') {
        table.status = 'available';
        table.customerName = undefined;
      }
    }

    saveDatabase(db);
    broadcastEvent('reservation_updated', db.reservations[resIdx]);
    broadcastEvent('tables_updated', db.tables);
    res.json(db.reservations[resIdx]);
  });

  app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const resItem = db.reservations.find((r) => r.id === id);
    if (!resItem) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }

    db.reservations = db.reservations.filter((r) => r.id !== id);
    const table = db.tables.find((t) => t.tableNumber === resItem.tableNumber);
    if (table && table.status === 'reserved') {
      table.status = 'available';
      table.customerName = undefined;
    }

    saveDatabase(db);
    broadcastEvent('reservation_deleted', id);
    broadcastEvent('tables_updated', db.tables);
    res.json({ success: true, message: 'Reservation removed' });
  });

  // INVENTORY
  app.get('/api/inventory', (req, res) => {
    res.json(db.inventory);
  });

  app.patch('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { currentStock, minThreshold, restockAmount } = req.body;
    const itemIdx = db.inventory.findIndex((i) => i.id === id);
    if (itemIdx === -1) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    if (restockAmount !== undefined) {
      db.inventory[itemIdx].currentStock += Number(restockAmount);
      db.inventory[itemIdx].lastRestocked = new Date().toISOString().split('T')[0];
    }
    if (currentStock !== undefined) {
      db.inventory[itemIdx].currentStock = Math.max(0, Number(currentStock));
    }
    if (minThreshold !== undefined) {
      db.inventory[itemIdx].minThreshold = Number(minThreshold);
    }

    // Refresh menu item availability based on newly adjusted stock
    recalculateMenuAvailability();

    saveDatabase(db);
    broadcastEvent('inventory_updated', db.inventory[itemIdx]);
    broadcastEvent('menu_updated', db.menu);
    res.json(db.inventory[itemIdx]);
  });

  // MENU
  app.get('/api/menu', (req, res) => {
    res.json(db.menu);
  });

  // ORDERS & REAL-TIME INVENTORY DEPLETION
  app.get('/api/orders', (req, res) => {
    res.json(db.orders);
  });

  app.post('/api/orders', (req, res) => {
    const { type, tableNumber, customerName, items, serverName } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item' });
      return;
    }

    // Check inventory stock and deplete
    const depletedItemsSummary: { itemName: string; deducted: number; remaining: number }[] = [];

    for (const orderItem of items) {
      const menuItem = db.menu.find((m) => m.id === orderItem.menuItemId);
      if (menuItem && menuItem.ingredients) {
        for (const ingredient of menuItem.ingredients) {
          const invItem = db.inventory.find((i) => i.id === ingredient.inventoryId);
          if (invItem) {
            const deductQty = ingredient.quantity * orderItem.quantity;
            invItem.currentStock = Math.max(0, Math.round((invItem.currentStock - deductQty) * 100) / 100);
            depletedItemsSummary.push({
              itemName: invItem.name,
              deducted: deductQty,
              remaining: invItem.currentStock
            });
          }
        }
      }
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    const orderNum = db.nextOrderNumber++;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      type: type || 'dine-in',
      tableNumber: tableNumber ? Number(tableNumber) : undefined,
      customerName: customerName || 'Guest Customer',
      items,
      subtotal,
      tax,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentStatus: 'unpaid',
      serverName: serverName || 'Direct Customer Order'
    };

    db.orders.unshift(newOrder);

    // If dine-in, assign to table
    if (type === 'dine-in' && tableNumber) {
      const table = db.tables.find((t) => t.tableNumber === Number(tableNumber));
      if (table) {
        table.status = 'occupied';
        table.currentOrderId = newOrder.id;
        table.customerName = newOrder.customerName;
        table.occupiedSince = table.occupiedSince || new Date().toISOString();
        if (serverName) table.assignedServer = serverName;
      }
    }

    // Refresh menu item availability
    recalculateMenuAvailability();

    saveDatabase(db);
    broadcastEvent('order_created', newOrder);
    broadcastEvent('inventory_depleted', { orderId: newOrder.id, items: depletedItemsSummary });
    broadcastEvent('inventory_updated_all', db.inventory);
    broadcastEvent('tables_updated', db.tables);

    res.status(201).json({
      order: newOrder,
      inventoryDepleted: depletedItemsSummary
    });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const orderIdx = db.orders.findIndex((o) => o.id === id);
    if (orderIdx === -1) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (status) db.orders[orderIdx].status = status;
    if (paymentStatus) db.orders[orderIdx].paymentStatus = paymentStatus;

    // If order is paid/closed, free table or set to cleaning
    if (status === 'paid' && db.orders[orderIdx].tableNumber) {
      const table = db.tables.find((t) => t.tableNumber === db.orders[orderIdx].tableNumber);
      if (table) {
        table.status = 'cleaning';
        table.currentOrderId = undefined;
      }
    }

    saveDatabase(db);
    broadcastEvent('order_updated', db.orders[orderIdx]);
    broadcastEvent('tables_updated', db.tables);
    res.json(db.orders[orderIdx]);
  });

  // RESTORE DEMO DATA
  app.post('/api/reset', (req, res) => {
    db = {
      tables: JSON.parse(JSON.stringify(initialTables)),
      inventory: JSON.parse(JSON.stringify(initialInventory)),
      menu: JSON.parse(JSON.stringify(initialMenu)),
      reservations: JSON.parse(JSON.stringify(initialReservations)),
      orders: JSON.parse(JSON.stringify(initialOrders)),
      nextOrderNumber: 104
    };
    saveDatabase(db);
    broadcastEvent('system_reset', { timestamp: new Date() });
    res.json({ success: true, message: 'Database reset to default seed state' });
  });

  function recalculateMenuAvailability() {
    db.menu.forEach((item) => {
      let isAvailable = true;
      if (item.ingredients && item.ingredients.length > 0) {
        for (const ing of item.ingredients) {
          const inv = db.inventory.find((i) => i.id === ing.inventoryId);
          if (!inv || inv.currentStock < ing.quantity) {
            isAvailable = false;
            break;
          }
        }
      }
      item.available = isAvailable;
    });
  }

  // Initial calculation
  recalculateMenuAvailability();

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BistroSync Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
