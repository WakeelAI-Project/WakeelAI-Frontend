/**
 * Assistant Service
 *
 * Wraps all AI assistant-related API calls.
 *
 * Backend status:
 *   POST /assistant/chat  — Backend endpoint not yet implemented
 *   GET  /assistant/thread — Backend endpoint not yet implemented
 */

import api from "../../../lib/api";

/**
 * Send a message to the AI assistant and receive a response.
 *
 * @param {{ message: string, threadId?: string }} payload
 * @returns {Promise<{ reply: string, citation?: string, confidence?: string }>}
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function sendAssistantMessage(payload) {
  // TODO: Uncomment when POST /assistant/chat is available.
  // const response = await api.post("/assistant/chat", payload);
  // return response.data;

  // ⚠️  Backend endpoint not implemented
  return null;
}

/**
 * Fetch the initial assistant thread / conversation history.
 *
 * @returns {Promise<Array>} Array of message objects
 *
 * @status BACKEND ENDPOINT NOT IMPLEMENTED
 */
export async function getAssistantThread() {
  // TODO: Uncomment when GET /assistant/thread is available.
  // const response = await api.get("/assistant/thread");
  // return response.data;

  // ⚠️  Backend endpoint not implemented — returning empty array
  return [];
}
