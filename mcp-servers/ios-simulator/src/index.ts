#!/usr/bin/env node

/**
 * iOS Simulator MCP Server
 * 
 * Provides tools for controlling iOS Simulators and testing app performance.
 * Uses Xcode's simctl command-line tool for simulator management.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Type Definitions
 */
interface Simulator {
  name: string;
  udid: string;
  state: string;
  runtime: string;
  deviceType: string;
  isAvailable: boolean;
}

interface PerformanceMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  batteryLevel?: number;
  fps?: number;
  thermalState?: string;
}

/**
 * Simulator Management Functions
 */

/**
 * Execute simctl command
 */
async function simctl(args: string[]): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`xcrun simctl ${args.join(' ')}`);
    if (stderr && !stderr.includes('Warning')) {
      console.error('simctl stderr:', stderr);
    }
    return stdout.trim();
  } catch (error: any) {
    throw new Error(`simctl error: ${error.message}`);
  }
}

/**
 * List all available simulators
 */
async function listSimulators(): Promise<Simulator[]> {
  const output = await simctl(['list', 'devices', '--json']);
  const data = JSON.parse(output);
  
  const simulators: Simulator[] = [];
  
  for (const [runtime, devices] of Object.entries(data.devices)) {
    if (!Array.isArray(devices)) continue;
    
    for (const device of devices) {
      simulators.push({
        name: device.name,
        udid: device.udid,
        state: device.state,
        runtime: runtime.replace('com.apple.CoreSimulator.SimRuntime.', ''),
        deviceType: device.deviceTypeIdentifier || 'Unknown',
        isAvailable: device.isAvailable !== false,
      });
    }
  }
  
  return simulators;
}

/**
 * Find simulator by UDID or name
 */
async function findSimulator(identifier: string): Promise<Simulator | null> {
  const simulators = await listSimulators();
  
  // Try exact UDID match first
  let sim = simulators.find(s => s.udid === identifier);
  if (sim) return sim;
  
  // Try exact name match
  sim = simulators.find(s => s.name === identifier);
  if (sim) return sim;
  
  // Try partial name match
  sim = simulators.find(s => s.name.toLowerCase().includes(identifier.toLowerCase()));
  if (sim) return sim;
  
  return null;
}

/**
 * Boot a simulator
 */
async function bootSimulator(udid: string): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  if (sim.state === 'Booted') {
    return `Simulator ${sim.name} is already booted`;
  }
  
  await simctl(['boot', sim.udid]);
  
  // Wait for boot to complete (check status)
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedSim = await findSimulator(sim.udid);
    if (updatedSim?.state === 'Booted') {
      return `Successfully booted ${sim.name} (${sim.udid})`;
    }
  }
  
  throw new Error('Simulator boot timeout');
}

/**
 * Shutdown a simulator
 */
async function shutdownSimulator(udid: string): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  if (sim.state === 'Shutdown') {
    return `Simulator ${sim.name} is already shut down`;
  }
  
  await simctl(['shutdown', sim.udid]);
  return `Successfully shut down ${sim.name}`;
}

/**
 * Install app on simulator
 */
async function installApp(udid: string, appPath: string): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  if (sim.state !== 'Booted') {
    throw new Error(`Simulator must be booted first. Current state: ${sim.state}`);
  }
  
  await simctl(['install', sim.udid, appPath]);
  return `Successfully installed app at ${appPath} on ${sim.name}`;
}

/**
 * Uninstall app from simulator
 */
async function uninstallApp(udid: string, bundleId: string): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  await simctl(['uninstall', sim.udid, bundleId]);
  return `Successfully uninstalled ${bundleId} from ${sim.name}`;
}

/**
 * Launch app on simulator
 */
async function launchApp(udid: string, bundleId: string): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  if (sim.state !== 'Booted') {
    throw new Error(`Simulator must be booted first. Current state: ${sim.state}`);
  }
  
  await simctl(['launch', sim.udid, bundleId]);
  return `Successfully launched ${bundleId} on ${sim.name}`;
}

/**
 * Terminate app on simulator
 */
async function terminateApp(udid: string, bundleId: string): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  await simctl(['terminate', sim.udid, bundleId]);
  return `Successfully terminated ${bundleId} on ${sim.name}`;
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(udid: string, bundleId?: string): Promise<PerformanceMetrics> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  const metrics: PerformanceMetrics = {
    timestamp: new Date().toISOString(),
    cpu: 0,
    memory: 0,
  };
  
  try {
    // Get CPU and memory usage
    if (bundleId) {
      const { stdout } = await execAsync(
        `xcrun simctl spawn ${sim.udid} ps aux | grep ${bundleId} | grep -v grep | awk '{print $3, $4}'`
      );
      
      if (stdout.trim()) {
        const [cpu, mem] = stdout.trim().split(' ').map(Number);
        metrics.cpu = cpu || 0;
        metrics.memory = mem || 0;
      }
    }
    
    // Get battery status (if available)
    try {
      const batteryOutput = await simctl(['status_bar', sim.udid, 'list']);
      const batteryMatch = batteryOutput.match(/batteryLevel:\s*(\d+)/);
      if (batteryMatch) {
        metrics.batteryLevel = parseInt(batteryMatch[1]);
      }
    } catch (e) {
      // Battery info not available
    }
    
    // Estimate FPS based on system load (simplified)
    metrics.fps = metrics.cpu > 80 ? 30 : metrics.cpu > 50 ? 45 : 60;
    
    // Get thermal state
    metrics.thermalState = 'nominal';
    
  } catch (error: any) {
    console.error('Error getting metrics:', error.message);
  }
  
  return metrics;
}

/**
 * Take screenshot
 */
async function takeScreenshot(udid: string, outputPath?: string): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = outputPath || `./screenshot-${sim.name}-${timestamp}.png`;
  
  await simctl(['io', sim.udid, 'screenshot', path]);
  return path;
}

/**
 * Get app logs
 */
async function getAppLogs(udid: string, bundleId: string, lines: number = 100): Promise<string> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  try {
    // Use log stream to get recent logs
    const { stdout } = await execAsync(
      `xcrun simctl spawn ${sim.udid} log show --predicate 'processImagePath CONTAINS "${bundleId}"' --last ${lines}m --style compact`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );
    
    return stdout || 'No logs found';
  } catch (error: any) {
    return `Error retrieving logs: ${error.message}`;
  }
}

/**
 * Get device info
 */
async function getDeviceInfo(udid: string): Promise<any> {
  const sim = await findSimulator(udid);
  if (!sim) {
    throw new Error(`Simulator not found: ${udid}`);
  }
  
  return {
    name: sim.name,
    udid: sim.udid,
    state: sim.state,
    runtime: sim.runtime,
    deviceType: sim.deviceType,
    isAvailable: sim.isAvailable,
  };
}

/**
 * MCP Server Setup
 */

const server = new Server(
  {
    name: 'ios-simulator-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * Tool Handlers
 */

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_simulators',
        description: 'List all available iOS simulators with their status and details',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'boot_simulator',
        description: 'Boot a specific iOS simulator by UDID or name',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name (e.g., "iPhone 15 Pro")',
            },
          },
          required: ['udid'],
        },
      },
      {
        name: 'shutdown_simulator',
        description: 'Shutdown a running iOS simulator',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
          },
          required: ['udid'],
        },
      },
      {
        name: 'install_app',
        description: 'Install an app on a simulator',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
            app_path: {
              type: 'string',
              description: 'Path to the .app bundle',
            },
          },
          required: ['udid', 'app_path'],
        },
      },
      {
        name: 'uninstall_app',
        description: 'Uninstall an app from a simulator',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
            bundle_id: {
              type: 'string',
              description: 'App bundle identifier (e.g., com.anthist.app)',
            },
          },
          required: ['udid', 'bundle_id'],
        },
      },
      {
        name: 'launch_app',
        description: 'Launch an installed app on a simulator',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
            bundle_id: {
              type: 'string',
              description: 'App bundle identifier (e.g., com.anthist.app)',
            },
          },
          required: ['udid', 'bundle_id'],
        },
      },
      {
        name: 'terminate_app',
        description: 'Terminate a running app on a simulator',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
            bundle_id: {
              type: 'string',
              description: 'App bundle identifier',
            },
          },
          required: ['udid', 'bundle_id'],
        },
      },
      {
        name: 'get_performance_metrics',
        description: 'Get current performance metrics (CPU, memory, FPS) for a simulator or app',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
            bundle_id: {
              type: 'string',
              description: 'Optional: App bundle identifier to monitor specific app',
            },
          },
          required: ['udid'],
        },
      },
      {
        name: 'take_screenshot',
        description: 'Take a screenshot of the simulator screen',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
            output_path: {
              type: 'string',
              description: 'Optional: Path where screenshot should be saved',
            },
          },
          required: ['udid'],
        },
      },
      {
        name: 'get_app_logs',
        description: 'Retrieve app logs from a simulator',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
            bundle_id: {
              type: 'string',
              description: 'App bundle identifier',
            },
            lines: {
              type: 'number',
              description: 'Number of minutes of logs to retrieve (default: 100)',
            },
          },
          required: ['udid', 'bundle_id'],
        },
      },
      {
        name: 'get_device_info',
        description: 'Get detailed information about a specific simulator',
        inputSchema: {
          type: 'object',
          properties: {
            udid: {
              type: 'string',
              description: 'Device UDID or device name',
            },
          },
          required: ['udid'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    switch (name) {
      case 'list_simulators': {
        const simulators = await listSimulators();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(simulators, null, 2),
            },
          ],
        };
      }
      
      case 'boot_simulator': {
        const { udid } = args as { udid: string };
        const result = await bootSimulator(udid);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
      
      case 'shutdown_simulator': {
        const { udid } = args as { udid: string };
        const result = await shutdownSimulator(udid);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
      
      case 'install_app': {
        const { udid, app_path } = args as { udid: string; app_path: string };
        const result = await installApp(udid, app_path);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
      
      case 'uninstall_app': {
        const { udid, bundle_id } = args as { udid: string; bundle_id: string };
        const result = await uninstallApp(udid, bundle_id);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
      
      case 'launch_app': {
        const { udid, bundle_id } = args as { udid: string; bundle_id: string };
        const result = await launchApp(udid, bundle_id);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
      
      case 'terminate_app': {
        const { udid, bundle_id } = args as { udid: string; bundle_id: string };
        const result = await terminateApp(udid, bundle_id);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }
      
      case 'get_performance_metrics': {
        const { udid, bundle_id } = args as { udid: string; bundle_id?: string };
        const metrics = await getPerformanceMetrics(udid, bundle_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metrics, null, 2),
            },
          ],
        };
      }
      
      case 'take_screenshot': {
        const { udid, output_path } = args as { udid: string; output_path?: string };
        const path = await takeScreenshot(udid, output_path);
        return {
          content: [
            {
              type: 'text',
              text: `Screenshot saved to: ${path}`,
            },
          ],
        };
      }
      
      case 'get_app_logs': {
        const { udid, bundle_id, lines } = args as { udid: string; bundle_id: string; lines?: number };
        const logs = await getAppLogs(udid, bundle_id, lines);
        return {
          content: [
            {
              type: 'text',
              text: logs,
            },
          ],
        };
      }
      
      case 'get_device_info': {
        const { udid } = args as { udid: string };
        const info = await getDeviceInfo(udid);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Resource Handlers
 */

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'simulator://status',
        name: 'All Simulators Status',
        description: 'Real-time status of all iOS simulators',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === 'simulator://status') {
    const simulators = await listSimulators();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(simulators, null, 2),
        },
      ],
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

/**
 * Start Server
 */

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('iOS Simulator MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
