(function () {
  var GATEWAY_TOKEN_KEY = 'mission-control.gateway-token';
  var HELPER_BASE_KEY = 'command-center.helper-base';
  var DEFAULT_HELPER_PORT = '3211';
  var REFRESH_MS = 30000;

  var refs = {
    refreshButton: document.getElementById('refreshBtn'),
    saveTokenButton: document.getElementById('saveTokenBtn'),
    connectButton: document.getElementById('connectBtn'),
    tokenInput: document.getElementById('gatewayTokenInput'),
    gatewayStatus: document.getElementById('gatewayStatus'),
    generatedAt: document.getElementById('generatedAt'),
    summaryStatus: document.getElementById('summaryStatus'),
    gatewayBadge: document.getElementById('gatewayBadge'),
    helperBadge: document.getElementById('helperBadge'),
    helperBaseBadge: document.getElementById('helperBaseBadge'),
    healthGrid: document.getElementById('healthGrid'),
    sessionSummary: document.getElementById('sessionSummary'),
    sessionList: document.getElementById('sessionList'),
    usageSummary: document.getElementById('usageSummary'),
    usageList: document.getElementById('usageList'),
    serviceSummary: document.getElementById('serviceSummary'),
    serviceList: document.getElementById('serviceList'),
    rawData: document.getElementById('rawData'),
    gatewayApp: document.getElementById('overviewGatewayApp')
  };

  var state = {
    helperBase: loadHelperBase(),
    health: null,
    gatewayConnected: false,
    gatewayError: null,
    sessions: [],
    currentSession: null,
    usageDaily: [],
    usageSessions: [],
    lastUsage: null,
    helperSnapshot: {
      helper: { ok: false, error: 'not-loaded' },
      services: [],
      diagnostics: []
    },
    updatedAt: null,
    refreshTimer: null
  };

  function defaultHelperBase() {
    var host = '127.0.0.1';
    try {
      if (window.location && window.location.hostname) {
        host = window.location.hostname;
      }
    } catch (error) {}
    return 'ws://' + host + ':' + DEFAULT_HELPER_PORT + '/ws';
  }

  function loadHelperBase() {
    try {
      return localStorage.getItem(HELPER_BASE_KEY) || defaultHelperBase();
    } catch (error) {
      return defaultHelperBase();
    }
  }

  function getStoredToken() {
    try {
      return localStorage.getItem(GATEWAY_TOKEN_KEY) || '';
    } catch (error) {
      return '';
    }
  }

  function setStoredToken(token) {
    try {
      if (token) {
        localStorage.setItem(GATEWAY_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(GATEWAY_TOKEN_KEY);
      }
    } catch (error) {}
  }

  function deriveDefaultWsUrl() {
    var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return protocol + '//' + window.location.host;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function toNumber(value) {
    if (typeof value === 'number' && isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      var parsed = Number(value);
      if (isFinite(parsed)) {
        return parsed;
      }
    }
    return null;
  }

  function formatCompact(value) {
    var numeric = toNumber(value);
    if (numeric == null) {
      return '--';
    }
    if (numeric >= 1000000) {
      return (numeric / 1000000).toFixed(2) + 'M';
    }
    if (numeric >= 1000) {
      return (numeric / 1000).toFixed(1) + 'K';
    }
    return String(Math.round(numeric));
  }

  function formatUsd(value) {
    var numeric = toNumber(value);
    if (numeric == null) {
      return '--';
    }
    if (!numeric) {
      return '$0.00';
    }
    if (numeric >= 10) {
      return '$' + numeric.toFixed(2);
    }
    return '$' + numeric.toFixed(3);
  }

  function formatPercent(value) {
    var numeric = toNumber(value);
    if (numeric == null) {
      return '--';
    }
    return Math.round(numeric) + '%';
  }

  function formatTime(value) {
    if (!value) {
      return '--';
    }
    var date = new Date(value);
    if (!isFinite(date.getTime())) {
      return '--';
    }
    return date.toLocaleString('zh-CN', { hour12: false });
  }

  function formatRelative(value) {
    if (!value) {
      return '--';
    }
    var timestamp = new Date(value).getTime();
    if (!isFinite(timestamp)) {
      return '--';
    }
    var diff = Date.now() - timestamp;
    if (diff < 60000) {
      return '刚刚';
    }
    if (diff < 3600000) {
      return Math.round(diff / 60000) + ' 分钟前';
    }
    if (diff < 86400000) {
      return Math.round(diff / 3600000) + ' 小时前';
    }
    return Math.round(diff / 86400000) + ' 天前';
  }

  function formatDayLabel(value) {
    if (!value) {
      return '--';
    }
    var date = new Date(value);
    if (isFinite(date.getTime())) {
      return String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }
    if (typeof value === 'string') {
      return value.slice(-5);
    }
    return '--';
  }

  function valueFromKeys(source, keys) {
    var index;
    for (index = 0; index < keys.length; index += 1) {
      var raw = source && source[keys[index]];
      var numeric = toNumber(raw);
      if (numeric != null) {
        return numeric;
      }
      if (typeof raw === 'string' && raw) {
        return raw;
      }
    }
    return null;
  }

  function textFromKeys(source, keys) {
    var index;
    for (index = 0; index < keys.length; index += 1) {
      var raw = source && source[keys[index]];
      if (typeof raw === 'string' && raw.trim()) {
        return raw.trim();
      }
    }
    return '';
  }

  function getSessionUpdatedAt(session) {
    if (!session) {
      return 0;
    }
    var raw = session.updatedAtMs || session.updatedAt || session.lastActivityAt || session.lastMessageAt || session.startedAt || 0;
    if (typeof raw === 'number' && isFinite(raw)) {
      return raw;
    }
    var parsed = new Date(raw).getTime();
    return isFinite(parsed) ? parsed : 0;
  }

  function sortSessionsByActivity(sessions) {
    return (Array.isArray(sessions) ? sessions.slice() : []).sort(function (left, right) {
      return getSessionUpdatedAt(right) - getSessionUpdatedAt(left);
    });
  }

  function normalizeModelValue(provider, model) {
    if (provider && model) {
      return provider + '/' + model;
    }
    return model || '';
  }

  function getCurrentSessionKey(app) {
    var rawKey = (app && app.sessionKey) || '';
    if (!rawKey) {
      return state.sessions[0] ? state.sessions[0].key : '';
    }
    if (/^agent:/.test(rawKey)) {
      return rawKey;
    }
    if (rawKey === 'main') {
      var match;
      for (match = 0; match < state.sessions.length; match += 1) {
        if (state.sessions[match].key === 'agent:main:main') {
          return state.sessions[match].key;
        }
      }
    }
    var index;
    for (index = 0; index < state.sessions.length; index += 1) {
      if (
        state.sessions[index].key === rawKey ||
        state.sessions[index].key.slice(-rawKey.length - 1) === ':' + rawKey
      ) {
        return state.sessions[index].key;
      }
    }
    return rawKey;
  }

  function getCurrentSession(app) {
    var currentKey = getCurrentSessionKey(app);
    var index;
    for (index = 0; index < state.sessions.length; index += 1) {
      if (state.sessions[index].key === currentKey) {
        return state.sessions[index];
      }
    }
    return state.sessions[0] || null;
  }

  function getDailyUsage(app) {
    if (app && app.usageCostSummary && Array.isArray(app.usageCostSummary.daily)) {
      return app.usageCostSummary.daily.slice();
    }
    if (app && app.usageResult && app.usageResult.aggregates && Array.isArray(app.usageResult.aggregates.daily)) {
      return app.usageResult.aggregates.daily.slice();
    }
    return [];
  }

  function getRecentUsageSessions(app) {
    if (app && Array.isArray(app.usageRecentSessions)) {
      return app.usageRecentSessions.slice();
    }
    if (app && app.usageResult && Array.isArray(app.usageResult.recentSessions)) {
      return app.usageResult.recentSessions.slice();
    }
    if (app && app.usageResult && app.usageResult.aggregates && Array.isArray(app.usageResult.aggregates.sessions)) {
      return app.usageResult.aggregates.sessions.slice();
    }
    if (app && app.usageCostSummary && Array.isArray(app.usageCostSummary.sessions)) {
      return app.usageCostSummary.sessions.slice();
    }
    return [];
  }

  function getLastAssistantUsage(app) {
    var messages = app && Array.isArray(app.chatMessages) ? app.chatMessages : [];
    var index;
    for (index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index] && messages[index].role === 'assistant' && messages[index].usage) {
        return messages[index].usage;
      }
    }
    return null;
  }

  function getHelperSocketUrl() {
    var base = state.helperBase || defaultHelperBase();
    if (/^https?:/i.test(base)) {
      base = base.replace(/^http/i, 'ws');
    }
    if (!/\/ws(?:$|\?)/.test(base)) {
      base = base.replace(/\/+$/, '') + '/ws';
    }
    return base;
  }

  function callHelper(message) {
    return new Promise(function (resolve, reject) {
      var settled = false;
      var socket = null;
      var timer = window.setTimeout(function () {
        if (settled) {
          return;
        }
        settled = true;
        if (socket) {
          socket.close();
        }
        reject(new Error('Helper socket timeout'));
      }, 4500);

      function finishError(error) {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      }

      function finishSuccess(value) {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        resolve(value);
      }

      try {
        socket = new WebSocket(getHelperSocketUrl());
      } catch (error) {
        finishError(error);
        return;
      }

      socket.addEventListener('open', function () {
        socket.send(JSON.stringify(message));
      });

      socket.addEventListener('message', function (event) {
        try {
          var payload = JSON.parse(event.data);
          if (!payload || payload.ok === false) {
            throw new Error((payload && payload.error) || 'Helper request failed');
          }
          finishSuccess(payload.data);
        } catch (error) {
          finishError(error);
        } finally {
          socket.close();
        }
      });

      socket.addEventListener('error', function () {
        finishError(new Error('Helper socket error'));
      });

      socket.addEventListener('close', function () {
        if (!settled) {
          finishError(new Error('Helper socket closed'));
        }
      });
    });
  }

  async function getGatewayApp() {
    if (!refs.gatewayApp) {
      throw new Error('Gateway app host missing');
    }
    await customElements.whenDefined('openclaw-app');
    return refs.gatewayApp;
  }

  async function applyGatewaySettings(app, token) {
    var nextSettings = Object.assign({}, app.settings || {}, {
      token: token,
      gatewayUrl: ((app && app.settings && app.settings.gatewayUrl) || '').trim() || deriveDefaultWsUrl()
    });
    if (typeof app.applySettings === 'function') {
      app.applySettings(nextSettings);
      if (app.updateComplete && typeof app.updateComplete.then === 'function') {
        try {
          await app.updateComplete;
        } catch (error) {}
      }
    } else {
      app.settings = nextSettings;
    }
  }

  function waitForGatewayConnection(app, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var deadline = Date.now() + timeoutMs;
      function tick() {
        if (app.connected) {
          resolve();
          return;
        }
        if (Date.now() >= deadline) {
          reject(new Error(app.lastError || 'Gateway connect timeout'));
          return;
        }
        window.setTimeout(tick, 150);
      }
      tick();
    });
  }

  async function refreshHealth() {
    try {
      var res = await fetch('/healthz', { cache: 'no-store' });
      var data = await res.json();
      state.health = {
        ok: true,
        httpStatus: res.status,
        responseOk: res.ok,
        data: data
      };
    } catch (error) {
      state.health = {
        ok: false,
        httpStatus: 0,
        responseOk: false,
        error: String(error && error.message ? error.message : error),
        data: null
      };
    }
  }

  function buildUsageSessionRows(app) {
    var map = {};

    function ensureRow(key) {
      var safeKey = String(key || '').trim();
      if (!safeKey) {
        return null;
      }
      if (!map[safeKey]) {
        map[safeKey] = {
          key: safeKey,
          title: '',
          modelProvider: '',
          model: '',
          totalTokens: null,
          inputTokens: null,
          outputTokens: null,
          cachedTokens: null,
          contextTokens: null,
          messages: null,
          costUsd: null,
          durationMs: null,
          updatedAt: 0
        };
      }
      return map[safeKey];
    }

    function mergeRow(row, source) {
      if (!row || !source) {
        return;
      }
      row.title = row.title || textFromKeys(source, ['title', 'name', 'displayName', 'label']);
      row.modelProvider = row.modelProvider || textFromKeys(source, ['modelProvider', 'provider']);
      row.model = row.model || textFromKeys(source, ['model', 'modelId']);
      row.totalTokens = row.totalTokens == null ? valueFromKeys(source, ['totalTokens', 'tokens']) : row.totalTokens;
      row.inputTokens = row.inputTokens == null ? valueFromKeys(source, ['inputTokens', 'promptTokens', 'input']) : row.inputTokens;
      row.outputTokens = row.outputTokens == null ? valueFromKeys(source, ['outputTokens', 'completionTokens', 'output']) : row.outputTokens;
      row.cachedTokens = row.cachedTokens == null ? valueFromKeys(source, ['cachedTokens']) : row.cachedTokens;
      row.contextTokens = row.contextTokens == null ? valueFromKeys(source, ['contextTokens', 'contextWindow']) : row.contextTokens;
      row.messages = row.messages == null ? valueFromKeys(source, ['messages', 'messageCount', 'turnCount']) : row.messages;
      row.costUsd = row.costUsd == null ? valueFromKeys(source, ['costUsd', 'cost', 'totalCostUsd', 'usd']) : row.costUsd;
      row.durationMs = row.durationMs == null ? valueFromKeys(source, ['durationMs', 'elapsedMs']) : row.durationMs;
      row.updatedAt = Math.max(row.updatedAt || 0, getSessionUpdatedAt(source));
    }

    var index;
    for (index = 0; index < state.sessions.length; index += 1) {
      var session = state.sessions[index];
      var sessionRow = ensureRow(session && session.key);
      mergeRow(sessionRow, session);
    }

    var recentUsageSessions = getRecentUsageSessions(app);
    for (index = 0; index < recentUsageSessions.length; index += 1) {
      var usageSession = recentUsageSessions[index];
      var key = textFromKeys(usageSession, ['sessionKey', 'key', 'id']);
      var usageRow = ensureRow(key);
      mergeRow(usageRow, usageSession);
    }

    return Object.keys(map).map(function (key) {
      return map[key];
    }).sort(function (left, right) {
      var leftTokens = toNumber(left.totalTokens) || 0;
      var rightTokens = toNumber(right.totalTokens) || 0;
      if (rightTokens !== leftTokens) {
        return rightTokens - leftTokens;
      }
      return (right.updatedAt || 0) - (left.updatedAt || 0);
    });
  }

  async function refreshGatewayData() {
    state.gatewayConnected = false;
    state.gatewayError = null;
    state.sessions = [];
    state.currentSession = null;
    state.usageDaily = [];
    state.usageSessions = [];
    state.lastUsage = null;

    try {
      var token = (refs.tokenInput && refs.tokenInput.value.trim()) || getStoredToken();
      if (!token) {
        state.gatewayError = '缺少 token';
        return;
      }

      setStoredToken(token);
      var app = await getGatewayApp();
      await applyGatewaySettings(app, token);

      if (!app.connected) {
        if (typeof app.connect === 'function') {
          app.connect();
        }
        await waitForGatewayConnection(app, 4500);
      }

      state.gatewayConnected = !!app.connected;
      if (!state.gatewayConnected) {
        state.gatewayError = String(app.lastError || 'Gateway 未连接');
        return;
      }

      if (typeof app.loadOverview === 'function') {
        try {
          await app.loadOverview();
        } catch (error) {}
      }

      try {
        var result = await app.client.request('sessions.list', {
          limit: 12,
          includeGlobal: true,
          includeUnknown: true
        });
        state.sessions = sortSessionsByActivity(result && result.sessions);
      } catch (error) {}

      state.currentSession = getCurrentSession(app);
      state.usageDaily = getDailyUsage(app);
      state.usageSessions = buildUsageSessionRows(app);
      state.lastUsage = getLastAssistantUsage(app);
    } catch (error) {
      state.gatewayError = String(error && error.message ? error.message : error);
    }
  }

  async function refreshHelperData() {
    try {
      state.helperSnapshot = await callHelper({ type: 'snapshot' });
    } catch (error) {
      state.helperSnapshot = {
        helper: {
          ok: false,
          error: String(error && error.message ? error.message : error)
        },
        services: [],
        diagnostics: []
      };
    }
  }

  function toneClass(value) {
    var text = String(value || '').toLowerCase();
    if (text.indexOf('live') !== -1 || text.indexOf('ok') !== -1 || text.indexOf('online') !== -1) {
      return 'mco-ok';
    }
    if (text.indexOf('warn') !== -1 || text.indexOf('degraded') !== -1) {
      return 'mco-warn';
    }
    return 'mco-bad';
  }

  function setRows(target, rows) {
    target.innerHTML = rows.map(function (row) {
      return (
        '<div class="mco-row">' +
        '<span>' + escapeHtml(row.label) + '</span>' +
        '<strong class="' + escapeHtml(row.tone || 'mco-info') + '">' + escapeHtml(row.value) + '</strong>' +
        '</div>'
      );
    }).join('');
  }

  function setHtml(target, value) {
    target.innerHTML = value;
  }

  function getTodayUsage() {
    return state.usageDaily.length ? state.usageDaily[state.usageDaily.length - 1] : null;
  }

  function helperServiceTone(service) {
    if (!service || !service.running) {
      return 'mco-badge-warn';
    }
    if (service.processCount > 1) {
      return 'mco-badge-bad';
    }
    return 'mco-badge-ok';
  }

  function helperServiceStatus(service) {
    if (!service || !service.running) {
      return '已停止';
    }
    if (service.processCount > 1) {
      return '重复实例';
    }
    return service.managed ? '托管中' : '运行中';
  }

  function hottestDiagnostics() {
    var diagnostics = Array.isArray(state.helperSnapshot && state.helperSnapshot.diagnostics)
      ? state.helperSnapshot.diagnostics.slice().reverse()
      : [];
    return diagnostics.filter(function (entry) {
      return entry && entry.detectedAt && Date.now() - new Date(entry.detectedAt).getTime() < 300000;
    });
  }

  function findUsageSession(sessionKey) {
    var index;
    for (index = 0; index < state.usageSessions.length; index += 1) {
      if (state.usageSessions[index].key === sessionKey) {
        return state.usageSessions[index];
      }
    }
    return null;
  }

  function sessionTotalTokens(session) {
    return valueFromKeys(session, ['totalTokens', 'tokens']) || 0;
  }

  function sessionInputTokens(session) {
    return valueFromKeys(session, ['inputTokens', 'promptTokens', 'input']) || 0;
  }

  function sessionOutputTokens(session) {
    return valueFromKeys(session, ['outputTokens', 'completionTokens', 'output']) || 0;
  }

  function sessionContextTokens(session) {
    return valueFromKeys(session, ['contextTokens', 'contextWindow']) || 0;
  }

  function sessionMessages(session) {
    return valueFromKeys(session, ['messages', 'messageCount', 'turnCount']) || 0;
  }

  function sessionCostUsd(session) {
    return valueFromKeys(session, ['costUsd', 'cost', 'totalCostUsd', 'usd']) || 0;
  }

  function sessionLabel(session) {
    if (!session) {
      return '--';
    }
    return textFromKeys(session, ['title', 'name', 'displayName']) || session.key || '--';
  }

  function sessionContextLoad(session) {
    var contextTokens = sessionContextTokens(session);
    var inputTokens = sessionInputTokens(session);
    if (!contextTokens) {
      return null;
    }
    return clamp(Math.round((inputTokens / contextTokens) * 100), 0, 999);
  }

  function contextLoadTone(load) {
    if (load == null) {
      return 'mco-info';
    }
    if (load >= 85) {
      return 'mco-bad';
    }
    if (load >= 65) {
      return 'mco-warn';
    }
    return 'mco-ok';
  }

  function renderUsageBreakdown(session) {
    var total = sessionTotalTokens(session);
    var input = sessionInputTokens(session);
    var output = sessionOutputTokens(session);
    var cached = valueFromKeys(session, ['cachedTokens']) || 0;
    var bars = [
      { label: '输入', value: input, tone: 'mco-meter-fill-info' },
      { label: '输出', value: output, tone: 'mco-meter-fill-ok' }
    ];

    if (cached) {
      bars.push({ label: '缓存', value: cached, tone: 'mco-meter-fill-warn' });
    }

    return bars.map(function (bar) {
      var width = total ? clamp((bar.value / total) * 100, 3, 100) : 0;
      return (
        '<div class="mco-meter">' +
          '<div class="mco-meter-head">' +
            '<span>' + escapeHtml(bar.label) + '</span>' +
            '<strong>' + escapeHtml(formatCompact(bar.value)) + '</strong>' +
          '</div>' +
          '<div class="mco-meter-track">' +
            '<span class="mco-meter-fill ' + escapeHtml(bar.tone) + '" style="width:' + escapeHtml(String(width)) + '%"></span>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderHero() {
    var healthData = state.health && state.health.data ? state.health.data : {};
    var gatewayStatus = healthData && healthData.status ? String(healthData.status) : (healthData && healthData.ok ? 'ok' : 'unknown');
    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);

    refs.gatewayStatus.textContent = gatewayStatus;
    refs.generatedAt.textContent = state.updatedAt ? formatTime(state.updatedAt) : '--';
    if (state.gatewayConnected && helperOk) {
      refs.summaryStatus.textContent = '总览已接入';
    } else if (state.gatewayConnected || helperOk) {
      refs.summaryStatus.textContent = '部分已接入';
    } else {
      refs.summaryStatus.textContent = '需要排查';
    }

    refs.gatewayBadge.className = 'mco-badge ' + (state.gatewayConnected ? 'mco-badge-ok' : 'mco-badge-warn');
    refs.gatewayBadge.textContent = state.gatewayConnected ? '网关已接入' : '网关未接入';

    refs.helperBadge.className = 'mco-badge ' + (helperOk ? 'mco-badge-ok' : 'mco-badge-warn');
    refs.helperBadge.textContent = helperOk ? 'Helper 在线' : 'Helper 离线';

    refs.helperBaseBadge.className = 'mco-badge mco-badge-info';
    refs.helperBaseBadge.textContent = state.helperBase;
  }

  function renderHealth() {
    var healthData = state.health && state.health.data ? state.health.data : {};
    var gatewayStatus = healthData && healthData.status ? String(healthData.status) : (healthData && healthData.ok ? 'ok' : 'unknown');
    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);
    setRows(refs.healthGrid, [
      { label: 'HTTP 状态', value: String(state.health ? state.health.httpStatus : 0), tone: state.health && state.health.responseOk ? 'mco-ok' : 'mco-bad' },
      { label: 'Gateway 状态', value: gatewayStatus, tone: toneClass(gatewayStatus) },
      { label: '网关连接', value: state.gatewayConnected ? '已接入' : (state.gatewayError || '未接入'), tone: state.gatewayConnected ? 'mco-ok' : 'mco-warn' },
      { label: 'Helper 状态', value: helperOk ? '在线' : ((state.helperSnapshot.helper && state.helperSnapshot.helper.error) || '离线'), tone: helperOk ? 'mco-ok' : 'mco-warn' },
      { label: '访问路径', value: '/healthz', tone: 'mco-info' }
    ]);
  }

  function renderSessions() {
    var currentSession = state.currentSession;
    var usageCurrent = currentSession ? (findUsageSession(currentSession.key) || currentSession) : null;
    var contextLoad = sessionContextLoad(usageCurrent);
    var recentSessions = state.sessions.slice(0, 5);

    setRows(refs.sessionSummary, [
      { label: '活动会话数', value: String(state.sessions.length), tone: state.sessions.length ? 'mco-ok' : 'mco-warn' },
      { label: '当前会话', value: currentSession ? sessionLabel(currentSession) : '--', tone: currentSession ? 'mco-info' : 'mco-warn' },
      { label: '当前模型', value: currentSession ? normalizeModelValue(currentSession.modelProvider, currentSession.model) : '--', tone: currentSession ? 'mco-info' : 'mco-warn' },
      { label: '上下文负载', value: formatPercent(contextLoad), tone: contextLoadTone(contextLoad) }
    ]);

    if (!state.sessions.length) {
      setHtml(refs.sessionList, '<div class="mco-empty">当前没有拿到会话列表。通常是网关还没接入，或者 token 未提供。</div>');
      return;
    }

    var focusHtml = '';
    if (usageCurrent) {
      focusHtml =
        '<article class="mco-focus">' +
          '<div class="mco-focus-head">' +
            '<div>' +
              '<p class="mco-section-kicker">Current Session</p>' +
              '<strong>' + escapeHtml(sessionLabel(usageCurrent)) + '</strong>' +
              '<div class="mco-copy">' + escapeHtml(normalizeModelValue(usageCurrent.modelProvider, usageCurrent.model) || '未声明模型') + '</div>' +
            '</div>' +
            '<span class="mco-badge ' + escapeHtml(contextLoadTone(contextLoad).replace('mco-', 'mco-badge-')) + '">' + escapeHtml(formatPercent(contextLoad)) + ' 负载</span>' +
          '</div>' +
          '<div class="mco-focus-grid">' +
            '<article class="mco-mini-card"><span>总 Token</span><strong>' + escapeHtml(formatCompact(sessionTotalTokens(usageCurrent))) + '</strong></article>' +
            '<article class="mco-mini-card"><span>消息数</span><strong>' + escapeHtml(formatCompact(sessionMessages(usageCurrent))) + '</strong></article>' +
            '<article class="mco-mini-card"><span>上下文窗</span><strong>' + escapeHtml(formatCompact(sessionContextTokens(usageCurrent))) + '</strong></article>' +
            '<article class="mco-mini-card"><span>最近活跃</span><strong>' + escapeHtml(formatRelative(getSessionUpdatedAt(usageCurrent))) + '</strong></article>' +
          '</div>' +
          '<div class="mco-meter-stack">' + renderUsageBreakdown(usageCurrent) + '</div>' +
          '<div class="mco-meta">最近活跃于 ' + escapeHtml(formatTime(getSessionUpdatedAt(usageCurrent))) + '，估算成本 ' + escapeHtml(formatUsd(sessionCostUsd(usageCurrent))) + '</div>' +
        '</article>';
    }

    var recentHtml = recentSessions.map(function (session) {
      var usageSession = findUsageSession(session.key) || session;
      var load = sessionContextLoad(usageSession);
      return (
        '<article class="mco-session">' +
          '<div class="mco-session-head">' +
            '<strong>' + escapeHtml(sessionLabel(session)) + '</strong>' +
            '<span class="mco-badge ' + (session.key === (state.currentSession && state.currentSession.key) ? 'mco-badge-ok' : 'mco-badge-info') + '">' +
              escapeHtml(session.key === (state.currentSession && state.currentSession.key) ? '当前会话' : formatRelative(getSessionUpdatedAt(session))) +
            '</span>' +
          '</div>' +
          '<div class="mco-session-body">' +
            '<div class="mco-copy">' + escapeHtml(normalizeModelValue(session.modelProvider, session.model) || '未声明模型') + '</div>' +
            '<div class="mco-item-grid">' +
              '<div><span>总 Token</span><strong>' + escapeHtml(formatCompact(sessionTotalTokens(usageSession))) + '</strong></div>' +
              '<div><span>消息数</span><strong>' + escapeHtml(formatCompact(sessionMessages(usageSession))) + '</strong></div>' +
              '<div><span>上下文</span><strong>' + escapeHtml(formatCompact(sessionContextTokens(usageSession))) + '</strong></div>' +
              '<div><span>负载</span><strong class="' + escapeHtml(contextLoadTone(load)) + '">' + escapeHtml(formatPercent(load)) + '</strong></div>' +
            '</div>' +
            '<div class="mco-meta">更新时间：' + escapeHtml(formatTime(getSessionUpdatedAt(session))) + '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    setHtml(refs.sessionList, focusHtml + '<div class="mco-stack">' + recentHtml + '</div>');
  }

  function renderUsage() {
    var currentSession = state.currentSession;
    var today = getTodayUsage();
    var todayTokens = valueFromKeys(today, ['totalTokens', 'tokens']) || 0;
    var todayMessages = valueFromKeys(today, ['messages', 'messageCount']) || 0;
    var todayCost = valueFromKeys(today, ['costUsd', 'cost', 'totalCostUsd', 'usd']) || 0;
    var lastUsage = state.lastUsage;
    var leaderboard = state.usageSessions.slice(0, 5);
    var recentDays = state.usageDaily.slice(-7);
    var peakTokens = recentDays.reduce(function (maxValue, entry) {
      return Math.max(maxValue, valueFromKeys(entry, ['totalTokens', 'tokens']) || 0);
    }, 0);

    setRows(refs.usageSummary, [
      { label: '当前会话总 Token', value: formatCompact(currentSession ? sessionTotalTokens(findUsageSession(currentSession.key) || currentSession) : 0), tone: currentSession ? 'mco-ok' : 'mco-warn' },
      { label: '今日累计 Token', value: formatCompact(todayTokens), tone: today ? 'mco-ok' : 'mco-warn' },
      { label: '今日估算成本', value: formatUsd(todayCost), tone: today ? 'mco-info' : 'mco-warn' },
      { label: '最近回复输出', value: formatCompact(lastUsage && lastUsage.output || 0), tone: lastUsage ? 'mco-info' : 'mco-warn' }
    ]);

    if (!recentDays.length && !leaderboard.length) {
      setHtml(refs.usageList, '<div class="mco-empty">还没拿到会话用量聚合结果。通常需要网关先连上并成功跑过 `loadOverview()`。</div>');
      return;
    }

    var trendHtml = recentDays.length ? (
      '<article class="mco-focus">' +
        '<div class="mco-focus-head">' +
          '<div>' +
            '<p class="mco-section-kicker">7 Day Trend</p>' +
            '<strong>近 7 日用量趋势</strong>' +
            '<div class="mco-copy">快速判断今天是在正常区间，还是已经明显高于前几天。</div>' +
          '</div>' +
          '<span class="mco-badge mco-badge-info">峰值 ' + escapeHtml(formatCompact(peakTokens)) + '</span>' +
        '</div>' +
        '<div class="mco-spark-grid">' +
          recentDays.map(function (entry) {
            var entryTokens = valueFromKeys(entry, ['totalTokens', 'tokens']) || 0;
            var entryMessages = valueFromKeys(entry, ['messages', 'messageCount']) || 0;
            var entryCost = valueFromKeys(entry, ['costUsd', 'cost', 'totalCostUsd', 'usd']);
            var height = peakTokens ? clamp((entryTokens / peakTokens) * 100, 12, 100) : 12;
            return (
              '<article class="mco-spark">' +
                '<span class="mco-spark-label">' + escapeHtml(formatDayLabel(entry.date || entry.day || entry.label)) + '</span>' +
                '<div class="mco-spark-bar"><span style="height:' + escapeHtml(String(height)) + '%"></span></div>' +
                '<strong>' + escapeHtml(formatCompact(entryTokens)) + '</strong>' +
                '<div class="mco-meta">' + escapeHtml(formatCompact(entryMessages)) + ' 消息' + (entryCost != null ? ' · ' + escapeHtml(formatUsd(entryCost)) : '') + '</div>' +
              '</article>'
            );
          }).join('') +
        '</div>' +
      '</article>'
    ) : '';

    var leaderboardHtml = leaderboard.length ? (
      '<article class="mco-focus">' +
        '<div class="mco-focus-head">' +
          '<div>' +
            '<p class="mco-section-kicker">Hot Sessions</p>' +
            '<strong>高消耗会话榜</strong>' +
            '<div class="mco-copy">结合网关最近会话和用量聚合，优先暴露最值得看的几条会话。</div>' +
          '</div>' +
          '<span class="mco-badge mco-badge-warn">Top ' + escapeHtml(String(leaderboard.length)) + '</span>' +
        '</div>' +
        '<div class="mco-stack">' +
          leaderboard.map(function (session, index) {
            var load = sessionContextLoad(session);
            return (
              '<article class="mco-item mco-item-strong">' +
                '<div class="mco-item-head">' +
                  '<strong>#' + escapeHtml(String(index + 1)) + ' ' + escapeHtml(sessionLabel(session)) + '</strong>' +
                  '<span class="mco-chip">' + escapeHtml(formatCompact(sessionTotalTokens(session))) + ' tok</span>' +
                '</div>' +
                '<div class="mco-copy">' + escapeHtml(normalizeModelValue(session.modelProvider, session.model) || '未声明模型') + '</div>' +
                '<div class="mco-item-grid">' +
                  '<div><span>输入</span><strong>' + escapeHtml(formatCompact(sessionInputTokens(session))) + '</strong></div>' +
                  '<div><span>输出</span><strong>' + escapeHtml(formatCompact(sessionOutputTokens(session))) + '</strong></div>' +
                  '<div><span>消息</span><strong>' + escapeHtml(formatCompact(sessionMessages(session))) + '</strong></div>' +
                  '<div><span>负载</span><strong class="' + escapeHtml(contextLoadTone(load)) + '">' + escapeHtml(formatPercent(load)) + '</strong></div>' +
                '</div>' +
              '</article>'
            );
          }).join('') +
        '</div>' +
      '</article>'
    ) : '';

    var lastTurnHtml = lastUsage ? (
      '<article class="mco-item mco-item-strong">' +
        '<div class="mco-item-head">' +
          '<strong>最近一轮回复</strong>' +
          '<span class="mco-chip">' + escapeHtml(formatCompact(lastUsage.totalTokens || ((lastUsage.input || 0) + (lastUsage.output || 0)))) + ' tok</span>' +
        '</div>' +
        '<div class="mco-item-grid">' +
          '<div><span>输入</span><strong>' + escapeHtml(formatCompact(lastUsage.input || 0)) + '</strong></div>' +
          '<div><span>输出</span><strong>' + escapeHtml(formatCompact(lastUsage.output || 0)) + '</strong></div>' +
          '<div><span>总计</span><strong>' + escapeHtml(formatCompact(lastUsage.totalTokens || 0)) + '</strong></div>' +
          '<div><span>成本</span><strong>' + escapeHtml(formatUsd(valueFromKeys(lastUsage, ['costUsd', 'cost', 'usd']) || 0)) + '</strong></div>' +
        '</div>' +
      '</article>'
    ) : '';

    setHtml(refs.usageList, trendHtml + leaderboardHtml + lastTurnHtml);
  }

  function renderServices() {
    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);
    var services = Array.isArray(state.helperSnapshot && state.helperSnapshot.services) ? state.helperSnapshot.services : [];
    var runningCount = services.filter(function (service) { return service && service.running; }).length;
    var hotDiagnostics = hottestDiagnostics();

    setRows(refs.serviceSummary, [
      { label: 'Helper', value: helperOk ? '在线' : ((state.helperSnapshot.helper && state.helperSnapshot.helper.error) || '离线'), tone: helperOk ? 'mco-ok' : 'mco-warn' },
      { label: '运行服务', value: runningCount + ' / ' + services.length, tone: runningCount === services.length && services.length ? 'mco-ok' : 'mco-warn' },
      { label: '5 分钟内告警', value: String(hotDiagnostics.length), tone: hotDiagnostics.length ? 'mco-bad' : 'mco-ok' },
      { label: 'Helper PID', value: state.helperSnapshot.helper && state.helperSnapshot.helper.pid ? String(state.helperSnapshot.helper.pid) : '--', tone: helperOk ? 'mco-info' : 'mco-warn' }
    ]);

    if (!services.length) {
      setHtml(refs.serviceList, '<div class="mco-empty">还没拿到宿主机服务快照。Helper 离线时这里只会显示占位。</div>');
      return;
    }

    setHtml(refs.serviceList, services.map(function (service) {
      var processes = Array.isArray(service.processes) ? service.processes : [];
      var uptime = processes.length && typeof processes[0].uptimeMs === 'number'
        ? formatCompact(Math.round(processes[0].uptimeMs / 1000)) + 's'
        : '--';
      return (
        '<article class="mco-service">' +
          '<div class="mco-service-head">' +
            '<strong>' + escapeHtml(service.name || service.id) + '</strong>' +
            '<span class="mco-badge ' + helperServiceTone(service) + '">' + escapeHtml(helperServiceStatus(service)) + '</span>' +
          '</div>' +
          '<div class="mco-service-body">' +
            '<div class="mco-copy">' + escapeHtml(service.command || service.path || '--') + '</div>' +
            '<div class="mco-meta">进程数：' + escapeHtml(String(service.processCount || 0)) + ' · 近似存活：' + escapeHtml(uptime) + '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('') + (hotDiagnostics.length ? hotDiagnostics.slice(0, 3).map(function (entry) {
      return (
        '<article class="mco-item">' +
          '<strong>' + escapeHtml(String(entry.status || 'ERR')) + ' · ' + escapeHtml(entry.path || entry.fullPath || entry.url || 'unknown-path') + '</strong>' +
          '<p>' + escapeHtml(formatTime(entry.detectedAt)) + ' · ' + escapeHtml(String(entry.message || 'helper diagnostic')) + '</p>' +
        '</article>'
      );
    }).join('') : ''));
  }

  function renderRaw() {
    refs.rawData.textContent = JSON.stringify({
      updatedAt: state.updatedAt,
      health: state.health,
      gatewayConnected: state.gatewayConnected,
      gatewayError: state.gatewayError,
      sessions: state.sessions.slice(0, 6),
      currentSession: state.currentSession,
      usageDaily: state.usageDaily.slice(-7),
      usageSessions: state.usageSessions.slice(0, 6),
      lastUsage: state.lastUsage,
      helperSnapshot: {
        helper: state.helperSnapshot.helper,
        services: state.helperSnapshot.services,
        diagnostics: (state.helperSnapshot.diagnostics || []).slice(-5)
      }
    }, null, 2);
  }

  function renderAll() {
    renderHero();
    renderHealth();
    renderSessions();
    renderUsage();
    renderServices();
    renderRaw();
  }

  async function refreshAll() {
    refs.generatedAt.textContent = '刷新中';
    await Promise.allSettled([
      refreshHealth(),
      refreshGatewayData(),
      refreshHelperData()
    ]);
    state.updatedAt = new Date().toISOString();
    renderAll();
  }

  function saveTokenOnly() {
    var token = refs.tokenInput.value.trim();
    setStoredToken(token);
    refs.tokenInput.value = token;
    renderAll();
  }

  async function connectAndRefresh() {
    saveTokenOnly();
    await refreshAll();
  }

  function startAutoRefresh() {
    if (state.refreshTimer) {
      window.clearInterval(state.refreshTimer);
    }
    state.refreshTimer = window.setInterval(function () {
      void refreshAll();
    }, REFRESH_MS);
  }

  function bindEvents() {
    refs.refreshButton.addEventListener('click', function () {
      void refreshAll();
    });
    refs.saveTokenButton.addEventListener('click', function () {
      saveTokenOnly();
    });
    refs.connectButton.addEventListener('click', function () {
      void connectAndRefresh();
    });
  }

  async function init() {
    refs.tokenInput.value = getStoredToken();
    refs.helperBaseBadge.textContent = state.helperBase;
    bindEvents();
    renderAll();
    await refreshAll();
    startAutoRefresh();
  }

  void init();

}());
