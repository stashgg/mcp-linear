I'll provide guidance on creating an MCP Server for Linear integration. Based on the requirements, here's a high-level design approach:

Project Setup:
// Basic MCP Server structure
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LinearClient } from "@linear/sdk";

// Server configuration
const server = new Server(
{
name: "linear-mcp-server",
version: "1.0.0",
},
{
capabilities: {
tools: {},
},
}
);
Tool Definitions: The server should expose these tools to handle the requested operations:
// Tool definitions
const tools = [
{
name: "get-assigned-tickets",
description: "Get all Linear tickets assigned to the authenticated user",
inputSchema: {
type: "object",
properties: {} // No input needed as it uses authenticated user
}
},
{
name: "get-tickets-by-status",
description: "Get Linear tickets by status for authenticated user",
inputSchema: {
type: "object",
properties: {
status: {
type: "string",
description: "Status to filter tickets by"
}
},
required: ["status"]
}
},
{
name: "search-tickets",
description: "Search Linear tickets by title",
inputSchema: {
type: "object",
properties: {
query: {
type: "string",
description: "Search query for ticket titles"
}
},
required: ["query"]
}
},
{
name: "get-suggested-branch",
description: "Get suggested GitHub branch name for a ticket",
inputSchema: {
type: "object",
properties: {
ticketId: {
type: "string",
description: "ID of the Linear ticket"
}
},
required: ["ticketId"]
}
},
{
name: "get-ticket-details",
description: "Get full ticket details including comments",
inputSchema: {
type: "object",
properties: {
ticketId: {
type: "string",
description: "ID of the Linear ticket"
}
},
required: ["ticketId"]
}
},
{
name: "update-ticket-description",
description: "Update Linear ticket description",
inputSchema: {
type: "object",
properties: {
ticketId: {
type: "string",
description: "ID of the Linear ticket"
},
description: {
type: "string",
description: "New description"
}
},
required: ["ticketId", "description"]
}
},
{
name: "update-ticket-status",
description: "Update Linear ticket status",
inputSchema: {
type: "object",
properties: {
ticketId: {
type: "string",
description: "ID of the Linear ticket"
},
statusId: {
type: "string",
description: "ID of the new status"
}
},
required: ["ticketId", "statusId"]
}
},
{
name: "add-ticket-comment",
description: "Add comment to Linear ticket with optional user mentions",
inputSchema: {
type: "object",
properties: {
ticketId: {
type: "string",
description: "ID of the Linear ticket"
},
comment: {
type: "string",
description: "Comment text"
},
mentionUserIds: {
type: "array",
items: {
type: "string"
},
description: "Optional array of user IDs to mention"
}
},
required: ["ticketId", "comment"]
}
},
{
name: "create-ticket",
description: "Create new Linear ticket",
inputSchema: {
type: "object",
properties: {
teamId: {
type: "string",
description: "ID of the team"
},
title: {
type: "string",
description: "Ticket title"
},
description: {
type: "string",
description: "Ticket description"
}
},
required: ["teamId", "title"]
}
},
{
name: "get-subtasks",
description: "Get subtasks for a Linear ticket",
inputSchema: {
type: "object",
properties: {
ticketId: {
type: "string",
description: "ID of the parent ticket"
}
},
required: ["ticketId"]
}
},
{
name: "create-subtask",
description: "Create subtask for a Linear ticket",
inputSchema: {
type: "object",
properties: {
parentTicketId: {
type: "string",
description: "ID of the parent ticket"
},
title: {
type: "string",
description: "Subtask title"
},
description: {
type: "string",
description: "Subtask description"
}
},
required: ["parentTicketId", "title"]
}
}
];
Implementation Considerations:
Authentication:
// Linear client initialization with API key
const linearClient = new LinearClient({
apiKey: process.env.LINEAR_API_KEY
});
Error Handling:
// Example error handling wrapper
const handleLinearOperation = async (operation: () => Promise<any>) => {
try {
return await operation();
} catch (error) {
throw new McpError(
ErrorCode.InternalError,
`Linear API error: ${error.message}`
);
}
};
Configuration: The MCP server would need to be configured in the Claude desktop config:
{
"mcpServers": {
"linear": {
"command": "node",
"args": ["/path/to/linear-mcp-server/build/index.js"],
"env": {
"LINEAR_API_KEY": "your-linear-api-key"
}
}
}
}
Security Considerations:
Store Linear API key securely
Validate all input parameters
Implement rate limiting
Handle authentication errors gracefully
Sanitize output data
Best Practices:
Use TypeScript for type safety
Implement comprehensive error handling
Add logging for debugging
Write unit tests
Document all tools and their usage
Follow Linear API best practices
Cache responses where appropriate
Implement retry logic for API calls
The implementation would require:

Setting up a new Node.js project
Installing required dependencies (@modelcontextprotocol/sdk, @linear/sdk)
Implementing the server and tools
Adding proper error handling and validation
Testing the integration
Deploying and configuring with Claude
This design provides a foundation for building a Linear MCP server that can handle all the requested operations while following MCP best practices and security considerations.

Task Completed
I've provided a high-level design for creating an MCP Server that integrates with Linear. The design includes:

Basic server structure and configuration
Comprehensive tool definitions for all requested Linear operations
Authentication and error handling patterns
Configuration requirements
Security considerations and best practices
This design would allow for all requested operations:

Finding and searching Linear tickets
Getting ticket details and branch names
Updating tickets and their statuses
Managing comments and mentions
Creating tickets and subtasks
The implementation would use the Linear SDK for API interactions and the MCP SDK for server functionality, providing a secure and efficient way to interact with Linear through Claude.
