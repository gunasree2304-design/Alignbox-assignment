const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

let username = prompt("Enter your name:") || "Anonymous";
console.log(`🔍 Username set: ${username}`); 


socket.on("connect", () => {
  console.log("🔌 Socket connected successfully"); 
});
socket.on("disconnect", () => {
  console.log("🔌 Socket disconnected");
});


fetch("/messages")
  .then(res => res.json())
  .then(data => {
    console.log("📥 Old messages loaded:", data); 
    if (data.error) {
      console.error("❌ Failed to load old messages:", data.error);
      return;
    }
    if (Array.isArray(data)) {
      data.forEach(msg => appendMessage(msg.sender, msg.message));
    }
  })
  .catch(err => console.error("❌ Fetch error:", err));


form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;

  console.log(`📤 Sending message: ${username}: ${msg}`); 

  
  appendMessage(username, msg);

 
  socket.emit("sendMessage", { sender: username, message: msg });
  input.value = "";
});


socket.on("receiveMessage", ({ sender, message }) => {
  console.log(`📨 Received message: ${sender}: ${message} (my username: ${username})`); 

 
    appendMessage(sender, message);
 
});


function appendMessage(sender, message) {
  console.log(`➕ Appending: ${sender}: ${message}`);
  const li = document.createElement("li");
  li.textContent = `${sender}: ${message}`;
  li.className = sender === username ? "self" : "other"; 
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight; 
}


document.getElementById("imageBtn")?.addEventListener("click", () => {
  console.log("📷 Image button clicked");
});
document.getElementById("fileBtn")?.addEventListener("click", () => {
  console.log("📎 File button clicked");

});
