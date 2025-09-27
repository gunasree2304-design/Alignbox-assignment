const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

let username = prompt("Enter your name:") || "Anonymous";
console.log(`🔍 Username set: ${username}`); // Debug: Confirm username

// Test Socket connection
socket.on("connect", () => {
  console.log("🔌 Socket connected successfully"); // Should log on page load
});
socket.on("disconnect", () => {
  console.log("🔌 Socket disconnected"); // If this logs, connection issue
});

// Load old messages from DB
fetch("/messages")
  .then(res => res.json())
  .then(data => {
    console.log("📥 Old messages loaded:", data); // Debug: See what DB returns
    if (data.error) {
      console.error("❌ Failed to load old messages:", data.error);
      return;
    }
    if (Array.isArray(data)) {
      data.forEach(msg => appendMessage(msg.sender, msg.message));
    }
  })
  .catch(err => console.error("❌ Fetch error:", err));

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;

  console.log(`📤 Sending message: ${username}: ${msg}`); // Debug: Confirm send

  // Append locally immediately (for sender feedback)
  appendMessage(username, msg);

  // Send to server (will broadcast to others)
  socket.emit("sendMessage", { sender: username, message: msg });
  input.value = "";
});

// Receive messages from server (for other users)
socket.on("receiveMessage", ({ sender, message }) => {
  console.log(`📨 Received message: ${sender}: ${message} (my username: ${username})`); // Debug: See incoming

  // TEMPORARILY DISABLE SELF-CHECK FOR TESTING (comment out the if below to always append)
  // if (sender !== username) {  // Re-enable this after fixing
    appendMessage(sender, message);
  // }
});

// Function to append a message to the chat
function appendMessage(sender, message) {
  console.log(`➕ Appending: ${sender}: ${message}`); // Debug: Confirm append
  const li = document.createElement("li");
  li.textContent = `${sender}: ${message}`; // Includes sender name
  li.className = sender === username ? "self" : "other"; // Correct class names
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight; // Auto-scroll to bottom
}

// Optional: Handle extra buttons (for future features)
document.getElementById("imageBtn")?.addEventListener("click", () => {
  console.log("📷 Image button clicked");
});
document.getElementById("fileBtn")?.addEventListener("click", () => {
  console.log("📎 File button clicked");
});