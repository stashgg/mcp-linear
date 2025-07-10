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
        {
          name: "get-linear-teams",
          description: "Get all teams from Linear to use when creating tickets",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "create-linear-ticket",
          description: "Create a new Linear ticket/issue",
          inputSchema: {
            type: "object",
            properties: {
              teamId: {
                type: "string",
                description:
                  "ID of the team to create the ticket in (required)",
              },
              title: {
                type: "string",
                description: "Title of the ticket (required)",
              },
              description: {
                type: "string",
                description: "Description of the ticket (optional)",
              },
              priority: {
                type: "number",
                description:
                  "Priority level (0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low)",
                minimum: 0,
                maximum: 4,
              },
              assigneeId: {
                type: "string",
                description:
                  "ID of the user to assign the ticket to (optional)",
              },
              labelIds: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "Array of label IDs to add to the ticket (optional)",
              },
              stateId: {
                type: "string",
                description: "ID of the workflow state to set (optional)",
              },
            },
            required: ["teamId", "title"],
          },
        },
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const apiKey = process.env.LINEAR_API_KEY;
      if (!apiKey) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "LINEAR_API_KEY environment variable is required",
        );
      }

      switch (request.params.name) {
        case "get-linear-tickets": {
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
        }

        case "get-linear-teams": {
          const { handleRequest } = await import(
            "./requests/getTeamsRequestHandler.js"
          );
          return handleRequest({ apiKey });
        }

        case "create-linear-ticket": {
          const { handleRequest } = await import(
            "./requests/createTicketRequestHandler.js"
          );
          return handleRequest({
            apiKey,
            ...(request.params.arguments as {
              teamId: string;
              title: string;
              description?: string;
              priority?: number;
              assigneeId?: string;
              labelIds?: string[];
              stateId?: string;
            }),
          });
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`,
          );
      }
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
