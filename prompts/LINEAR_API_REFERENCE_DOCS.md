Here is some information on Linear Docs for accessing information

###

The Linear Typescript SDK exposes the Linear GraphQL schema through strongly typed models and operations. It's written in Typescript but can also be used in any Javascript environment.

All operations return models, which can be used to perform operations for other models and all types are accessible through the Linear SDK package.

Copy
import { LinearClient, LinearFetch, User } from "@linear/sdk";

const linearClient = new LinearClient({ apiKey });

async function getCurrentUser(): LinearFetch<User> {
return linearClient.viewer;
}
You can view the Linear SDK source code on GitHub.

Connect to the Linear API and interact with your data in a few steps:

1. Install the Linear Client
   Using npm:

Copy
npm install @linear/sdk
Or yarn:

Copy
yarn add @linear/sdk 2. Create a Linear client
SDK supports both authentication methods, personal API keys and OAuth 2. See authentication for more details.

You can create a client after creating authentication keys:

Copy
import { LinearClient } from '@linear/sdk'

// Api key authentication
const client1 = new LinearClient({
apiKey: YOUR_PERSONAL_API_KEY
})

// OAuth2 authentication
const client2 = new LinearClient({
accessToken: YOUR_OAUTH_ACCESS_TOKEN
}) 3. Query for your issues
Using async await syntax:

Copy
async function getMyIssues() {
const me = await linearClient.viewer;
const myIssues = await me.assignedIssues();

if (myIssues.nodes.length) {
myIssues.nodes.map(issue => console.log(`${me.displayName} has issue: ${issue.title}`));
} else {
console.log(`${me.displayName} has no issues`);
}
}

getMyIssues();
Or promises:

Copy
linearClient.viewer.then(me => {
return me.assignedIssues().then(myIssues => {
if (myIssues.nodes.length) {
myIssues.nodes.map(issue => console.log(`${me.displayName} has issue: ${issue.title}`));
} else {
console.log(`${me.displayName} has no issues`);
}
});
});

###

###

Queries
Some models can be fetched from the Linear Client without any arguments:

Copy
const me = await linearClient.viewer;
const org = await linearClient.organization;
Other models are exposed as connections, and return a list of nodes:

Copy
const issues = await linearClient.issues();
const firstIssue = issues.nodes[0];
All required variables are passed as the first arguments:

Copy
const user = await linearClient.user("user-id");
const team = await linearClient.team("team-id");
Any optional variables are passed into the last argument as an object:

Copy
const fiftyProjects = await linearClient.projects({ first: 50 });
const allComments = await linearClient.comments({ includeArchived: true });
Most models expose operations to fetch other models:

Copy
const me = await linearClient.viewer;
const myIssues = await me.assignedIssues();
const myFirstIssue = myIssues.nodes[0];
const myFirstIssueComments = await myFirstIssue.comments();
const myFirstIssueFirstComment = myFirstIssueComments.nodes[0];
const myFirstIssueFirstCommentUser = await myFirstIssueFirstComment.user;
NOTE: Parenthesis is required only if the operation takes an optional variables object.

TIP: You can find ID's for any entity within the Linear app by searching for for "Copy model UUID" in the command menu.

Mutations
To create a model, call the Linear Client mutation and pass in the input object:

Copy
const teams = await linearClient.teams();
const team = teams.nodes[0];
if (team.id) {
await linearClient.createIssue({ teamId: team.id, title: "My Created Issue" });
}
To update a model, call the Linear Client mutation and pass in the required variables and input object:

Copy
const me = await linearClient.viewer;
if (me.id) {
await linearClient.updateUser(me.id, { displayName: "Alice" });
}
Or call the mutation from the model:

Copy
const me = await linearClient.viewer;
await me.update({ displayName: "Alice" });
All mutations are exposed in the same way:

Copy
const projects = await linearClient.projects();
const project = projects.nodes[0];
if (project.id) {
await linearClient.archiveProject(project.id);
await project.archive();
}
Mutations will often return a success boolean and the mutated entity:

Copy
const commentPayload = await linearClient.createComment({ issueId: "some-issue-id" });
if (commentPayload.success) {
return commentPayload.comment;
} else {
return new Error("Failed to create comment");
}
Pagination
Connection models have helpers to fetch the next and previous pages of results:

Copy
const issues = await linearClient.issues({ after: "some-issue-cursor", first: 10 });
const nextIssues = await issues.fetchNext();
const prevIssues = await issues.fetchPrevious();
Pagination info is exposed and can be passed to the query operations. This uses the Relay Connection spec:

Copy
const issues = await linearClient.issues();
const hasMoreIssues = issues.pageInfo.hasNextPage;
const issuesEndCursor = issues.pageInfo.endCursor;
const moreIssues = await linearClient.issues({ after: issuesEndCursor, first: 10 });
Results can be ordered using the orderBy optional variable:

Copy
import { LinearDocument } from "@linear/sdk";

const issues = await linearClient.issues({ orderBy: LinearDocument.PaginationOrderBy.Updat

###

###

Errors can be caught and interrogated by wrapping the operation in a try catch block:

Copy
async function createComment(input: LinearDocument.CommentCreateInput): LinearFetch<Comment | UserError> {
try {
/** Try to create a comment \*/
const commentPayload = await linearClient.createComment(input);
/** Return it if available _/
return commentPayload.comment;
} catch (error) {
/\*\* The error has been parsed by Linear Client _/
throw error;
}
}
Or by catching the error thrown from a calling function:

Copy
async function archiveFirstIssue(): LinearFetch<ArchivePayload> {
const me = await linearClient.viewer;
const issues = await me.assignedIssues();
const firstIssue = issues.nodes[0];

if (firstIssue?.id) {
const payload = await linearClient.archiveIssue(firstIssue.id);
return payload;
} else {
return undefined;
}
}

archiveFirstIssue().catch(error => {
throw error;
});
The parsed error type can be compared to determine the course of action:

Copy
import { InvalidInputLinearError, LinearError, LinearErrorType } from '@linear/sdk'
import { UserError } from './custom-errors'

const input = { name: "Happy Team" };
createTeam(input).catch(error => {
if (error instanceof InvalidInputLinearError) {
/** If the mutation has failed due to an invalid user input return a custom user error \*/
return new UserError(input, error);
} else {
/** Otherwise throw the error and handle in the calling function \*/
throw error;
}
});
Information about the request resulting in the error is attached if available:

Copy
run().catch(error => {
if (error instanceof LinearError) {
console.error("Failed query:", error.query);
console.error("With variables:", error.variables);
}
throw error;
});
Information about the response is attached if available:

Copy
run().catch(error => {
if (error instanceof LinearError) {
console.error("Failed HTTP status:", error.status);
console.error("Failed response data:", error.data);
}
throw error;
});
Any GraphQL errors are parsed and added to an array:

Copy
run().catch(error => {
if (error instanceof LinearError) {
error.errors?.map(graphqlError => {
console.log("Error message", graphqlError.message);
console.log("LinearErrorType of this GraphQL error", graphqlError.type);
console.log("Error due to user input", graphqlError.userError);
console.log("Path through the GraphQL schema", graphqlError.path);
});
}
throw error;
});
The raw error returned by the LinearGraphQLClient is still available:

Copy
run().catch(error => {
if (error instanceof LinearError) {
console.log("The original error", error.raw);
}
throw error;
});

###

###

Advanced Usage
The Linear Client wraps the Linear SDK, provides a LinearGraphQLClient, and parses errors.

Request Configuration
The LinearGraphQLClient can be configured by passing the RequestInit object to the Linear Client constructor:

Copy
const linearClient = new LinearClient({ apiKey, headers: { "my-header": "value" } });
Raw GraphQL Client
The LinearGraphQLClient is accessible through the Linear Client:

Copy
const graphQLClient = linearClient.client;
graphQLClient.setHeader("my-header", "value");
Raw GraphQL Queries
The Linear GraphQL API can be queried directly by passing a raw GraphQL query to the LinearGraphQLClient:

Copy
const graphQLClient = linearClient.client;
const cycle = await graphQLClient.rawRequest(`
query cycle($id: String!) {
cycle(id: $id) {
id
name
completedAt
}
}`,
{ id: "cycle-id" }
);
Custom GraphQL Client
In order to use a custom GraphQL Client, the Linear SDK must be extended and provided with a request function:

Copy
import { LinearError, LinearFetch, LinearRequest, LinearSdk, parseLinearError, UserConnection } from "@linear/sdk";
import { DocumentNode, GraphQLClient, print } from "graphql";
import { CustomGraphqlClient } from "./graphql-client";

/\*_ Create a custom client configured with the Linear API base url and API key _/
const customGraphqlClient = new CustomGraphqlClient("https://api.linear.app/graphql", {
headers: { Authorization: apiKey },
});

/** Create the custom request function \*/
const customLinearRequest: LinearRequest = <Response, Variables>(
document: DocumentNode,
variables?: Variables
) => {
/** The request must take a GraphQL document and variables, then return a promise for the result _/
return customGraphqlClient.request<Data>(print(document), variables).catch(error => {
/\*\* Optionally catch and parse errors from the Linear API _/
throw parseLinearError(error);
});
};

/\*_ Extend the Linear SDK to provide a request function using the custom client _/
class CustomLinearClient extends LinearSdk {
public constructor() {
super(customLinearRequest);
}
}

/\*_ Create an instance of the custom client _/
const customLinearClient = new CustomLinearClient();

/\*_ Use the custom client as if it were the Linear Client _/
async function getUsers(): LinearFetch<UserConnection> {
const users = await customLinearClient.users();
return users;
}
Previous

###

Here is the Linear API GraphQL API
Query

###

Query
The Query type is a special type that defines the entry point of every GraphQL query. Otherwise, the Query type is the same as any other GraphQL object type, and its fields work exactly the same way.

Learn more about the Query type
Kind of type: Object
128
Fields
fields
DETAILS
ACTIONS
administrableTeams : TeamConnection!
All teams you the user can administrate. Administrable teams are teams whose settings the user can change, but to whose issues the user doesn't necessarily have access to.

filter TeamFilter
Filter returned teams.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

apiKeys : ApiKeyConnection!
All API keys for the user.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

applicationInfo : Application!
Get basic information for an application.

clientId String!
The client ID of the application.

applicationInfoByIds : [Application!]!
[INTERNAL] Get basic information for a list of applications.

ids [String!]!
The IDs of the applications.

applicationInfoWithMembershipsByIds : [WorkspaceAuthorizedApplication!]!
[INTERNAL] Get information for a list of applications with memberships

clientIds [String!]!
The client IDs to look up.

applicationWithAuthorization : UserAuthorizedApplication!
Get information for an application and whether a user has approved it for the given scopes.

redirectUri String
Redirect URI for the application.

actor String = "user"
Actor mode used for the authorization.

scope [String!]!
Scopes being requested by the application.

clientId String!
The client ID of the application.

archivedTeams : [Team!]!
[Internal] All archived teams of the organization.

attachment : Attachment!
One specific issue attachment. [Deprecated] 'url' can no longer be used as the 'id' parameter. Use 'attachmentsForUrl' instead

id String!
attachmentIssue : Issue!
Query an issue by its associated attachment, and its id.
@deprecated(reason: Will be removed in near future, please use `attachmentsForURL` to get attachments and their issues instead.)

id String!
id of the attachment for which you'll want to get the issue for. [Deprecated] url as the id parameter.

attachmentSources : AttachmentSourcesPayload!
[Internal] Get a list of all unique attachment sources in the workspace.

teamId String
(optional) if provided will only return attachment sources for the given team.

attachments : AttachmentConnection!
All issue attachments.

To get attachments for a given URL, use attachmentsForURL query.

filter AttachmentFilter
Filter returned attachments.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

attachmentsForURL : AttachmentConnection!
Returns issue attachments for a given url.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

url String!
The attachment URL.

auditEntries : AuditEntryConnection!
All audit log entries.

filter AuditEntryFilter
Filter returned audit entries.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

auditEntryTypes : [AuditEntryType!]!
List of audit entry types.

authenticationSessions : [AuthenticationSessionResponse!]!
User's active sessions.

authorizedApplications : [AuthorizedApplication!]!
[INTERNAL] Get all authorized applications for a user.

availableUsers : AuthResolverResponse!
Fetch users belonging to this user account.

comment : Comment!
A specific comment.

id String
The identifier of the comment to retrieve.

issueId String
[Deprecated] The issue for which to find the comment.

hash String
The hash of the comment to retrieve.

comments : CommentConnection!
All comments.

filter CommentFilter
Filter returned comments.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

customView : CustomView!
One specific custom view.

id String!
customViewDetailsSuggestion : CustomViewSuggestionPayload!
[INTERNAL] Suggests metadata for a view based on it's filters.

modelName String
filter JSONObject!
customViewHasSubscribers : CustomViewHasSubscribersPayload!
Whether a custom view has other subscribers than the current user in the organization.

id String!
The identifier of the custom view.

customViews : CustomViewConnection!
Custom views for the user.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

customer : Customer!
One specific customer.

id String!
customerNeed : CustomerNeed!
One specific customer need

id String!
customerNeeds : CustomerNeedConnection!
All customer needs.

filter CustomerNeedFilter
Filter returned customers needs.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

customerStatus : CustomerStatus!
One specific customer status.

id String!
customerStatuses : CustomerStatusConnection!
All customer statuses.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

customerTier : CustomerTier!
One specific customer tier.

id String!
customerTiers : CustomerTierConnection!
All customer tiers.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

customers : CustomerConnection!
All customers.

filter CustomerFilter
Filter returned customers.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

sorts [CustomerSortInput!]
Sort returned customers.

cycle : Cycle!
One specific cycle.

id String!
cycles : CycleConnection!
All cycles.

filter CycleFilter
Filter returned users.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

document : Document!
One specific document.

id String!
documentContentHistory : DocumentContentHistoryPayload!
A collection of document content history entries.

id String!
documents : DocumentConnection!
All documents in the workspace.

filter DocumentFilter
Filter returned documents.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

emoji : Emoji!
A specific emoji.

id String!
The identifier or the name of the emoji to retrieve.

emojis : EmojiConnection!
All custom emojis.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

entityExternalLink : EntityExternalLink!
One specific entity link.

id String!
externalUser : ExternalUser!
One specific external user.

id String!
The identifier of the external user to retrieve.

externalUsers : ExternalUserConnection!
All external users for the organization.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

favorite : Favorite!
One specific favorite.

id String!
favorites : FavoriteConnection!
The user's favorites.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

initiative : Initiative!
One specific initiative.

id String!
initiativeToProject : InitiativeToProject!
One specific initiativeToProject.

id String!
initiativeToProjects : InitiativeToProjectConnection!
returns a list of initiative to project entities.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

initiatives : InitiativeConnection!
All initiatives in the workspace.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

integration : Integration!
One specific integration.

id String!
integrationHasScopes : IntegrationHasScopesPayload!
Checks if the integration has all required scopes.

scopes [String!]!
Required scopes.

integrationId String!
The integration ID.

integrationTemplate : IntegrationTemplate!
One specific integrationTemplate.

id String!
integrationTemplates : IntegrationTemplateConnection!
Template and integration connections.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

integrations : IntegrationConnection!
All integrations.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

integrationsSettings : IntegrationsSettings!
One specific set of settings.

id String!
issue : Issue!
One specific issue.

id String!
issueFigmaFileKeySearch : IssueConnection!
Find issues that are related to a given Figma file key.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

fileKey String!
The Figma file key.

issueFilterSuggestion : IssueFilterSuggestionPayload!
Suggests filters for an issue view based on a text prompt.

projectId String
The ID of the project if filtering a project view

prompt String!
issueImportCheckCSV : IssueImportCheckPayload!
Checks a CSV file validity against a specific import service.

csvUrl String!
CSV storage url.

service String!
The service the CSV containing data from.

issueImportCheckSync : IssueImportSyncCheckPayload!
Checks whether it will be possible to setup sync for this project or repository at the end of import

issueImportId String!
The ID of the issue import for which to check sync eligibility

issueImportJqlCheck : IssueImportJqlCheckPayload!
Checks whether a custom JQL query is valid and can be used to filter issues of a Jira import

jiraHostname String!
Jira installation or cloud hostname.

jiraToken String!
Jira personal access token to access Jira REST API.

jiraEmail String!
Jira user account email.

jiraProject String!
Jira project key to use as the base filter of the query.

jql String!
The JQL query to validate.

issueLabel : IssueLabel!
One specific label.

id String!
issueLabels : IssueLabelConnection!
All issue labels.

filter IssueLabelFilter
Filter returned issue labels.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

issuePriorityValues : [IssuePriorityValue!]!
Issue priority values and corresponding labels.

issueRelation : IssueRelation!
One specific issue relation.

id String!
issueRelations : IssueRelationConnection!
All issue relationships.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

issueSearch : IssueConnection!
[DEPRECATED] Search issues. This endpoint is deprecated and will be removed in the future – use searchIssues instead.

filter IssueFilter
Filter returned issues.

query String
[Deprecated] Search string to look for.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

issueTitleSuggestionFromCustomerRequest : IssueTitleSuggestionFromCustomerRequestPayload!
Suggests issue title based on a customer request.

request String!
issueVcsBranchSearch : Issue
Find issue based on the VCS branch name.

branchName String!
The VCS branch name to search for.

issues : IssueConnection!
All issues.

filter IssueFilter
Filter returned issues.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

sort [IssueSortInput!]
[INTERNAL] Sort returned issues.

notification : Notification!
One specific notification.

id String!
notificationSubscription : NotificationSubscription!
One specific notification subscription.

id String!
notificationSubscriptions : NotificationSubscriptionConnection!
The user's notification subscriptions.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

notifications : NotificationConnection!
All notifications.

filter NotificationFilter
Filters returned notifications.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

notificationsUnreadCount : Int!
[Internal] A number of unread notifications.

organization : Organization!
The user's organization.

organizationDomainClaimRequest : OrganizationDomainClaimPayload!
[INTERNAL] Checks whether the domain can be claimed.

id String!
The ID of the organization domain to claim.

organizationExists : OrganizationExistsPayload!
Does the organization exist.

urlKey String!
organizationInvite : OrganizationInvite!
One specific organization invite.

id String!
organizationInviteDetails : OrganizationInviteDetailsPayload!
One specific organization invite.

id String!
organizationInvites : OrganizationInviteConnection!
All invites for the organization.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

organizationMeta : OrganizationMeta
[INTERNAL] Get organization metadata by urlKey or organization id.

urlKey String!
project : Project!
One specific project.

id String!
projectFilterSuggestion : ProjectFilterSuggestionPayload!
Suggests filters for a project view based on a text prompt.

prompt String!
projectLink : ProjectLink!
One specific project link.

id String!
projectLinks : ProjectLinkConnection!
All links for the project.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

projectMilestone : ProjectMilestone!
One specific project milestone.

id String!
projectMilestones : ProjectMilestoneConnection!
All milestones for the project.

filter ProjectMilestoneFilter
Filter returned project milestones.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

projectRelation : ProjectRelation!
One specific project relation.

id String!
projectRelations : ProjectRelationConnection!
All project relationships.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

projectStatus : ProjectStatus!
One specific project status.

id String!
projectStatusProjectCount : ProjectStatusCountPayload!
[INTERNAL] Count of projects using this project status across the organization.

id String!
The identifier of the project status to find the project count for.

projectStatuses : ProjectStatusConnection!
All project statuses.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

projectUpdate : ProjectUpdate!
A specific project update.

id String!
The identifier of the project update to retrieve.

projectUpdateInteraction : ProjectUpdateInteraction!
A specific interaction on a project update.
@deprecated(reason: ProjectUpdateInteraction is not used and will be deleted.)

id String!
The identifier of the project update interaction to retrieve.

projectUpdateInteractions : ProjectUpdateInteractionConnection!
All interactions on project updates.
@deprecated(reason: ProjectUpdateInteraction is not used and will be deleted.)

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

projectUpdates : ProjectUpdateConnection!
All project updates.

filter ProjectUpdateFilter
Filter returned project updates.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

projects : ProjectConnection!
All projects.

filter ProjectFilter
Filter returned projects.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

pushSubscriptionTest : PushSubscriptionTestPayload!
Sends a test push message.

targetMobile Boolean
Whether to send to mobile devices.

sendStrategy SendStrategy = "push"
The send strategy to use.

rateLimitStatus : RateLimitPayload!
The status of the rate limiter.

roadmap : Roadmap!
One specific roadmap.

id String!
roadmapToProject : RoadmapToProject!
One specific roadmapToProject.

id String!
roadmapToProjects : RoadmapToProjectConnection!
Custom views for the user.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

roadmaps : RoadmapConnection!
All roadmaps in the workspace.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

searchDocuments : DocumentSearchPayload!
Search documents.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

term String!
Search string to look for.

snippetSize Float
Size of search snippet to return (default: 100)

includeComments Boolean
Should associated comments be searched (default: false).

teamId String
UUID of a team to use as a boost.

searchIssues : IssueSearchPayload!
Search issues.

filter IssueFilter
Filter returned issues.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

term String!
Search string to look for.

snippetSize Float
Size of search snippet to return (default: 100)

includeComments Boolean
Should associated comments be searched (default: false).

teamId String
UUID of a team to use as a boost.

searchProjects : ProjectSearchPayload!
Search projects.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

term String!
Search string to look for.

snippetSize Float
Size of search snippet to return (default: 100)

includeComments Boolean
Should associated comments be searched (default: false).

teamId String
UUID of a team to use as a boost.

ssoUrlFromEmail : SsoUrlFromEmailResponse!
Fetch SSO login URL for the email provided.

isDesktop Boolean
Whether the client is the desktop app.

email String!
Email to query the SSO login URL by.

summarizeProjectUpdates : SummaryPayload!
[Internal] AI summary of the latest project updates for the given projects

ids [String!]!
The identifiers of the projects to summarize.

team : Team!
One specific team.

id String!
teamMembership : TeamMembership!
One specific team membership.

id String!
teamMemberships : TeamMembershipConnection!
All team memberships.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

teams : TeamConnection!
All teams whose issues can be accessed by the user. This might be different from administrableTeams, which also includes teams whose settings can be changed by the user.

filter TeamFilter
Filter returned teams.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

template : Template!
A specific template.

id String!
The identifier of the template to retrieve.

templates : [Template!]!
All templates from all users.

templatesForIntegration : [Template!]!
Returns all templates that are associated with the integration type.

integrationType String!
The type of integration for which to return associated templates.

timeSchedule : TimeSchedule!
A specific time schedule.

id String!
The identifier of the time schedule to retrieve.

timeSchedules : TimeScheduleConnection!
All time schedules.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

triageResponsibilities : TriageResponsibilityConnection!
All triage responsibilities.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

triageResponsibility : TriageResponsibility!
A specific triage responsibility.

id String!
The identifier of the triage responsibility to retrieve.

user : User!
One specific user.

id String!
The identifier of the user to retrieve. To retrieve the authenticated user, use viewer query.

userSettings : UserSettings!
The user's settings.

users : UserConnection!
All users for the organization.

filter UserFilter
Filter returned users.

includeDisabled Boolean
Should query return disabled/suspended users (default: false).

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

verifyGitHubEnterpriseServerInstallation : GitHubEnterpriseServerInstallVerificationPayload!
Verify that we received the correct response from the GitHub Enterprise Server.

viewer : User!
The currently authenticated user.

webhook : Webhook!
A specific webhook.

id String!
The identifier of the webhook to retrieve.

webhooks : WebhookConnection!
All webhooks.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

workflowState : WorkflowState!
One specific state.

id String!
workflowStates : WorkflowStateConnection!
All issue workflow states.

filter WorkflowStateFilter
Filter returned workflow states.

before String
A cursor to be used with last for backward pagination.

after String
A cursor to be used with first for forward pagination

first Int
The number of items to forward paginate (used with after). Defaults to 50.

last Int
The number of items to backward paginate (used with before). Defaults to 50.

includeArchived Boolean
Should archived resources be included (default: false)

orderBy PaginationOrderBy
By which field should the pagination order by. Available options are createdAt (default) and updatedAt.

workspaceAuthorizedApplications : [WorkspaceAuthorizedApplication!]!
[INTERNAL] Get non-internal authorized applications (with limited fields) for a workspace

###

Mutation

###

Mutation
The Mutation type is a special type that is used to modify server-side data. Just like in queries, if the mutation field returns an object type, you can ask for nested fields. It can also contain multiple fields. However, unlike queries, mutation fields run in series, one after the other.

Learn more about the Mutation type
Kind of type: Object
280
Fields
fields
DETAILS
ACTIONS
airbyteIntegrationConnect : IntegrationPayload!
Creates an integration api key for Airbyte to connect with Linear.

input AirbyteConfigurationInput!
Airbyte integration settings.

apiKeyCreate : ApiKeyPayload!
[INTERNAL] Creates a new API key.

input ApiKeyCreateInput!
The api key object to create.

apiKeyDelete : DeletePayload!
[INTERNAL] Deletes an API key.

id String!
The identifier of the API key to delete.

attachmentArchive : AttachmentArchivePayload!
[DEPRECATED] Archives an issue attachment.
@deprecated(reason: This mutation is deprecated, please use `attachmentDelete` instead)

id String!
The identifier of the attachment to archive.

attachmentCreate : AttachmentPayload!
Creates a new attachment, or updates existing if the same url and issueId is used.

input AttachmentCreateInput!
The attachment object to create.

attachmentDelete : DeletePayload!
Deletes an issue attachment.

id String!
The identifier of the attachment to delete.

attachmentLinkDiscord : AttachmentPayload!
Link an existing Discord message to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

issueId String!
The issue for which to link the Discord message.

id String
Optional attachment ID that may be provided through the API.

channelId String!
The Discord channel ID for the message to link.

messageId String!
The Discord message ID for the message to link.

url String!
The Discord message URL for the message to link.

attachmentLinkFront : FrontAttachmentPayload!
Link an existing Front conversation to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

conversationId String!
The Front conversation ID to link.

issueId String!
The issue for which to link the Front conversation.

id String
Optional attachment ID that may be provided through the API.

attachmentLinkGitHubIssue : AttachmentPayload!
Link a GitHub issue to a Linear issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

issueId String!
The Linear issue for which to link the GitHub issue.

id String
Optional attachment ID that may be provided through the API.

url String!
The URL of the GitHub issue to link.

attachmentLinkGitHubPR : AttachmentPayload!
Link a GitHub pull request to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

issueId String!
The issue for which to link the GitHub pull request.

id String
Optional attachment ID that may be provided through the API.

url String!
The URL of the GitHub pull request to link.

owner String
The owner of the GitHub repository.

repo String
The name of the GitHub repository.

number Float
The GitHub pull request number to link.

linkKind GitLinkKind
[Internal] The kind of link between the issue and the pull request.

attachmentLinkGitLabMR : AttachmentPayload!
Link an existing GitLab MR to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

issueId String!
The issue for which to link the GitLab merge request.

id String
Optional attachment ID that may be provided through the API.

url String!
The URL of the GitLab merge request to link.

projectPathWithNamespace String!
The path name to the project including any (sub)groups. E.g. linear/main/client.

number Float!
The GitLab merge request number to link.

attachmentLinkIntercom : AttachmentPayload!
Link an existing Intercom conversation to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

conversationId String!
The Intercom conversation ID to link.

id String
Optional attachment ID that may be provided through the API.

issueId String!
The issue for which to link the Intercom conversation.

attachmentLinkJiraIssue : AttachmentPayload!
Link an existing Jira issue to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

issueId String!
The issue for which to link the Jira issue.

jiraIssueId String!
The Jira issue key or ID to link.

id String
Optional attachment ID that may be provided through the API.

attachmentLinkSlack : AttachmentPayload!
Link an existing Slack message to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

channel String
[DEPRECATED] The Slack channel ID for the message to link.

ts String
[DEPRECATED] Unique identifier of either a thread's parent message or a message in the thread.

latest String
[DEPRECATED] The latest timestamp for the Slack message.

issueId String!
The issue to which to link the Slack message.

url String!
The Slack message URL for the message to link.

id String
Optional attachment ID that may be provided through the API.

syncToCommentThread Boolean
Whether to begin syncing the message's Slack thread with a comment thread on the issue.

attachmentLinkURL : AttachmentPayload!
Link any url to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

url String!
The url to link.

issueId String!
The issue for which to link the url.

id String
The id for the attachment.

attachmentLinkZendesk : AttachmentPayload!
Link an existing Zendesk ticket to an issue.

createAsUser String
Create attachment as a user with the provided name. This option is only available to OAuth applications creating attachments in actor=application mode.

displayIconUrl String
Provide an external user avatar URL. Can only be used in conjunction with the createAsUser options. This option is only available to OAuth applications creating comments in actor=application mode.

title String
The title to use for the attachment.

ticketId String!
The Zendesk ticket ID to link.

issueId String!
The issue for which to link the Zendesk ticket.

id String
Optional attachment ID that may be provided through the API.

url String
The URL of the Zendesk ticket to link.

attachmentSyncToSlack : AttachmentPayload!
Begin syncing the thread for an existing Slack message attachment with a comment thread on its issue.

id String!
The ID of the Slack attachment to begin syncing.

attachmentUpdate : AttachmentPayload!
Updates an existing issue attachment.

input AttachmentUpdateInput!
A partial attachment object to update the attachment with.

id String!
The identifier of the attachment to update.

commentCreate : CommentPayload!
Creates a new comment.

input CommentCreateInput!
The comment object to create.

commentDelete : DeletePayload!
Deletes a comment.

id String!
The identifier of the comment to delete.

commentResolve : CommentPayload!
Resolves a comment.

resolvingCommentId String
id String!
The identifier of the comment to update.

commentUnresolve : CommentPayload!
Unresolves a comment.

id String!
The identifier of the comment to update.

commentUpdate : CommentPayload!
Updates a comment.

input CommentUpdateInput!
A partial comment object to update the comment with.

id String!
The identifier of the comment to update.

contactCreate : ContactPayload!
Saves user message.

input ContactCreateInput!
The contact entry to create.

contactSalesCreate : ContactPayload!
[INTERNAL] Saves sales pricing inquiry to Front.

input ContactSalesCreateInput!
The contact entry to create.

createCsvExportReport : CreateCsvExportReportPayload!
Create CSV export report for the organization.

includePrivateTeamIds [String!]
createOrganizationFromOnboarding : CreateOrJoinOrganizationResponse!
Creates an organization from onboarding.

survey OnboardingCustomerSurvey
Onboarding survey.

input CreateOrganizationInput!
Organization details for the new organization.

createProjectUpdateReminder : ProjectUpdateReminderPayload!
Create a notification to remind a user about a project update.

userId String
The user identifier to whom the notification will be sent. By default, it is set to the project lead.

projectId String!
The identifier of the project to remind about.

customViewCreate : CustomViewPayload!
Creates a new custom view.

input CustomViewCreateInput!
The properties of the custom view to create.

customViewDelete : DeletePayload!
Deletes a custom view.

id String!
The identifier of the custom view to delete.

customViewUpdate : CustomViewPayload!
Updates a custom view.

input CustomViewUpdateInput!
The properties of the custom view to update.

id String!
The identifier of the custom view to update.

customerCreate : CustomerPayload!
Creates a new customer.

input CustomerCreateInput!
The customer to create.

customerDelete : DeletePayload!
Deletes a customer.

id String!
The identifier of the customer to delete.

customerMerge : CustomerPayload!
Merges two customers.

sourceCustomerId String!
The ID of the customer to merge. The needs of this customer will be transferred before it gets deleted.

targetCustomerId String!
The ID of the target customer to merge into. The needs of this customer will be retained

customerNeedArchive : CustomerNeedArchivePayload!
Archives a customer need.

id String!
The identifier of the customer need to archive.

customerNeedCreate : CustomerNeedPayload!
Creates a new customer need.

input CustomerNeedCreateInput!
The customer need to create.

customerNeedCreateFromAttachment : CustomerNeedPayload!
Creates a new customer need out of an attachment

input CustomerNeedCreateFromAttachmentInput!
The customer need to create.

customerNeedDelete : DeletePayload!
Deletes a customer need.

id String!
The identifier of the customer need to delete.

customerNeedUnarchive : CustomerNeedArchivePayload!
Unarchives a customer need.

id String!
The identifier of the customer need to unarchive.

customerNeedUpdate : CustomerNeedPayload!
Updates a customer need

input CustomerNeedUpdateInput!
The properties of the customer need to update.

id String!
The identifier of the customer need to update.

customerTierCreate : CustomerTierPayload!
Creates a new customer tier.

input CustomerTierCreateInput!
The CustomerTier object to create.

customerTierDelete : DeletePayload!
Deletes a customer tier.

id String!
The identifier of the customer tier to delete.

customerTierUpdate : CustomerTierPayload!
Updates a customer tier.

input CustomerTierUpdateInput!
A partial CustomerTier object to update the CustomerTier with.

id String!
The identifier of the customer tier to update.

customerUpdate : CustomerPayload!
Updates a customer

input CustomerUpdateInput!
The properties of the customer to update.

id String!
The identifier of the customer to update.

customerUpsert : CustomerPayload!
Upserts a customer, creating it if it doesn't exists, updating it otherwise. Matches against an existing customer with id or externalId

input CustomerUpsertInput!
The customer to create.

cycleArchive : CycleArchivePayload!
Archives a cycle.

id String!
The identifier of the cycle to archive.

cycleCreate : CyclePayload!
Creates a new cycle.

input CycleCreateInput!
The cycle object to create.

cycleShiftAll : CyclePayload!
Shifts all cycles starts and ends by a certain number of days, starting from the provided cycle onwards.

input CycleShiftAllInput!
A partial cycle object to update the cycle with.

cycleStartUpcomingCycleToday : CyclePayload!
Shifts all cycles starts and ends by a certain number of days, starting from the provided cycle onwards.

id String!
The identifier of the cycle to start as of midnight today. Must be the upcoming cycle.

cycleUpdate : CyclePayload!
Updates a cycle.

input CycleUpdateInput!
A partial cycle object to update the cycle with.

id String!
The identifier of the cycle to update.

documentCreate : DocumentPayload!
Creates a new document.

input DocumentCreateInput!
The document to create.

documentDelete : DocumentArchivePayload!
Deletes (trashes) a document.

id String!
The identifier of the document to delete.

documentUnarchive : DocumentArchivePayload!
Restores a document.

id String!
The identifier of the document to restore.

documentUpdate : DocumentPayload!
Updates a document.

input DocumentUpdateInput!
A partial document object to update the document with.

id String!
The identifier of the document to update. Also the identifier from the URL is accepted.

emailIntakeAddressCreate : EmailIntakeAddressPayload!
Creates a new email intake address.

input EmailIntakeAddressCreateInput!
The email intake address object to create.

emailIntakeAddressDelete : DeletePayload!
Deletes an email intake address object.

id String!
The identifier of the email intake address to delete.

emailIntakeAddressRotate : EmailIntakeAddressPayload!
Rotates an existing email intake address.

id String!
The identifier of the email intake address.

emailIntakeAddressUpdate : EmailIntakeAddressPayload!
Updates an existing email intake address.

input EmailIntakeAddressUpdateInput!
The properties of the email intake address to update.

id String!
The identifier of the email intake address.

emailTokenUserAccountAuth : AuthResolverResponse!
Authenticates a user account via email and authentication token.

input TokenUserAccountAuthInput!
The data used for token authentication.

emailUnsubscribe : EmailUnsubscribePayload!
Unsubscribes the user from one type of email.

input EmailUnsubscribeInput!
Unsubscription details.

emailUserAccountAuthChallenge : EmailUserAccountAuthChallengeResponse!
Finds or creates a new user account by email and sends an email with token.

input EmailUserAccountAuthChallengeInput!
The data used for email authentication.

emojiCreate : EmojiPayload!
Creates a custom emoji.

input EmojiCreateInput!
The emoji object to create.

emojiDelete : DeletePayload!
Deletes an emoji.

id String!
The identifier of the emoji to delete.

entityExternalLinkCreate : EntityExternalLinkPayload!
Creates a new entity link.

input EntityExternalLinkCreateInput!
The entity link object to create.

entityExternalLinkDelete : DeletePayload!
Deletes an entity link.

id String!
The identifier of the entity link to delete.

entityExternalLinkUpdate : EntityExternalLinkPayload!
Updates an entity link.

input EntityExternalLinkUpdateInput!
The entity link object to update.

id String!
The identifier of the entity link to update.

favoriteCreate : FavoritePayload!
Creates a new favorite (project, cycle etc).

input FavoriteCreateInput!
The favorite object to create.

favoriteDelete : DeletePayload!
Deletes a favorite reference.

id String!
The identifier of the favorite reference to delete.

favoriteUpdate : FavoritePayload!
Updates a favorite.

input FavoriteUpdateInput!
A partial favorite object to update the favorite with.

id String!
The identifier of the favorite to update.

fileUpload : UploadPayload!
XHR request payload to upload an images, video and other attachments directly to Linear's cloud storage.

metaData JSON
Optional metadata.

makePublic Boolean
Should the file be made publicly accessible (default: false).

size Int!
File size of the uploaded file.

contentType String!
MIME type of the uploaded file.

filename String!
Filename of the uploaded file.

gitAutomationStateCreate : GitAutomationStatePayload!
Creates a new automation state.

input GitAutomationStateCreateInput!
The automation state to create.

gitAutomationStateDelete : DeletePayload!
Archives an automation state.

id String!
The identifier of the automation state to archive.

gitAutomationStateUpdate : GitAutomationStatePayload!
Updates an existing state.

input GitAutomationStateUpdateInput!
The state to update.

id String!
The identifier of the state to update.

gitAutomationTargetBranchCreate : GitAutomationTargetBranchPayload!
Creates a Git target branch automation.

input GitAutomationTargetBranchCreateInput!
The Git target branch automation to create.

gitAutomationTargetBranchDelete : DeletePayload!
Archives a Git target branch automation.

id String!
The identifier of the Git target branch automation to archive.

gitAutomationTargetBranchUpdate : GitAutomationTargetBranchPayload!
Updates an existing Git target branch automation.

input GitAutomationTargetBranchUpdateInput!
The updates.

id String!
The identifier of the Git target branch automation to update.

googleUserAccountAuth : AuthResolverResponse!
Authenticate user account through Google OAuth. This is the 2nd step of OAuth flow.

input GoogleUserAccountAuthInput!
The data used for Google authentication.

imageUploadFromUrl : ImageUploadFromUrlPayload!
Upload an image from an URL to Linear.

url String!
URL of the file to be uploaded to Linear.

importFileUpload : UploadPayload!
XHR request payload to upload a file for import, directly to Linear's cloud storage.

metaData JSON
Optional metadata.

size Int!
File size of the uploaded file.

contentType String!
MIME type of the uploaded file.

filename String!
Filename of the uploaded file.

initiativeArchive : InitiativeArchivePayload!
Archives a initiative.

id String!
The identifier of the initiative to archive.

initiativeCreate : InitiativePayload!
Creates a new initiative.

input InitiativeCreateInput!
The properties of the initiative to create.

initiativeDelete : DeletePayload!
Deletes (trashes) an initiative.

id String!
The identifier of the initiative to delete.

initiativeToProjectCreate : InitiativeToProjectPayload!
Creates a new initiativeToProject join.

input InitiativeToProjectCreateInput!
The properties of the initiativeToProject to create.

initiativeToProjectDelete : DeletePayload!
Deletes a initiativeToProject.

id String!
The identifier of the initiativeToProject to delete.

initiativeToProjectUpdate : InitiativeToProjectPayload!
Updates a initiativeToProject.

input InitiativeToProjectUpdateInput!
The properties of the initiativeToProject to update.

id String!
The identifier of the initiativeToProject to update.

initiativeUnarchive : InitiativeArchivePayload!
Unarchives a initiative.

id String!
The identifier of the initiative to unarchive.

initiativeUpdate : InitiativePayload!
Updates a initiative.

input InitiativeUpdateInput!
The properties of the initiative to update.

id String!
The identifier of the initiative to update.

integrationArchive : DeletePayload!
Archives an integration.

id String!
The identifier of the integration to archive.

integrationAsksConnectChannel : AsksChannelConnectPayload!
Connect a Slack channel to Asks.

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

integrationDelete : DeletePayload!
Deletes an integration.

id String!
The identifier of the integration to delete.

integrationDiscord : IntegrationPayload!
Integrates the organization with Discord.

redirectUri String!
The Discord OAuth redirect URI.

code String!
The Discord OAuth code.

integrationFigma : IntegrationPayload!
Integrates the organization with Figma.

redirectUri String!
The Figma OAuth redirect URI.

code String!
The Figma OAuth code.

integrationFront : IntegrationPayload!
Integrates the organization with Front.

redirectUri String!
The Front OAuth redirect URI.

code String!
The Front OAuth code.

integrationGitHubEnterpriseServerConnect : GitHubEnterpriseServerPayload!
Connects the organization with a GitHub Enterprise Server.

organizationName String
The name of GitHub organization.

githubUrl String!
The base URL of the GitHub Enterprise Server installation.

integrationGitHubPersonal : IntegrationPayload!
Connect your GitHub account to Linear.

code String!
The GitHub OAuth code.

integrationGithubCommitCreate : GitHubCommitIntegrationPayload!
Generates a webhook for the GitHub commit integration.

integrationGithubConnect : IntegrationPayload!
Connects the organization with the GitHub App.

code String!
The GitHub grant code that's exchanged for OAuth tokens.

installationId String!
The GitHub data to connect with.

integrationGithubImportConnect : IntegrationPayload!
Connects the organization with the GitHub Import App.

code String!
The GitHub grant code that's exchanged for OAuth tokens.

installationId String!
The GitHub data to connect with.

integrationGithubImportRefresh : IntegrationPayload!
Refreshes the data for a GitHub import integration.

id String!
The id of the integration to update.

integrationGitlabConnect : GitLabIntegrationCreatePayload!
Connects the organization with a GitLab Access Token.

gitlabUrl String!
The URL of the GitLab installation.

accessToken String!
The GitLab Access Token to connect with.

integrationGoogleCalendarPersonalConnect : IntegrationPayload!
[Internal] Connects the Google Calendar to the user to this Linear account via OAuth2.

code String!
[Internal] The Google OAuth code.

integrationGoogleSheets : IntegrationPayload!
Integrates the organization with Google Sheets.

code String!
The Google OAuth code.

integrationIntercom : IntegrationPayload!
Integrates the organization with Intercom.

domainUrl String
The Intercom domain URL to use for the integration. Defaults to app.intercom.com if not provided.

redirectUri String!
The Intercom OAuth redirect URI.

code String!
The Intercom OAuth code.

integrationIntercomDelete : IntegrationPayload!
Disconnects the organization from Intercom.

integrationIntercomSettingsUpdate : IntegrationPayload!
[DEPRECATED] Updates settings on the Intercom integration.
@deprecated(reason: This mutation is deprecated, please use `integrationSettingsUpdate` instead)

input IntercomSettingsInput!
A partial Intercom integration settings object to update the integration settings with.

integrationJiraPersonal : IntegrationPayload!
Connect your Jira account to Linear.

code String
The Jira OAuth code, when connecting using OAuth.

accessToken String
The Jira personal access token, when connecting using a PAT.

integrationJiraUpdate : IntegrationPayload!
[INTERNAL] Updates a Jira Integration.

input JiraUpdateInput!
Jira integration update input.

integrationLaunchDarklyConnect : IntegrationPayload!
[INTERNAL] Integrates the organization with LaunchDarkly.

code String!
The LaunchDarkly OAuth code.

projectKey String!
The LaunchDarkly project key.

environment String!
The LaunchDarkly environment.

integrationLaunchDarklyPersonalConnect : IntegrationPayload!
[INTERNAL] Integrates your personal account with LaunchDarkly.

code String!
The LaunchDarkly OAuth code.

integrationLoom : IntegrationPayload!
Enables Loom integration for the organization.
@deprecated(reason: Not available.)

integrationOpsgenieConnect : IntegrationPayload!
[INTERNAL] Integrates the organization with Opsgenie.

apiKey String!
The Opsgenie API key.

integrationOpsgenieRefreshScheduleMappings : IntegrationPayload!
[INTERNAL] Refresh Opsgenie schedule mappings.

integrationPagerDutyConnect : IntegrationPayload!
[INTERNAL] Integrates the organization with PagerDuty.

code String!
The PagerDuty OAuth code.

redirectUri String!
The PagerDuty OAuth redirect URI.

integrationPagerDutyRefreshScheduleMappings : IntegrationPayload!
[INTERNAL] Refresh PagerDuty schedule mappings.

integrationRequest : IntegrationRequestPayload!
Requests a currently unavailable integration.

input IntegrationRequestInput!
Integration request details.

integrationSentryConnect : IntegrationPayload!
Integrates the organization with Sentry.

organizationSlug String!
The slug of the Sentry organization being connected.

code String!
The Sentry grant code that's exchanged for OAuth tokens.

installationId String!
The Sentry installationId to connect with.

integrationSettingsUpdate : IntegrationPayload!
[INTERNAL] Updates the integration.

input IntegrationSettingsInput!
An integration settings object.

id String!
The identifier of the integration to update.

integrationSlack : IntegrationPayload!
Integrates the organization with Slack.

shouldUseV2Auth Boolean
[DEPRECATED] Whether or not v2 of Slack OAuth should be used. No longer used.

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

integrationSlackAsks : IntegrationPayload!
Integrates the organization with the Slack Asks app.

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

integrationSlackCustomViewNotifications : SlackChannelConnectPayload!
Slack integration for custom view notifications.

redirectUri String!
The Slack OAuth redirect URI.

customViewId String!
Integration's associated custom view.

code String!
The Slack OAuth code.

integrationSlackCustomerChannelLink : SuccessPayload!
Integrates a Slack Asks channel with a Customer.

redirectUri String!
The Slack OAuth redirect URI.

customerId String!
The customer to link the Slack channel with

code String!
The Slack OAuth code.

integrationSlackImportEmojis : IntegrationPayload!
Imports custom emojis from your Slack workspace.

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

integrationSlackInitiativePost : SlackChannelConnectPayload!
[Internal] Slack integration for initiative notifications.

redirectUri String!
The Slack OAuth redirect URI.

initiativeId String!
Integration's associated initiative.

code String!
The Slack OAuth code.

integrationSlackOrgInitiativeUpdatesPost : SlackChannelConnectPayload!
[Internal] Slack integration for organization level initiative update notifications.

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

integrationSlackOrgProjectUpdatesPost : SlackChannelConnectPayload!
Slack integration for organization level project update notifications.

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

integrationSlackPersonal : IntegrationPayload!
Integrates your personal notifications with Slack.

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

integrationSlackPost : SlackChannelConnectPayload!
Slack integration for team notifications.

shouldUseV2Auth Boolean
[DEPRECATED] Whether or not v2 of Slack OAuth should be used. No longer used.

redirectUri String!
The Slack OAuth redirect URI.

teamId String!
Integration's associated team.

code String!
The Slack OAuth code.

integrationSlackProjectPost : SlackChannelConnectPayload!
Slack integration for project notifications.

service String!
The service to enable once connected, either 'notifications' or 'updates'.

redirectUri String!
The Slack OAuth redirect URI.

projectId String!
Integration's associated project.

code String!
The Slack OAuth code.

integrationTemplateCreate : IntegrationTemplatePayload!
Creates a new integrationTemplate join.

input IntegrationTemplateCreateInput!
The properties of the integrationTemplate to create.

integrationTemplateDelete : DeletePayload!
Deletes a integrationTemplate.

id String!
The identifier of the integrationTemplate to delete.

integrationZendesk : IntegrationPayload!
Integrates the organization with Zendesk.

subdomain String!
The Zendesk installation subdomain.

code String!
The Zendesk OAuth code.

scope String!
The Zendesk OAuth scopes.

redirectUri String!
The Zendesk OAuth redirect URI.

integrationsSettingsCreate : IntegrationsSettingsPayload!
Creates new settings for one or more integrations.

input IntegrationsSettingsCreateInput!
The settings to create.

integrationsSettingsUpdate : IntegrationsSettingsPayload!
Updates settings related to integrations for a project or a team.

input IntegrationsSettingsUpdateInput!
A settings object to update the settings with.

id String!
The identifier of the settings to update.

issueAddLabel : IssuePayload!
Adds a label to an issue.

labelId String!
The identifier of the label to add.

id String!
The identifier of the issue to add the label to.

issueArchive : IssueArchivePayload!
Archives an issue.

trash Boolean
Whether to trash the issue.

id String!
The identifier of the issue to archive.

issueBatchCreate : IssueBatchPayload!
Creates a list of issues in one transaction.

input IssueBatchCreateInput!
A list of issue objects to create.

issueBatchUpdate : IssueBatchPayload!
Updates multiple issues at once.

input IssueUpdateInput!
A partial issue object to update the issues with.

ids [UUID!]!
The id's of the issues to update. Can't be more than 50 at a time.

issueCreate : IssuePayload!
Creates a new issue.

input IssueCreateInput!
The issue object to create.

issueDelete : IssueArchivePayload!
Deletes (trashes) an issue.

permanentlyDelete Boolean
Whether to permanently delete the issue and skip the grace period of 30 days. Available only to admins!

id String!
The identifier of the issue to delete.

issueDescriptionUpdateFromFront : IssuePayload!
[INTERNAL] Updates an issue description from the Front app to handle Front attachments correctly.

description String!
Description to update the issue with.

id String!
The identifier of the issue to update.

issueImportCreateAsana : IssueImportPayload!
Kicks off an Asana import job.

organizationId String
ID of the organization into which to import data.

teamId String
ID of the team into which to import data.

teamName String
Name of new team. When teamId is not set.

asanaToken String!
Asana token to fetch information from the Asana API.

asanaTeamName String!
Asana team name to choose which issues we should import.

instantProcess Boolean
Whether to instantly process the import with the default configuration mapping.

includeClosedIssues Boolean
Whether or not we should collect the data for closed issues.

id String
ID of issue import. If not provided it will be generated.

issueImportCreateCSVJira : IssueImportPayload!
Kicks off a Jira import job from a CSV.

organizationId String
ID of the organization into which to import data.

teamId String
ID of the team into which to import data. Empty to create new team.

teamName String
Name of new team. When teamId is not set.

csvUrl String!
URL for the CSV.

jiraHostname String
Jira installation or cloud hostname.

jiraToken String
Jira personal access token to access Jira REST API.

jiraEmail String
Jira user account email.

issueImportCreateClubhouse : IssueImportPayload!
Kicks off a Shortcut (formerly Clubhouse) import job.

organizationId String
ID of the organization into which to import data.

teamId String
ID of the team into which to import data.

teamName String
Name of new team. When teamId is not set.

clubhouseToken String!
Shortcut (formerly Clubhouse) token to fetch information from the Clubhouse API.

clubhouseGroupName String!
Shortcut (formerly Clubhouse) group name to choose which issues we should import.

instantProcess Boolean
Whether to instantly process the import with the default configuration mapping.

includeClosedIssues Boolean
Whether or not we should collect the data for closed issues.

id String
ID of issue import. If not provided it will be generated.

issueImportCreateGithub : IssueImportPayload!
Kicks off a GitHub import job.

organizationId String
ID of the organization into which to import data.

teamId String
ID of the team into which to import data.

teamName String
Name of new team. When teamId is not set.

githubRepoIds [Int!]
IDs of the Github repositories from which we will import data.

githubLabels [String!]
Labels to use to filter the import data. Only issues matching any of these filters will be imported.

integrationId String
[DEPRECATED] ID of the Github import integration to use to access issues.

githubShouldImportOrgProjects Boolean
Whether or not we should import GitHub organization level projects.

instantProcess Boolean
Whether to instantly process the import with the default configuration mapping.

includeClosedIssues Boolean
Whether or not we should collect the data for closed issues.

issueImportCreateJira : IssueImportPayload!
Kicks off a Jira import job.

organizationId String
ID of the organization into which to import data.

teamId String
ID of the team into which to import data. Empty to create new team.

teamName String
Name of new team. When teamId is not set.

jiraToken String!
Jira personal access token to access Jira REST API.

jiraProject String!
Jira project key from which we will import data.

jiraEmail String!
Jira user account email.

jiraHostname String!
Jira installation or cloud hostname.

jql String
A custom JQL query to filter issues being imported

instantProcess Boolean
Whether to instantly process the import with the default configuration mapping.

includeClosedIssues Boolean
Whether or not we should collect the data for closed issues.

id String
ID of issue import. If not provided it will be generated.

issueImportCreateLinearV2 : IssueImportPayload!
[INTERNAL] Kicks off a Linear to Linear import job.

linearSourceOrganizationId String!
The source organization to import from.

id String
ID of issue import. If not provided it will be generated.

issueImportDelete : IssueImportDeletePayload!
Deletes an import job.

issueImportId String!
ID of the issue import to delete.

issueImportProcess : IssueImportPayload!
Kicks off import processing.

mapping JSONObject!
The mapping configuration to use for processing the import.

issueImportId String!
ID of the issue import which we're going to process.

issueImportUpdate : IssueImportPayload!
Updates the mapping for the issue import.

input IssueImportUpdateInput!
The properties of the issue import to update.

id String!
The identifier of the issue import.

issueLabelCreate : IssueLabelPayload!
Creates a new label.

replaceTeamLabels Boolean
Whether to replace all team-specific labels with the same name with this newly created workspace label (default: false).

input IssueLabelCreateInput!
The issue label to create.

issueLabelDelete : DeletePayload!
Deletes an issue label.

id String!
The identifier of the label to delete.

issueLabelUpdate : IssueLabelPayload!
Updates an label.

replaceTeamLabels Boolean
Whether to replace all team-specific labels with the same name with this updated workspace label (default: false).

input IssueLabelUpdateInput!
A partial label object to update.

id String!
The identifier of the label to update.

issueRelationCreate : IssueRelationPayload!
Creates a new issue relation.

overrideCreatedAt DateTime
Used by client undo operations. Should not be set directly.

input IssueRelationCreateInput!
The issue relation to create.

issueRelationDelete : DeletePayload!
Deletes an issue relation.

id String!
The identifier of the issue relation to delete.

issueRelationUpdate : IssueRelationPayload!
Updates an issue relation.

input IssueRelationUpdateInput!
The properties of the issue relation to update.

id String!
The identifier of the issue relation to update.

issueReminder : IssuePayload!
Adds an issue reminder. Will cause a notification to be sent when the issue reminder time is reached.

reminderAt DateTime!
The time when a reminder notification will be sent.

id String!
The identifier of the issue to add a reminder for.

issueRemoveLabel : IssuePayload!
Removes a label from an issue.

labelId String!
The identifier of the label to remove.

id String!
The identifier of the issue to remove the label from.

issueSubscribe : IssuePayload!
Subscribes a user to an issue.

userId String
The identifier of the user to subscribe, default is the current user.

id String!
The identifier of the issue to subscribe to.

issueUnarchive : IssueArchivePayload!
Unarchives an issue.

id String!
The identifier of the issue to archive.

issueUnsubscribe : IssuePayload!
Unsubscribes a user from an issue.

userId String
The identifier of the user to unsubscribe, default is the current user.

id String!
The identifier of the issue to unsubscribe from.

issueUpdate : IssuePayload!
Updates an issue.

input IssueUpdateInput!
A partial issue object to update the issue with.

id String!
The identifier of the issue to update.

jiraIntegrationConnect : IntegrationPayload!
[INTERNAL] Connects the organization with a Jira Personal Access Token.

input JiraConfigurationInput!
Jira integration settings.

joinOrganizationFromOnboarding : CreateOrJoinOrganizationResponse!
Join an organization from onboarding.

input JoinOrganizationInput!
Organization details for the organization to join.

leaveOrganization : CreateOrJoinOrganizationResponse!
Leave an organization.

organizationId String!
ID of the organization to leave.

logout : LogoutResponse!
Logout the client.

reason String
The reason for logging out.

logoutAllSessions : LogoutResponse!
Logout all of user's sessions including the active one.

reason String
The reason for logging out.

logoutOtherSessions : LogoutResponse!
Logout all of user's sessions excluding the current one.

reason String
The reason for logging out.

logoutSession : LogoutResponse!
Logout an individual session with its ID.

sessionId String!
ID of the session to logout.

notificationArchive : NotificationArchivePayload!
Archives a notification.

id String!
The id of the notification to archive.

notificationArchiveAll : NotificationBatchActionPayload!
Archives a notification and all related notifications.

input NotificationEntityInput!
The type and id of the entity to archive notifications for.

notificationCategoryChannelSubscriptionUpdate : UserSettingsPayload!
Subscribes to or unsubscribes from a notification category for a given notification channel for the user

channel NotificationChannel!
The notification channel in which to subscribe to or unsubscribe from the category

category NotificationCategory!
The notification category to subscribe to or unsubscribe from

subscribe Boolean!
True if the user wants to subscribe, false if the user wants to unsubscribe

notificationMarkReadAll : NotificationBatchActionPayload!
Marks notification and all related notifications as read.

readAt DateTime!
The time when notification was marked as read.

input NotificationEntityInput!
The type and id of the entity to archive notifications for.

notificationMarkUnreadAll : NotificationBatchActionPayload!
Marks notification and all related notifications as unread.

input NotificationEntityInput!
The type and id of the entity to archive notifications for.

notificationSnoozeAll : NotificationBatchActionPayload!
Snoozes a notification and all related notifications.

snoozedUntilAt DateTime!
The time until a notification will be snoozed. After that it will appear in the inbox again.

input NotificationEntityInput!
The type and id of the entity to archive notifications for.

notificationSubscriptionCreate : NotificationSubscriptionPayload!
Creates a new notification subscription for a cycle, custom view, label, project or team.

input NotificationSubscriptionCreateInput!
The subscription object to create.

notificationSubscriptionDelete : DeletePayload!
Deletes a notification subscription reference.
@deprecated(reason: Update `notificationSubscription.active` to `false` instead.)

id String!
The identifier of the notification subscription reference to delete.

notificationSubscriptionUpdate : NotificationSubscriptionPayload!
Updates a notification subscription.

input NotificationSubscriptionUpdateInput!
A partial notification subscription object to update the notification subscription with.

id String!
The identifier of the notification subscription to update.

notificationUnarchive : NotificationArchivePayload!
Unarchives a notification.

id String!
The id of the notification to archive.

notificationUnsnoozeAll : NotificationBatchActionPayload!
Unsnoozes a notification and all related notifications.

unsnoozedAt DateTime!
The time when the notification was unsnoozed.

input NotificationEntityInput!
The type and id of the entity to archive notifications for.

notificationUpdate : NotificationPayload!
Updates a notification.

input NotificationUpdateInput!
A partial notification object to update the notification with.

id String!
The identifier of the notification to update.

organizationCancelDelete : OrganizationCancelDeletePayload!
Cancels the deletion of an organization. Administrator privileges required.

organizationDelete : OrganizationDeletePayload!
Delete's an organization. Administrator privileges required.

input DeleteOrganizationInput!
Information required to delete an organization.

organizationDeleteChallenge : OrganizationDeletePayload!
Get an organization's delete confirmation token. Administrator privileges required.

organizationDomainClaim : OrganizationDomainSimplePayload!
[INTERNAL] Verifies a domain claim.

id String!
The ID of the organization domain to claim.

organizationDomainCreate : OrganizationDomainPayload!
[INTERNAL] Adds a domain to be allowed for an organization.

triggerEmailVerification Boolean
Whether to trigger an email verification flow during domain creation.

input OrganizationDomainCreateInput!
The organization domain entry to create.

organizationDomainDelete : DeletePayload!
Deletes a domain.

id String!
The identifier of the domain to delete.

organizationDomainUpdate : OrganizationDomainPayload!
[INTERNAL] Updates an organization domain settings.

input OrganizationDomainUpdateInput!
The organization domain entry to update.

id String!
The identifier of the domain to update.

organizationDomainVerify : OrganizationDomainPayload!
[INTERNAL] Verifies a domain to be added to an organization.

input OrganizationDomainVerificationInput!
The organization domain to verify.

organizationInviteCreate : OrganizationInvitePayload!
Creates a new organization invite.

input OrganizationInviteCreateInput!
The organization invite object to create.

organizationInviteDelete : DeletePayload!
Deletes an organization invite.

id String!
The identifier of the organization invite to delete.

organizationInviteUpdate : OrganizationInvitePayload!
Updates an organization invite.

input OrganizationInviteUpdateInput!
The updates to make to the organization invite object.

id String!
The identifier of the organization invite to update.

organizationStartTrial : OrganizationStartTrialPayload!
[DEPRECATED] Starts a trial for the organization. Administrator privileges required.
@deprecated(reason: Use organizationStartTrialForPlan)

organizationStartTrialForPlan : OrganizationStartTrialPayload!
Starts a trial for the organization on the specified plan type. Administrator privileges required.

input OrganizationStartTrialInput!
Plan details for trial

organizationUpdate : OrganizationPayload!
Updates the user's organization.

input OrganizationUpdateInput!
A partial organization object to update the organization with.

passkeyLoginFinish : AuthResolverResponse!
[INTERNAL] Finish passkey login process.

response JSONObject!
authId String!
Random ID to start passkey login with.

passkeyLoginStart : PasskeyLoginStartResponse!
[INTERNAL] Starts passkey login process.

authId String!
Random ID to start passkey login with.

projectArchive : ProjectArchivePayload!
Archives a project.
@deprecated(reason: Deprecated in favor of projectDelete.)

trash Boolean
Whether to trash the project.

id String!
The identifier of the project to archive. Also the identifier from the URL is accepted.

projectCreate : ProjectPayload!
Creates a new project.

connectSlackChannel Boolean
Whether to connect a Slack channel to the project.

input ProjectCreateInput!
The issue object to create.

projectDelete : ProjectArchivePayload!
Deletes (trashes) a project.

id String!
The identifier of the project to delete.

projectLinkCreate : ProjectLinkPayload!
Creates a new project link.

input ProjectLinkCreateInput!
The project link object to create.

projectLinkDelete : DeletePayload!
Deletes a project link.

id String!
The identifier of the project link to delete.

projectLinkUpdate : ProjectLinkPayload!
Updates a project link.

input ProjectLinkUpdateInput!
The project link object to update.

id String!
The identifier of the project link to update.

projectMilestoneCreate : ProjectMilestonePayload!
Creates a new project milestone.

input ProjectMilestoneCreateInput!
The project milestone to create.

projectMilestoneDelete : DeletePayload!
Deletes a project milestone.

id String!
The identifier of the project milestone to delete.

projectMilestoneMove : ProjectMilestoneMovePayload!
[Internal] Moves a project milestone to another project, can be called to undo a prior move.

input ProjectMilestoneMoveInput!
The project to move the milestone to, as well as any additional options need to make a successful move, or undo a previous move.

id String!
The identifier of the project milestone to move.

projectMilestoneUpdate : ProjectMilestonePayload!
Updates a project milestone.

input ProjectMilestoneUpdateInput!
A partial object to update the project milestone with.

id String!
The identifier of the project milestone to update. Also the identifier from the URL is accepted.

projectReassignStatus : SuccessPayload!
[INTERNAL] Updates all projects currently assigned to to a project status to a new project status.

newProjectStatusId String!
The identifier of the new project status to update the projects to.

originalProjectStatusId String!
The identifier of the project status with which projects will be updated.

projectRelationCreate : ProjectRelationPayload!
Creates a new project relation.

input ProjectRelationCreateInput!
The project relation to create.

projectRelationDelete : DeletePayload!
Deletes a project relation.

id String!
The identifier of the project relation to delete.

projectRelationUpdate : ProjectRelationPayload!
Updates a project relation.

input ProjectRelationUpdateInput!
The properties of the project relation to update.

id String!
The identifier of the project relation to update.

projectStatusArchive : ProjectStatusArchivePayload!
Archives a project status.

id String!
The identifier of the project status to archive.

projectStatusCreate : ProjectStatusPayload!
Creates a new project status.

input ProjectStatusCreateInput!
The ProjectStatus object to create.

projectStatusUnarchive : ProjectStatusArchivePayload!
Unarchives a project status.

id String!
The identifier of the project status to unarchive.

projectStatusUpdate : ProjectStatusPayload!
Updates a project status.

input ProjectStatusUpdateInput!
A partial ProjectStatus object to update the ProjectStatus with.

id String!
The identifier of the project status to update.

projectUnarchive : ProjectArchivePayload!
Unarchives a project.

id String!
The identifier of the project to restore. Also the identifier from the URL is accepted.

projectUpdate : ProjectPayload!
Updates a project.

input ProjectUpdateInput!
A partial project object to update the project with.

id String!
The identifier of the project to update. Also the identifier from the URL is accepted.

projectUpdateArchive : ProjectUpdateArchivePayload!
Archives a project update.

id String!
The identifier of the project update to archive.

projectUpdateCreate : ProjectUpdatePayload!
Creates a new project update.

input ProjectUpdateCreateInput!
Data for the project update to create.

projectUpdateDelete : DeletePayload!
Deletes a project update.
@deprecated(reason: Use `projectUpdateArchive` instead.)

id String!
The identifier of the project update to delete.

projectUpdateInteractionCreate : ProjectUpdateInteractionPayload!
Creates a new interaction on a project update.
@deprecated(reason: ProjectUpdateInteraction is not used and will be deleted.)

input ProjectUpdateInteractionCreateInput!
Data for the project update interaction to create.

projectUpdateMarkAsRead : ProjectUpdateWithInteractionPayload!
Mark a project update as read.
@deprecated(reason: Project uppdate interactions are not used and will be removed.)

id String!
The identifier of the project update.

projectUpdateUnarchive : ProjectUpdateArchivePayload!
Unarchives a project update.

id String!
The identifier of the project update to unarchive.

projectUpdateUpdate : ProjectUpdatePayload!
Updates a project update.

input ProjectUpdateUpdateInput!
A data to update the project update with.

id String!
The identifier of the project update to update.

pushSubscriptionCreate : PushSubscriptionPayload!
Creates a push subscription.

input PushSubscriptionCreateInput!
The push subscription to create.

pushSubscriptionDelete : PushSubscriptionPayload!
Deletes a push subscription.

id String!
The identifier of the push subscription to delete.

reactionCreate : ReactionPayload!
Creates a new reaction.

input ReactionCreateInput!
The reaction object to create.

reactionDelete : DeletePayload!
Deletes a reaction.

id String!
The identifier of the reaction to delete.

refreshGoogleSheetsData : IntegrationPayload!
Manually update Google Sheets data.

id String!
The identifier of the Google Sheets integration to update.

resendOrganizationInvite : DeletePayload!
Re-send an organization invite.

id String!
The identifier of the organization invite to be re-send.

roadmapArchive : RoadmapArchivePayload!
Archives a roadmap.

id String!
The identifier of the roadmap to archive.

roadmapCreate : RoadmapPayload!
Creates a new roadmap.

input RoadmapCreateInput!
The properties of the roadmap to create.

roadmapDelete : DeletePayload!
Deletes a roadmap.

id String!
The identifier of the roadmap to delete.

roadmapToProjectCreate : RoadmapToProjectPayload!
Creates a new roadmapToProject join.

input RoadmapToProjectCreateInput!
The properties of the roadmapToProject to create.

roadmapToProjectDelete : DeletePayload!
Deletes a roadmapToProject.

id String!
The identifier of the roadmapToProject to delete.

roadmapToProjectUpdate : RoadmapToProjectPayload!
Updates a roadmapToProject.

input RoadmapToProjectUpdateInput!
The properties of the roadmapToProject to update.

id String!
The identifier of the roadmapToProject to update.

roadmapUnarchive : RoadmapArchivePayload!
Unarchives a roadmap.

id String!
The identifier of the roadmap to unarchive.

roadmapUpdate : RoadmapPayload!
Updates a roadmap.

input RoadmapUpdateInput!
The properties of the roadmap to update.

id String!
The identifier of the roadmap to update.

samlTokenUserAccountAuth : AuthResolverResponse!
Authenticates a user account via email and authentication token for SAML.

input TokenUserAccountAuthInput!
The data used for token authentication.

teamCreate : TeamPayload!
Creates a new team. The user who creates the team will automatically be added as a member to the newly created team.

copySettingsFromTeamId String
The team id to copy settings from, if any.

input TeamCreateInput!
The team object to create.

teamCyclesDelete : TeamPayload!
Deletes team's cycles data

id String!
The identifier of the team, which cycles will be deleted.

teamDelete : DeletePayload!
Deletes a team.

id String!
The identifier of the team to delete.

teamKeyDelete : DeletePayload!
Deletes a previously used team key.

id String!
The identifier of the team key to delete.

teamMembershipCreate : TeamMembershipPayload!
Creates a new team membership.

input TeamMembershipCreateInput!
The team membership object to create.

teamMembershipDelete : DeletePayload!
Deletes a team membership.

alsoLeaveParentTeams Boolean
Whether to leave the parent teams.

id String!
The identifier of the team membership to delete.

teamMembershipUpdate : TeamMembershipPayload!
Updates a team membership.

input TeamMembershipUpdateInput!
A partial team membership object to update the team membership with.

id String!
The identifier of the team membership to update.

teamUnarchive : TeamArchivePayload!
Unarchives a team and cancels deletion.

id String!
The identifier of the team to delete.

teamUpdate : TeamPayload!
Updates a team.

mapping InheritanceEntityMapping
[INTERNAL] Mapping of existing team entities to those inherited from the parent team

input TeamUpdateInput!
A partial team object to update the team with.

id String!
The identifier of the team to update.

templateCreate : TemplatePayload!
Creates a new template.

input TemplateCreateInput!
The template object to create.

templateDelete : DeletePayload!
Deletes a template.

id String!
The identifier of the template to delete.

templateUpdate : TemplatePayload!
Updates an existing template.

input TemplateUpdateInput!
The properties of the template to update.

id String!
The identifier of the template.

timeScheduleCreate : TimeSchedulePayload!
Creates a new time schedule.

input TimeScheduleCreateInput!
The properties of the time schedule to create.

timeScheduleDelete : DeletePayload!
Deletes a time schedule.

id String!
The identifier of the time schedule to delete.

timeScheduleRefreshIntegrationSchedule : TimeSchedulePayload!
Refresh the integration schedule information.

id String!
The identifier of the time schedule to refresh.

timeScheduleUpdate : TimeSchedulePayload!
Updates a time schedule.

input TimeScheduleUpdateInput!
The properties of the time schedule to update.

id String!
The identifier of the time schedule to update.

timeScheduleUpsertExternal : TimeSchedulePayload!
Upsert an external time schedule.

input TimeScheduleUpdateInput!
The properties of the time schedule to insert or update.

externalId String!
The unique identifier of the external schedule.

triageResponsibilityCreate : TriageResponsibilityPayload!
Creates a new triage responsibility.

input TriageResponsibilityCreateInput!
The properties of the triage responsibility to create.

triageResponsibilityDelete : DeletePayload!
Deletes a triage responsibility.

id String!
The identifier of the triage responsibility to delete.

triageResponsibilityUpdate : TriageResponsibilityPayload!
Updates an existing triage responsibility.

input TriageResponsibilityUpdateInput!
The properties of the triage responsibility to update.

id String!
The identifier of the triage responsibility to update.

updateIntegrationSlackScopes : IntegrationPayload!
[Internal] Updates existing Slack integration scopes.

integrationId String!
The ID of the existing Slack integration

redirectUri String!
The Slack OAuth redirect URI.

code String!
The Slack OAuth code.

userDemoteAdmin : UserAdminPayload!
Makes user a regular user. Can only be called by an admin.

id String!
The identifier of the user to make a regular user.

userDemoteMember : UserAdminPayload!
Makes user a guest. Can only be called by an admin.

id String!
The identifier of the user to make a guest.

userDiscordConnect : UserPayload!
Connects the Discord user to this Linear account via OAuth2.

redirectUri String!
The Discord OAuth redirect URI.

code String!
The Discord OAuth code.

userExternalUserDisconnect : UserPayload!
Disconnects the external user from this Linear account.

service String!
The external service to disconnect.

userFlagUpdate : UserSettingsFlagPayload!
Updates a user's settings flag.

operation UserFlagUpdateOperation!
Flag operation to perform.

flag UserFlagType!
Settings flag to increment.

userPromoteAdmin : UserAdminPayload!
Makes user an admin. Can only be called by an admin.

id String!
The identifier of the user to make an admin.

userPromoteMember : UserAdminPayload!
Makes user a regular user. Can only be called by an admin.

id String!
The identifier of the user to make a regular user.

userSettingsFlagsReset : UserSettingsFlagsResetPayload!
Resets user's setting flags.

flags [UserFlagType!]
The flags to reset. If not provided all flags will be reset.

userSettingsUpdate : UserSettingsPayload!
Updates the user's settings.

input UserSettingsUpdateInput!
A partial notification object to update the settings with.

id String!
The identifier of the userSettings to update.

userSuspend : UserAdminPayload!
Suspends a user. Can only be called by an admin.

id String!
The identifier of the user to suspend.

userUnsuspend : UserAdminPayload!
Un-suspends a user. Can only be called by an admin.

id String!
The identifier of the user to unsuspend.

userUpdate : UserPayload!
Updates a user. Only available to organization admins and the user themselves.

input UserUpdateInput!
A partial user object to update the user with.

id String!
The identifier of the user to update. Use me to reference currently authenticated user.

viewPreferencesCreate : ViewPreferencesPayload!
Creates a new ViewPreferences object.

input ViewPreferencesCreateInput!
The ViewPreferences object to create.

viewPreferencesDelete : DeletePayload!
Deletes a ViewPreferences.

id String!
The identifier of the ViewPreferences to delete.

viewPreferencesUpdate : ViewPreferencesPayload!
Updates an existing ViewPreferences object.

input ViewPreferencesUpdateInput!
The properties of the view preferences.

id String!
The identifier of the ViewPreferences object.

webhookCreate : WebhookPayload!
Creates a new webhook.

input WebhookCreateInput!
The webhook object to create.

webhookDelete : DeletePayload!
Deletes a Webhook.

id String!
The identifier of the Webhook to delete.

webhookUpdate : WebhookPayload!
Updates an existing Webhook.

input WebhookUpdateInput!
The properties of the Webhook.

id String!
The identifier of the Webhook.

workflowStateArchive : WorkflowStateArchivePayload!
Archives a state. Only states with issues that have all been archived can be archived.

id String!
The identifier of the state to archive.

workflowStateCreate : WorkflowStatePayload!
Creates a new state, adding it to the workflow of a team.

input WorkflowStateCreateInput!
The state to create.

workflowStateUpdate : WorkflowStatePayload!
Updates a state.

input WorkflowStateUpdateInput!
A partial state object to update.

id String!
The identifier of the state to update.

###
