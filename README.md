# Linear MCP Server

A Model Context Protocol (MCP) server that enables Linear issue management directly from Cursor's Composer feature.

## Features

- Fetch Linear tickets assigned to the authenticated user
- Filter tickets by status (active, completed, canceled)
- Limit the number of results returned
- Seamless integration with Cursor's AI assistant

## 🚀 Quick Setup

1. **Open a terminal and run:**

   ```bash
   cd tools/mcp-linear
   ./setup-mcp-linear.sh
   ```

   > If you get a permission error, run:  
   > `chmod +x setup-mcp-linear.sh`

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

## Development

- Make changes in `tools/mcp-linear`
- Add tests for new functionality
- Update this README if needed

## License

MIT License
