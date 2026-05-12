import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// === Enums ===
export const productFormat = pgEnum('product_format', ['lata_473', 'porron_1l']);
export const batchStatus = pgEnum('batch_status', ['brewing', 'bottled', 'depleted']);
export const stockReason = pgEnum('stock_reason', [
  'production', 'sale_online', 'sale_pos', 'purchase_supply', 'adjustment', 'loss',
]);
export const supplyReason = pgEnum('supply_reason', [
  'purchase_receive', 'production_consume', 'adjustment',
]);
export const orderStatus = pgEnum('order_status', [
  'pending', 'paid', 'fulfilled', 'cancelled',
]);
export const orderChannel = pgEnum('order_channel', ['online']);
export const shippingMethod = pgEnum('shipping_method', ['delivery_local', 'pickup']);
export const poStatus = pgEnum('po_status', [
  'draft', 'placed', 'received', 'paid', 'cancelled',
]);
export const paymentMethod = pgEnum('payment_method', [
  'cash', 'card', 'mp_qr', 'transfer',
]);
export const userRole = pgEnum('user_role', ['owner', 'cashier']);

// === Auth ===
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// === Catálogo ===
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  style: varchar('style', { length: 64 }).notNull(),
  format: productFormat('format').notNull(),
  abvDefault: integer('abv_default'),
  ibuDefault: integer('ibu_default'),
  description: text('description'),
  heroImageUrl: text('hero_image_url'),
  reorderPoint: integer('reorder_point').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const packDefinitions = pgTable('pack_definitions', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  size: integer('size').notNull(),
  priceCents: integer('price_cents').notNull(),
  sku: varchar('sku', { length: 64 }).notNull().unique(),
  active: boolean('active').notNull().default(true),
});

export const batches = pgTable('batches', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  lotCode: varchar('lot_code', { length: 64 }).notNull().unique(),
  bottledAt: timestamp('bottled_at', { withTimezone: true }).notNull(),
  abv: integer('abv'),
  ibu: integer('ibu'),
  volumeProducedL: integer('volume_produced_l').notNull(),
  unitsProduced: integer('units_produced').notNull(),
  costTotalCents: bigint('cost_total_cents', { mode: 'number' }).notNull(),
  notes: text('notes'),
  status: batchStatus('status').notNull().default('bottled'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const stockMovements = pgTable('stock_movements', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  batchId: integer('batch_id').references(() => batches.id),
  delta: integer('delta').notNull(),
  reason: stockReason('reason').notNull(),
  referenceId: integer('reference_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
}, (t) => ({
  productIdx: index('stock_mov_product_idx').on(t.productId),
  batchIdx: index('stock_mov_batch_idx').on(t.batchId),
}));

// === Insumos ===
export const supplies = pgTable('supplies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  unit: varchar('unit', { length: 32 }).notNull(),
  reorderPoint: integer('reorder_point').notNull().default(0),
  currentQty: integer('current_qty').notNull().default(0),
});

export const supplyMovements = pgTable('supply_movements', {
  id: serial('id').primaryKey(),
  supplyId: integer('supply_id').notNull().references(() => supplies.id),
  delta: integer('delta').notNull(),
  reason: supplyReason('reason').notNull(),
  referenceId: integer('reference_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 64 }),
  address: text('address'),
  cuit: varchar('cuit', { length: 32 }),
  notes: text('notes'),
});

export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').notNull().references(() => suppliers.id),
  status: poStatus('status').notNull().default('draft'),
  placedAt: timestamp('placed_at', { withTimezone: true }),
  receivedAt: timestamp('received_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  totalCents: bigint('total_cents', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: serial('id').primaryKey(),
  poId: integer('po_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  supplyId: integer('supply_id').notNull().references(() => supplies.id),
  qty: integer('qty').notNull(),
  unitCostCents: integer('unit_cost_cents').notNull(),
});

// === Ventas online ===
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 64 }),
  address: jsonb('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  status: orderStatus('status').notNull().default('pending'),
  channel: orderChannel('channel').notNull().default('online'),
  shippingMethod: shippingMethod('shipping_method').notNull(),
  shippingAddress: jsonb('shipping_address'),
  shippingCostCents: integer('shipping_cost_cents').notNull().default(0),
  subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull(),
  totalCents: bigint('total_cents', { mode: 'number' }).notNull(),
  mpPaymentId: varchar('mp_payment_id', { length: 128 }),
  paymentStatus: varchar('payment_status', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
}, (t) => ({
  mpPaymentUnique: uniqueIndex('orders_mp_payment_id_unique').on(t.mpPaymentId),
}));

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  packDefinitionId: integer('pack_definition_id').notNull().references(() => packDefinitions.id),
  qty: integer('qty').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  lineTotalCents: bigint('line_total_cents', { mode: 'number' }).notNull(),
});

// === POS ===
export const cashSessions = pgTable('cash_sessions', {
  id: serial('id').primaryKey(),
  openedBy: integer('opened_by').notNull().references(() => users.id),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  openingAmountCents: bigint('opening_amount_cents', { mode: 'number' }).notNull(),
  closedBy: integer('closed_by').references(() => users.id),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  closingAmountCountedCents: bigint('closing_amount_counted_cents', { mode: 'number' }),
  closingAmountExpectedCents: bigint('closing_amount_expected_cents', { mode: 'number' }),
  notes: text('notes'),
});

export const posSales = pgTable('pos_sales', {
  id: serial('id').primaryKey(),
  cashSessionId: integer('cash_session_id').notNull().references(() => cashSessions.id),
  cashierId: integer('cashier_id').notNull().references(() => users.id),
  totalCents: bigint('total_cents', { mode: 'number' }).notNull(),
  paymentMethod: paymentMethod('payment_method').notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const posSaleItems = pgTable('pos_sale_items', {
  id: serial('id').primaryKey(),
  posSaleId: integer('pos_sale_id').notNull().references(() => posSales.id, { onDelete: 'cascade' }),
  packDefinitionId: integer('pack_definition_id').notNull().references(() => packDefinitions.id),
  qty: integer('qty').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
});
