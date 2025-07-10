import { LinearClient } from "@linear/sdk";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export interface GetUsersArgs {
  apiKey: string;
}

export async function handleRequest(
  args: GetUsersArgs,
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

    // Get all users from the organization
    const users = await linearClient.users();

    if (!users.nodes.length) {
      return {
        content: [
          {
            type: "text",
            text: "No users found.",
          },
        ],
      };
    }

    // Format the users
    const formattedUsers = users.nodes.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      displayName: user.displayName,
      isActive: user.active,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(formattedUsers, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch Linear users: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
