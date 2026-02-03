#!/bin/bash

# Configure Cursor to use iOS Simulator MCP Server
# This script helps add the MCP server to Cursor's settings

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MCP_PATH="$SCRIPT_DIR/dist/index.js"

echo "🔧 iOS Simulator MCP Server - Cursor Configuration"
echo ""

# Check if build exists
if [ ! -f "$MCP_PATH" ]; then
    echo "❌ Server not built yet"
    echo "   Building now..."
    cd "$SCRIPT_DIR"
    npm run build
    echo ""
fi

# Detect Cursor settings location
CURSOR_SETTINGS=""

if [ -f "$HOME/Library/Application Support/Cursor/User/settings.json" ]; then
    CURSOR_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"
elif [ -f "$HOME/.config/Cursor/User/settings.json" ]; then
    CURSOR_SETTINGS="$HOME/.config/Cursor/User/settings.json"
fi

if [ -z "$CURSOR_SETTINGS" ]; then
    echo "⚠️  Could not auto-detect Cursor settings.json"
    echo ""
    echo "Please manually add this to your Cursor settings.json:"
    echo ""
    echo "{"
    echo "  \"mcpServers\": {"
    echo "    \"ios-simulator\": {"
    echo "      \"command\": \"node\","
    echo "      \"args\": ["
    echo "        \"$MCP_PATH\""
    echo "      ]"
    echo "    }"
    echo "  }"
    echo "}"
    echo ""
    echo "📍 Find settings.json at:"
    echo "   Cursor → Settings (Cmd+,) → Search 'MCP' → Edit settings.json"
    exit 0
fi

echo "✓ Found Cursor settings: $CURSOR_SETTINGS"
echo ""

# Check if already configured
if grep -q "ios-simulator" "$CURSOR_SETTINGS" 2>/dev/null; then
    echo "✅ MCP server already configured in Cursor!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Restart Cursor if it's running"
    echo "   2. Ask the AI: 'List all iOS simulators'"
    echo ""
    exit 0
fi

echo "📝 Configuration to add:"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"ios-simulator\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$MCP_PATH\"]"
echo "    }"
echo "  }"
echo "}"
echo ""

# Ask for confirmation
read -p "Add this configuration to Cursor settings? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Configuration cancelled"
    echo ""
    echo "You can manually add the configuration shown above to:"
    echo "   $CURSOR_SETTINGS"
    exit 0
fi

# Backup settings
cp "$CURSOR_SETTINGS" "$CURSOR_SETTINGS.backup"
echo "✓ Created backup: $CURSOR_SETTINGS.backup"

# Add or update mcpServers configuration
if [ -f "$CURSOR_SETTINGS" ]; then
    # Check if mcpServers section exists
    if grep -q "mcpServers" "$CURSOR_SETTINGS"; then
        echo "⚠️  mcpServers section already exists"
        echo "   Please manually add 'ios-simulator' configuration"
        echo ""
        echo "Add this inside the mcpServers object:"
        echo ""
        echo "    \"ios-simulator\": {"
        echo "      \"command\": \"node\","
        echo "      \"args\": [\"$MCP_PATH\"]"
        echo "    }"
        exit 0
    else
        # Add new mcpServers section
        # This is a simplified approach - for complex JSON, use jq
        echo "   Adding mcpServers section..."
        
        # Create temp file with updated config
        python3 -c "
import json
import sys

settings_file = '$CURSOR_SETTINGS'
mcp_path = '$MCP_PATH'

try:
    with open(settings_file, 'r') as f:
        settings = json.load(f)
except:
    settings = {}

if 'mcpServers' not in settings:
    settings['mcpServers'] = {}

settings['mcpServers']['ios-simulator'] = {
    'command': 'node',
    'args': [mcp_path]
}

with open(settings_file, 'w') as f:
    json.dump(settings, f, indent=2)

print('✓ Configuration added successfully!')
" 2>/dev/null
        
        if [ $? -ne 0 ]; then
            echo "❌ Could not automatically update settings"
            echo "   Please manually add the configuration"
            echo ""
            echo "Restore backup with:"
            echo "   cp \"$CURSOR_SETTINGS.backup\" \"$CURSOR_SETTINGS\""
            exit 1
        fi
    fi
fi

echo ""
echo "✅ Successfully configured Cursor!"
echo ""
echo "📋 Next steps:"
echo "   1. Restart Cursor"
echo "   2. Ask the AI: 'List all iOS simulators'"
echo "   3. See QUICK-START.md for usage examples"
echo ""
echo "🧪 Test the configuration:"
echo "   ./test-server.sh"
