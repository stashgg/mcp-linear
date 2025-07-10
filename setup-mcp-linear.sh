#!/bin/bash

set -e

# Check if we're in the right directory by looking for package.json with mcp-linear
if [ ! -f "package.json" ] || ! grep -q "mcp-linear" package.json; then
    echo "❌ Please run this script from the mcp-linear root directory."
    echo "   Example:"
    echo "     cd path/to/mcp-linear"
    echo "     ./setup-mcp-linear.sh"
    exit 1
fi

echo "🚀 Setting up Linear MCP Server..."
echo ""

# Check if pnpm is installed for local development
if ! command -v pnpm &>/dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if npm is available for global installation
if ! command -v npm &>/dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies and build the package using pnpm
echo "📦 Installing dependencies with pnpm..."
pnpm install

echo "🔨 Building the package..."
pnpm build

# Install the package globally using npm (more reliable for global installations)
echo "📦 Installing mcp-linear globally with npm from $(pwd) ..."
npm install -g .

# Verify installation
if command -v mcp-linear &>/dev/null; then
    echo "✅ MCP Linear server installed successfully"
else
    echo "❌ Installation failed - mcp-linear command not found"
    echo "   Try running: npm list -g --depth=0 | grep mcp-linear"
    echo "   And ensure your npm global bin directory is in your PATH"
    exit 1
fi

# Create MCP config if it doesn't exist
MCP_CONFIG="$HOME/.cursor/mcp.json"
if [ ! -f "$MCP_CONFIG" ]; then
    echo "📝 Creating MCP config file..."
    mkdir -p "$(dirname "$MCP_CONFIG")"
    echo '{"mcpServers": {}}' >"$MCP_CONFIG"
    echo "✅ Created MCP config file at $MCP_CONFIG"
else
    echo "✅ MCP config file already exists at $MCP_CONFIG"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Set your Linear API key:"
echo "   export LINEAR_API_KEY='your-linear-api-key'"
echo ""
echo "   To get your API key, visit: https://linear.app/stashgg/settings/account/security"
echo ""
echo "2. Add to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
echo "   export LINEAR_API_KEY='your-linear-api-key'"
echo ""
echo "3. Configure Cursor MCP:"
echo "   - Open Cursor Settings → Tools & Integrations → MCP Tools"
echo "   - Click 'Add Custom MCP' (opens ~/.cursor/mcp.json)"
echo "   - Add the Linear server configuration:"
echo '   {'
echo '     "mcpServers": {'
echo '       "linear": {'
echo '         "command": "mcp-linear",'
echo '         "type": "stdio"'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "4. Restart Cursor and test:"
echo "   - 'Show me my Linear tickets'"
echo "   - 'Show me all my Linear teams'"
echo "   - 'Create a new Linear ticket titled \"Test\" in the Engineering team'"
echo ""
echo "Note: We use pnpm for local development and npm for global installation."
echo "      This provides the best compatibility for MCP usage."
