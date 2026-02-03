# MCP Servers for Anthist

This directory contains Model Context Protocol (MCP) servers that extend Cursor's capabilities for the Anthist project.

## Available Servers

### 1. iOS Simulator MCP Server

**Location:** `./ios-simulator/`

**Purpose:** Control iOS Simulators and test app performance directly from Cursor using AI commands.

**Features:**
- 🚀 Boot/shutdown simulators
- 📱 Install and launch apps
- 📊 Monitor performance (CPU, memory, FPS)
- 📸 Capture screenshots
- 📝 Collect app logs
- 🔍 Device information and status

**Quick Setup:**
```bash
cd ios-simulator
npm install
npm run build
```

Add to Cursor settings:
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

**Documentation:**
- [Quick Start Guide](./ios-simulator/QUICK-START.md) - Get started in 5 minutes
- [Full Documentation](./ios-simulator/README.md) - Complete tool reference
- [Setup Instructions](./ios-simulator/SETUP.md) - Detailed installation
- [Testing Workflows](./ios-simulator/TESTING-WORKFLOW.md) - Advanced testing strategies

---

## What is MCP?

Model Context Protocol (MCP) is a standard for extending AI capabilities. MCP servers provide:

- **Tools** - Functions the AI can call (e.g., "boot simulator", "get metrics")
- **Resources** - Data the AI can access (e.g., simulator status, logs)
- **Prompts** - Pre-defined workflows for common tasks

### Benefits for Anthist Development

1. **AI-Powered Testing** - Ask AI to run complex test scenarios
2. **Automated Workflows** - Chain multiple operations together
3. **Performance Monitoring** - Continuous performance tracking
4. **Faster Iteration** - Test without leaving Cursor
5. **Documentation** - Screenshots and logs collected automatically

---

## Example Usage

### Simple Commands

```
"List all iOS simulators"
"Boot iPhone 15 Pro"
"Get performance metrics for com.anthist.app"
"Take a screenshot"
```

### Complex Workflows

```
"Run a complete performance test:
1. Boot iPhone 15 Pro
2. Launch the Anthist app
3. Monitor CPU and memory for 60 seconds
4. Take screenshots every 10 seconds
5. Get logs if any issues detected
6. Generate a performance report"
```

The AI will execute all steps and provide analysis!

---

## Development

### Creating a New MCP Server

1. Create a new directory in `mcp-servers/`
2. Initialize with `npm init`
3. Add `@modelcontextprotocol/sdk` dependency
4. Implement server following MCP spec
5. Build and test
6. Add to Cursor settings
7. Document in README

### Testing MCP Servers

```bash
# Build the server
cd mcp-servers/your-server
npm run build

# Test directly
npm run dev

# Test through Cursor
# Add to settings and restart Cursor
```

---

## Roadmap

Future MCP servers planned:

- [ ] **Android Emulator MCP** - Control Android emulators
- [ ] **AWS Amplify MCP** - Manage backend resources
- [ ] **Analytics MCP** - Query app analytics data
- [ ] **Build MCP** - Monitor and control builds
- [ ] **Database MCP** - Query and manage database

---

## Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [Cursor MCP Documentation](https://docs.cursor.com/mcp)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/sdk)

---

## Contributing

When adding new MCP servers:

1. Follow the existing structure
2. Include comprehensive documentation
3. Add example workflows
4. Test thoroughly
5. Update this README

---

## Support

For issues with MCP servers:

1. Check server logs in Cursor Developer Tools
2. Verify settings.json configuration
3. Ensure dependencies are installed
4. See individual server documentation

---

## License

MIT - See main project LICENSE file
