const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const root = __dirname;
const rooms = new Map();

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filePath = path.join(root, url.pathname === "/" ? "index.html" : url.pathname);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.on("upgrade", (req, socket) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  const key = req.headers["sec-websocket-key"];
  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    ""
  ].join("\r\n"));

  const roomId = url.searchParams.get("room") || "room1";
  const role = url.searchParams.get("role") || "join";
  const room = rooms.get(roomId) || new Set();
  rooms.set(roomId, room);
  socket.roomId = roomId;
  socket.role = role;
  room.add(socket);

  socket.on("data", (buffer) => {
    const message = decodeFrame(buffer);
    if (!message) return;
    for (const client of room) {
      if (client !== socket && !client.destroyed) client.write(encodeFrame(message));
    }
  });

  socket.on("close", () => leave(socket));
  socket.on("error", () => leave(socket));
});

function leave(socket) {
  const room = rooms.get(socket.roomId);
  if (!room) return;
  room.delete(socket);
  if (room.size === 0) rooms.delete(socket.roomId);
}

function decodeFrame(buffer) {
  const second = buffer[1];
  if (second === undefined) return "";
  let length = second & 127;
  let offset = 2;

  if (length === 126) {
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    length = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }

  const mask = buffer.slice(offset, offset + 4);
  offset += 4;
  const payload = buffer.slice(offset, offset + length);
  for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
  return payload.toString("utf8");
}

function encodeFrame(message) {
  const payload = Buffer.from(message);
  if (payload.length < 126) {
    return Buffer.concat([Buffer.from([129, payload.length]), payload]);
  }
  const header = Buffer.alloc(4);
  header[0] = 129;
  header[1] = 126;
  header.writeUInt16BE(payload.length, 2);
  return Buffer.concat([header, payload]);
}

server.listen(port, "0.0.0.0", () => {
  console.log(`LAN game server: http://localhost:${port}`);
});
