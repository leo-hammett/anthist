# iOS Simulator MCP Server

A Model Context Protocol (MCP) server for controlling iOS Simulators and testing app performance.

## Features

- **List Simulators**: Get all available iOS simulators with their status
- **Boot/Shutdown**: Control simulator lifecycle
- **App Management**: Install, launch, and uninstall apps
- **Performance Metrics**: Monitor CPU, memory, and battery usage
- **Screenshots**: Capture simulator screen
- **Logs**: Stream and retrieve app logs
- **Device Info**: Get detailed simulator information

## Installation

```bash
cd mcp-servers/ios-simulator
npm install
npm run build
```

## Usage

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "ios-simulator": {
      "command": "node",
      "args": ["/path/to/mcp-servers/ios-simulator/dist/index.js"]
    }
  }
}
```

## Available Tools

### 1. `list_simulators`
Lists all available iOS simulators.

**Returns:**
- Device name
- UDID
- Runtime (iOS version)
- State (Booted, Shutdown, etc.)
- Device type

**Example:**
```json
{
  "name": "list_simulators"
}
```

### 2. `boot_simulator`
Boots a specific iOS simulator.

**Parameters:**
- `udid` (required): Device UDID or device name

**Example:**
```json
{
  "name": "boot_simulator",
  "arguments": {
    "udid": "iPhone 15 Pro"
  }
}
```

### 3. `shutdown_simulator`
Shuts down a running simulator.

**Parameters:**
- `udid` (required): Device UDID or device name

### 4. `install_app`
Installs the app on a simulator.

**Parameters:**
- `udid` (required): Device UDID or device name
- `app_path` (required): Path to .app bundle

**Example:**
```json
{
  "name": "install_app",
  "arguments": {
    "udid": "iPhone 15 Pro",
    "app_path": "./ios/build/Build/Products/Debug-iphonesimulator/Anthist.app"
  }
}
```

### 5. `launch_app`
Launches the installed app.

**Parameters:**
- `udid` (required): Device UDID or device name
- `bundle_id` (required): App bundle identifier (e.g., com.anthist.app)

### 6. `get_performance_metrics`
Retrieves current performance metrics for the running app.

**Parameters:**
- `udid` (required): Device UDID or device name
- `bundle_id` (optional): App bundle identifier

**Returns:**
- CPU usage (%)
- Memory usage (MB)
- Battery level
- FPS (frames per second)
- Thermal state

### 7. `take_screenshot`
Captures a screenshot of the simulator.

**Parameters:**
- `udid` (required): Device UDID or device name
- `output_path` (optional): Where to save the screenshot

**Returns:**
- Path to saved screenshot
- Base64 encoded image data

### 8. `get_app_logs`
Retrieves app logs from the simulator.

**Parameters:**
- `udid` (required): Device UDID or device name
- `bundle_id` (required): App bundle identifier
- `lines` (optional): Number of recent log lines (default: 100)

**Returns:**
- Log entries with timestamps

### 9. `uninstall_app`
Uninstalls an app from the simulator.

**Parameters:**
- `udid` (required): Device UDID or device name
- `bundle_id` (required): App bundle identifier

### 10. `get_device_info`
Gets detailed information about a simulator.

**Parameters:**
- `udid` (required): Device UDID or device name

**Returns:**
- Device specifications
- Screen resolution
- iOS version
- Available storage

## Resources

### `simulator://status`
Provides real-time status of all simulators.

### `simulator://logs/{udid}`
Streams logs from a specific simulator.

## Requirements

- macOS with Xcode installed
- iOS Simulator tools available
- Node.js 18+

## Testing Your App

### Quick Start

1. **List available simulators:**
   ```bash
   # Tool: list_simulators
   ```

2. **Boot a simulator:**
   ```bash
   # Tool: boot_simulator with udid="iPhone 15 Pro"
   ```

3. **Build your app:**
   ```bash
   cd ios
   npx expo run:ios --device "iPhone 15 Pro"
   ```

4. **Monitor performance:**
   ```bash
   # Tool: get_performance_metrics with bundle_id="com.anthist.app"
   ```

### Performance Testing Workflow

```
1. Boot Simulator
   ↓
2. Install App
   ↓
3. Launch App
   ↓
4. Run test scenarios
   ↓
5. Collect metrics (CPU, Memory, FPS)
   ↓
6. Take screenshots
   ↓
7. Get logs
   ↓
8. Analyze results
```

## Common Use Cases

### App Launch Performance Test
```typescript
// 1. Cold start test
await bootSimulator('iPhone 15 Pro');
await installApp('./path/to/app');
const startTime = Date.now();
await launchApp('com.anthist.app');
const launchTime = Date.now() - startTime;

// 2. Get metrics after launch
const metrics = await getPerformanceMetrics('com.anthist.app');
console.log(`Launch time: ${launchTime}ms`);
console.log(`Memory usage: ${metrics.memory}MB`);
```

### Memory Leak Detection
```typescript
// Monitor memory over time
const samples = [];
for (let i = 0; i < 60; i++) {
  const metrics = await getPerformanceMetrics('com.anthist.app');
  samples.push({
    time: i,
    memory: metrics.memory
  });
  await sleep(1000); // Wait 1 second
}

// Analyze for memory growth
const memoryGrowth = samples[samples.length - 1].memory - samples[0].memory;
console.log(`Memory growth: ${memoryGrowth}MB over 60 seconds`);
```

### UI Responsiveness Test
```typescript
// Monitor FPS during interaction
const metrics = await getPerformanceMetrics('com.anthist.app');
if (metrics.fps < 55) {
  console.warn('UI performance issue detected: FPS below 55');
  await takeScreenshot('./debug-screenshot.png');
  const logs = await getAppLogs('com.anthist.app', { lines: 50 });
  console.log('Recent logs:', logs);
}
```

## Troubleshooting

### Simulator not found
Ensure the device name or UDID is correct. Use `list_simulators` to see all available devices.

### App installation fails
- Verify the .app bundle path is correct
- Check that the app was built for the simulator (not a real device)
- Ensure Xcode command line tools are installed

### Performance metrics unavailable
Some metrics require the app to be running. Launch the app first with `launch_app`.

## License

MIT
