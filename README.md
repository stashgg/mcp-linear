# Linear MCP Server

A Model Context Protocol (MCP) server that enables Linear issue management directly from Cursor's Composer feature.

## Features

- **Read Operations:**
  - Fetch Linear tickets assigned to the authenticated user
  - Filter tickets by status (active, completed, canceled)
  - Limit the number of results returned
  - Get all teams to find team IDs for creating tickets

- **Write Operations:**
  - Create new Linear tickets/issues
  - Automatically attach `agent-created` label for tracking
  - Support for priority, assignee, labels, and workflow states

- **Seamless Integration:**
  - Works directly in Cursor's AI assistant
  - Automatic team discovery
  - Full error handling and validation

## 🚀 Quick Setup

### Option 1: Git Submodule (Recommended)

If you want to use this as a git submodule in your project:

1. **Add as git submodule:**

   ```bash
   # From your project root (e.g., pie-mono)
   # Note: The first command is only necessary if the submodule is not yet setup in the repo
   git submodule add https://github.com/stashgg/mcp-linear path/to/mcp-linear
   git submodule update --init --recursive # initializes submodule in your local setup
   ```

2. **Run the setup script:**

   ```bash
   cd path/to/mcp-linear
   ./setup-mcp-linear.sh
   ```

   > If you get a permission error, run:  
   > `chmod +x setup-mcp-linear.sh`

### Option 2: Standalone Setup

If you've cloned this repository directly:

1. **Navigate to the mcp-linear directory:**

   ```bash
   cd path/to/mcp-linear
   ./setup-mcp-linear.sh
   ```

   > If you get a permission error, run:  
   > `chmod +x setup-mcp-linear.sh`

### Final Configuration Steps

2. **Follow the script's instructions:**
   - It will install dependencies with yarn and build the package
   - It will install the MCP tool globally with npm (more reliable for global tools)
   - It will help you set up your Linear API key and MCP config

3. **Set your Linear API key:**

   ```bash
   export LINEAR_API_KEY="your-linear-api-key"
   ```

   - To get your API key, visit [StashGG Linear API Settings](https://linear.app/stashgg/settings/account/security)
   - (Strongly recommended) Add this line to your `~/.zshrc` or `~/.bashrc` for persistence.

4. **Configure Cursor:**
   - Open Cursor
   - Go to **Settings → Tools & Integrations → MCP Tools**
   - Click **Add Custom MCP** (this opens `.cursor/mcp.json`)
   - Add the following:
     ```json
     {
       "mcpServers": {
         "linear": {
           "command": "mcp-linear",
           "type": "stdio"
         }
       }
     }
     ```

5. **Test the setup:**
   - Restart Cursor
   - Open Cursor's Composer
   - Try: "Show me my Linear tickets"
   - Try: "Show me all my Linear teams"
   - Try: "Create a new Linear ticket titled 'Test ticket' in the Engineering team"

## 🛠️ Manual Setup (if you prefer not to use the script)

### Prerequisites

- Node.js (v20 or higher)
- npm (for global installation)
- yarn (for local development)

### Installation

1. **Install dependencies and build:**

   ```bash
   yarn install
   yarn build
   ```

2. **Install the package globally with npm:**

   ```bash
   npm install -g .
   ```

3. **Set your Linear API key and configure Cursor as above.**

## 🔄 Updating Git Submodule

If you're using this as a git submodule and want to update to the latest version:

```bash
cd tools/mcp-linear
git pull origin main
./setup-mcp-linear.sh  # Rebuild and reinstall
cd ../..
git add tools/mcp-linear
git commit -m "Update mcp-linear submodule"
```

## Usage

Once configured, you can use the Linear MCP in Cursor's Composer:

### Read Operations:

- "Show me my active Linear tickets"
- "Get my completed tickets from Linear"
- "Show me 5 of my active Linear tickets"
- "Show me all my Linear teams"

### Write Operations:

- "Create a new Linear ticket titled 'Fix login bug' in the Engineering team"
- "Create a high priority ticket titled 'Performance issue' with description 'App is slow on mobile devices'"
- "Create a ticket assigned to John Doe titled 'Review PR'"

### Auto-Labeling:

All tickets created through the MCP automatically get an `agent-created` label for easy tracking and filtering.

## 🔧 Development

### Local Development Setup:

```bash
yarn install
yarn build
```

### Testing Changes:

```bash
yarn build
npm install -g .  # Reinstall globally
# Restart Cursor to pick up changes
```

### Package Management:

- **Local development**: Uses `yarn` for faster installs and better dependency management
- **Global installation**: Uses `npm` for better compatibility with global tools and MCP

## Troubleshooting

- **Permission denied:**  
  Run `chmod +x setup-mcp-linear.sh`
- **mcp-linear: command not found:**  
  Make sure your npm global bin directory is in your PATH (`npm bin -g`)
- **API key issues:**  
  Make sure you've set `LINEAR_API_KEY` in your environment
- **Node version incompatibility:**  
  This project requires Node.js 20 or higher. If you're using nvm:
  ```bash
  nvm use 20
  # or install if not available
  nvm install 20
  nvm use 20
  ```
- **Submodule issues:**  
  Run `git submodule update --init --recursive` to ensure submodules are properly initialized
- **Tools not showing up in Cursor:**
  - Completely quit and restart Cursor (Cmd+Q on Mac)
  - Check MCP status in Settings → Tools & Integrations → MCP Tools
  - Verify the linear server shows as connected

## Available Tools

1. **`get-linear-tickets`** - Get tickets assigned to you
2. **`get-linear-teams`** - Get all teams (helpful for creating tickets)
3. **`create-linear-ticket`** - Create new tickets with auto-labeling

## License

MIT License
