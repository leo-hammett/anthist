# Setup Guide for iOS Simulator MCP Server

## Prerequisites

1. **macOS** with Xcode installed
2. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **Node.js** version 18 or higher

## Installation

1. **Navigate to the MCP server directory:**
   ```bash
   cd /Volumes/makingthings/git-repos/feed/mcp-servers/ios-simulator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Configure Cursor

Add the MCP server to your Cursor settings:

1. **Open Cursor Settings** (Cmd + ,)
2. **Search for "MCP"** or navigate to Features → MCP
3. **Edit settings.json** and add:

```json
{
  "mcpServers": {
    "ios-simulator": {
      "command": "node",
      "args": [
        "/Volumes/makingthings/git-repos/feed/mcp-servers/ios-simulator/dist/index.js"
      ]
    }
  }
}
```

**Or use this automated command:**

```bash
# Run from the ios-simulator directory
npm run setup-cursor
```

## Verify Installation

1. **Restart Cursor**
2. **Open the MCP panel** (View → MCP or Cmd + Shift + P → "MCP")
3. **Check that "ios-simulator" appears** in the list of servers
4. **Test a tool** by asking the AI to list simulators:
   ```
   Can you list all iOS simulators?
   ```

## Quick Test

After setup, try these commands in Cursor:

```bash
# List all simulators
list_simulators

# Boot iPhone 15 Pro
boot_simulator with udid="iPhone 15 Pro"

# Get device info
get_device_info with udid="iPhone 15 Pro"
```

## Troubleshooting

### "Command not found: xcrun"
**Solution:** Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### "No simulators found"
**Solution:** Open Xcode → Preferences → Components and download iOS Simulator runtimes.

### MCP server not appearing in Cursor
**Solutions:**
1. Check the path in settings.json is correct (use absolute path)
2. Ensure the server was built: `npm run build`
3. Check the dist/index.js file exists
4. Restart Cursor completely (Quit and reopen)
5. Check Cursor's console for errors (Help → Toggle Developer Tools)

### Permission errors
**Solution:** Ensure the script is executable:
```bash
chmod +x dist/index.js
```

## Development Mode

For development with auto-rebuild:

```bash
npm run watch
```

Then restart Cursor when you make changes.

## Testing Without Cursor

You can test the MCP server directly:

```bash
# Start the server
npm run dev

# In another terminal, send MCP requests via stdin
# (Advanced usage - typically you'll use through Cursor)
```

## Next Steps

Once configured, you can:

1. **Test your Anthist app** with performance monitoring
2. **Automate testing workflows** through the AI
3. **Capture screenshots** during testing
4. **Monitor memory and CPU usage**
5. **Collect logs** for debugging

See the main README.md for usage examples and workflows.
