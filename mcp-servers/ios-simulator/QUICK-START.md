# Quick Start Guide - iOS Simulator MCP

Get started testing your Anthist iOS app in 5 minutes!

---

## 1. Configure Cursor (One-Time Setup)

Add this to your Cursor settings (Cmd + , → search "MCP"):

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

**Then restart Cursor.**

---

## 2. Verify Installation

Ask the AI in Cursor:

```
List all iOS simulators
```

You should see output with available devices like:
- iPhone 15 Pro
- iPhone 14
- iPad Pro, etc.

---

## 3. First Test - Launch Your App

### Step 1: Boot a Simulator

```
Boot iPhone 15 Pro
```

### Step 2: Build and Install App

In terminal:
```bash
cd /Volumes/makingthings/git-repos/feed
npx expo run:ios --device "iPhone 15 Pro"
```

### Step 3: Get Performance Metrics

```
Get performance metrics for com.anthist.app on iPhone 15 Pro
```

### Step 4: Take a Screenshot

```
Take a screenshot of iPhone 15 Pro
```

---

## 4. Common Commands

Just ask the AI naturally:

- **"Show me all simulators"** → Lists all devices
- **"Boot iPhone 15 Pro"** → Starts the simulator
- **"Launch com.anthist.app"** → Opens your app
- **"Get performance metrics"** → Shows CPU, memory, FPS
- **"Take a screenshot"** → Captures the screen
- **"Get app logs"** → Shows recent logs
- **"Shutdown the simulator"** → Closes it

---

## 5. Test Workflow Example

Ask the AI to run a complete test:

```
Can you help me test the Anthist app performance?

1. Boot iPhone 15 Pro
2. Check if the app is installed
3. Launch com.anthist.app
4. Get performance metrics
5. Take a screenshot
6. Get the last 50 lines of logs
7. Tell me if everything looks good
```

The AI will execute all steps and analyze the results for you!

---

## 6. Monitoring Share Extension

Test the share extension:

```
1. Boot iPhone 15 Pro
2. Launch the app
3. Get logs with "ShareExtension" in them
4. Take a screenshot
5. Get performance metrics for com.anthist.app.ShareExtension
```

---

## 7. Performance Benchmarks

What to expect:

| Metric | Good | Bad |
|--------|------|-----|
| Launch Time | < 2s | > 3s |
| Memory (idle) | < 100 MB | > 200 MB |
| CPU (idle) | < 5% | > 15% |
| FPS | 60 | < 55 |

---

## 8. Troubleshooting

### MCP server not showing up?
1. Check the path in settings.json is correct
2. Restart Cursor
3. Check Help → Toggle Developer Tools for errors

### "xcrun: error: unable to find utility 'simctl'"?
Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### No simulators listed?
Open Xcode → Preferences → Components and download iOS runtimes.

---

## 9. Next Steps

See these files for more:

- **SETUP.md** - Detailed installation instructions
- **README.md** - Complete tool reference
- **TESTING-WORKFLOW.md** - Advanced testing strategies

---

## Tips

✅ **Always test on multiple devices** (iPhone 15 Pro, iPhone 14, iPad)
✅ **Monitor memory over time** to catch leaks early
✅ **Test share extension separately** (120MB memory limit!)
✅ **Take screenshots** during testing for documentation
✅ **Get logs** when something goes wrong

---

## Example: Full Performance Test

Ask the AI:

```
Run a comprehensive performance test on Anthist:

1. Boot iPhone 15 Pro
2. Launch com.anthist.app
3. Get baseline performance metrics
4. Wait 30 seconds
5. Get metrics again and compare
6. Check for memory growth > 50MB
7. Verify FPS is at 60
8. Take screenshot
9. Get logs if any issues found
10. Provide a summary report
```

The AI will execute everything and give you a detailed report!

---

## You're Ready!

Start testing your Anthist app with AI-powered iOS simulator control. Happy testing! 🚀
