# Testing Workflow for Anthist iOS App

This guide provides step-by-step workflows for testing the Anthist app using the iOS Simulator MCP server.

---

## Table of Contents

1. [Quick Start Testing](#quick-start-testing)
2. [Performance Testing](#performance-testing)
3. [Share Extension Testing](#share-extension-testing)
4. [Memory Leak Detection](#memory-leak-detection)
5. [Cold Start Performance](#cold-start-performance)
6. [Automated Test Scripts](#automated-test-scripts)

---

## Quick Start Testing

### Basic App Launch Test

1. **List available simulators:**
   ```
   Use the list_simulators tool to see all available devices
   ```

2. **Boot a simulator:**
   ```
   Boot iPhone 15 Pro using boot_simulator
   ```

3. **Build and install the app:**
   ```bash
   # In the terminal
   cd /Volumes/makingthings/git-repos/feed
   npx expo run:ios --device "iPhone 15 Pro"
   ```

4. **Get performance baseline:**
   ```
   Get performance metrics for com.anthist.app on iPhone 15 Pro
   ```

5. **Take a screenshot:**
   ```
   Take a screenshot of iPhone 15 Pro
   ```

---

## Performance Testing

### CPU and Memory Monitoring

**Scenario:** Monitor app performance during normal usage

1. **Boot simulator and launch app:**
   ```
   - Boot iPhone 15 Pro
   - Launch com.anthist.app
   ```

2. **Collect baseline metrics:**
   ```
   Get performance metrics for com.anthist.app
   ```
   
   **Expected Results:**
   - CPU: < 10% when idle
   - Memory: 50-100 MB for initial load
   - FPS: 60

3. **Perform user actions** (manually):
   - Navigate to content list
   - Scroll through feed
   - Open an article
   - Navigate back

4. **Collect metrics after interaction:**
   ```
   Get performance metrics again
   ```
   
   **Expected Results:**
   - CPU: Should return to < 10% after interaction
   - Memory: Should not increase by more than 50 MB
   - FPS: Should maintain 60 during scrolling

5. **Document results:**
   ```
   Take screenshot and save with timestamp
   Get last 50 lines of logs
   ```

### FPS Monitoring During Animations

**Scenario:** Ensure smooth 60 FPS during swipe animations

1. **Launch app on iPhone 15 Pro**

2. **Navigate to the swipe feed**

3. **Collect metrics during swiping:**
   ```
   Get performance metrics every 2 seconds for 30 seconds
   ```

4. **Analyze results:**
   - FPS should stay at 60
   - CPU spikes during swipe are acceptable (< 80%)
   - Memory should remain stable

---

## Share Extension Testing

### Test Sharing from Safari

1. **Boot simulator:**
   ```
   Boot iPhone 15 Pro
   ```

2. **Install app with share extension:**
   ```bash
   npx expo run:ios --device "iPhone 15 Pro"
   ```

3. **Open Safari** (manually on simulator)

4. **Navigate to a blog post** (e.g., https://example.com/article)

5. **Test share flow:**
   - Tap Share button in Safari
   - Select "Anthist" from share sheet
   - Verify share extension appears
   - Confirm content is shared

6. **Check app group data:**
   ```
   Get app logs for com.anthist.app
   ```
   
   Look for:
   - Successful URL extraction
   - Content saved to app group
   - No errors in share extension

7. **Verify in main app:**
   - Open Anthist app
   - Check if shared content appears in processing queue
   - Confirm no data loss

### Share Extension Memory Testing

**Scenario:** Ensure share extension stays under 120MB memory limit

1. **Monitor memory before sharing:**
   ```
   Get performance metrics for com.anthist.app.ShareExtension
   ```

2. **Share multiple items** in quick succession

3. **Monitor memory after each share:**
   ```
   Get performance metrics continuously
   ```
   
   **Expected Results:**
   - Memory should not exceed 120 MB
   - Memory should be released after share completes

---

## Memory Leak Detection

### Long-Running Memory Test

**Scenario:** Detect memory leaks during extended app usage

1. **Setup:**
   ```
   - Boot iPhone 15 Pro
   - Launch com.anthist.app
   - Get initial memory baseline
   ```

2. **Perform repeated actions** (60 iterations):
   - Open article
   - Scroll content
   - Navigate back
   - Wait 1 second

3. **Monitor memory every 10 iterations:**
   ```
   Get performance metrics
   ```

4. **Analyze memory growth:**
   ```python
   # Example analysis
   initial_memory = 80 MB
   final_memory = 150 MB
   growth = final_memory - initial_memory
   
   if growth > 100 MB:
       print("⚠️ Potential memory leak detected")
   ```

5. **If leak detected:**
   ```
   - Take screenshot of memory graph
   - Get complete app logs
   - Use Xcode Instruments for detailed analysis
   ```

### Navigation Memory Test

**Scenario:** Ensure screens properly release memory when navigating away

1. **Test each screen:**
   - Home → Content List → Back
   - Home → Settings → Back
   - Home → Add Content → Back

2. **Monitor memory after each navigation:**
   ```
   Get performance metrics after returning to home
   ```

3. **Expected results:**
   - Memory should return close to baseline (within 10-20 MB)
   - No continuous upward trend

---

## Cold Start Performance

### App Launch Speed Test

**Scenario:** Measure time from tap to interactive

1. **Ensure app is not running:**
   ```
   Terminate com.anthist.app on iPhone 15 Pro
   ```

2. **Record start time** (note current time)

3. **Launch app:**
   ```
   Launch com.anthist.app
   ```

4. **Wait for app to be fully loaded**

5. **Calculate launch time:**
   ```
   Launch time = time until app is interactive
   ```
   
   **Target:** < 2 seconds on iPhone 15 Pro

6. **Get post-launch metrics:**
   ```
   Get performance metrics
   ```

7. **Analyze:**
   - Memory usage at launch
   - CPU usage during launch
   - Any errors in logs

### Repeated Launch Test

**Scenario:** Test launch performance consistency

1. **Perform 10 cold starts:**
   ```
   For i = 1 to 10:
     - Terminate app
     - Wait 2 seconds
     - Launch app
     - Record launch time
     - Get metrics
   ```

2. **Calculate statistics:**
   - Average launch time
   - Min/max launch time
   - Standard deviation

3. **Expected results:**
   - Average < 2 seconds
   - Consistent performance (low std deviation)
   - No increasing trend over iterations

---

## Automated Test Scripts

### Example: AI-Driven Test Flow

You can ask the AI to execute these workflows:

```
"Can you run a complete performance test on the Anthist app?

1. Boot iPhone 15 Pro
2. Launch the app
3. Get baseline performance metrics
4. Wait 30 seconds
5. Get metrics again
6. Take a screenshot
7. Get the last 100 lines of logs
8. Analyze if there are any performance issues"
```

### Example: Memory Leak Detection

```
"Test for memory leaks in the Anthist app:

1. Boot iPhone 15 Pro
2. Launch com.anthist.app
3. Get initial memory usage
4. Wait 60 seconds
5. Get memory usage again
6. Calculate memory growth
7. If growth > 50MB, investigate and get logs"
```

### Example: Share Extension Test

```
"Test the share extension:

1. Boot iPhone 15 Pro
2. Launch the app
3. Get logs related to 'ShareExtension'
4. Take a screenshot for documentation
5. Check for any errors in the share extension logs"
```

---

## Performance Benchmarks

### Target Metrics for Anthist App

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Cold Start | < 2s | < 3s | > 3s |
| Memory (Idle) | < 100 MB | < 150 MB | > 200 MB |
| CPU (Idle) | < 5% | < 10% | > 15% |
| FPS (Scrolling) | 60 | 55-60 | < 55 |
| Memory Growth (30 min) | < 50 MB | < 100 MB | > 150 MB |
| Share Extension Memory | < 80 MB | < 100 MB | > 120 MB |

### Device-Specific Targets

| Device | Min Target FPS | Max Launch Time |
|--------|----------------|-----------------|
| iPhone 15 Pro | 60 | 2s |
| iPhone 14 | 60 | 2.5s |
| iPhone 13 | 55 | 3s |
| iPhone 12 | 50 | 3.5s |

---

## Continuous Integration Testing

### CI/CD Integration

You can integrate these tests into your CI pipeline:

```yaml
# Example GitHub Actions workflow
name: iOS Performance Tests

on: [pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        
      - name: Install Dependencies
        run: |
          npm install
          cd mcp-servers/ios-simulator && npm install && npm run build
      
      - name: Boot Simulator
        run: xcrun simctl boot "iPhone 15 Pro"
      
      - name: Build App
        run: npx expo run:ios --device "iPhone 15 Pro"
      
      - name: Run Performance Tests
        run: node mcp-servers/ios-simulator/dist/index.js
        # Use MCP tools to test performance
      
      - name: Upload Screenshots
        uses: actions/upload-artifact@v2
        with:
          name: test-screenshots
          path: screenshots/
```

---

## Troubleshooting Common Issues

### High Memory Usage

**Symptoms:**
- Memory > 200 MB during normal usage
- Memory doesn't decrease after closing screens

**Investigation:**
1. Get detailed logs
2. Take screenshot of problematic screen
3. Check for:
   - Large images not being released
   - Event listeners not being removed
   - Timers not being cleared

### Low FPS

**Symptoms:**
- FPS < 55 during animations
- Janky scrolling

**Investigation:**
1. Check CPU usage during animation
2. Look for:
   - Heavy computation on UI thread
   - Too many re-renders
   - Large list without virtualization

### Slow Launch

**Symptoms:**
- Launch time > 3 seconds

**Investigation:**
1. Get logs from launch sequence
2. Check for:
   - Heavy initialization code
   - Synchronous API calls
   - Large assets being loaded upfront

---

## Best Practices

1. **Test on multiple devices** - Don't just test on the newest iPhone
2. **Test in different states** - Low battery, low storage, airplane mode
3. **Monitor over time** - Look for gradual performance degradation
4. **Automate repetitive tests** - Use the MCP tools to create test scripts
5. **Document results** - Take screenshots and save metrics for comparison
6. **Test share extension separately** - It has different memory constraints
7. **Test on macOS** - If supporting Mac Catalyst builds

---

## Report Template

When reporting performance issues:

```markdown
## Performance Issue Report

**Device:** iPhone 15 Pro
**iOS Version:** 17.0
**App Version:** 1.0.0
**Date:** 2026-02-03

### Issue Description
[Describe the performance problem]

### Reproduction Steps
1. Boot simulator
2. Launch app
3. [Specific steps to reproduce]

### Metrics
- CPU: XX%
- Memory: XXX MB
- FPS: XX

### Logs
[Paste relevant logs]

### Screenshots
[Attach screenshots]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]
```

---

## Summary

This workflow guide provides comprehensive testing strategies for the Anthist iOS app. Use the MCP server tools through Cursor's AI to automate these tests and maintain high performance standards throughout development.
