import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { appendFileSync, createWriteStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const API_MARKER = '>>> [API Error Debug] <<<';
const DIAGNOSTIC_LIMIT = 50;

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function unquoteEnvValue(value) {
  const trimmed = String(value || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }
  const result = {};
  try {
    const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      if (!line || /^\s*#/.test(line) || !line.includes('=')) {
        continue;
      }
      const pair = line.split(/=(.*)/s, 2);
      const key = String(pair[0] || '').trim();
      if (!key) {
        continue;
      }
      result[key] = unquoteEnvValue(pair[1] || '');
    }
  } catch (error) {}
  return result;
}

const envFileValues = loadEnvFile(join(repoRoot, '.env'));

function readSetting(name, fallback) {
  const raw = process.env[name] ?? envFileValues[name];
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  return fallback;
}

function readIntegerSetting(name, fallback) {
  const raw = readSetting(name, '');
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readListSetting(name) {
  const raw = readSetting(name, '');
  if (!raw) {
    return [];
  }
  return raw
    .split(/[,\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveSettingPath(name, fallback) {
  const raw = readSetting(name, '');
  return raw ? resolve(repoRoot, raw) : fallback;
}

function normalizeText(value) {
  return String(value || '').replace(/\\/g, '/').toLowerCase();
}

const helperConfig = {
  host: readSetting('COMMAND_CENTER_HELPER_HOST', '127.0.0.1'),
  port: readIntegerSetting('COMMAND_CENTER_HELPER_PORT', 3211),
  outputDir: resolveSettingPath('COMMAND_CENTER_OUTPUT_DIR', join(repoRoot, 'output', 'command-center')),
  allowedOrigins: readListSetting('COMMAND_CENTER_ALLOWED_ORIGINS'),
  mcpRoot: readSetting('COMMAND_CENTER_MCP_ROOT', '')
};

helperConfig.filesystemDir = readSetting(
  'COMMAND_CENTER_FILESYSTEM_DIR',
  helperConfig.mcpRoot ? join(helperConfig.mcpRoot, 'mcp-filesystem') : ''
);
helperConfig.filesystemTarget = readSetting('COMMAND_CENTER_FILESYSTEM_TARGET', repoRoot);
helperConfig.puppeteerDir = readSetting(
  'COMMAND_CENTER_PUPPETEER_DIR',
  helperConfig.mcpRoot ? join(helperConfig.mcpRoot, 'puppeteer') : ''
);
helperConfig.tencentcodeDir = readSetting(
  'COMMAND_CENTER_TENCENTCODE_DIR',
  helperConfig.mcpRoot ? join(helperConfig.mcpRoot, 'tencentcode-mcp') : ''
);

const HOST = helperConfig.host;
const PORT = helperConfig.port;
const outputRoot = helperConfig.outputDir;
const serviceLogDir = join(outputRoot, 'service-logs');
const diagnosticsLogFile = join(outputRoot, 'api-diagnostics.jsonl');

mkdirSync(serviceLogDir, { recursive: true });

function isLoopbackOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '[::1]' || url.hostname === '::1')
    );
  } catch (error) {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }
  if (helperConfig.allowedOrigins.length) {
    return helperConfig.allowedOrigins.includes(origin);
  }
  return isLoopbackOrigin(origin);
}

function createServiceDefinition(options) {
  const configured = !!(options.cwd && options.scriptPath && existsSync(options.scriptPath));
  return {
    id: options.id,
    name: options.name,
    cwd: configured ? options.cwd : null,
    path: options.cwd || '--',
    args: configured ? options.args : [],
    command: configured ? options.command : options.hint,
    configHint: options.hint,
    configured,
    matchers: configured ? [normalizeText(options.scriptPath)] : []
  };
}

function buildServiceDefinitions(config) {
  const filesystemScript = join(
    config.filesystemDir,
    'node_modules',
    '@modelcontextprotocol',
    'server-filesystem',
    'dist',
    'index.js'
  );
  const puppeteerScript = join(
    config.puppeteerDir,
    'node_modules',
    'puppeteer-real-browser-mcp-server',
    'dist',
    'index.js'
  );
  const tencentcodeScript = join(config.tencentcodeDir, 'dist', 'index.js');

  return {
    filesystem: createServiceDefinition({
      id: 'filesystem',
      name: 'Filesystem MCP',
      cwd: config.filesystemDir,
      scriptPath: filesystemScript,
      args: filesystemScript ? [filesystemScript, config.filesystemTarget] : [],
      command: 'node node_modules/@modelcontextprotocol/server-filesystem/dist/index.js ' + config.filesystemTarget,
      hint: 'Set COMMAND_CENTER_FILESYSTEM_DIR or COMMAND_CENTER_MCP_ROOT to enable this service.'
    }),
    puppeteer: createServiceDefinition({
      id: 'puppeteer',
      name: 'Puppeteer MCP',
      cwd: config.puppeteerDir,
      scriptPath: puppeteerScript,
      args: puppeteerScript ? [puppeteerScript] : [],
      command: 'node node_modules/puppeteer-real-browser-mcp-server/dist/index.js',
      hint: 'Set COMMAND_CENTER_PUPPETEER_DIR or COMMAND_CENTER_MCP_ROOT to enable this service.'
    }),
    tencentcode: createServiceDefinition({
      id: 'tencentcode',
      name: 'Tencent Code MCP',
      cwd: config.tencentcodeDir,
      scriptPath: tencentcodeScript,
      args: tencentcodeScript ? [tencentcodeScript] : [],
      command: 'node dist/index.js',
      hint: 'Set COMMAND_CENTER_TENCENTCODE_DIR or COMMAND_CENTER_MCP_ROOT to enable this service.'
    })
  };
}

const serviceDefinitions = buildServiceDefinitions(helperConfig);

const helperStartedAt = new Date().toISOString();
const managedChildren = new Map();
const streamState = new Map();
const diagnostics = loadDiagnostics();

function ensureService(id) {
  const service = serviceDefinitions[id];
  if (!service) {
    const error = new Error(`Unknown service: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return service;
}

function loadDiagnostics() {
  if (!existsSync(diagnosticsLogFile)) {
    return [];
  }
  try {
    return readFileSync(diagnosticsLogFile, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(-DIAGNOSTIC_LIMIT)
      .map((line) => JSON.parse(line));
  } catch (error) {
    return [];
  }
}

function pushDiagnostic(entry) {
  diagnostics.push(entry);
  while (diagnostics.length > DIAGNOSTIC_LIMIT) {
    diagnostics.shift();
  }
  appendFileSync(diagnosticsLogFile, `${JSON.stringify(entry)}\n`, 'utf8');
}

function attachServiceLogging(serviceId, child) {
  const logPath = join(serviceLogDir, `${serviceId}.log`);
  const logStream = createWriteStream(logPath, { flags: 'a' });
  const state = { buffer: '' };
  streamState.set(serviceId, state);

  const onChunk = (label) => (chunk) => {
    const text = chunk.toString('utf8');
    logStream.write(`[${new Date().toISOString()}] [${label}] ${text}`);
    if (serviceId === 'tencentcode') {
      state.buffer += text;
      consumeDiagnosticsBuffer(state);
    }
  };

  if (child.stdout) {
    child.stdout.on('data', onChunk('stdout'));
  }
  if (child.stderr) {
    child.stderr.on('data', onChunk('stderr'));
  }

  child.on('close', (code, signal) => {
    logStream.write(`[${new Date().toISOString()}] [system] exited code=${code} signal=${signal}\n`);
    logStream.end();
    if (managedChildren.get(serviceId)?.pid === child.pid) {
      managedChildren.delete(serviceId);
    }
  });
}

function consumeDiagnosticsBuffer(state) {
  while (true) {
    const markerIndex = state.buffer.indexOf(API_MARKER);
    if (markerIndex === -1) {
      if (state.buffer.length > 65536) {
        state.buffer = state.buffer.slice(-32768);
      }
      return;
    }

    const jsonStart = state.buffer.indexOf('{', markerIndex);
    if (jsonStart === -1) {
      state.buffer = state.buffer.slice(markerIndex);
      return;
    }

    const extraction = extractJsonObject(state.buffer.slice(jsonStart));
    if (!extraction) {
      state.buffer = state.buffer.slice(markerIndex);
      return;
    }

    const rawJson = extraction.raw;
    state.buffer = state.buffer.slice(jsonStart + extraction.endIndex);
    try {
      const payload = JSON.parse(rawJson);
      pushDiagnostic({
        ...payload,
        detectedAt: new Date().toISOString(),
        serviceId: 'tencentcode'
      });
    } catch (error) {}
  }
}

function extractJsonObject(text) {
  if (!text || text[0] !== '{') {
    return null;
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{') {
      depth += 1;
      continue;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          raw: text.slice(0, i + 1),
          endIndex: i + 1
        };
      }
    }
  }
  return null;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const spawnOptions = {
      windowsHide: true,
      cwd: options.cwd,
      env: options.env,
      stdio: options.stdio
    };
    const child = spawn(command, args, spawnOptions);
    let stdout = '';
    let stderr = '';
    const timeoutMs = options.timeoutMs || 10000;
    let settled = false;

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString('utf8');
      });
    }
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString('utf8');
      });
    }

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill();
      reject(new Error(`${command} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      reject(error);
    });

    child.on('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(stderr.trim() || stdout.trim() || `${command} exited with code ${code}`));
    });
  });
}

async function listNodeProcesses() {
  const script = `
$ErrorActionPreference = 'Stop'
$items = Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine } |
  Select-Object @{
      Name = 'pid'
      Expression = { $_.ProcessId }
    }, @{
      Name = 'createdAt'
      Expression = { ([DateTime]$_.CreationDate).ToString('o') }
    }, @{
      Name = 'commandLine'
      Expression = { $_.CommandLine }
    }
$items | ConvertTo-Json -Depth 3 -Compress
  `.trim();

  const { stdout } = await runCommand('powershell.exe', ['-NoProfile', '-Command', script]);
  if (!stdout.trim()) {
    return [];
  }
  const parsed = JSON.parse(stdout);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  return rows.map((row) => {
    const createdAt = row.createdAt || null;
    const timestamp = createdAt ? new Date(createdAt).getTime() : NaN;
    return {
      pid: Number(row.pid),
      commandLine: String(row.commandLine || ''),
      createdAt,
      uptimeMs: Number.isFinite(timestamp) ? Date.now() - timestamp : null
    };
  });
}

async function inspectServices() {
  const processes = await listNodeProcesses();
  return Object.values(serviceDefinitions).map((service) => {
    const matches = processes.filter((proc) => {
      const command = normalizeText(proc.commandLine);
      return service.matchers.some((matcher) => command.includes(matcher));
    });
    const managed = managedChildren.get(service.id);
    return {
      id: service.id,
      name: service.name,
      path: service.path,
      command: service.command,
      running: matches.length > 0,
      processCount: matches.length,
      managed: !!managed && matches.some((proc) => proc.pid === managed.pid),
      processes: matches
    };
  });
}

function fallbackServices(error) {
  return Object.values(serviceDefinitions).map((service) => ({
    id: service.id,
    name: service.name,
    path: service.path,
    command: service.command,
    configured: service.configured,
    running: false,
    processCount: 0,
    managed: false,
    processes: [],
    inspectionError: error.message || String(error)
  }));
}

async function inspectServicesSafe() {
  try {
    return {
      ok: true,
      services: await inspectServices(),
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      services: fallbackServices(error),
      error: error.message || String(error)
    };
  }
}

async function stopService(id) {
  ensureService(id);
  const services = await inspectServices();
  const snapshot = services.find((item) => item.id === id);
  const pids = (snapshot?.processes || []).map((proc) => proc.pid);
  if (!pids.length) {
    managedChildren.delete(id);
    return { ok: true, message: `${id} already stopped` };
  }

  for (const pid of pids) {
    await runCommand('taskkill.exe', ['/PID', String(pid), '/F', '/T'], { timeoutMs: 15000 });
  }

  managedChildren.delete(id);
  return { ok: true, message: `${id} stopped (${pids.join(', ')})` };
}

async function startService(id) {
  const service = ensureService(id);
  if (!service.configured) {
    throw new Error(service.configHint || `${id} is not configured`);
  }
  const services = await inspectServices();
  const snapshot = services.find((item) => item.id === id);
  if (snapshot?.running) {
    return { ok: true, message: `${id} already running` };
  }

  const child = spawn(process.execPath, service.args, {
    cwd: service.cwd,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true
  });

  managedChildren.set(id, child);
  attachServiceLogging(id, child);

  await waitForService(id, 4000);
  return { ok: true, message: `${id} started (PID ${child.pid})` };
}

async function restartService(id) {
  await stopService(id);
  return startService(id);
}

async function waitForService(id, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const services = await inspectServices();
    const snapshot = services.find((item) => item.id === id);
    if (snapshot?.running) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function writeJson(response, request, statusCode, payload) {
  const origin = request.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.statusCode = statusCode;
  response.end(JSON.stringify(payload));
}

async function buildSnapshot() {
  const inspection = await inspectServicesSafe();
  return {
    helper: {
      ok: true,
      pid: process.pid,
      startedAt: helperStartedAt,
      origin: `http://${HOST}:${PORT}`,
      socket: `ws://${HOST}:${PORT}/ws`,
      partial: !inspection.ok,
      warning: inspection.ok ? null : `Service inspection degraded: ${inspection.error}`,
      config: {
        ...helperConfig,
        allowedOrigins: helperConfig.allowedOrigins.length
          ? helperConfig.allowedOrigins.slice()
          : ['loopback origins only']
      }
    },
    services: inspection.services,
    diagnostics: diagnostics.slice(-10)
  };
}

function encodeWebSocketFrame(text) {
  const payload = Buffer.from(text);
  if (payload.length < 126) {
    return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  }
  if (payload.length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
    return Buffer.concat([header, payload]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(payload.length), 2);
  return Buffer.concat([header, payload]);
}

function decodeWebSocketFrame(buffer) {
  if (buffer.length < 2) {
    return null;
  }

  const first = buffer[0];
  const second = buffer[1];
  const opcode = first & 0x0f;
  const masked = (second & 0x80) === 0x80;
  let length = second & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < offset + 2) {
      return null;
    }
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (buffer.length < offset + 8) {
      return null;
    }
    length = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }

  let mask = null;
  if (masked) {
    if (buffer.length < offset + 4) {
      return null;
    }
    mask = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + length) {
    return null;
  }

  let payload = buffer.slice(offset, offset + length);
  if (mask) {
    const decoded = Buffer.alloc(length);
    for (let i = 0; i < length; i += 1) {
      decoded[i] = payload[i] ^ mask[i % 4];
    }
    payload = decoded;
  }

  return {
    opcode,
    payload,
    bytesConsumed: offset + length
  };
}

function sendWebSocketJson(socket, payload) {
  if (socket.destroyed) {
    return;
  }
  socket.write(encodeWebSocketFrame(JSON.stringify(payload)));
}

async function handleSocketMessage(socket, text) {
  let message;
  try {
    message = JSON.parse(text);
  } catch (error) {
    sendWebSocketJson(socket, { ok: false, error: 'Invalid JSON payload' });
    return;
  }

  const requestId = message.id || null;
  try {
    if (message.type === 'snapshot') {
      sendWebSocketJson(socket, {
        id: requestId,
        ok: true,
        data: await buildSnapshot()
      });
      return;
    }

    if (message.type === 'serviceAction') {
      const action = message.action;
      const serviceId = message.serviceId;
      let result;
      if (action === 'start') {
        result = await startService(serviceId);
      } else if (action === 'restart') {
        result = await restartService(serviceId);
      } else if (action === 'stop') {
        result = await stopService(serviceId);
      } else {
        throw new Error(`Unknown action: ${action}`);
      }
      sendWebSocketJson(socket, {
        id: requestId,
        ok: true,
        data: {
          result,
          snapshot: await buildSnapshot()
        }
      });
      return;
    }

    throw new Error(`Unknown message type: ${message.type}`);
  } catch (error) {
    sendWebSocketJson(socket, {
      id: requestId,
      ok: false,
      error: error.message || String(error)
    });
  }
}

function attachWebSocket(socket) {
  let buffer = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const frame = decodeWebSocketFrame(buffer);
      if (!frame) {
        return;
      }
      buffer = buffer.slice(frame.bytesConsumed);
      if (frame.opcode === 0x8) {
        socket.end();
        return;
      }
      if (frame.opcode === 0x1) {
        handleSocketMessage(socket, frame.payload.toString('utf8'));
      }
    }
  });

  socket.on('error', () => {});
}

async function handleRequest(request, response) {
  const url = new URL(request.url || '/', `http://${request.headers.host || `${HOST}:${PORT}`}`);

  if (request.method === 'OPTIONS') {
    writeJson(response, request, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    writeJson(response, request, 200, {
      ok: true,
      pid: process.pid,
      startedAt: helperStartedAt,
      socket: `ws://${HOST}:${PORT}/ws`,
      config: {
        ...helperConfig,
        allowedOrigins: helperConfig.allowedOrigins.length
          ? helperConfig.allowedOrigins.slice()
          : ['loopback origins only']
      }
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/snapshot') {
    writeJson(response, request, 200, await buildSnapshot());
    return;
  }

  const match = url.pathname.match(/^\/api\/services\/([^/]+)\/(start|restart|stop)$/);
  if (request.method === 'POST' && match) {
    const serviceId = decodeURIComponent(match[1]);
    const action = match[2];
    let result;
    if (action === 'start') {
      result = await startService(serviceId);
    } else if (action === 'restart') {
      result = await restartService(serviceId);
    } else {
      result = await stopService(serviceId);
    }
    writeJson(response, request, 200, result);
    return;
  }

  writeJson(response, request, 404, {
    ok: false,
    error: `Not found: ${url.pathname}`
  });
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    const statusCode = error.statusCode || 500;
    writeJson(response, request, statusCode, {
      ok: false,
      error: error.message || String(error)
    });
  });
});

server.on('upgrade', (request, socket) => {
  const origin = request.headers.origin;
  const url = new URL(request.url || '/', `http://${request.headers.host || `${HOST}:${PORT}`}`);
  if (url.pathname !== '/ws') {
    socket.destroy();
    return;
  }
  if (origin && !isAllowedOrigin(origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
    return;
  }

  const key = request.headers['sec-websocket-key'];
  if (!key) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }

  const accept = createHash('sha1').update(`${key}${WS_GUID}`).digest('base64');
  socket.write([
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '\r\n'
  ].join('\r\n'));
  attachWebSocket(socket);
});

server.listen(PORT, HOST, () => {
  console.log(`[command-center-helper] listening on http://${HOST}:${PORT}`);
});



