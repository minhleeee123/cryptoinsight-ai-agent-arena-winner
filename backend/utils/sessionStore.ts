// Session ID management for multi-turn conversations
// IQ ADK uses .withQuickSession(sessionId) - we just track session IDs

// Store active session IDs per user
const userSessions = new Map<string, string>();

// Session cleanup after 1 hour of inactivity
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
const sessionTimestamps = new Map<string, number>();

/**
 * Get existing session ID or create new one for user
 */
export function getOrCreateSessionId(userId: string): string {
  // Update last activity timestamp
  sessionTimestamps.set(userId, Date.now());
  
  if (!userSessions.has(userId)) {
    const sessionId = `session-${userId}-${Date.now()}`;
    userSessions.set(userId, sessionId);
    console.log(`📝 Creating new session for user: ${userId} (ID: ${sessionId})`);
  } else {
    console.log(`♻️ Reusing existing session for user: ${userId} (ID: ${userSessions.get(userId)})`);
  }
  
  return userSessions.get(userId)!;
}

/**
 * Clear session for specific user
 */
export function clearSession(userId: string): void {
  if (userSessions.has(userId)) {
    userSessions.delete(userId);
    sessionTimestamps.delete(userId);
    console.log(`🗑️ Cleared session for user: ${userId}`);
  }
}

/**
 * Clear all sessions
 */
export function clearAllSessions(): void {
  const count = userSessions.size;
  userSessions.clear();
  sessionTimestamps.clear();
  console.log(`🗑️ Cleared all ${count} sessions`);
}

/**
 * Get session statistics
 */
export function getSessionStats() {
  return {
    activeSessions: userSessions.size,
    users: Array.from(userSessions.keys())
  };
}

/**
 * Auto-cleanup expired sessions
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [userId, timestamp] of sessionTimestamps.entries()) {
    if (now - timestamp > SESSION_TIMEOUT) {
      clearSession(userId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
  }
}

// Auto-cleanup every 15 minutes
setInterval(cleanupExpiredSessions, 15 * 60 * 1000);

// Log stats every 30 minutes
setInterval(() => {
  const stats = getSessionStats();
  console.log(`📊 Session Stats: ${stats.activeSessions} active sessions`);
}, 30 * 60 * 1000);
