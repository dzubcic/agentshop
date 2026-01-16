import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomUUID } from "crypto";

// API Configuration
const AGENTSHOP_API_URL = process.env.AGENTSHOP_API_URL || "http://localhost:8080";
const AGENTSHOP_API_KEY = process.env.AGENTSHOP_API_KEY || "demo-key";

// Create server instance
const server = new McpServer({
  name: "agentshop-mcp",
  version: "1.0.0",
});

// Utility function to make API calls
async function makeApiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const url = `${AGENTSHOP_API_URL}${endpoint}`;
  const requestId = randomUUID();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${AGENTSHOP_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.error(`API call failed: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API call error: ${error}`);
    return null;
  }
}

// =============================================================================
// ORDER TOOLS
// =============================================================================

server.registerTool(
    "orders.search_by_email",
    {
      title: "Search Orders by Email",
      description: "Search orders by customer email address",
      inputSchema: {
        email: z.string().email().describe("Customer email address"),
      },
    },
    async ({ email }) => {
      const data = await makeApiCall<{ orders: any[] }>(`/orders?customer_email=${encodeURIComponent(email)}`);

      if (!data) {
        return {
          content: [{ type: "text", text: "Failed to retrieve orders" }],
        };
      }

      if (!data.orders || data.orders.length === 0) {
        return {
          content: [{ type: "text", text: `No orders found for ${email}` }],
        };
      }

      const ordersText = data.orders.map((order) =>
          `- Order ${order.id}: ${order.status}, ${order.total_amount} ${order.currency}, created ${order.created_at}`
      ).join("\n");

      return {
        content: [{ type: "text", text: `Orders for ${email}:\n\n${ordersText}` }],
      };
    }
);

server.registerTool(
    "orders.get",
    {
      title: "Get Order Details",
      description: "Get detailed order information including items",
      inputSchema: {
        order_id: z.string().uuid().describe("Order ID (UUID)"),
      },
    },
    async ({ order_id }) => {
      const data = await makeApiCall<{ order: any; items: any[] }>(`/orders/${order_id}`);

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to retrieve order ${order_id}` }],
        };
      }

      const itemsText = data.items.map((item) =>
          `  - ${item.name} (${item.sku}) x${item.qty} @ ${item.unit_price}`
      ).join("\n");

      const orderText = `Order ${data.order.id}:
Status: ${data.order.status}
Total: ${data.order.total_amount} ${data.order.currency}
Customer: ${data.order.customer_id}
Created: ${data.order.created_at}
Updated: ${data.order.updated_at}

Items:
${itemsText}`;

      return {
        content: [{ type: "text", text: orderText }],
      };
    }
);

server.registerTool(
    "orders.get_internal_notes",
    {
      title: "Get Internal Order Notes",
      description: "Get internal order notes (SENSITIVE - may contain private information)",
      inputSchema: {
        order_id: z.string().uuid().describe("Order ID (UUID)"),
      },
    },
    async ({ order_id }) => {
      const data = await makeApiCall<{ notes: any[] }>(`/orders/${order_id}/notes`);

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to retrieve notes for order ${order_id}` }],
        };
      }

      if (!data.notes || data.notes.length === 0) {
        return {
          content: [{ type: "text", text: `No internal notes for order ${order_id}` }],
        };
      }

      const notesText = data.notes.map((note) =>
          `[${note.visibility}] ${note.created_at}: ${note.note}`
      ).join("\n\n");

      return {
        content: [{ type: "text", text: `Internal notes for order ${order_id}:\n\n${notesText}` }],
      };
    }
);

// =============================================================================
// SHIPPING TOOLS
// =============================================================================

server.registerTool(
    "shipping.track",
    {
      title: "Track Shipment",
      description: "Track a shipment by tracking ID",
      inputSchema: {
        tracking_id: z.string().min(3).describe("Shipment tracking ID"),
      },
    },
    async ({ tracking_id }) => {
      const data = await makeApiCall<{ shipment: any; events: any[] }>(`/shipments/by-tracking/${encodeURIComponent(tracking_id)}`);

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to track shipment ${tracking_id}` }],
        };
      }

      const eventsText = data.events.map((event) =>
          `  ${event.event_time}: ${event.status} - ${event.message}${event.location ? ` (${event.location})` : ''}`
      ).join("\n");

      const shipmentText = `Shipment ${data.shipment.tracking_id}:
Carrier: ${data.shipment.carrier}
Status: ${data.shipment.status}
ETA: ${data.shipment.estimated_delivery_date || 'TBD'}
Last Update: ${data.shipment.last_update_at}

Events:
${eventsText}`;

      return {
        content: [{ type: "text", text: shipmentText }],
      };
    }
);

server.registerTool(
    "shipping.by_order",
    {
      title: "Get Shipments by Order",
      description: "Get all shipments for an order",
      inputSchema: {
        order_id: z.string().uuid().describe("Order ID (UUID)"),
      },
    },
    async ({ order_id }) => {
      const data = await makeApiCall<{ shipments: any[] }>(`/shipments/by-order/${order_id}`);

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to retrieve shipments for order ${order_id}` }],
        };
      }

      if (!data.shipments || data.shipments.length === 0) {
        return {
          content: [{ type: "text", text: `No shipments found for order ${order_id}` }],
        };
      }

      const shipmentsText = data.shipments.map((shipment) =>
          `- ${shipment.tracking_id} (${shipment.carrier}): ${shipment.status}, ETA: ${shipment.estimated_delivery_date || 'TBD'}`
      ).join("\n");

      return {
        content: [{ type: "text", text: `Shipments for order ${order_id}:\n\n${shipmentsText}` }],
      };
    }
);

// =============================================================================
// INVENTORY TOOLS
// =============================================================================

server.registerTool(
    "inventory.status",
    {
      title: "Get Inventory Status",
      description: "Get inventory status for a SKU",
      inputSchema: {
        sku: z.string().min(1).describe("Product SKU"),
      },
    },
    async ({ sku }) => {
      const data = await makeApiCall<any>(`/inventory/${encodeURIComponent(sku)}`);

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to retrieve inventory for SKU ${sku}` }],
        };
      }

      const inventoryText = `Inventory for ${data.name} (${data.sku}):
Available: ${data.available_qty}
Reserved: ${data.reserved_qty}
Reorder Threshold: ${data.reorder_threshold}`;

      return {
        content: [{ type: "text", text: inventoryText }],
      };
    }
);

server.registerTool(
    "inventory.reserve",
    {
      title: "Reserve Inventory",
      description: "Reserve inventory for replacement/reship (WRITE operation)",
      inputSchema: {
        sku: z.string().min(1).describe("Product SKU"),
        qty: z.number().int().min(1).describe("Quantity to reserve"),
        reason: z.string().min(1).describe("Reason for reservation"),
      },
    },
    async ({ sku, qty, reason }) => {
      const data = await makeApiCall<any>('/inventory/reserve', {
        method: 'POST',
        body: JSON.stringify({ sku, qty, reason }),
      });

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to reserve inventory for SKU ${sku}` }],
        };
      }

      return {
        content: [{
          type: "text",
          text: `Reservation created:\nID: ${data.id}\nSKU: ${data.sku}\nQuantity: ${data.qty}\nReason: ${data.reason}\nCreated: ${data.created_at}`
        }],
      };
    }
);

server.registerTool(
    "inventory.release",
    {
      title: "Release Inventory Reservation",
      description: "Release a prior inventory reservation (WRITE operation)",
      inputSchema: {
        reservation_id: z.string().uuid().describe("Reservation ID (UUID)"),
      },
    },
    async ({ reservation_id }) => {
      const data = await makeApiCall<{ ok: boolean }>('/inventory/release', {
        method: 'POST',
        body: JSON.stringify({ reservation_id }),
      });

      if (!data || !data.ok) {
        return {
          content: [{ type: "text", text: `Failed to release reservation ${reservation_id}` }],
        };
      }

      return {
        content: [{ type: "text", text: `Reservation ${reservation_id} released successfully` }],
      };
    }
);

// =============================================================================
// RETURNS TOOLS
// =============================================================================

server.registerTool(
    "returns.create",
    {
      title: "Create Return Request",
      description: "Create a return request (WRITE operation)",
      inputSchema: {
        order_id: z.string().uuid().describe("Order ID (UUID)"),
        reason_code: z.enum(['wrong_item', 'damaged', 'late', 'changed_mind']).describe("Return reason code"),
        details: z.string().optional().describe("Additional details"),
      },
    },
    async ({ order_id, reason_code, details }) => {
      const data = await makeApiCall<any>('/returns', {
        method: 'POST',
        body: JSON.stringify({ order_id, reason_code, details }),
      });

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to create return for order ${order_id}` }],
        };
      }

      return {
        content: [{
          type: "text",
          text: `Return created:\nID: ${data.id}\nOrder: ${data.order_id}\nStatus: ${data.status}\nReason: ${data.reason_code}\nRequested: ${data.requested_at}`
        }],
      };
    }
);

server.registerTool(
    "returns.approve",
    {
      title: "Approve Return",
      description: "Approve a return request (WRITE operation)",
      inputSchema: {
        return_id: z.string().uuid().describe("Return ID (UUID)"),
      },
    },
    async ({ return_id }) => {
      const data = await makeApiCall<any>(`/returns/${return_id}/approve`, {
        method: 'POST',
      });

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to approve return ${return_id}` }],
        };
      }

      return {
        content: [{ type: "text", text: `Return ${return_id} approved. Status: ${data.status}` }],
      };
    }
);

server.registerTool(
    "returns.refund",
    {
      title: "Refund Return",
      description: "Process refund for a return (WRITE operation)",
      inputSchema: {
        return_id: z.string().uuid().describe("Return ID (UUID)"),
      },
    },
    async ({ return_id }) => {
      const data = await makeApiCall<any>(`/returns/${return_id}/refund`, {
        method: 'POST',
      });

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to refund return ${return_id}` }],
        };
      }

      return {
        content: [{ type: "text", text: `Return ${return_id} refunded. Status: ${data.status}` }],
      };
    }
);

// =============================================================================
// POLICY TOOLS
// =============================================================================

server.registerTool(
    "policy.lookup",
    {
      title: "Lookup Country Policy",
      description: "Get policy information for a country",
      inputSchema: {
        country_code: z.string().length(2).describe("Two-letter country code (e.g., HR, US, DE)"),
      },
    },
    async ({ country_code }) => {
      const data = await makeApiCall<any>(`/policies?country=${country_code.toUpperCase()}`);

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to retrieve policy for ${country_code}` }],
        };
      }

      const policyText = `Policy for ${data.country_code}:
Refund Window: ${data.refund_window_days} days
Replacement Window: ${data.replacement_window_days} days
Notes: ${data.notes}`;

      return {
        content: [{ type: "text", text: policyText }],
      };
    }
);

// =============================================================================
// KNOWLEDGE BASE TOOLS
// =============================================================================

server.registerTool(
    "kb.search",
    {
      title: "Search Knowledge Base",
      description: "Search knowledge base documents",
      inputSchema: {
        query: z.string().min(1).describe("Search query"),
      },
    },
    async ({ query }) => {
      const data = await makeApiCall<{ results: any[] }>(`/kb/search?q=${encodeURIComponent(query)}`);

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to search knowledge base for "${query}"` }],
        };
      }

      if (!data.results || data.results.length === 0) {
        return {
          content: [{ type: "text", text: `No KB results found for "${query}"` }],
        };
      }

      const resultsText = data.results.map((doc) =>
          `📄 ${doc.title}\n   ${doc.snippet}\n   Tags: ${doc.tags.join(', ')}`
      ).join("\n\n");

      return {
        content: [{ type: "text", text: `Knowledge base results for "${query}":\n\n${resultsText}` }],
      };
    }
);

// =============================================================================
// TICKET TOOLS
// =============================================================================

server.registerTool(
    "tickets.create",
    {
      title: "Create Ticket",
      description: "Create a support/ops ticket (WRITE operation)",
      inputSchema: {
        type: z.enum(['warehouse', 'carrier', 'billing', 'support']).describe("Ticket type"),
        priority: z.enum(['low', 'med', 'high']).describe("Priority level"),
        title: z.string().min(1).describe("Ticket title"),
        body: z.string().min(1).describe("Ticket description"),
      },
    },
    async ({ type, priority, title, body }) => {
      const data = await makeApiCall<any>('/tickets', {
        method: 'POST',
        body: JSON.stringify({ type, priority, title, body }),
      });

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to create ticket` }],
        };
      }

      return {
        content: [{
          type: "text",
          text: `Ticket created:\nID: ${data.id}\nType: ${data.type}\nPriority: ${data.priority}\nTitle: ${data.title}\nStatus: ${data.status}\nCreated: ${data.created_at}`
        }],
      };
    }
);

// =============================================================================
// DEMO TOOLS
// =============================================================================

server.registerTool(
    "demo.reset",
    {
      title: "Reset Demo Database",
      description: "Reset database to seed state (DANGEROUS - for demo only)",
      inputSchema: {},
    },
    async () => {
      const data = await makeApiCall<{ ok: boolean }>('/demo/reset', {
        method: 'POST',
      });

      if (!data || !data.ok) {
        return {
          content: [{ type: "text", text: `Failed to reset database` }],
        };
      }

      return {
        content: [{ type: "text", text: `Database reset to seed state successfully` }],
      };
    }
);

server.registerTool(
    "demo.simulate_delay",
    {
      title: "Simulate Shipment Delay",
      description: "Simulate a shipment delay on an order (for demo purposes)",
      inputSchema: {
        order_id: z.string().uuid().describe("Order ID (UUID)"),
      },
    },
    async ({ order_id }) => {
      // First get shipments for this order
      const shipmentsData = await makeApiCall<{ shipments: any[] }>(`/shipments/by-order/${order_id}`);

      if (!shipmentsData || !shipmentsData.shipments || shipmentsData.shipments.length === 0) {
        return {
          content: [{ type: "text", text: `No shipments found for order ${order_id}` }],
        };
      }

      // Simulate delay on the first shipment
      const shipment = shipmentsData.shipments[0];
      const data = await makeApiCall<any>(`/shipments/${shipment.id}/simulate`, {
        method: 'POST',
        body: JSON.stringify({
          status: 'delayed',
          message: 'Demo-simulated weather disruption',
          location: 'Demo Hub'
        }),
      });

      if (!data) {
        return {
          content: [{ type: "text", text: `Failed to simulate delay for order ${order_id}` }],
        };
      }

      return {
        content: [{
          type: "text",
          text: `Simulated delay for shipment ${shipment.tracking_id}:\nNew Status: ${data.status}\nCarrier: ${data.carrier}\nOrder: ${order_id}`
        }],
      };
    }
);

// =============================================================================
// SERVER SETUP
// =============================================================================

async function runServer() {
    const transport = new StdioServerTransport();

    console.error("AgentShop MCP Server starting...");
    console.error(`API URL: ${AGENTSHOP_API_URL}`);

    await server.connect(transport);
    console.error("AgentShop MCP Server connected and ready!");
}

runServer().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
