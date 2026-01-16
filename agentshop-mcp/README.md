# 🛒 AgentShop MCP Server

AgentShop MCP is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides a comprehensive "e-commerce back office" toolkit for AI models. It allows LLMs to interact with orders, shipping, inventory, returns, policies, and support tickets.

## 🚀 Quick Start

### Installation

```bash
npm install
npm run build
```

### Configuration

The server requires the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENTSHOP_API_URL` | Base URL of the AgentShop API | `http://localhost:8080` |
| `AGENTSHOP_API_KEY` | API key for authentication | `demo-key` |

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentshop": {
      "command": "node",
      "args": ["/path/to/agentshop-mcp/build/index.js"],
      "env": {
        "AGENTSHOP_API_URL": "http://localhost:8080",
        "AGENTSHOP_API_KEY": "demo-key"
      }
    }
  }
}
```

## 🛠 Available Tools

- **Orders**: Search by email, retrieve details, and view internal notes.
- **Shipping**: Track shipments and view order delivery status.
- **Inventory**: Check stock levels, reserve, and release inventory.
- **Returns**: Create, approve, and process refunds.
- **Support**: Look up policies, search knowledge base, and create tickets.
- **Demo**: Tools to reset the demo database and simulate order delays.

## 💡 Example Prompts

- "Find all orders for ana@example.com and check their shipping status."
- "What is the return policy for Croatia (HR)?"
- "Check if we have enough stock for SKU 'TSHIRT-001' and reserve 2 units."
- "Create a high-priority support ticket for order #12345."

---
Built with the [MCP SDK](https://github.com/modelcontextprotocol/sdk)
