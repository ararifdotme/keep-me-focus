/**
 * Alert Page Controller
 * 
 * Controller for the alert page that is displayed when a site is blocked or 
 * time-limited by the extension. Handles displaying appropriate messages,
 * countdown timers for time limits, and provides options to go back or
 * override the restriction if applicable.
 */

import "../styles/main.css";
import DOMPurify from 'dompurify';

/**
 * Initialize the alert page when DOM is loaded.
 * Processes URL parameters and displays appropriate alert message.
 */
window.addEventListener("DOMContentLoaded", () => {
  const messageElement = document.getElementById("alert-message");
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const currentUrl = urlParams.get("currentUrl");
  const ruleTitle = urlParams.get("ruleTitle");
  const allowedAt = urlParams.get("allowedAt");

  if (messageElement && type && currentUrl && ruleTitle) {
    let message = "";

    if (type === "block") {
      // Display block message with link to blocked site
      message = `Access to <a href="${currentUrl}" class="text-blue-600 hover:underline">${currentUrl}</a> is blocked by the rule: <b>${ruleTitle}</b>`;
      messageElement.innerHTML = DOMPurify.sanitize(message);
    } else if (type === "limit") {
      // Handle time limit scenario
      const allowedAtDate = allowedAt ? new Date(parseInt(allowedAt, 10)) : new Date();

      // Check if the allowed time is in the future
      const now = new Date();
      if (allowedAtDate.getTime() > now.getTime()) {
        // Start countdown timer
        startCountdown(allowedAtDate, currentUrl, ruleTitle);
      } else {
        // Time limit has expired, redirect to original URL
        window.location.href = currentUrl;
      }
    }
  }
});

/**
 * Format milliseconds into a human-readable countdown string.
 * @param milliseconds - Time remaining in milliseconds
 * @returns Formatted string (e.g., "1h 23m 45s")
 */
function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function startCountdown(allowedAtDate: Date, currentUrl: string, ruleTitle: string): void {
  const messageElement = document.getElementById("alert-message");
  if (!messageElement) return;

  const updateCountdown = () => {
    const now = new Date();
    const timeRemaining = allowedAtDate.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      // Time's up - allow access
      window.location.href = currentUrl;
      return;
    }

    const formattedAllowedAt = allowedAtDate.toLocaleTimeString();
    const countdown = formatCountdown(timeRemaining);

    messageElement.innerHTML = DOMPurify.sanitize(`
      Access to <a href="${currentUrl}" class="text-blue-600 hover:underline">${currentUrl}</a> is limited by the rule: <b>${ruleTitle}</b>. 
      <br><br>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
        <div class="text-sm text-blue-700 mb-2">You can access it at ${formattedAllowedAt}</div>
        <div class="text-2xl font-bold text-blue-800">
          <span class="inline-block bg-blue-100 px-3 py-2 rounded-lg">${countdown}</span>
        </div>
        <div class="text-xs text-blue-600 mt-2">Time remaining</div>
      </div>
    `);

    setTimeout(updateCountdown, 1000);
  };

  updateCountdown();
}