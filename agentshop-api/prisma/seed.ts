import { PrismaClient, ShipmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.shipmentEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.inventoryReservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.return.deleteMany();
  await prisma.orderNote.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.kbDoc.deleteMany();

  // Create policies for 10 countries
  const policies = await Promise.all([
    prisma.policy.create({
      data: {
        countryCode: 'HR',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'US',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'DE',
        refundWindowDays: 30,
        replacementWindowDays: 45,
        notes: 'Extended replacement window for DE. VIP exceptions available.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'IT',
        refundWindowDays: 14,
        replacementWindowDays: 14,
        notes: 'Shorter windows for IT market. VIP exceptions available.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'UK',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'FR',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'ES',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'NL',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'AT',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
    prisma.policy.create({
      data: {
        countryCode: 'PL',
        refundWindowDays: 30,
        replacementWindowDays: 30,
        notes: 'Standard policy. VIP customers may request exceptions.',
      },
    }),
  ]);

  console.log(`Created ${policies.length} policies`);

  // Create 10 customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'ivan.horvat@example.hr',
        name: 'Ivan Horvat',
        countryCode: 'HR',
        tags: ['vip'],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'john.smith@example.com',
        name: 'John Smith',
        countryCode: 'US',
        tags: ['frequent_traveler'],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'anna.mueller@example.de',
        name: 'Anna Müller',
        countryCode: 'DE',
        tags: ['vip'],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'marco.rossi@example.it',
        name: 'Marco Rossi',
        countryCode: 'IT',
        tags: [],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'emily.jones@example.uk',
        name: 'Emily Jones',
        countryCode: 'UK',
        tags: ['vip', 'frequent_traveler'],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'marie.dupont@example.fr',
        name: 'Marie Dupont',
        countryCode: 'FR',
        tags: [],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'carlos.garcia@example.es',
        name: 'Carlos García',
        countryCode: 'ES',
        tags: [],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'sophie.vandenberg@example.nl',
        name: 'Sophie van den Berg',
        countryCode: 'NL',
        tags: ['vip'],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'wolfgang.schmidt@example.at',
        name: 'Wolfgang Schmidt',
        countryCode: 'AT',
        tags: [],
      },
    }),
    prisma.customer.create({
      data: {
        email: 'anna.kowalska@example.pl',
        name: 'Anna Kowalska',
        countryCode: 'PL',
        tags: [],
      },
    }),
  ]);

  console.log(`Created ${customers.length} customers`);

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventory.create({
      data: {
        sku: 'LAPTOP-X1',
        name: 'Premium Laptop X1',
        availableQty: 50,
        reservedQty: 0,
        reorderThreshold: 10,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'PHONE-Y2',
        name: 'Smartphone Y2',
        availableQty: 100,
        reservedQty: 0,
        reorderThreshold: 20,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'HEADSET-Z3',
        name: 'Wireless Headset Z3',
        availableQty: 0,
        reservedQty: 0,
        reorderThreshold: 15,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'MOUSE-M4',
        name: 'Gaming Mouse M4',
        availableQty: 200,
        reservedQty: 0,
        reorderThreshold: 30,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'KEYBOARD-K5',
        name: 'Mechanical Keyboard K5',
        availableQty: 75,
        reservedQty: 0,
        reorderThreshold: 20,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'MONITOR-V6',
        name: '4K Monitor V6',
        availableQty: 30,
        reservedQty: 0,
        reorderThreshold: 5,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'CABLE-C7',
        name: 'USB-C Cable Premium',
        availableQty: 500,
        reservedQty: 0,
        reorderThreshold: 100,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'CASE-P8',
        name: 'Protective Phone Case',
        availableQty: 150,
        reservedQty: 0,
        reorderThreshold: 40,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'CHARGER-W9',
        name: 'Wireless Charger Stand',
        availableQty: 80,
        reservedQty: 0,
        reorderThreshold: 25,
      },
    }),
    prisma.inventory.create({
      data: {
        sku: 'TABLET-T10',
        name: 'Premium Tablet T10',
        availableQty: 40,
        reservedQty: 0,
        reorderThreshold: 8,
      },
    }),
  ]);

  console.log(`Created ${inventoryItems.length} inventory items`);

  // Helper function to create orders with dates in the past
  const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const hoursAgo = (hours: number): Date => {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return date;
  };

  // Track order count
  let orderCount = 0;

  // Scenario 1: WISMO Delayed (15+ orders)
  console.log('Creating WISMO Delayed scenarios...');
  for (let i = 0; i < 15; i++) {
    const customer = customers[i % customers.length];
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'shipped',
        totalAmount: 199.99 + i * 10,
        currency: 'USD',
        createdAt: daysAgo(5 + i),
        updatedAt: daysAgo(4 + i),
        items: {
          create: [
            {
              sku: 'LAPTOP-X1',
              name: 'Premium Laptop X1',
              qty: 1,
              unitPrice: 199.99 + i * 10,
            },
          ],
        },
      },
    });

    const trackingId = `DELAYED${String(i + 1).padStart(3, '0')}`;
    const carriers = ['FedEx', 'UPS', 'DHL', 'USPS'];
    const carrier = carriers[i % carriers.length];
    const delayReasons = [
      'Weather delays affecting regional hub',
      'Customs clearance taking longer than expected',
      'High package volume during peak season',
      'Mechanical issues with delivery vehicle',
      'Address verification needed',
    ];

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier,
        trackingId,
        status: 'delayed',
        estimatedDeliveryDate: daysAgo(-2),
        lastUpdateAt: hoursAgo(6 + i),
        events: {
          create: [
            {
              eventTime: daysAgo(4 + i),
              location: 'Origin Hub',
              status: 'label_created',
              message: 'Shipping label created',
            },
            {
              eventTime: daysAgo(3 + i),
              location: 'Sorting Facility',
              status: 'in_transit',
              message: 'Package in transit',
            },
            {
              eventTime: hoursAgo(6 + i),
              location: 'Regional Distribution Center',
              status: 'delayed',
              message: delayReasons[i % delayReasons.length],
            },
          ],
        },
      },
    });

    orderCount++;
  }

  // Scenario 2: Wrong Item (10+ orders)
  console.log('Creating Wrong Item scenarios...');
  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'delivered',
        totalAmount: 149.99,
        currency: 'USD',
        createdAt: daysAgo(10 + i),
        updatedAt: daysAgo(5 + i),
        items: {
          create: [
            {
              sku: 'PHONE-Y2',
              name: 'Smartphone Y2',
              qty: 1,
              unitPrice: 149.99,
            },
          ],
        },
        notes: {
          create: [
            {
              visibility: 'internal',
              note: `Customer ordered PHONE-Y2 but may have received HEADSET-Z3 instead. Warehouse picking error suspected.`,
            },
          ],
        },
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'FedEx',
        trackingId: `WRONG${String(i + 1).padStart(3, '0')}`,
        status: 'delivered',
        estimatedDeliveryDate: daysAgo(5 + i),
        lastUpdateAt: daysAgo(5 + i),
        events: {
          create: [
            {
              eventTime: daysAgo(9 + i),
              location: 'Warehouse',
              status: 'label_created',
              message: 'Label created',
            },
            {
              eventTime: daysAgo(7 + i),
              location: 'In transit',
              status: 'in_transit',
              message: 'Package in transit',
            },
            {
              eventTime: daysAgo(5 + i),
              location: customer.countryCode,
              status: 'delivered',
              message: 'Delivered',
            },
          ],
        },
      },
    });

    orderCount++;
  }

  // Scenario 3: Out of Stock Replacement (10+ orders)
  console.log('Creating Out of Stock Replacement scenarios...');
  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'delivered',
        totalAmount: 89.99,
        currency: 'EUR',
        createdAt: daysAgo(15 + i),
        updatedAt: daysAgo(10 + i),
        items: {
          create: [
            {
              sku: 'HEADSET-Z3',
              name: 'Wireless Headset Z3',
              qty: 1,
              unitPrice: 89.99,
            },
          ],
        },
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'DHL',
        trackingId: `NOSTOCK${String(i + 1).padStart(3, '0')}`,
        status: 'delivered',
        estimatedDeliveryDate: daysAgo(10 + i),
        lastUpdateAt: daysAgo(10 + i),
        events: {
          create: [
            {
              eventTime: daysAgo(14 + i),
              location: 'Warehouse',
              status: 'label_created',
              message: 'Label created',
            },
            {
              eventTime: daysAgo(10 + i),
              location: customer.countryCode,
              status: 'delivered',
              message: 'Delivered to customer',
            },
          ],
        },
      },
    });

    orderCount++;
  }

  // Scenario 4: Refund Outside Window (10+ orders)
  console.log('Creating Refund Outside Window scenarios...');
  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const daysOld = 31 + i * 2; // 31-60 days old
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'delivered',
        totalAmount: 299.99,
        currency: 'USD',
        createdAt: daysAgo(daysOld),
        updatedAt: daysAgo(daysOld - 5),
        items: {
          create: [
            {
              sku: 'TABLET-T10',
              name: 'Premium Tablet T10',
              qty: 1,
              unitPrice: 299.99,
            },
          ],
        },
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'UPS',
        trackingId: `OLDORD${String(i + 1).padStart(3, '0')}`,
        status: 'delivered',
        estimatedDeliveryDate: daysAgo(daysOld - 5),
        lastUpdateAt: daysAgo(daysOld - 5),
        events: {
          create: [
            {
              eventTime: daysAgo(daysOld - 2),
              location: 'Warehouse',
              status: 'label_created',
              message: 'Label created',
            },
            {
              eventTime: daysAgo(daysOld - 5),
              location: customer.countryCode,
              status: 'delivered',
              message: 'Delivered',
            },
          ],
        },
      },
    });

    orderCount++;
  }

  // Scenario 5: VIP Customer Exception (10+ orders)
  console.log('Creating VIP Customer Exception scenarios...');
  const vipCustomers = customers.filter((c) => c.tags.includes('vip'));
  for (let i = 0; i < 12; i++) {
    const customer = vipCustomers[i % vipCustomers.length];
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'delivered',
        totalAmount: 599.99,
        currency: 'EUR',
        createdAt: daysAgo(20 + i),
        updatedAt: daysAgo(15 + i),
        items: {
          create: [
            {
              sku: 'LAPTOP-X1',
              name: 'Premium Laptop X1',
              qty: 1,
              unitPrice: 599.99,
            },
          ],
        },
        notes: {
          create: [
            {
              visibility: 'internal',
              note: `VIP customer. Consider exception for late return/refund requests. Manager approval may be granted.`,
            },
          ],
        },
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'DHL Express',
        trackingId: `VIP${String(i + 1).padStart(3, '0')}`,
        status: 'delivered',
        estimatedDeliveryDate: daysAgo(15 + i),
        lastUpdateAt: daysAgo(15 + i),
        events: {
          create: [
            {
              eventTime: daysAgo(19 + i),
              location: 'Warehouse',
              status: 'label_created',
              message: 'Priority shipping label created',
            },
            {
              eventTime: daysAgo(17 + i),
              location: 'International Hub',
              status: 'in_transit',
              message: 'Express shipment in transit',
            },
            {
              eventTime: daysAgo(15 + i),
              location: customer.countryCode,
              status: 'delivered',
              message: 'Delivered - signature required',
            },
          ],
        },
      },
    });

    orderCount++;
  }

  // Scenario 6: Carrier Exception (10+ orders)
  console.log('Creating Carrier Exception scenarios...');
  const exceptionReasons = [
    'Incorrect address - unable to locate recipient',
    'Business closed - recipient unavailable',
    'Customs hold - additional documentation required',
    'Damaged package - needs inspection',
    'Security delay at international border',
    'Refused by recipient',
  ];
  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'shipped',
        totalAmount: 129.99,
        currency: 'USD',
        createdAt: daysAgo(8 + i),
        updatedAt: daysAgo(2 + i),
        items: {
          create: [
            {
              sku: 'MONITOR-V6',
              name: '4K Monitor V6',
              qty: 1,
              unitPrice: 129.99,
            },
          ],
        },
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'DHL',
        trackingId: `EXCPT${String(i + 1).padStart(3, '0')}`,
        status: 'exception',
        estimatedDeliveryDate: null,
        lastUpdateAt: hoursAgo(12 + i * 2),
        events: {
          create: [
            {
              eventTime: daysAgo(7 + i),
              location: 'Origin',
              status: 'label_created',
              message: 'Shipping label created',
            },
            {
              eventTime: daysAgo(5 + i),
              location: 'In transit',
              status: 'in_transit',
              message: 'Package in transit',
            },
            {
              eventTime: hoursAgo(12 + i * 2),
              location: 'Destination hub',
              status: 'exception',
              message: exceptionReasons[i % exceptionReasons.length],
            },
          ],
        },
      },
    });

    orderCount++;
  }

  // Scenario 7: Split Shipment (10+ orders)
  console.log('Creating Split Shipment scenarios...');
  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'shipped',
        totalAmount: 399.99,
        currency: 'EUR',
        createdAt: daysAgo(12 + i),
        updatedAt: daysAgo(3 + i),
        items: {
          create: [
            {
              sku: 'LAPTOP-X1',
              name: 'Premium Laptop X1',
              qty: 1,
              unitPrice: 299.99,
            },
            {
              sku: 'MOUSE-M4',
              name: 'Gaming Mouse M4',
              qty: 1,
              unitPrice: 49.99,
            },
            {
              sku: 'KEYBOARD-K5',
              name: 'Mechanical Keyboard K5',
              qty: 1,
              unitPrice: 79.99,
            },
          ],
        },
      },
    });

    // First shipment - delivered
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'FedEx',
        trackingId: `SPLIT${String(i + 1).padStart(3, '0')}A`,
        status: 'delivered',
        estimatedDeliveryDate: daysAgo(5 + i),
        lastUpdateAt: daysAgo(5 + i),
        events: {
          create: [
            {
              eventTime: daysAgo(11 + i),
              location: 'Warehouse A',
              status: 'label_created',
              message: 'Shipment 1 of 2 - Label created',
            },
            {
              eventTime: daysAgo(5 + i),
              location: customer.countryCode,
              status: 'delivered',
              message: 'Shipment 1 of 2 delivered',
            },
          ],
        },
      },
    });

    // Second shipment - in various states
    const secondShipmentStatuses: ShipmentStatus[] = ['in_transit', 'delayed', 'out_for_delivery'];
    const secondStatus = secondShipmentStatuses[i % secondShipmentStatuses.length];
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'FedEx',
        trackingId: `SPLIT${String(i + 1).padStart(3, '0')}B`,
        status: secondStatus,
        estimatedDeliveryDate: daysAgo(-1),
        lastUpdateAt: hoursAgo(8 + i),
        events: {
          create: [
            {
              eventTime: daysAgo(10 + i),
              location: 'Warehouse B',
              status: 'label_created',
              message: 'Shipment 2 of 2 - Label created (backordered item)',
            },
            {
              eventTime: hoursAgo(8 + i),
              location: 'Regional Hub',
              status: secondStatus,
              message: `Shipment 2 of 2 - ${secondStatus.replace('_', ' ')}`,
            },
          ],
        },
      },
    });

    orderCount++;
  }

  // Scenario 8: Internal Note Redaction (10+ orders)
  console.log('Creating Internal Note Redaction scenarios...');
  const internalNotes = [
    'Customer has history of fraudulent chargebacks - handle with care',
    'Employee discount applied - 30% off retail price',
    'Shipping address differs from billing - verified with customer via phone',
    'Package value insurance added per customer request',
    'Customer threatened legal action if not delivered by Friday',
    'VIP customer relationship - prioritize any issues',
    'Payment flagged by fraud detection but cleared manually',
    'Customer service complaint filed for previous order',
  ];
  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'delivered',
        totalAmount: 179.99,
        currency: 'USD',
        createdAt: daysAgo(18 + i),
        updatedAt: daysAgo(12 + i),
        items: {
          create: [
            {
              sku: 'PHONE-Y2',
              name: 'Smartphone Y2',
              qty: 1,
              unitPrice: 179.99,
            },
          ],
        },
        notes: {
          create: [
            {
              visibility: 'internal',
              note: internalNotes[i % internalNotes.length],
            },
            {
              visibility: 'public',
              note: 'Order processed successfully. Thank you for your purchase!',
            },
          ],
        },
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: 'USPS',
        trackingId: `INTERNAL${String(i + 1).padStart(3, '0')}`,
        status: 'delivered',
        estimatedDeliveryDate: daysAgo(12 + i),
        lastUpdateAt: daysAgo(12 + i),
        events: {
          create: [
            {
              eventTime: daysAgo(16 + i),
              location: 'Post Office',
              status: 'label_created',
              message: 'Label created',
            },
            {
              eventTime: daysAgo(12 + i),
              location: customer.countryCode,
              status: 'delivered',
              message: 'Delivered',
            },
          ],
        },
      },
    });

    orderCount++;
  }

  console.log(`Created ${orderCount} orders in total`);

  // Create KB docs
  const kbDocs = await Promise.all([
    prisma.kbDoc.create({
      data: {
        title: 'Understanding Delayed Shipments',
        body: 'Shipment delays can occur due to various reasons including weather conditions, customs clearance, high package volumes during peak seasons, and carrier operational issues. For delayed packages, check the tracking information for updates. If a package is delayed more than 3 days past the estimated delivery date, contact customer support.',
        tags: ['shipping', 'delays', 'wismo'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'How to Handle Wrong Item Deliveries',
        body: 'If you received the wrong item: 1) Take photos of the item received, 2) Contact customer support with your order number, 3) Keep the wrong item until we send a return label, 4) We will ship the correct item once we confirm the error. No charge for return shipping on our errors.',
        tags: ['returns', 'wrong_item', 'replacement'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'Return and Refund Policy',
        body: 'Standard return window is 30 days from delivery date. Items must be in original condition. Refunds are processed within 5-7 business days after we receive the return. Some countries have different windows - check your country-specific policy. VIP customers may request exceptions for late returns.',
        tags: ['returns', 'refunds', 'policy'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'VIP Customer Program Benefits',
        body: 'VIP customers receive: Extended return windows (manager approval), Priority customer support, Free expedited shipping, Early access to new products, Dedicated account manager. VIP status is granted to customers with $5000+ annual spend or by invitation.',
        tags: ['vip', 'benefits', 'program'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'Carrier Exception Resolution Process',
        body: 'Carrier exceptions (address issues, customs holds, damaged packages) require investigation. Common resolutions: Address corrections, Additional documentation for customs, Package inspection and repackaging, Alternative delivery arrangements. Contact the carrier directly for fastest resolution, or our support team can assist.',
        tags: ['carrier', 'exceptions', 'shipping'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'Out of Stock Item Replacements',
        body: 'If your replacement item is out of stock, options include: Wait for restock (we will notify you of ETA), Choose an alternative item of equal or greater value, Receive a full refund. We prioritize restocking popular items and will expedite your replacement when available.',
        tags: ['inventory', 'out_of_stock', 'replacement'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'Split Shipment Notifications',
        body: 'Orders may ship in multiple packages if items are in different warehouses or if some items are backordered. You will receive separate tracking numbers for each shipment. All items are guaranteed to arrive, but delivery dates may vary. No additional shipping charges for split shipments.',
        tags: ['shipping', 'split_shipment', 'tracking'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'International Shipping and Customs',
        body: 'International orders may require customs clearance. You may be responsible for import duties and taxes. Delays at customs are beyond our control but typically resolve within 3-5 business days. Track your package for customs status updates. Contact local customs office for specific questions.',
        tags: ['international', 'customs', 'shipping'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'How to Track Your Package',
        body: 'Use your tracking number on the carrier website or our tracking portal. Updates may take 24-48 hours after label creation. Tracking shows: Label created, In transit, Out for delivery, Delivered, Exceptions. For questions about tracking status, contact customer support with your order number.',
        tags: ['tracking', 'shipping', 'wismo'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'Damaged Package Claims',
        body: 'If your package arrives damaged: 1) Take photos of the package and contents, 2) Do not discard packaging materials, 3) Contact support within 48 hours, 4) We will file a carrier claim and send replacement or issue refund. Keep all materials until claim is resolved.',
        tags: ['damaged', 'claims', 'returns'],
      },
    }),
    prisma.kbDoc.create({
      data: {
        title: 'Product Warranty Information',
        body: 'All products include manufacturer warranty. Warranty periods vary by product (typically 1-3 years). Register products within 30 days for extended warranty. Warranty covers manufacturing defects, not accidental damage. Contact support for warranty claims with proof of purchase and description of issue.',
        tags: ['warranty', 'support', 'products'],
      },
    }),
  ]);

  console.log(`Created ${kbDocs.length} KB documents`);

  // Create some tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        type: 'warehouse',
        priority: 'high',
        title: 'Inventory discrepancy for SKU HEADSET-Z3',
        body: 'Physical count shows 5 units but system shows 0. Need immediate reconciliation.',
        status: 'open',
      },
    }),
    prisma.ticket.create({
      data: {
        type: 'carrier',
        priority: 'med',
        title: 'Multiple delayed shipments with FedEx',
        body: 'Pattern of delays in the Northeast region. Need to escalate with carrier account manager.',
        status: 'in_progress',
      },
    }),
    prisma.ticket.create({
      data: {
        type: 'billing',
        priority: 'low',
        title: 'Invoice reconciliation for December',
        body: 'Monthly carrier invoice review and approval needed.',
        status: 'open',
      },
    }),
    prisma.ticket.create({
      data: {
        type: 'support',
        priority: 'high',
        title: 'VIP customer escalation - wrong item received',
        body: 'VIP customer Anna Müller received wrong item. Need expedited replacement and manager approval for courtesy discount.',
        status: 'in_progress',
      },
    }),
  ]);

  console.log(`Created ${tickets.length} tickets`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
