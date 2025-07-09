#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

declare const process: NodeJS.Process;

class LinearMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "linear-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupTools();
  }

  private setupTools(): void {
    // Define available tools
    this.server.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: [
        {
          name: "get-linear-tickets",
          description: "Get tickets from Linear API for the authenticated user",
          inputSchema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                description:
                  "Optional specific status to filter tickets (e.g. 'Todo', 'In Progress')",
              },
              excludeStatuses: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "Optional list of statuses to exclude (e.g. ['Implemented', 'Verified', 'Canceled'])",
              },
              maxPriority: {
                type: "number",
                description:
                  "Optional maximum priority level to include (0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low)",
                minimum: 0,
                maximum: 4,
              },
              limit: {
                type: "number",
                description:
                  "Maximum number of tickets to return (default: 10)",
                minimum: 1,
                maximum: 50,
              },
            },
          },
        },
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== "get-linear-tickets") {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`,
        );
      }

      const apiKey = process.env.LINEAR_API_KEY;
      if (!apiKey) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "LINEAR_API_KEY environment variable is required",
        );
      }

      const { handleRequest } = await import(
        "./requests/getTicketsRequestHandler.js"
      );
      return handleRequest({
        apiKey,
        ...(request.params.arguments as {
          status?: string;
          excludeStatuses?: string[];
          maxPriority?: number;
          limit?: number;
        }),
      });
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Linear MCP Server running on stdio");
  }
}

// Start the server
const server = new LinearMcpServer();
server.run().catch((error: Error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
