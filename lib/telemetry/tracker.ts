import { amplifyClient } from '../amplify-client';

export interface EngagementData {
  timeSpent: number;
  scrollDepth: number;
  scrollSpeed: number;
  scrollPauses: number;
  videoPauses: number;
  videoSeeks: number;
  videoCompletionRate: number;
  touchCount: number;
  gyroVariance: number;
  focusLost: number;
}

interface ActiveSession {
  contentId: string;
  sessionId: string;
  startTime: number;
  lastUpdateTime: number;
  data: EngagementData;
}

// Debounce interval for sending updates
const UPDATE_INTERVAL_MS = 5000;

class TelemetryTracker {
  private activeSession: ActiveSession | null = null;
  private userId: string | null = null;
  private updateTimeout: ReturnType<typeof setTimeout> | null = null;
  private gyroReadings: number[] = [];

  setUserId(userId: string) {
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  startSession(contentId: string): string {
    // End any existing session first
    if (this.activeSession) {
      this.endSession('NEXT');
    }

    const sessionId = this.generateSessionId();
    
    this.activeSession = {
      contentId,
      sessionId,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      data: {
        timeSpent: 0,
        scrollDepth: 0,
        scrollSpeed: 0,
        scrollPauses: 0,
        videoPauses: 0,
        videoSeeks: 0,
        videoCompletionRate: 0,
        touchCount: 0,
        gyroVariance: 0,
        focusLost: 0,
      },
    };

    this.gyroReadings = [];
    this.scheduleUpdate();

    return sessionId;
  }

  updateScrollMetrics(depth: number, speed: number) {
    if (!this.activeSession) return;
    
    this.activeSession.data.scrollDepth = Math.max(
      this.activeSession.data.scrollDepth,
      depth
    );
    
    // Running average of scroll speed
    const currentSpeed = this.activeSession.data.scrollSpeed;
    this.activeSession.data.scrollSpeed = currentSpeed === 0 
      ? speed 
      : (currentSpeed * 0.8 + speed * 0.2);
  }

  recordScrollPause() {
    if (!this.activeSession) return;
    this.activeSession.data.scrollPauses++;
  }

  recordVideoPause() {
    if (!this.activeSession) return;
    this.activeSession.data.videoPauses++;
  }

  recordVideoSeek() {
    if (!this.activeSession) return;
    this.activeSession.data.videoSeeks++;
  }

  updateVideoCompletion(rate: number) {
    if (!this.activeSession) return;
    this.activeSession.data.videoCompletionRate = rate;
  }

  recordTouch() {
    if (!this.activeSession) return;
    this.activeSession.data.touchCount++;
  }

  recordGyro(x: number, y: number, z: number) {
    if (!this.activeSession) return;
    
    // Store magnitude of gyro reading
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    this.gyroReadings.push(magnitude);
    
    // Keep last 100 readings
    if (this.gyroReadings.length > 100) {
      this.gyroReadings.shift();
    }
    
    // Calculate variance
    if (this.gyroReadings.length > 1) {
      const mean = this.gyroReadings.reduce((a, b) => a + b, 0) / this.gyroReadings.length;
      const variance = this.gyroReadings.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.gyroReadings.length;
      this.activeSession.data.gyroVariance = variance;
    }
  }

  recordFocusLost() {
    if (!this.activeSession) return;
    this.activeSession.data.focusLost++;
  }

  private scheduleUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.sendUpdate();
      this.scheduleUpdate();
    }, UPDATE_INTERVAL_MS);
  }

  private async sendUpdate() {
    if (!this.activeSession || !this.userId) return;

    const now = Date.now();
    this.activeSession.data.timeSpent = now - this.activeSession.startTime;
    this.activeSession.lastUpdateTime = now;

    // Don't persist intermediate updates to DB, just log for now
    // Full engagement record is created on session end
    console.log('[Telemetry] Update:', {
      contentId: this.activeSession.contentId,
      timeSpent: this.activeSession.data.timeSpent,
      scrollDepth: this.activeSession.data.scrollDepth,
    });
  }

  async endSession(swipeDirection: 'NEXT' | 'BACK' | 'NONE'): Promise<void> {
    if (!this.activeSession || !this.userId) return;

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }

    // Capture all session data BEFORE any async operations to avoid race conditions
    // (startSession may be called during the await, which would clear activeSession)
    const session = this.activeSession;
    const userId = this.userId;
    const now = Date.now();
    const timeSpent = now - session.startTime;
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Capture engagement data
    const engagementData = {
      userId,
      contentId: session.contentId,
      sessionId: session.sessionId,
      timeSpent,
      timeOfDay: hour,
      dayOfWeek: day,
      scrollDepth: session.data.scrollDepth,
      scrollSpeed: session.data.scrollSpeed,
      scrollPauses: session.data.scrollPauses,
      videoPauses: session.data.videoPauses,
      videoSeeks: session.data.videoSeeks,
      videoCompletionRate: session.data.videoCompletionRate,
      touchCount: session.data.touchCount,
      gyroVariance: session.data.gyroVariance,
      focusLost: session.data.focusLost,
      swipeDirection,
      timestamp: new Date().toISOString(),
    };

    // Clear session state immediately to prevent duplicate endSession calls
    this.activeSession = null;
    this.gyroReadings = [];

    try {
      await amplifyClient.models.Engagement.create(engagementData);

      console.log('[Telemetry] Session ended:', {
        contentId: engagementData.contentId,
        timeSpent,
        swipeDirection,
      });
    } catch (error) {
      console.error('[Telemetry] Failed to save engagement:', error);
    }
  }

  getCurrentSessionData(): EngagementData | null {
    if (!this.activeSession) return null;
    
    return {
      ...this.activeSession.data,
      timeSpent: Date.now() - this.activeSession.startTime,
    };
  }
}

// Singleton instance
export const telemetryTracker = new TelemetryTracker();
