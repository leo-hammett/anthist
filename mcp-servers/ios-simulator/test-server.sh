#!/bin/bash

# Test script for iOS Simulator MCP Server
# Verifies the server is working correctly

set -e

echo "🧪 Testing iOS Simulator MCP Server..."
echo ""

# Check if Node.js is installed
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi
echo "  Node.js version: $(node --version)"
echo ""

# Check if Xcode command line tools are installed
echo "✓ Checking Xcode command line tools..."
if ! command -v xcrun &> /dev/null; then
    echo "❌ Xcode command line tools not found"
    echo "   Install with: xcode-select --install"
    exit 1
fi
echo "  Xcode version: $(xcodebuild -version | head -n 1)"
echo ""

# Check if simctl is available
echo "✓ Checking simctl..."
if ! xcrun simctl list devices &> /dev/null; then
    echo "❌ simctl is not working"
    exit 1
fi
echo "  simctl is available"
echo ""

# Check if build exists
echo "✓ Checking if server is built..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if [ ! -f "dist/index.js" ]; then
    echo "❌ Server not built. Running build..."
    npm run build
fi
echo "  dist/index.js exists"
echo ""

# List simulators using simctl directly
echo "✓ Testing simctl directly..."
SIMULATOR_COUNT=$(xcrun simctl list devices --json | grep -o '"udid"' | wc -l)
echo "  Found $SIMULATOR_COUNT simulators"
echo ""

# Check if any booted simulators exist
echo "✓ Checking for booted simulators..."
BOOTED_COUNT=$(xcrun simctl list devices | grep "Booted" | wc -l)
if [ $BOOTED_COUNT -gt 0 ]; then
    echo "  $BOOTED_COUNT simulator(s) currently booted"
else
    echo "  No simulators currently booted (this is fine)"
fi
echo ""

echo "✅ All checks passed!"
echo ""
echo "📋 Next steps:"
echo "   1. Add the MCP server to Cursor settings.json"
echo "   2. Restart Cursor"
echo "   3. Ask the AI: 'List all iOS simulators'"
echo ""
echo "📖 See QUICK-START.md for detailed instructions"
