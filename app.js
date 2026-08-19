// Alias for hosts (e.g. Hostinger's Node.js App panel) that default their
// "Application startup file" field to app.js rather than reading it from
// package.json's start script. Delegates straight to server.js.
require("./server.js");
