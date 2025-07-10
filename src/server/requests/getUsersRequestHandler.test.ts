import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { LinearClient, UserConnection } from "@linear/sdk";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { handleRequest } from "./getUsersRequestHandler";

// Mock Linear SDK
vi.mock("@linear/sdk", () => ({
  LinearClient: vi.fn().mockImplementation(() => ({
    users: vi.fn(),
  })),
}));

// Get the mock constructor
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const MockLinearClient = LinearClient as unknown as Mock;

describe("getUsersRequestHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if no API key is provided", async () => {
    // @ts-expect-error - Testing invalid input
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await expect(handleRequest({})).rejects.toThrow(
      new McpError(ErrorCode.InvalidParams, "API key is required"),
    );
  });

  it("should return appropriate message when no users are found", async () => {
    // Mock Linear client to return empty users list
    const mockUserConnection: Partial<UserConnection> = {
      nodes: [],
    };

    const mockUsers = vi.fn().mockResolvedValue(mockUserConnection);
    const mockClient = {
      users: mockUsers,
      options: {},
    } as LinearClient;

    MockLinearClient.mockImplementation(() => mockClient);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = await handleRequest({ apiKey: "test-key" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "No users found.",
        },
      ],
    });
  });

  it("should return formatted users when users are found", async () => {
    // Mock Linear client to return users
    const mockUsers = [
      {
        id: "user-1",
        name: "Cole",
        email: "cole@example.com",
        displayName: "Cole Smith",
        active: true,
      },
      {
        id: "user-2",
        name: "Kan",
        email: "kan@example.com",
        displayName: "Kan Johnson",
        active: true,
      },
    ];

    const mockUserConnection: Partial<UserConnection> = {
      nodes: mockUsers,
    };

    const mockUsersMethod = vi.fn().mockResolvedValue(mockUserConnection);
    const mockClient = {
      users: mockUsersMethod,
      options: {},
    } as LinearClient;

    MockLinearClient.mockImplementation(() => mockClient);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = await handleRequest({ apiKey: "test-key" });

    const expectedUsers = [
      {
        id: "user-1",
        name: "Cole",
        email: "cole@example.com",
        displayName: "Cole Smith",
        isActive: true,
      },
      {
        id: "user-2",
        name: "Kan",
        email: "kan@example.com",
        displayName: "Kan Johnson",
        isActive: true,
      },
    ];

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(expectedUsers, null, 2),
        },
      ],
    });
  });

  it("should handle unexpected errors properly", async () => {
    // Mock Linear client to throw an error
    const mockError = new Error("Unexpected API error");
    const mockUsers = vi.fn().mockRejectedValue(mockError);
    const mockClient = {
      users: mockUsers,
      options: {},
    } as LinearClient;

    MockLinearClient.mockImplementation(() => mockClient);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await expect(handleRequest({ apiKey: "test-key" })).rejects.toThrow(
      new McpError(
        ErrorCode.InternalError,
        "Failed to fetch Linear users: Unexpected API error",
      ),
    );
  });
});
