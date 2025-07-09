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

# Check if yarn is installed
if ! command -v yarn &>/dev/null; then
    echo "❌ Yarn is not installed. Please install yarn first:"
    echo "   npm install -g yarn"
    exit 1
fi

# Install dependencies and build the package
echo "📦 Installing dependencies..."
yarn install

echo "🔨 Building the package..."
yarn build

# Install the package globally using npm (more reliable for local packages)
echo "📦 Installing mcp-linear globally from $(pwd) ..."
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
echo "3. Configure in Cursor:"
echo "   - Open Cursor Settings"
echo "   - Navigate to Tools & Integrations > MCP Tools"
echo "   - Click '+ Add Custom MCP'"
echo "   - Edit .cursor/mcp.json as described in the README"
echo ""
echo "4. Test the setup:"
echo "   - Open Cursor's Composer"
echo "   - Try: 'Show me my active Linear tickets'"
echo ""
echo "📚 For more information, see: README.md"
echo ""
