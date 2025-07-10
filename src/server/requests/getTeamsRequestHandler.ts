import { LinearClient } from "@linear/sdk";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export interface GetTeamsArgs {
  apiKey: string;
}

export async function handleRequest(
  args: GetTeamsArgs,
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

    // Get all teams
    const teams = await linearClient.teams();

    if (!teams.nodes.length) {
      return {
        content: [
          {
            type: "text",
            text: "No teams found.",
          },
        ],
      };
    }

    // Format the teams
    const formattedTeams = teams.nodes.map((team) => ({
      id: team.id,
      name: team.name,
      key: team.key,
      description: team.description,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(formattedTeams, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch Linear teams: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
