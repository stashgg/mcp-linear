# Linear MCP Server

A Model Context Protocol (MCP) server that enables Linear issue management directly from Cursor's Composer feature.

## Features

- Fetch Linear tickets assigned to the authenticated user
- Filter tickets by status (active, completed, canceled)
- Limit the number of results returned
- Seamless integration with Cursor's AI assistant

## 🚀 Quick Setup

### Option 1: Git Submodule (Recommended)

If you want to use this as a git submodule in your project:

1. **Add as git submodule:**

   ```bash
   # From your project root (e.g., pie-mono)
   git submodule add https://github.com/stashgg/mcp-linear tools/mcp-linear
   git submodule update --init --recursive
   ```

2. **Run the setup script:**

   ```bash
   cd tools/mcp-linear
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
   - It will install the MCP tool globally.
   - It will help you set up your Linear API key.
   - It will ensure your MCP config file exists.

3. **Set your Linear API key:**

   ```bash
   export LINEAR_API_KEY="your-linear-api-key"
   ```

   - To get your API key, visit [StashGG Linear API Settings](https://linear.app/stashgg/settings/account/security)
   - (Optional) Add this line to your `~/.zshrc` or `~/.bashrc` for persistence.

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
   - (Optional, not recommended for security) You can add your API key here:
     ```json
     "env": {
       "LINEAR_API_KEY": "your-linear-api-key"
     }
     ```

5. **Test the setup:**
   - Open Cursor's Composer
   - Try: "Show me my active Linear tickets"

## 🛠️ Manual Setup (if you prefer not to use the script)

1. **Install dependencies and build:**

   ```bash
   yarn install
   yarn build
   ```

2. **Install the package globally:**

   ```bash
   yarn global add file:.
   ```

3. **Set your Linear API key and configure Cursor as above.**

## 🔄 Updating Git Submodule

If you're using this as a git submodule and want to update to the latest version:

```bash
cd tools/mcp-linear
git pull origin main
cd ../..
git add tools/mcp-linear
git commit -m "Update mcp-linear submodule"
```

## Usage

Once configured, you can use the Linear MCP in Cursor's Composer:

- "Show me my active Linear tickets"
- "Get my completed tickets from Linear"
- "Show me 5 of my active Linear tickets"

## Troubleshooting

- **Permission denied:**  
  Run `chmod +x setup-mcp-linear.sh`
- **mcp-linear: command not found:**  
  Make sure your global Yarn bin directory is in your PATH (`yarn global bin`)
- **API key issues:**  
  Make sure you've set `LINEAR_API_KEY` in your environment
- **Submodule issues:**  
  Run `git submodule update --init --recursive` to ensure submodules are properly initialized

## Development

- Make changes in the mcp-linear directory
- Add tests for new functionality
- Update this README if needed

## License

MIT License
