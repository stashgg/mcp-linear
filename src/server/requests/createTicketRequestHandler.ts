import { LinearClient } from "@linear/sdk";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export interface CreateTicketArgs {
  apiKey: string;
  teamId: string;
  title: string;
  description?: string;
  priority?: number;
  assigneeId?: string;
  labelIds?: string[];
  stateId?: string;
}

async function findOrCreateAgentLabel(
  linearClient: LinearClient,
): Promise<string> {
  try {
    // First, try to find existing 'agent-created' label
    const labels = await linearClient.issueLabels({
      filter: { name: { eq: "agent-created" } },
    });

    if (labels.nodes.length > 0) {
      return labels.nodes[0].id;
    }

    // If not found, create the label
    const labelPayload = await linearClient.createIssueLabel({
      name: "agent-created",
      description: "Automatically created by Linear MCP agent",
      color: "#6366f1", // Indigo color
    });

    if (!labelPayload.success || !labelPayload.issueLabel) {
      throw new Error("Failed to create agent-created label");
    }

    const label = await labelPayload.issueLabel;
    return label.id;
  } catch (error) {
    // If we can't create the label, log it but don't fail the ticket creation
    console.error("Warning: Could not create agent-created label:", error);
    return "";
  }
}

export async function handleRequest(
  args: CreateTicketArgs,
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    // Validate required arguments
    if (!args.apiKey) {
      throw new McpError(ErrorCode.InvalidParams, "API key is required");
    }
    if (!args.teamId) {
      throw new McpError(ErrorCode.InvalidParams, "Team ID is required");
    }
    if (!args.title) {
      throw new McpError(ErrorCode.InvalidParams, "Title is required");
    }

    // Initialize Linear client
    const linearClient = new LinearClient({
      apiKey: args.apiKey,
    });

    // Find or create the agent-created label
    const agentLabelId = await findOrCreateAgentLabel(linearClient);

    // Build the labelIds array, including the agent-created label
    const labelIds = [...(args.labelIds || [])];
    if (agentLabelId) {
      labelIds.push(agentLabelId);
    }

    // Build the issue creation input
    const issueInput = {
      teamId: args.teamId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      assigneeId: args.assigneeId,
      labelIds: labelIds.length > 0 ? labelIds : undefined,
      stateId: args.stateId,
    };

    // Create the issue
    const issuePayload = await linearClient.createIssue(issueInput);

    if (!issuePayload.success) {
      throw new McpError(
        ErrorCode.InternalError,
        "Failed to create Linear ticket: Unknown error",
      );
    }

    const issueResult = issuePayload.issue;
    if (!issueResult) {
      throw new McpError(
        ErrorCode.InternalError,
        "Issue was not returned after creation",
      );
    }

    // Await the Linear SDK objects to get the actual data
    const issue = await issueResult;

    // Get the labels for display
    const labels = await issue.labels();
    const labelNames = labels.nodes.map((label) => label.name);

    // Format the response similar to the existing getTicketsRequestHandler
    const createdIssue = {
      id: issue.id,
      title: issue.title,
      url: issue.url,
      labels: labelNames,
      createdAt: issue.createdAt,
    };

    return {
      content: [
        {
          type: "text",
          text: `Successfully created Linear ticket with agent-created label!\n\n${JSON.stringify(createdIssue, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create Linear ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
