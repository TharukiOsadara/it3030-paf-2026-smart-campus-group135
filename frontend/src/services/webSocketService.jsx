// WebSocket service for real-time resource updates
// Connects to Spring Boot WebSocket endpoint

const WS_URL = "ws://localhost:8080/ws/resources";

/**
 * @typedef {Object} ResourceEvent
 * @property {string} type
 * @property {"CREATE" | "UPDATE" | "DELETE"} action
 * @property {number} resourceId
 * @property {string} resourceName
 * @property {string} resourceType
 * @property {string} location
 * @property {string} status
 * @property {number} timestamp
 * @property {string} message
 */

class WebSocketService {
  ws = null;
  url = WS_URL;
  listeners = [];
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;
  reconnectDelay = 3000;

  /**
   * Connect to WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected to", this.url);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const resourceEvent = JSON.parse(event.data);
            console.log("📨 Resource event received:", resourceEvent);
            // Notify all listeners
            this.listeners.forEach((listener) => listener(resourceEvent));
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("⚠️ WebSocket disconnected");
          this.attemptReconnect();
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      );

      setTimeout(() => {
        this.connect().catch(() => {
          // Continue attempting to reconnect
        });
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  /**
   * Subscribe to resource updates
   */
  subscribe(listener) {
    this.listeners.push(listener);
    console.log(`📌 Listener added. Total listeners: ${this.listeners.length}`);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
      console.log(
        `📌 Listener removed. Total listeners: ${this.listeners.length}`
      );
    };
  }

  /**
   * Send message to server
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.listeners = [];
      console.log("WebSocket disconnected");
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }
}

export default new WebSocketService();
