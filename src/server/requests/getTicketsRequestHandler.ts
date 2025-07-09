import { LinearClient } from "@linear/sdk";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export interface GetTicketsArgs {
  apiKey: string;
  status?: string;
  excludeStatuses?: string[];
  maxPriority?: number;
  limit?: number;
}

export async function handleRequest(
  args: GetTicketsArgs,
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    // Validate arguments
    if (!args.apiKey) {
      throw new McpError(ErrorCode.InvalidParams, "API key is required");
    }

    // Initialize Linear client
    const linearClient = new LinearClient({
      apiKey: args.apiKey,
    });

    // Get authenticated user
    const me = await linearClient.viewer;

    // Build query options with server-side filtering
    const queryOptions: Record<string, unknown> = {
      first: args.limit || 10,
    };

    // Build API-level filters
    const filters: Record<string, unknown> = {};

    // Apply specific status filtering if provided
    if (args.status) {
      filters.state = {
        name: {
          eq: args.status,
        },
      };
    }

    // Apply excludeStatuses filtering if provided
    if (args.excludeStatuses && args.excludeStatuses.length > 0) {
      filters.state = {
        name: {
          nin: args.excludeStatuses, // "not in" filter
        },
      };
    }

    // Apply priority filtering if provided
    // Note: Linear priority: 0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low
    if (args.maxPriority !== undefined) {
      filters.priority = {
        lte: args.maxPriority, // Include tickets with priority <= maxPriority
      };
    }

    // Add filters to query if any exist
    if (Object.keys(filters).length > 0) {
      queryOptions.filter = filters;
    }

    // Get user's assigned issues
    const issues = await me.assignedIssues(queryOptions);

    if (!issues.nodes.length) {
      return {
        content: [
          {
            type: "text",
            text: "No tickets found matching the criteria.",
          },
        ],
      };
    }

    // Format the issues (server-side filtering already applied)
    const formattedIssues = await Promise.all(
      issues.nodes.map(async (issue) => {
        const state = await issue.state;
        return {
          id: issue.id,
          title: issue.title,
          status: state?.name || "Unknown",
          priority: issue.priority,
          url: issue.url,
          createdAt: issue.createdAt,
        };
      }),
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(formattedIssues, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch Linear tickets: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
