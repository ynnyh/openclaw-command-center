(function () {
  var GATEWAY_TOKEN_KEY = 'mission-control.gateway-token';
  var HELPER_BASE_KEY = 'command-center.helper-base';
  var LANGUAGE_KEY = 'mission-control.lang';
  var THEME_KEY = 'mission-control.theme';
  var OPENCLAW_LOCALE_KEY = 'openclaw.i18n.locale';
  var DEFAULT_HELPER_BASE = 'ws://127.0.0.1:3211/ws';
  var REFRESH_MS = 5000;
  var LIVE_SYNC_MS = 400;
  var LIVE_SYNC_DEBOUNCE_MS = 80;
  var HELPER_REFRESH_MS = 2500;
  var MODEL_REFRESH_MS = 60000;
  var CONFIG_REFRESH_MS = 30000;
  var APP_SELECTOR = 'openclaw-app';

  var translations = {
    zh: {
      'meta.title': 'David HQ',
      'logo.subtitle': '18789 指挥部',
      'pilot.model': '模型',
      'pilot.theme': '主题',
      'pilot.drawer': '抽屉',
      'pilot.modelConfig': '配置模型',
      'pilot.gateway.online': '网关在线',
      'pilot.gateway.offline': '网关离线',
      'pilot.helper.online': 'Helper 在线',
      'pilot.helper.offline': 'Helper 离线',
      'results.eyebrow': 'David 结果流',
      'results.title': 'Markdown 直出，不要气泡',
      'results.final': '最终输出',
      'results.trace': '逻辑链',
      'results.waiting': '等待 David',
      'results.placeholder': '连接网关后，David 的输出会以纯 Markdown 区块直接呈现在这里。',
      'results.traceEmpty': '还没有逻辑链事件。',
      'results.stream': 'David 实时流',
      'results.live': '实时',
      'results.events': '{count} 条事件',
      'connect.title': '连接网关',
      'connect.copy': '如果没有自动接入，请粘贴 18789 Token。',
      'connect.save': '保存',
      'connect.connect': '连接',
      'connect.tokenRequired': '必须提供网关 Token',
      'connect.tokenSaved': 'Token 已保存',
      'mcp.eyebrow': 'MCP 环境监控',
      'mcp.title': '主机服务目录',
      'mcp.helperOffline': 'Helper API 当前不可用：{base}。运行 `node scripts/command-center-helper.mjs` 后即可启用主机级 MCP 控制。',
      'mcp.noProcess': '当前没有匹配到该服务定义的进程。',
      'mcp.path': '路径',
      'mcp.command': '命令',
      'mcp.start': '启动',
      'mcp.restart': '重启',
      'mcp.stop': '关闭',
      'mcp.status.stopped': '已停止',
      'mcp.status.duplicate': '重复实例',
      'mcp.status.managed': '托管中',
      'mcp.status.running': '运行中',
      'mcp.pid': 'PID',
      'mcp.service.filesystem': '文件系统 MCP',
      'mcp.service.puppeteer': 'Puppeteer MCP',
      'mcp.service.tencentcode': '腾讯工蜂 MCP',
      'api.eyebrow': 'API 诊断墙',
      'api.title': '工蜂 Git v3 / v4 报错',
      'api.state.idle': '空闲',
      'api.state.hot': '告警',
      'api.state.clean': '干净',
      'api.state.offline': 'Helper 离线',
      'api.helperOffline': 'Tencent 工蜂诊断会在 helper 在线后自动接管。从本面板重启 `tencentcode-mcp` 时，也会接入实时日志捕获。',
      'api.noErrors': '当前还没有捕获到 Git v3/v4 失败。只要 Tencent Code 客户端输出 404 / 500 路径错误，这块区域就会变红并闪烁。',
      'api.noBody': '无响应体',
      'token.eyebrow': 'Token 监控',
      'token.title': '当前会话与今日累计',
      'token.current': '当前会话',
      'token.today': '今日累计',
      'token.last': '最近回复',
      'token.context': '上下文负载',
      'token.noSession': '当前没有活动会话',
      'token.usageNotLoaded': '尚未加载到用量数据',
      'token.noAssistant': '还没有 assistant 回合',
      'token.messages': '消息 {count}',
      'token.input': '输入 {count}',
      'token.window': '窗口 {count}',
      'token.unknown': '未知',
      'drawer.eyebrow': '原生控制核心',
      'drawer.title': '设置 / 模型 / 插件 / 日志',
      'drawer.tab.chat': '聊天',
      'drawer.tab.config': '配置',
      'drawer.tab.ai': 'AI',
      'drawer.tab.skills': '技能',
      'drawer.tab.automation': '自动化',
      'drawer.tab.infra': '基础设施',
      'drawer.tab.logs': '日志',
      'drawer.tab.debug': '调试',
      'easy.eyebrow': '懒人配置',
      'easy.title': '常用配置，一眼能懂',
      'easy.desc': '这里只放最常用、最容易搞错的设置。更细的原始字段，放到高级控制台里。',
      'easy.status.saved': '已同步',
      'easy.status.dirty': '待保存',
      'easy.status.saving': '保存中',
      'easy.ai': 'AI 默认',
      'easy.voice': '消息与语音',
      'easy.gateway': '访问方式',
      'easy.advanced': '高级入口',
      'easy.primaryModel': '默认主模型',
      'easy.primaryModelHelp': '新会话默认优先使用它。',
      'easy.fallbackModels': '备用模型',
      'easy.fallbackModelsHelp': '主模型不可用时，才会轮到这里。',
      'easy.fallbackHintSelected': '已选 {count} 个',
      'easy.fallbackHintEmpty': '未选备用模型',
      'easy.contextMode': '上下文清理',
      'easy.contextModeHelp': '避免对话越聊越重，减少无效历史。',
      'easy.contextMode.cache': '智能清理',
      'easy.contextMode.default': '默认',
      'easy.contextMode.off': '关闭',
      'easy.contextTtl': '保留时长',
      'easy.contextTtlHelp': '越短越省上下文，越长越保留历史。',
      'easy.compactionMode': '自动压缩',
      'easy.compactionModeHelp': '长对话自动整理成更短的上下文。',
      'easy.compaction.default': '默认',
      'easy.compaction.off': '关闭',
      'easy.heartbeatEvery': '心跳频率',
      'easy.heartbeatEveryHelp': '后台巡检和定时触发的节奏。',
      'easy.qqbotEnabled': '开启 QQ 通道',
      'easy.qqbotEnabledHelp': '关闭后，QQ 不再收发消息。',
      'easy.qqbotSttEnabled': '语音转文字',
      'easy.qqbotSttEnabledHelp': '收到 QQ 语音后，先转成文字再交给 David。',
      'easy.qqbotSttProvider': '语音识别服务',
      'easy.qqbotSttModel': '语音识别模型',
      'easy.gatewayBind': '网关开放范围',
      'easy.gatewayBindHelp': '局域网访问用 LAN，只本机访问就选本地。',
      'easy.gatewayBind.lan': '局域网可访问',
      'easy.gatewayBind.loopback': '仅本机',
      'easy.restart': '允许自动重启',
      'easy.restartHelp': '命令链路异常时，允许自动重启相关能力。',
      'easy.sourcePath': '配置文件',
      'easy.current': '当前：{value}',
      'easy.on': '开启',
      'easy.off': '关闭',
      'easy.reset': '恢复',
      'easy.save': '仅保存',
      'easy.saveApply': '保存并生效',
      'easy.openAdvanced': '打开高级控制台',
      'easy.backSimple': '返回简化配置',
      'easy.advancedDesc': '要改原始字段、插件细项或完整 openclaw.json，再进入高级控制台。',
      'easy.connectNeeded': '连接网关后才能读取配置。',
      'easy.noConfig': '还没有拿到配置快照。',
      'easy.savedToast': '配置已保存',
      'easy.appliedToast': '配置已保存并生效',
      'easy.saveFailed': '配置保存失败',
      'easy.applyFailed': '配置应用失败',
      'theme.obsidian': '夜幕蓝',
      'theme.ember': '炽焰红',
      'theme.desc': '抽屉和概览页都走这套主题变量，后续扩主题时不用重做结构。',
      'tab.ai.eyebrow': 'AI 与代理',
      'tab.ai.title': '模型、会话、能力一页看懂',
      'tab.ai.desc': '这页不展示原始字段，而是告诉你 David 现在默认怎么思考、会用什么模型、当前谁在工作。',
      'tab.ai.defaults': '默认策略',
      'tab.ai.pool': '模型池',
      'tab.ai.runtime': '当前运行',
      'tab.ai.primary': '默认主模型',
      'tab.ai.fallbacks': '备用模型',
      'tab.ai.context': '上下文策略',
      'tab.ai.compaction': '自动压缩',
      'tab.ai.heartbeat': '心跳频率',
      'tab.ai.providers': '模型提供方',
      'tab.ai.totalModels': '可选模型数',
      'tab.ai.imageModels': '可看图模型',
      'tab.ai.session': '当前会话',
      'tab.ai.sessionCount': '活动会话数',
      'tab.ai.currentModel': '当前工作模型',
      'tab.ai.contextLoad': '上下文负载',
      'tab.automation.eyebrow': '自动化',
      'tab.automation.title': '命令、插件、主机服务一页看懂',
      'tab.automation.desc': '这页告诉你自动执行链路有没有打开、插件是否启用、后台服务是不是健康。',
      'tab.automation.commands': '命令执行',
      'tab.automation.plugins': '插件状态',
      'tab.automation.services': '主机服务',
      'tab.automation.native': '原生命令执行',
      'tab.automation.skills': '技能命令',
      'tab.automation.restart': '故障后重启',
      'tab.automation.owner': '展示方式',
      'tab.automation.allow': '允许的插件',
      'tab.automation.enabled': '已启用插件',
      'tab.automation.helper': 'Helper 状态',
      'tab.automation.noServices': '还没有拿到主机服务信息。',
      'tab.infrastructure.eyebrow': '基础设施',
      'tab.infrastructure.title': '网关、媒体、入口方式一页看懂',
      'tab.infrastructure.desc': '这页告诉你系统怎么对外开放、图片能力怎么工作、消息入口现在是否可用。',
      'tab.infrastructure.gateway': '网关访问',
      'tab.infrastructure.media': '媒体能力',
      'tab.infrastructure.channel': '消息入口',
      'tab.infrastructure.runtime': '运行状态',
      'tab.infrastructure.bind': '开放范围',
      'tab.infrastructure.auth': '鉴权方式',
      'tab.infrastructure.root': '控制台路径',
      'tab.infrastructure.origins': '允许来源',
      'tab.infrastructure.deviceAuth': '设备认证',
      'tab.infrastructure.attachments': '图片附件策略',
      'tab.infrastructure.maxAttachments': '单次最多图片',
      'tab.infrastructure.qq': 'QQ 通道',
      'tab.infrastructure.qqVoice': 'QQ 语音转文字',
      'tab.infrastructure.qqApp': 'QQ AppId',
      'tab.infrastructure.gatewayStatus': '网关状态',
      'tab.infrastructure.helperStatus': 'Helper 状态',
      'tab.infrastructure.currentSession': '当前会话',
      'shell.advancedOpen': '打开高级控制台',
      'shell.advancedBack': '返回简化页',
      'shell.advancedDesc': '需要改完整原始配置时，再进入高级控制台。',
      'shell.status.online': '在线',
      'shell.status.offline': '离线',
      'shell.none': '未配置',
      'shell.count': '{count} 项',
      'shell.more': '等 {count} 项',
      'shell.mode.auto': '自动判断',
      'shell.mode.off': '关闭',
      'shell.mode.on': '开启',
      'shell.mode.raw': '原样显示',
      'shell.gateway.deviceAuthOff': '已放宽',
      'shell.gateway.deviceAuthOn': '正常',
      'shell.helperUnavailable': 'Helper 还没连上，主机服务详情暂时不可读。',
      'shell.openConfig': '去简化配置页',
      'common.refresh': '刷新',
      'common.close': '关闭',
      'common.session': '会话',
      'common.model': '模型',
      'common.loadingModels': '模型加载中...',
      'common.pinned': '常用模型',
      'common.allModels': '全部模型',
      'common.noActiveSession': '没有可修改的活动会话',
      'common.modelSwitched': '模型已切换为 {model}',
      'common.modelSwitchFailed': '模型切换失败',
      'common.helperActionFailed': '{action} 失败',
      'common.action.start': '启动',
      'common.action.restart': '重启',
      'common.action.stop': '关闭',
      'common.justNow': '刚刚',
      'common.minutes': '{count} 分钟前',
      'common.hours': '{count} 小时前',
      'common.days': '{count} 天前',
      'common.ctx': '上下文',
      'common.total': '总计',
      'common.lastOut': '最近输出',
      'role.assistant': 'David',
      'role.user': '输入',
      'role.tool': '工具调用',
      'role.toolResult': '工具结果',
      'role.unknown': '事件'
    },
    en: {
      'meta.title': 'David HQ',
      'logo.subtitle': '18789 Command Center',
      'pilot.model': 'Model',
      'pilot.theme': 'Theme',
      'pilot.drawer': 'Drawer',
      'pilot.modelConfig': 'Configure',
      'pilot.gateway.online': 'Gateway online',
      'pilot.gateway.offline': 'Gateway disconnected',
      'pilot.helper.online': 'Helper online',
      'pilot.helper.offline': 'Helper offline',
      'results.eyebrow': 'David Result Stream',
      'results.title': 'Markdown output, no bubbles',
      'results.final': 'Final output',
      'results.trace': 'Logic chain',
      'results.waiting': 'Waiting for David',
      'results.placeholder': 'Connect the gateway and David output will render here as plain markdown blocks.',
      'results.traceEmpty': 'No logic-chain events yet.',
      'results.stream': 'David Stream',
      'results.live': 'live',
      'results.events': '{count} events',
      'connect.title': 'Connect Gateway',
      'connect.copy': 'Paste the 18789 token if auto-connect did not attach.',
      'connect.save': 'Save',
      'connect.connect': 'Connect',
      'connect.tokenRequired': 'Gateway token is required',
      'connect.tokenSaved': 'Token saved',
      'mcp.eyebrow': 'MCP Environment Monitor',
      'mcp.title': 'Host services under',
      'mcp.helperOffline': 'Helper API is offline at {base}. Run `node scripts/command-center-helper.mjs` to enable host MCP control.',
      'mcp.noProcess': 'No process matched this service definition.',
      'mcp.path': 'Path',
      'mcp.command': 'Command',
      'mcp.start': 'Start',
      'mcp.restart': 'Restart',
      'mcp.stop': 'Stop',
      'mcp.status.stopped': 'stopped',
      'mcp.status.duplicate': 'duplicate',
      'mcp.status.managed': 'managed',
      'mcp.status.running': 'running',
      'mcp.pid': 'PID',
      'mcp.service.filesystem': 'Filesystem MCP',
      'mcp.service.puppeteer': 'Puppeteer MCP',
      'mcp.service.tencentcode': 'Tencent Code MCP',
      'api.eyebrow': 'API Diagnostic Wall',
      'api.title': 'Git (Gongfeng) v3 / v4 errors',
      'api.state.idle': 'Idle',
      'api.state.hot': 'Hot',
      'api.state.clean': 'Clean',
      'api.state.offline': 'Helper offline',
      'api.helperOffline': 'Tencent Gongfeng diagnostics arm after the helper comes online. Restarting `tencentcode-mcp` from this panel also attaches live log capture.',
      'api.noErrors': 'No captured Git v3/v4 failures. The wall turns red and flashes when the Tencent Code client emits a 404 / 500 path error.',
      'api.noBody': 'No response body',
      'token.eyebrow': 'Token Monitor',
      'token.title': 'Session burn and daily burn',
      'token.current': 'Current session',
      'token.today': 'Today total',
      'token.last': 'Last reply',
      'token.context': 'Context load',
      'token.noSession': 'No active session',
      'token.usageNotLoaded': 'Usage not loaded',
      'token.noAssistant': 'No assistant turn yet',
      'token.messages': 'messages {count}',
      'token.input': 'input {count}',
      'token.window': 'window {count}',
      'token.unknown': 'Unknown',
      'drawer.eyebrow': 'Native Control Core',
      'drawer.title': 'Settings / models / plugins / logs',
      'drawer.tab.chat': 'Chat',
      'drawer.tab.config': 'Config',
      'drawer.tab.ai': 'AI',
      'drawer.tab.skills': 'Skills',
      'drawer.tab.automation': 'Automation',
      'drawer.tab.infra': 'Infra',
      'drawer.tab.logs': 'Logs',
      'drawer.tab.debug': 'Debug',
      'easy.eyebrow': 'Easy Config',
      'easy.title': 'Common settings, clearly explained',
      'easy.desc': 'Only the most useful and least confusing controls live here. Raw fields stay in the advanced console.',
      'easy.status.saved': 'Synced',
      'easy.status.dirty': 'Unsaved',
      'easy.status.saving': 'Saving',
      'easy.ai': 'AI Defaults',
      'easy.voice': 'Messages & Voice',
      'easy.gateway': 'Access',
      'easy.advanced': 'Advanced',
      'easy.primaryModel': 'Primary model',
      'easy.primaryModelHelp': 'New sessions prefer this model first.',
      'easy.fallbackModels': 'Fallback models',
      'easy.fallbackModelsHelp': 'These are used only when the primary model is unavailable.',
      'easy.fallbackHintSelected': '{count} selected',
      'easy.fallbackHintEmpty': 'No fallback model selected',
      'easy.contextMode': 'Context pruning',
      'easy.contextModeHelp': 'Keeps conversations from growing without limit.',
      'easy.contextMode.cache': 'Smart prune',
      'easy.contextMode.default': 'Default',
      'easy.contextMode.off': 'Off',
      'easy.contextTtl': 'Keep window',
      'easy.contextTtlHelp': 'Shorter saves context, longer keeps history.',
      'easy.compactionMode': 'Auto compaction',
      'easy.compactionModeHelp': 'Compress long chats into shorter context automatically.',
      'easy.compaction.default': 'Default',
      'easy.compaction.off': 'Off',
      'easy.heartbeatEvery': 'Heartbeat',
      'easy.heartbeatEveryHelp': 'Base cadence for background checks and timed triggers.',
      'easy.qqbotEnabled': 'Enable QQ channel',
      'easy.qqbotEnabledHelp': 'Turn QQ message send/receive on or off.',
      'easy.qqbotSttEnabled': 'Speech to text',
      'easy.qqbotSttEnabledHelp': 'Convert QQ voice messages into text before David handles them.',
      'easy.qqbotSttProvider': 'STT provider',
      'easy.qqbotSttModel': 'STT model',
      'easy.gatewayBind': 'Gateway exposure',
      'easy.gatewayBindHelp': 'Use LAN for network access, loopback for local-only access.',
      'easy.gatewayBind.lan': 'LAN access',
      'easy.gatewayBind.loopback': 'Local only',
      'easy.restart': 'Allow auto restart',
      'easy.restartHelp': 'Allows related command links to restart automatically after failures.',
      'easy.sourcePath': 'Config file',
      'easy.current': 'Current: {value}',
      'easy.on': 'On',
      'easy.off': 'Off',
      'easy.reset': 'Reset',
      'easy.save': 'Save only',
      'easy.saveApply': 'Save and apply',
      'easy.openAdvanced': 'Open advanced console',
      'easy.backSimple': 'Back to easy config',
      'easy.advancedDesc': 'Use the advanced console only for raw fields, plugin details, or the full openclaw.json.',
      'easy.connectNeeded': 'Connect the gateway before loading config.',
      'easy.noConfig': 'No config snapshot loaded yet.',
      'easy.savedToast': 'Config saved',
      'easy.appliedToast': 'Config saved and applied',
      'easy.saveFailed': 'Config save failed',
      'easy.applyFailed': 'Config apply failed',
      'theme.obsidian': 'Nightfall',
      'theme.ember': 'Ember',
      'theme.desc': 'Drawer and overview pages use theme variables now, so future themes can be added without reworking layout.',
      'tab.ai.eyebrow': 'AI & Agents',
      'tab.ai.title': 'Models, sessions, and capabilities at a glance',
      'tab.ai.desc': 'This page explains how David thinks by default, which models it can use, and what is active now.',
      'tab.ai.defaults': 'Defaults',
      'tab.ai.pool': 'Model pool',
      'tab.ai.runtime': 'Runtime',
      'tab.ai.primary': 'Primary model',
      'tab.ai.fallbacks': 'Fallbacks',
      'tab.ai.context': 'Context strategy',
      'tab.ai.compaction': 'Compaction',
      'tab.ai.heartbeat': 'Heartbeat',
      'tab.ai.providers': 'Providers',
      'tab.ai.totalModels': 'Total models',
      'tab.ai.imageModels': 'Vision models',
      'tab.ai.session': 'Current session',
      'tab.ai.sessionCount': 'Active sessions',
      'tab.ai.currentModel': 'Current model',
      'tab.ai.contextLoad': 'Context load',
      'tab.automation.eyebrow': 'Automation',
      'tab.automation.title': 'Commands, plugins, and host services at a glance',
      'tab.automation.desc': 'This page explains whether the automation chain is enabled, which plugins are active, and whether host services are healthy.',
      'tab.automation.commands': 'Command execution',
      'tab.automation.plugins': 'Plugins',
      'tab.automation.services': 'Host services',
      'tab.automation.native': 'Native commands',
      'tab.automation.skills': 'Skill commands',
      'tab.automation.restart': 'Restart on failure',
      'tab.automation.owner': 'Display mode',
      'tab.automation.allow': 'Allowed plugins',
      'tab.automation.enabled': 'Enabled plugins',
      'tab.automation.helper': 'Helper status',
      'tab.automation.noServices': 'No host service snapshot yet.',
      'tab.infrastructure.eyebrow': 'Infrastructure',
      'tab.infrastructure.title': 'Gateway, media, and entry paths at a glance',
      'tab.infrastructure.desc': 'This page explains how the system is exposed, how image capabilities work, and whether message ingress is available.',
      'tab.infrastructure.gateway': 'Gateway access',
      'tab.infrastructure.media': 'Media',
      'tab.infrastructure.channel': 'Channel ingress',
      'tab.infrastructure.runtime': 'Runtime',
      'tab.infrastructure.bind': 'Exposure',
      'tab.infrastructure.auth': 'Auth mode',
      'tab.infrastructure.root': 'Control UI root',
      'tab.infrastructure.origins': 'Allowed origins',
      'tab.infrastructure.deviceAuth': 'Device auth',
      'tab.infrastructure.attachments': 'Image attachments',
      'tab.infrastructure.maxAttachments': 'Max images',
      'tab.infrastructure.qq': 'QQ channel',
      'tab.infrastructure.qqVoice': 'QQ speech to text',
      'tab.infrastructure.qqApp': 'QQ AppId',
      'tab.infrastructure.gatewayStatus': 'Gateway',
      'tab.infrastructure.helperStatus': 'Helper',
      'tab.infrastructure.currentSession': 'Current session',
      'shell.advancedOpen': 'Open advanced console',
      'shell.advancedBack': 'Back to simple view',
      'shell.advancedDesc': 'Open the advanced console only when you need the full raw configuration.',
      'shell.status.online': 'Online',
      'shell.status.offline': 'Offline',
      'shell.none': 'Not set',
      'shell.count': '{count} items',
      'shell.more': '{count} more',
      'shell.mode.auto': 'Auto',
      'shell.mode.off': 'Off',
      'shell.mode.on': 'On',
      'shell.mode.raw': 'Raw',
      'shell.gateway.deviceAuthOff': 'Relaxed',
      'shell.gateway.deviceAuthOn': 'Normal',
      'shell.helperUnavailable': 'Helper is offline, so host service details are unavailable.',
      'shell.openConfig': 'Open simple config',
      'common.refresh': 'Refresh',
      'common.close': 'Close',
      'common.session': 'Session',
      'common.model': 'Model',
      'common.loadingModels': 'Loading models...',
      'common.pinned': 'Pinned',
      'common.allModels': 'All models',
      'common.noActiveSession': 'No active session to patch',
      'common.modelSwitched': 'Model switched to {model}',
      'common.modelSwitchFailed': 'Model switch failed',
      'common.helperActionFailed': '{action} failed',
      'common.action.start': 'start',
      'common.action.restart': 'restart',
      'common.action.stop': 'stop',
      'common.justNow': 'just now',
      'common.minutes': '{count}m ago',
      'common.hours': '{count}h ago',
      'common.days': '{count}d ago',
      'common.ctx': 'ctx',
      'common.total': 'total',
      'common.lastOut': 'last out',
      'role.assistant': 'David',
      'role.user': 'Input',
      'role.tool': 'Tool Call',
      'role.toolResult': 'Tool Result',
      'role.unknown': 'Event'
    }
  };

  var refs = {
    logoButton: document.getElementById('cc-logo'),
    settingsButton: document.getElementById('cc-settings'),
    helperRefreshButton: document.getElementById('cc-helper-refresh'),
    modelConfigButton: document.getElementById('cc-model-config'),
    modelSelect: document.getElementById('cc-model-select'),
    themeSelect: document.getElementById('cc-theme-select'),
    connectionBadge: document.getElementById('cc-connection-badge'),
    helperBadge: document.getElementById('cc-helper-badge'),
    sessionPill: document.getElementById('cc-session-pill'),
    modelPill: document.getElementById('cc-model-pill'),
    resultMeta: document.getElementById('cc-result-meta'),
    traceMeta: document.getElementById('cc-trace-meta'),
    finalOutput: document.getElementById('cc-final-output'),
    traceFeed: document.getElementById('cc-trace-feed'),
    tokenMetrics: document.getElementById('cc-token-metrics'),
    mcpStatus: document.getElementById('cc-mcp-status'),
    apiWall: document.getElementById('cc-api-wall'),
    apiState: document.getElementById('cc-api-state'),
    apiErrors: document.getElementById('cc-api-errors'),
    connectBlock: document.getElementById('cc-connect-block'),
    tokenInput: document.getElementById('cc-token-input'),
    saveTokenButton: document.getElementById('cc-save-token'),
    connectButton: document.getElementById('cc-connect'),
    drawer: document.getElementById('cc-drawer'),
    drawerCloseButton: document.getElementById('cc-drawer-close'),
    drawerBackdrop: document.getElementById('cc-drawer-backdrop'),
    drawerTabs: Array.prototype.slice.call(document.querySelectorAll('[data-drawer-tab]')),
    easyConfigPanel: document.getElementById('cc-easy-config'),
    nativeHost: document.getElementById('cc-native-host'),
    toast: document.getElementById('cc-toast'),
    langZhButton: document.getElementById('cc-lang-zh'),
    langEnButton: document.getElementById('cc-lang-en'),
    i18nNodes: Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'))
  };

  var state = {
    app: null,
    helperBase: loadHelperBase(),
    lang: loadLanguage(),
    theme: loadTheme(),
    drawerOpen: false,
    drawerTab: 'chat',
    drawerSection: null,
    drawerSectionSyncTimer: null,
    busy: false,
    helperBusy: false,
    modelBusy: false,
    refreshTimer: null,
    livePollTimer: null,
    liveTimer: null,
    helperTimer: null,
    appObserver: null,
    appObserverTarget: null,
    appliedDrawerTab: null,
    lastLiveSignature: '',
    models: [],
    sessions: [],
    config: null,
    configSnapshot: null,
    configSource: null,
    configEditable: null,
    helperSnapshot: null,
    lastModelsAt: 0,
    lastConfigAt: 0,
    lastToastTimer: null,
    easyConfigBaseline: null,
    easyConfigDraft: null,
    easyConfigDirty: false,
    easyConfigBusy: false,
    easyConfigAdvanced: false,
    lastEasyConfigSignature: '',
    shellAdvancedTabs: {
      config: false,
      aiAgents: false,
      automation: false,
      infrastructure: false
    }
  };

  function loadHelperBase() {
    try {
      return localStorage.getItem(HELPER_BASE_KEY) || DEFAULT_HELPER_BASE;
    } catch (error) {
      return DEFAULT_HELPER_BASE;
    }
  }

  function loadLanguage() {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || 'zh';
    } catch (error) {
      return 'zh';
    }
  }

  function loadTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'obsidian';
    } catch (error) {
      return 'obsidian';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {}
  }

  function saveLanguage(lang) {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {}
  }

  function localeCode() {
    return state.lang === 'zh' ? 'zh-CN' : 'en-US';
  }

  function nativeLocaleCode() {
    return state.lang === 'zh' ? 'zh-CN' : 'en';
  }

  function nativeThemeKey() {
    if (state.theme === 'ember') {
      return 'knot';
    }
    return 'dash';
  }

  function saveNativeLocale(locale) {
    try {
      localStorage.setItem(OPENCLAW_LOCALE_KEY, locale);
    } catch (error) {}
  }

  function dictionary() {
    return translations[state.lang] || translations.zh;
  }

  function t(key, vars) {
    var value = dictionary()[key] || translations.en[key] || key;
    if (!vars) {
      return value;
    }
    return value.replace(/\{(\w+)\}/g, function (_, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : '';
    });
  }

  function getHelperSocketUrl() {
    var base = state.helperBase || DEFAULT_HELPER_BASE;
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

  function text(node, value) {
    if (node) {
      node.textContent = value;
    }
  }

  function html(node, value) {
    if (node) {
      node.innerHTML = value;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message) {
    if (!refs.toast) {
      return;
    }
    refs.toast.hidden = false;
    refs.toast.textContent = message;
    if (state.lastToastTimer) {
      window.clearTimeout(state.lastToastTimer);
    }
    state.lastToastTimer = window.setTimeout(function () {
      refs.toast.hidden = true;
      refs.toast.textContent = '';
    }, 2200);
  }

  function formatCompact(value) {
    if (typeof value !== 'number' || !isFinite(value)) {
      return '--';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return String(Math.round(value));
  }

  function formatTime(value) {
    if (!value) {
      return '--';
    }
    var date = new Date(value);
    if (!isFinite(date.getTime())) {
      return '--';
    }
    return date.toLocaleString(localeCode(), { hour12: false });
  }

  function formatClock(value) {
    if (!value) {
      return '--';
    }
    var date = new Date(value);
    if (!isFinite(date.getTime())) {
      return '--';
    }
    return date.toLocaleTimeString(localeCode(), { hour12: false });
  }

  function formatDuration(value) {
    if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
      return '--';
    }
    var seconds = Math.floor(value / 1000);
    if (state.lang === 'zh') {
      if (seconds < 60) {
        return seconds + '秒';
      }
      var minutesZh = Math.floor(seconds / 60);
      var remainSecondsZh = seconds % 60;
      if (minutesZh < 60) {
        return remainSecondsZh ? minutesZh + '分 ' + remainSecondsZh + '秒' : minutesZh + '分';
      }
      var hoursZh = Math.floor(minutesZh / 60);
      var remainMinutesZh = minutesZh % 60;
      if (hoursZh < 24) {
        return remainMinutesZh ? hoursZh + '小时 ' + remainMinutesZh + '分' : hoursZh + '小时';
      }
      var daysZh = Math.floor(hoursZh / 24);
      var remainHoursZh = hoursZh % 24;
      return remainHoursZh ? daysZh + '天 ' + remainHoursZh + '小时' : daysZh + '天';
    }

    if (seconds < 60) {
      return seconds + 's';
    }
    var minutes = Math.floor(seconds / 60);
    var remainSeconds = seconds % 60;
    if (minutes < 60) {
      return remainSeconds ? minutes + 'm ' + remainSeconds + 's' : minutes + 'm';
    }
    var hours = Math.floor(minutes / 60);
    var remainMinutes = minutes % 60;
    if (hours < 24) {
      return remainMinutes ? hours + 'h ' + remainMinutes + 'm' : hours + 'h';
    }
    var days = Math.floor(hours / 24);
    var remainHours = hours % 24;
    return remainHours ? days + 'd ' + remainHours + 'h' : days + 'd';
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
    var abs = Math.abs(diff);
    if (abs < 60000) {
      return t('common.justNow');
    }
    if (abs < 3600000) {
      return t('common.minutes', { count: Math.round(abs / 60000) });
    }
    if (abs < 86400000) {
      return t('common.hours', { count: Math.round(abs / 3600000) });
    }
    return t('common.days', { count: Math.round(abs / 86400000) });
  }

  function deriveDefaultWsUrl() {
    var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return protocol + '//' + window.location.host;
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

  function resolveApp() {
    if (state.app) {
      return state.app;
    }
    state.app = document.querySelector(APP_SELECTOR);
    return state.app;
  }

  function getSessionUpdatedAt(session) {
    if (!session) {
      return 0;
    }
    var raw = session.updatedAtMs || session.updatedAt || session.lastActivityAt || session.lastMessageAt || 0;
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

  function scheduleLiveUpdate() {
    if (state.liveTimer) {
      return;
    }
    state.liveTimer = window.setTimeout(function () {
      state.liveTimer = null;
      updateView({ skipDrawer: true });
    }, LIVE_SYNC_DEBOUNCE_MS);
  }

  function buildLiveSignature() {
    var app = resolveApp();
    var messages = getCurrentMessages();
    var currentSession = getCurrentSession();
    var lastMessage = messages.length ? messages[messages.length - 1] : null;
    return [
      app && app.connected ? '1' : '0',
      app && app.sessionKey ? String(app.sessionKey) : '',
      app && app.chatRunId ? String(app.chatRunId) : '',
      app && app.chatStream ? String(app.chatStream) : '',
      messages.length,
      currentSession ? currentSession.key : '',
      currentSession ? getSessionUpdatedAt(currentSession) : 0,
      lastMessage ? lastMessage.role || '' : '',
      lastMessage ? lastMessage.timestamp || lastMessage.updatedAt || '' : '',
      lastMessage ? summarizeMessage(lastMessage).slice(-160) : '',
      state.sessions.length ? state.sessions[0].key : '',
      state.sessions.length ? getSessionUpdatedAt(state.sessions[0]) : 0
    ].join('||');
  }

  function syncLiveView(force) {
    var signature = buildLiveSignature();
    if (!force && signature === state.lastLiveSignature) {
      return;
    }
    state.lastLiveSignature = signature;
    scheduleLiveUpdate();
  }

  function attachAppRealtimeSync() {
    var app = resolveApp();
    if (!app) {
      return;
    }
    if (state.appObserverTarget !== app) {
      if (state.appObserver) {
        state.appObserver.disconnect();
      }
      state.appObserver = new MutationObserver(function () {
        syncLiveView(false);
      });
      state.appObserver.observe(app, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      state.appObserverTarget = app;
    }
    syncLiveView(true);
  }

  function resolveToken(app) {
    var url = new URL(window.location.href);
    var searchToken = (url.searchParams.get('token') || '').trim();
    var hashParams = new URLSearchParams((url.hash || '').replace(/^#/, ''));
    return (
      searchToken ||
      (hashParams.get('token') || '').trim() ||
      ((app && app.settings && app.settings.token) || '').trim() ||
      getStoredToken()
    );
  }

  function resolveGatewayUrl(app) {
    return ((app && app.settings && app.settings.gatewayUrl) || '').trim() || deriveDefaultWsUrl();
  }

  async function syncNativeShellState(app) {
    var target = app || resolveApp();
    if (!target) {
      return null;
    }

    var locale = nativeLocaleCode();
    var theme = nativeThemeKey();
    var nextSettings = Object.assign({}, target.settings || {}, {
      locale: locale
    });

    saveNativeLocale(locale);

    if (typeof target.applySettings === 'function') {
      target.applySettings(nextSettings);
      if (target.updateComplete && typeof target.updateComplete.then === 'function') {
        try {
          await target.updateComplete;
        } catch (error) {}
      }
    } else {
      target.settings = nextSettings;
    }

    if (typeof target.setTheme === 'function' && target.theme !== theme) {
      try {
        target.setTheme(theme, { persist: true });
      } catch (error) {
        try {
          target.setTheme(theme);
        } catch (innerError) {}
      }
    }

    return target;
  }

  async function applyAppSettings(token) {
    var app = resolveApp();
    if (!app) {
      return null;
    }
    var nextSettings = Object.assign({}, app.settings || {}, {
      token: (token || '').trim() || resolveToken(app),
      gatewayUrl: resolveGatewayUrl(app),
      locale: nativeLocaleCode()
    });
    saveNativeLocale(nextSettings.locale);
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
    await syncNativeShellState(app);
    return app;
  }

  async function connectApp() {
    var app = resolveApp();
    if (!app) {
      updateView();
      return;
    }
    var token = refs.tokenInput ? refs.tokenInput.value.trim() : '';
    token = token || resolveToken(app);
    if (!token) {
      setStoredToken('');
      if (refs.tokenInput) {
        refs.tokenInput.focus();
      }
      showToast(t('connect.tokenRequired'));
      updateView();
      return;
    }
    setStoredToken(token);
    await applyAppSettings(token);
    if (typeof app.connect === 'function') {
      app.connect();
    }
    window.setTimeout(function () {
      refreshGatewayData(true);
    }, 1000);
    updateView();
  }

  function callAppRequest(method, params) {
    var app = resolveApp();
    if (!app || !app.client || !app.connected) {
      return Promise.reject(new Error('Gateway is not connected'));
    }
    return app.client.request(method, params || {});
  }

  function needsModelRefresh() {
    return !state.models.length || Date.now() - state.lastModelsAt > MODEL_REFRESH_MS;
  }

  function needsConfigRefresh() {
    return !state.config || Date.now() - state.lastConfigAt > CONFIG_REFRESH_MS;
  }

  async function refreshGatewayData(force) {
    var app = resolveApp();
    if (!app) {
      updateView();
      return;
    }
    if (!app.connected && resolveToken(app)) {
      await connectApp();
      return;
    }
    if (!app.connected) {
      updateView();
      return;
    }
    if (state.busy && !force) {
      updateView();
      return;
    }

    state.busy = true;
    try {
      var jobs = [];
      if (typeof app.loadOverview === 'function') {
        jobs.push(app.loadOverview());
      }
      if (typeof app.loadCron === 'function') {
        jobs.push(app.loadCron());
      }
      jobs.push(
        callAppRequest('sessions.list', {
          limit: 40,
          includeGlobal: true,
          includeUnknown: true
        }).then(function (result) {
          state.sessions = sortSessionsByActivity(result && result.sessions);
        }).catch(function () {
          state.sessions = [];
        })
      );

      if (needsModelRefresh() || force) {
        jobs.push(
          callAppRequest('models.list', {}).then(function (result) {
            state.models = Array.isArray(result && result.models) ? result.models : [];
            state.lastModelsAt = Date.now();
          }).catch(function () {})
        );
      }

      if (needsConfigRefresh() || force) {
        jobs.push(
          callAppRequest('config.get', {}).then(function (result) {
            state.configSnapshot = result || null;
            state.configSource = (result && (result.config || result.parsed || result.resolved)) || null;
            state.configEditable = (result && (parseConfigRaw(result.raw) || result.config || result.parsed || result.resolved)) || null;
            state.config = (result && (result.resolved || result.config || result.parsed)) || null;
            state.lastConfigAt = Date.now();
            syncEasyConfigState(false);
          }).catch(function () {})
        );
      }

      await Promise.allSettled(jobs);
    } finally {
      state.busy = false;
      syncLiveView(true);
      updateView({ skipDrawer: true });
      updateEasyConfigPanel(false);
    }
  }

  async function fetchHelperSnapshot() {
    if (state.helperBusy) {
      return;
    }
    state.helperBusy = true;
    try {
      state.helperSnapshot = await callHelper({ type: 'snapshot' });
    } catch (error) {
      state.helperSnapshot = {
        helper: {
          ok: false,
          error: String(error)
        },
        services: [],
        diagnostics: []
      };
    } finally {
      state.helperBusy = false;
      updateView();
    }
  }

  function getDailyUsage() {
    var app = resolveApp();
    if (app && app.usageCostSummary && Array.isArray(app.usageCostSummary.daily)) {
      return app.usageCostSummary.daily;
    }
    if (app && app.usageResult && app.usageResult.aggregates && Array.isArray(app.usageResult.aggregates.daily)) {
      return app.usageResult.aggregates.daily;
    }
    return [];
  }

  function getCurrentSessionKey() {
    var app = resolveApp();
    var rawKey = (app && app.sessionKey) || '';
    if (!rawKey) {
      return state.sessions[0] ? state.sessions[0].key : '';
    }
    if (/^agent:/.test(rawKey)) {
      return rawKey;
    }
    for (var i = 0; i < state.sessions.length; i += 1) {
      if (state.sessions[i].key === rawKey) {
        return rawKey;
      }
    }
    if (rawKey === 'main') {
      for (var j = 0; j < state.sessions.length; j += 1) {
        if (state.sessions[j].key === 'agent:main:main') {
          return state.sessions[j].key;
        }
      }
    }
    for (var k = 0; k < state.sessions.length; k += 1) {
      if (state.sessions[k].key.slice(-rawKey.length - 1) === ':' + rawKey) {
        return state.sessions[k].key;
      }
    }
    return rawKey;
  }

  function getCurrentSession() {
    var currentKey = getCurrentSessionKey();
    for (var i = 0; i < state.sessions.length; i += 1) {
      if (state.sessions[i].key === currentKey) {
        return state.sessions[i];
      }
    }
    return state.sessions[0] || null;
  }

  function normalizeModelValue(provider, model) {
    if (provider && model) {
      return provider + '/' + model;
    }
    return model || '';
  }

  function summarizeMessage(message) {
    if (!message) {
      return '';
    }
    if (typeof message.text === 'string') {
      return message.text;
    }
    if (typeof message.content === 'string') {
      return message.content;
    }
    if (Array.isArray(message.content)) {
      return message.content.map(function (part) {
        if (typeof part === 'string') {
          return part;
        }
        if (part && part.type === 'text') {
          return part.text || '';
        }
        return '';
      }).join('\n').trim();
    }
    return '';
  }

  function getCurrentMessages() {
    var app = resolveApp();
    return app && Array.isArray(app.chatMessages) ? app.chatMessages.slice() : [];
  }

  function getLastAssistantMessage(messages) {
    for (var i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') {
        return messages[i];
      }
    }
    return null;
  }

  function getLastAssistantUsage(messages) {
    var assistant = getLastAssistantMessage(messages);
    return assistant && assistant.usage ? assistant.usage : null;
  }

  function currentModelValue() {
    var currentSession = getCurrentSession();
    return currentSession ? normalizeModelValue(currentSession.modelProvider, currentSession.model) : '';
  }

  function configuredModelValues() {
    var values = [];
    var seen = {};

    function push(value) {
      if (!value || seen[value]) {
        return;
      }
      seen[value] = true;
      values.push(value);
    }

    if (state.config && state.config.models && state.config.models.providers) {
      Object.keys(state.config.models.providers).forEach(function (providerKey) {
        var provider = state.config.models.providers[providerKey];
        if (!provider || !Array.isArray(provider.models)) {
          return;
        }
        provider.models.forEach(function (model) {
          if (model && model.id) {
            push(normalizeModelValue(providerKey, model.id));
          }
        });
      });
    }

    if (state.config && state.config.agents && state.config.agents.defaults && state.config.agents.defaults.model) {
      push(state.config.agents.defaults.model.primary);
      (state.config.agents.defaults.model.fallbacks || []).forEach(push);
    }

    push(currentModelValue());
    return values;
  }

  function buildModelOptions() {
    var configured = configuredModelValues();
    if (!configured.length) {
      return '<option value="">' + escapeHtml(t('common.loadingModels')) + '</option>';
    }

    var current = currentModelValue();
    var modelMap = {};
    state.models.forEach(function (model) {
      modelMap[normalizeModelValue(model.provider, model.id)] = model;
    });

    return configured.map(function (value) {
      var model = modelMap[value];
      var label = model && model.name && model.name !== model.id ? value + ' - ' + model.name : value;
      return '<option value="' + escapeHtml(value) + '"' + (value === current ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
    }).join('');
  }

  function cloneJson(value) {
    if (value == null) {
      return value;
    }
    return JSON.parse(JSON.stringify(value));
  }

  function uniqueStrings(values) {
    var seen = {};
    var result = [];
    (Array.isArray(values) ? values : []).forEach(function (value) {
      if (typeof value !== 'string') {
        return;
      }
      var next = value.trim();
      if (!next || seen[next]) {
        return;
      }
      seen[next] = true;
      result.push(next);
    });
    return result;
  }

  function ensureObjectPath(root, path) {
    var cursor = root;
    path.forEach(function (key) {
      if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    });
    return cursor;
  }

  function currentConfigSource() {
    return state.configEditable || state.configSource || state.config || null;
  }

  function parseConfigRaw(raw) {
    if (typeof raw !== 'string' || !raw.trim()) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function serializeEasyConfig(value) {
    return JSON.stringify(value || {});
  }

  function availableEasyModels() {
    return uniqueStrings(configuredModelValues());
  }

  function modelValuesForProvider(providerKey) {
    var provider = state.config && state.config.models && state.config.models.providers
      ? state.config.models.providers[providerKey]
      : null;
    if (!provider || !Array.isArray(provider.models)) {
      return [];
    }
    return uniqueStrings(provider.models.map(function (model) {
      return model && model.id ? model.id : '';
    }));
  }

  function formatEasyModelLabel(value) {
    if (!value) {
      return '--';
    }
    var parts = String(value).split('/');
    var provider = parts[0] || '';
    var modelId = parts.length > 1 ? parts.slice(1).join('/') : parts[0];
    for (var i = 0; i < state.models.length; i += 1) {
      var model = state.models[i];
      if (!model) {
        continue;
      }
      if (normalizeModelValue(model.provider, model.id) !== value) {
        continue;
      }
      if (model.name && model.name !== model.id) {
        return model.name + ' · ' + provider;
      }
      break;
    }
    return modelId + ' · ' + provider;
  }

  function buildEasyConfig(config) {
    var agentDefaults = config && config.agents && config.agents.defaults ? config.agents.defaults : {};
    var modelDefaults = agentDefaults.model || {};
    var contextPruning = agentDefaults.contextPruning || {};
    var compaction = agentDefaults.compaction || {};
    var heartbeat = agentDefaults.heartbeat || {};
    var qqbot = config && config.channels && config.channels.qqbot ? config.channels.qqbot : {};
    var stt = qqbot.stt || {};
    var gateway = config && config.gateway ? config.gateway : {};
    var commands = config && config.commands ? config.commands : {};
    var primary = typeof modelDefaults.primary === 'string' ? modelDefaults.primary.trim() : '';
    var availableModels = availableEasyModels();

    return {
      primaryModel: primary || (availableModels[0] || ''),
      fallbackModels: uniqueStrings(modelDefaults.fallbacks || []),
      contextMode: typeof contextPruning.mode === 'string' && contextPruning.mode ? contextPruning.mode : 'cache-ttl',
      contextTtl: typeof contextPruning.ttl === 'string' && contextPruning.ttl ? contextPruning.ttl : '30m',
      compactionMode: typeof compaction.mode === 'string' && compaction.mode ? compaction.mode : 'default',
      heartbeatEvery: typeof heartbeat.every === 'string' && heartbeat.every ? heartbeat.every : '2h',
      qqbotEnabled: !!qqbot.enabled,
      qqbotSttEnabled: !!stt.enabled,
      qqbotSttProvider: typeof stt.provider === 'string' ? stt.provider : '',
      qqbotSttModel: typeof stt.model === 'string' ? stt.model : '',
      gatewayBind: typeof gateway.bind === 'string' && gateway.bind ? gateway.bind : 'loopback',
      restartEnabled: commands.restart !== false
    };
  }

  function updateEasyConfigDirty() {
    state.easyConfigDirty = serializeEasyConfig(state.easyConfigDraft) !== serializeEasyConfig(state.easyConfigBaseline);
  }

  function syncEasyConfigState(force) {
    var source = currentConfigSource();
    if (!source) {
      state.easyConfigBaseline = null;
      if (force) {
        state.easyConfigDraft = null;
        state.easyConfigDirty = false;
      }
      return;
    }
    state.easyConfigBaseline = buildEasyConfig(source);
    if (force || !state.easyConfigDraft || !state.easyConfigDirty) {
      state.easyConfigDraft = cloneJson(state.easyConfigBaseline);
    }
    updateEasyConfigDirty();
  }

  function selectEasyOptionValues(baseValues, currentValue) {
    var values = uniqueStrings(baseValues || []);
    if (currentValue && values.indexOf(currentValue) === -1) {
      values.push(currentValue);
    }
    return values;
  }

  function setEasyConfigField(field, value) {
    if (!state.easyConfigDraft) {
      syncEasyConfigState(true);
    }
    if (!state.easyConfigDraft) {
      return;
    }

    if (field === 'qqbotEnabled' || field === 'qqbotSttEnabled' || field === 'restartEnabled') {
      state.easyConfigDraft[field] = value === true || value === 'true';
    } else {
      state.easyConfigDraft[field] = value;
    }

    if (field === 'qqbotSttProvider') {
      var models = modelValuesForProvider(state.easyConfigDraft.qqbotSttProvider);
      if (models.length && models.indexOf(state.easyConfigDraft.qqbotSttModel) === -1) {
        state.easyConfigDraft.qqbotSttModel = models[0];
      }
    }

    updateEasyConfigDirty();
    updateEasyConfigPanel(true);
  }

  function toggleEasyFallback(modelValue) {
    if (!modelValue) {
      return;
    }
    if (!state.easyConfigDraft) {
      syncEasyConfigState(true);
    }
    if (!state.easyConfigDraft) {
      return;
    }
    var next = uniqueStrings(state.easyConfigDraft.fallbackModels || []);
    var index = next.indexOf(modelValue);
    if (index >= 0) {
      next.splice(index, 1);
    } else {
      next.push(modelValue);
    }
    state.easyConfigDraft.fallbackModels = next;
    updateEasyConfigDirty();
    updateEasyConfigPanel(true);
  }

  function resetEasyConfigDraft() {
    if (!state.easyConfigBaseline) {
      return;
    }
    state.easyConfigDraft = cloneJson(state.easyConfigBaseline);
    updateEasyConfigDirty();
    updateEasyConfigPanel(true);
  }

  function applyEasyConfigDraftToConfig(config, draft) {
    var next = cloneJson(config) || {};
    var agentDefaults = ensureObjectPath(next, ['agents', 'defaults']);
    var modelDefaults = ensureObjectPath(agentDefaults, ['model']);
    var contextPruning = ensureObjectPath(agentDefaults, ['contextPruning']);
    var compaction = ensureObjectPath(agentDefaults, ['compaction']);
    var heartbeat = ensureObjectPath(agentDefaults, ['heartbeat']);
    var qqbot = ensureObjectPath(next, ['channels', 'qqbot']);
    var stt = ensureObjectPath(qqbot, ['stt']);
    var gateway = ensureObjectPath(next, ['gateway']);
    var commands = ensureObjectPath(next, ['commands']);

    modelDefaults.primary = draft.primaryModel || '';
    modelDefaults.fallbacks = uniqueStrings(draft.fallbackModels || []);
    contextPruning.mode = draft.contextMode || 'cache-ttl';
    contextPruning.ttl = draft.contextTtl || '30m';
    compaction.mode = draft.compactionMode || 'default';
    heartbeat.every = draft.heartbeatEvery || '2h';

    qqbot.enabled = !!draft.qqbotEnabled;
    stt.enabled = !!draft.qqbotSttEnabled;
    stt.provider = draft.qqbotSttProvider || '';
    stt.model = draft.qqbotSttModel || '';

    gateway.bind = draft.gatewayBind || 'loopback';
    commands.restart = !!draft.restartEnabled;

    return next;
  }

  function ensureEnvSecretRef(parent, key, envId) {
    if (!parent || typeof parent !== 'object') {
      return;
    }
    var current = parent[key];
    if (
      current &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      typeof current.id === 'string' &&
      /^[A-Z][A-Z0-9_]{0,127}$/.test(current.id)
    ) {
      return;
    }
    parent[key] = {
      source: 'env',
      provider: 'default',
      id: envId
    };
  }

  function repairManagedSecretRefs(config) {
    var next = cloneJson(config) || {};
    var providers = ensureObjectPath(next, ['models', 'providers']);
    var anthropic = ensureObjectPath(providers, ['anthropic']);
    var localStt = ensureObjectPath(providers, ['local_stt']);
    var moonshot = ensureObjectPath(providers, ['moonshot']);
    var auth = ensureObjectPath(ensureObjectPath(next, ['gateway']), ['auth']);

    ensureEnvSecretRef(anthropic, 'apiKey', 'OPENCLAW_ANTHROPIC_API_KEY');
    ensureEnvSecretRef(localStt, 'apiKey', 'OPENCLAW_LOCAL_STT_API_KEY');
    ensureEnvSecretRef(moonshot, 'apiKey', 'OPENCLAW_MOONSHOT_API_KEY');
    ensureEnvSecretRef(auth, 'token', 'OPENCLAW_GATEWAY_TOKEN');

    return next;
  }

  async function saveEasyConfig(applyChanges) {
    if (state.easyConfigBusy || !state.easyConfigDraft || !state.configSnapshot || !state.configSnapshot.hash) {
      return;
    }
    state.easyConfigBusy = true;
    updateEasyConfigPanel(true);

    try {
      var rawConfig = repairManagedSecretRefs(applyEasyConfigDraftToConfig(currentConfigSource(), state.easyConfigDraft));
      var request = {
        raw: JSON.stringify(rawConfig, null, 2) + '\n',
        baseHash: state.configSnapshot.hash
      };
      var sessionKey = getCurrentSessionKey();
      if (applyChanges && sessionKey) {
        request.sessionKey = sessionKey;
      }
      await callAppRequest(applyChanges ? 'config.apply' : 'config.set', request);
      await refreshGatewayData(true);
      syncEasyConfigState(true);
      showToast(t(applyChanges ? 'easy.appliedToast' : 'easy.savedToast'));
    } catch (error) {
      console.error('easy config save failed', error);
      showToast(t(applyChanges ? 'easy.applyFailed' : 'easy.saveFailed') + ': ' + String((error && error.message) || error));
    } finally {
      state.easyConfigBusy = false;
      updateEasyConfigPanel(true);
    }
  }

  async function handleModelChange() {
    if (state.modelBusy) {
      return;
    }
    var nextValue = refs.modelSelect ? refs.modelSelect.value.trim() : '';
    var currentValue = currentModelValue();
    if (!nextValue || nextValue === currentValue) {
      updateView();
      return;
    }

    var currentKey = getCurrentSessionKey();
    if (!currentKey) {
      showToast(t('common.noActiveSession'));
      updateView();
      return;
    }

    state.modelBusy = true;
    try {
      await callAppRequest('sessions.patch', {
        key: currentKey,
        model: nextValue
      });
      showToast(t('common.modelSwitched', { model: nextValue }));
      await refreshGatewayData(true);
    } catch (error) {
      showToast(t('common.modelSwitchFailed'));
    } finally {
      state.modelBusy = false;
      updateView();
    }
  }

  function serviceDisplayName(service) {
    if (!service) {
      return '--';
    }
    return dictionary()['mcp.service.' + service.id] || service.name || service.id;
  }

  async function setLanguage(lang) {
    if (lang !== 'zh' && lang !== 'en') {
      return;
    }
    state.lang = lang;
    saveLanguage(lang);
    await syncNativeShellState();
    updateView();
  }

  function availableThemes() {
    return ['obsidian', 'ember'];
  }

  async function setTheme(theme) {
    if (availableThemes().indexOf(theme) === -1) {
      return;
    }
    state.theme = theme;
    saveTheme(theme);
    applyShellTheme();
    await syncNativeShellState();
    updateView({ skipDrawer: true });
    updateEasyConfigPanel(true);
  }

  function applyShellTheme() {
    document.body.setAttribute('data-cc-theme', state.theme || 'obsidian');
  }

  function renderThemeSelect() {
    if (!refs.themeSelect) {
      return;
    }
    html(refs.themeSelect, availableThemes().map(function (themeKey) {
      return '<option value="' + escapeHtml(themeKey) + '"' + (themeKey === state.theme ? ' selected' : '') + '>' +
        escapeHtml(t('theme.' + themeKey)) + '</option>';
    }).join(''));
  }

  function isDrawerShellTab(tab) {
    return tab === 'config' || tab === 'aiAgents' || tab === 'automation' || tab === 'infrastructure';
  }

  function isDrawerShellAdvanced(tab) {
    return !!(state.shellAdvancedTabs && state.shellAdvancedTabs[tab]);
  }

  function setDrawerShellAdvanced(tab, nextValue) {
    if (!isDrawerShellTab(tab)) {
      return;
    }
    state.shellAdvancedTabs[tab] = !!nextValue;
  }

  function applyStaticTranslations() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('meta.title');
    applyShellTheme();
    refs.i18nNodes.forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      if (key) {
        node.textContent = t(key);
      }
    });
    if (refs.langZhButton) {
      refs.langZhButton.classList.toggle('active', state.lang === 'zh');
    }
    if (refs.langEnButton) {
      refs.langEnButton.classList.toggle('active', state.lang === 'en');
    }
    renderThemeSelect();
  }

  function renderPilot() {
    var app = resolveApp();
    var connected = !!(app && app.connected);
    refs.connectBlock.classList.toggle('is-visible', !connected);
    refs.connectBlock.hidden = false;

    refs.connectionBadge.className = 'cc-badge ' + (connected ? 'cc-badge-ok' : 'cc-badge-warn');
    text(refs.connectionBadge, connected ? t('pilot.gateway.online') : t('pilot.gateway.offline'));

    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);
    refs.helperBadge.className = 'cc-badge ' + (helperOk ? 'cc-badge-ok' : 'cc-badge-warn');
    text(refs.helperBadge, helperOk ? t('pilot.helper.online') : t('pilot.helper.offline'));

    html(refs.modelSelect, buildModelOptions());

    var currentSession = getCurrentSession();
    text(refs.sessionPill, currentSession ? currentSession.key : t('common.session') + ' --');
    text(
      refs.modelPill,
      currentSession ? normalizeModelValue(currentSession.modelProvider, currentSession.model) : t('common.model') + ' --'
    );

    if (refs.tokenInput && !refs.tokenInput.value) {
      refs.tokenInput.value = resolveToken(app);
    }
  }

  function renderEasySegment(field, currentValue, options) {
    return '<div class="cc-easy-segment">' + options.map(function (option) {
      var active = option.value === currentValue;
      return (
        '<button class="cc-easy-segment-btn' + (active ? ' active' : '') + '" type="button" data-easy-action="set-field" data-easy-field="' +
        escapeHtml(field) + '" data-easy-value="' + escapeHtml(option.value) + '">' + escapeHtml(option.label) + '</button>'
      );
    }).join('') + '</div>';
  }

  function renderEasyField(label, help, controlHtml, extraHtml) {
    return (
      '<div class="cc-easy-field">' +
        '<div class="cc-easy-field-head">' +
          '<strong>' + escapeHtml(label) + '</strong>' +
          (help ? '<span>' + escapeHtml(help) + '</span>' : '') +
        '</div>' +
        controlHtml +
        (extraHtml || '') +
      '</div>'
    );
  }

  function renderDrawerShellHero(eyebrowKey, titleKey, descKey, statusKey, statusClass, extraHtml) {
    return (
      '<section class="cc-easy-hero">' +
        '<div>' +
          '<span class="cc-eyebrow">' + escapeHtml(t(eyebrowKey)) + '</span>' +
          '<h3>' + escapeHtml(t(titleKey)) + '</h3>' +
          '<p>' + escapeHtml(t(descKey)) + '</p>' +
        '</div>' +
        '<div class="cc-easy-hero-meta">' +
          '<span class="cc-easy-status ' + escapeHtml(statusClass || '') + '">' + escapeHtml(t(statusKey)) + '</span>' +
          (extraHtml || '') +
        '</div>' +
      '</section>'
    );
  }

  function renderInfoStack(items) {
    return '<div class="cc-easy-info-stack">' + items.map(function (item) {
      return (
        '<div class="cc-easy-info-row">' +
          '<span class="cc-easy-info-label">' + escapeHtml(item.label) + '</span>' +
          '<strong class="cc-easy-info-value">' + escapeHtml(item.value) + '</strong>' +
          (item.copy ? '<span class="cc-easy-info-copy">' + escapeHtml(item.copy) + '</span>' : '') +
        '</div>'
      );
    }).join('') + '</div>';
  }

  function renderSimplePills(values, emptyText) {
    var list = uniqueStrings(values || []);
    if (!list.length) {
      return '<div class="cc-easy-inline-note">' + escapeHtml(emptyText || t('shell.none')) + '</div>';
    }
    return '<div class="cc-easy-chip-wrap">' + list.map(function (value) {
      return '<span class="cc-easy-pill">' + escapeHtml(value) + '</span>';
    }).join('') + '</div>';
  }

  function friendlyMode(value) {
    if (value === true || value === 'on') {
      return t('shell.mode.on');
    }
    if (value === false || value === 'off') {
      return t('shell.mode.off');
    }
    if (value === 'auto') {
      return t('shell.mode.auto');
    }
    if (value === 'raw') {
      return t('shell.mode.raw');
    }
    if (value == null || value === '') {
      return t('shell.none');
    }
    return String(value);
  }

  function formatListPreview(values, maxCount) {
    var list = uniqueStrings(values || []);
    if (!list.length) {
      return t('shell.none');
    }
    var cap = typeof maxCount === 'number' ? maxCount : 3;
    var head = list.slice(0, cap).join(' / ');
    if (list.length <= cap) {
      return head;
    }
    return head + ' + ' + t('shell.more', { count: list.length - cap });
  }

  function helperServiceState(service) {
    if (!service) {
      return t('shell.status.offline');
    }
    if (service.duplicate) {
      return t('mcp.status.duplicate');
    }
    if (service.managed) {
      return t('mcp.status.managed');
    }
    if (service.running) {
      return t('mcp.status.running');
    }
    return t('mcp.status.stopped');
  }

  function renderAdvancedShellToolbar(tab) {
    var titleKey = tab === 'config' ? 'easy.openAdvanced'
      : tab === 'aiAgents' ? 'tab.ai.title'
      : tab === 'automation' ? 'tab.automation.title'
      : 'tab.infrastructure.title';
    return (
      '<section class="cc-easy-toolbar">' +
        '<div class="cc-easy-toolbar-copy">' +
          '<span class="cc-eyebrow">' + escapeHtml(t('easy.advanced')) + '</span>' +
          '<strong>' + escapeHtml(t(titleKey)) + '</strong>' +
          '<span>' + escapeHtml(t('shell.advancedDesc')) + '</span>' +
        '</div>' +
        '<div class="cc-easy-toolbar-actions">' +
          '<span class="cc-easy-status is-clean">' + escapeHtml(t('easy.status.saved')) + '</span>' +
          '<button class="cc-action" type="button" data-easy-action="back-simple" data-shell-tab="' + escapeHtml(tab) + '">' + escapeHtml(t('shell.advancedBack')) + '</button>' +
        '</div>' +
      '</section>'
    );
  }

  function renderOpenAdvancedCard(tab) {
    return (
      '<section class="cc-easy-card cc-easy-card-advanced">' +
        '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('easy.advanced')) + '</span></div>' +
        '<p class="cc-easy-card-copy">' + escapeHtml(t('shell.advancedDesc')) + '</p>' +
        '<button class="cc-action" type="button" data-easy-action="open-advanced" data-shell-tab="' + escapeHtml(tab) + '">' + escapeHtml(t('shell.advancedOpen')) + '</button>' +
      '</section>'
    );
  }

  function renderThemeCard() {
    return (
      '<section class="cc-easy-card">' +
        '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('pilot.theme')) + '</span></div>' +
        renderEasyField(
          t('pilot.theme'),
          t('theme.desc'),
          '<select class="cc-select cc-easy-select" data-shell-theme="1">' + availableThemes().map(function (themeKey) {
            return '<option value="' + escapeHtml(themeKey) + '"' + (themeKey === state.theme ? ' selected' : '') + '>' + escapeHtml(t('theme.' + themeKey)) + '</option>';
          }).join('') + '</select>'
        ) +
      '</section>'
    );
  }

  function renderAiOverviewPanel() {
    var config = currentConfigSource();
    var agentDefaults = config && config.agents && config.agents.defaults ? config.agents.defaults : {};
    var modelDefaults = agentDefaults.model || {};
    var currentSession = getCurrentSession();
    var providerKeys = config && config.models && config.models.providers ? Object.keys(config.models.providers) : [];
    var imageModels = config && config.tools && config.tools.media && config.tools.media.image && Array.isArray(config.tools.media.image.models)
      ? config.tools.media.image.models.map(function (item) { return normalizeModelValue(item.provider, item.model); })
      : [];
    var totalModels = availableEasyModels().length;
    var contextLoad = currentSession && currentSession.contextTokens
      ? Math.round(((currentSession.inputTokens || 0) / currentSession.contextTokens) * 100) + '%'
      : '--';

    return (
      '<div class="cc-easy-shell">' +
        renderDrawerShellHero('tab.ai.eyebrow', 'tab.ai.title', 'tab.ai.desc', 'shell.status.online', 'is-clean') +
        '<div class="cc-easy-grid">' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.ai.defaults')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.ai.primary'), value: formatEasyModelLabel(modelDefaults.primary || '') },
              { label: t('tab.ai.fallbacks'), value: String(uniqueStrings(modelDefaults.fallbacks || []).length), copy: formatListPreview(modelDefaults.fallbacks || [], 2) },
              { label: t('tab.ai.context'), value: friendlyMode(agentDefaults.contextPruning && agentDefaults.contextPruning.mode), copy: agentDefaults.contextPruning && agentDefaults.contextPruning.ttl || '' },
              { label: t('tab.ai.compaction'), value: friendlyMode(agentDefaults.compaction && agentDefaults.compaction.mode) },
              { label: t('tab.ai.heartbeat'), value: agentDefaults.heartbeat && agentDefaults.heartbeat.every || '--' }
            ]) +
          '</section>' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.ai.pool')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.ai.providers'), value: String(providerKeys.length), copy: providerKeys.join(' / ') || t('shell.none') },
              { label: t('tab.ai.totalModels'), value: String(totalModels) },
              { label: t('tab.ai.imageModels'), value: String(uniqueStrings(imageModels).length), copy: formatListPreview(imageModels, 2) }
            ]) +
          '</section>' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.ai.runtime')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.ai.session'), value: currentSession ? currentSession.key : '--' },
              { label: t('tab.ai.sessionCount'), value: String(state.sessions.length) },
              { label: t('tab.ai.currentModel'), value: currentSession ? normalizeModelValue(currentSession.modelProvider, currentSession.model) : '--' },
              { label: t('tab.ai.contextLoad'), value: contextLoad }
            ]) +
          '</section>' +
          renderOpenAdvancedCard('aiAgents') +
        '</div>' +
      '</div>'
    );
  }

  function renderAutomationOverviewPanel() {
    var config = currentConfigSource();
    var commands = config && config.commands ? config.commands : {};
    var plugins = config && config.plugins ? config.plugins : {};
    var allow = uniqueStrings(plugins.allow || []);
    var enabled = Object.keys(plugins.entries || {}).filter(function (key) {
      return plugins.entries[key] && plugins.entries[key].enabled !== false;
    });
    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);
    var services = Array.isArray(state.helperSnapshot && state.helperSnapshot.services) ? state.helperSnapshot.services : [];

    return (
      '<div class="cc-easy-shell">' +
        renderDrawerShellHero('tab.automation.eyebrow', 'tab.automation.title', 'tab.automation.desc', helperOk ? 'shell.status.online' : 'shell.status.offline', helperOk ? 'is-clean' : 'is-dirty') +
        '<div class="cc-easy-grid">' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.automation.commands')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.automation.native'), value: friendlyMode(commands.native) },
              { label: t('tab.automation.skills'), value: friendlyMode(commands.nativeSkills) },
              { label: t('tab.automation.restart'), value: friendlyMode(commands.restart) },
              { label: t('tab.automation.owner'), value: friendlyMode(commands.ownerDisplay) }
            ]) +
          '</section>' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.automation.plugins')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.automation.allow'), value: String(allow.length), copy: formatListPreview(allow, 3) },
              { label: t('tab.automation.enabled'), value: String(enabled.length), copy: formatListPreview(enabled, 3) }
            ]) +
          '</section>' +
          '<section class="cc-easy-card cc-easy-service-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.automation.services')) + '</span></div>' +
            (services.length
              ? '<div class="cc-easy-service-list">' + services.map(function (service) {
                  return (
                    '<article class="cc-easy-service">' +
                      '<div class="cc-easy-service-copy">' +
                        '<strong>' + escapeHtml(serviceDisplayName(service)) + '</strong>' +
                        '<span>' + escapeHtml(helperServiceState(service)) + '</span>' +
                      '</div>' +
                      '<div class="cc-easy-service-actions">' +
                        '<button class="cc-action cc-action-small" type="button" data-service-action="start" data-service-id="' + escapeHtml(service.id) + '">' + escapeHtml(t('mcp.start')) + '</button>' +
                        '<button class="cc-action cc-action-small" type="button" data-service-action="restart" data-service-id="' + escapeHtml(service.id) + '">' + escapeHtml(t('mcp.restart')) + '</button>' +
                        '<button class="cc-action cc-action-small" type="button" data-service-action="stop" data-service-id="' + escapeHtml(service.id) + '">' + escapeHtml(t('mcp.stop')) + '</button>' +
                      '</div>' +
                    '</article>'
                  );
                }).join('') + '</div>'
              : '<div class="cc-easy-empty-note">' + escapeHtml(helperOk ? t('tab.automation.noServices') : t('shell.helperUnavailable')) + '</div>') +
          '</section>' +
          renderOpenAdvancedCard('automation') +
        '</div>' +
      '</div>'
    );
  }

  function renderInfrastructureOverviewPanel() {
    var config = currentConfigSource();
    var gateway = config && config.gateway ? config.gateway : {};
    var controlUi = gateway.controlUi || {};
    var attachments = config && config.tools && config.tools.media && config.tools.media.image && config.tools.media.image.attachments
      ? config.tools.media.image.attachments
      : {};
    var imageModels = config && config.tools && config.tools.media && config.tools.media.image && Array.isArray(config.tools.media.image.models)
      ? config.tools.media.image.models.map(function (item) { return normalizeModelValue(item.provider, item.model); })
      : [];
    var qqbot = config && config.channels && config.channels.qqbot ? config.channels.qqbot : {};
    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);
    var app = resolveApp();
    var connected = !!(app && app.connected);
    var currentSession = getCurrentSession();

    return (
      '<div class="cc-easy-shell">' +
        renderDrawerShellHero('tab.infrastructure.eyebrow', 'tab.infrastructure.title', 'tab.infrastructure.desc', connected ? 'shell.status.online' : 'shell.status.offline', connected ? 'is-clean' : 'is-dirty') +
        '<div class="cc-easy-grid">' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.infrastructure.gateway')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.infrastructure.bind'), value: friendlyMode(gateway.bind) },
              { label: t('tab.infrastructure.auth'), value: friendlyMode(gateway.auth && gateway.auth.mode) },
              { label: t('tab.infrastructure.root'), value: controlUi.root || '--' },
              { label: t('tab.infrastructure.origins'), value: String((controlUi.allowedOrigins || []).length), copy: formatListPreview(controlUi.allowedOrigins || [], 2) },
              { label: t('tab.infrastructure.deviceAuth'), value: controlUi.dangerouslyDisableDeviceAuth ? t('shell.gateway.deviceAuthOff') : t('shell.gateway.deviceAuthOn') }
            ]) +
          '</section>' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.infrastructure.media')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.infrastructure.attachments'), value: friendlyMode(attachments.mode) },
              { label: t('tab.infrastructure.maxAttachments'), value: String(attachments.maxAttachments || 0) }
            ]) +
            renderSimplePills(imageModels, t('shell.none')) +
          '</section>' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.infrastructure.channel')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.infrastructure.qq'), value: qqbot.enabled ? t('shell.status.online') : t('shell.status.offline') },
              { label: t('tab.infrastructure.qqVoice'), value: qqbot.stt && qqbot.stt.enabled ? t('shell.status.online') : t('shell.status.offline') },
              { label: t('tab.infrastructure.qqApp'), value: qqbot.appId || '--' }
            ]) +
          '</section>' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('tab.infrastructure.runtime')) + '</span></div>' +
            renderInfoStack([
              { label: t('tab.infrastructure.gatewayStatus'), value: connected ? t('shell.status.online') : t('shell.status.offline') },
              { label: t('tab.infrastructure.helperStatus'), value: helperOk ? t('shell.status.online') : t('shell.status.offline') },
              { label: t('tab.infrastructure.currentSession'), value: currentSession ? currentSession.key : '--' }
            ]) +
          '</section>' +
          renderThemeCard() +
          renderOpenAdvancedCard('infrastructure') +
        '</div>' +
      '</div>'
    );
  }

  function buildEasyConfigSignature() {
    return [
      state.lang,
      state.theme,
      state.drawerOpen ? '1' : '0',
      state.drawerTab,
      isDrawerShellAdvanced(state.drawerTab) ? '1' : '0',
      state.easyConfigBusy ? '1' : '0',
      serializeEasyConfig(state.easyConfigBaseline),
      serializeEasyConfig(state.easyConfigDraft),
      state.configSnapshot && state.configSnapshot.hash ? state.configSnapshot.hash : '',
      state.configSnapshot && state.configSnapshot.path ? state.configSnapshot.path : '',
      JSON.stringify(state.helperSnapshot && state.helperSnapshot.services ? state.helperSnapshot.services.map(function (service) {
        return [service.id, service.running, service.managed, service.duplicate].join(':');
      }) : []),
      state.sessions.length
    ].join('||');
  }

  function renderEasyConfigPanel() {
    var app = resolveApp();
    var connected = !!(app && app.connected);
    var statusKey = state.easyConfigBusy ? 'easy.status.saving' : state.easyConfigDirty ? 'easy.status.dirty' : 'easy.status.saved';
    var statusClass = state.easyConfigBusy ? 'is-busy' : state.easyConfigDirty ? 'is-dirty' : 'is-clean';
    var pathCopy = state.configSnapshot && state.configSnapshot.path ? state.configSnapshot.path : 'openclaw.json';
    var disabled = state.easyConfigBusy ? ' disabled' : '';

    if (isDrawerShellAdvanced('config')) {
      return renderAdvancedShellToolbar('config');
    }

    if (!connected) {
      return (
        '<section class="cc-easy-empty">' +
          '<span class="cc-eyebrow">' + escapeHtml(t('easy.eyebrow')) + '</span>' +
          '<strong>' + escapeHtml(t('easy.connectNeeded')) + '</strong>' +
          '<span>' + escapeHtml(t('easy.desc')) + '</span>' +
        '</section>'
      );
    }

    if (!state.easyConfigDraft || !state.configSnapshot || !state.configSnapshot.hash) {
      return (
        '<section class="cc-easy-empty">' +
          '<span class="cc-eyebrow">' + escapeHtml(t('easy.eyebrow')) + '</span>' +
          '<strong>' + escapeHtml(t('easy.noConfig')) + '</strong>' +
          '<span>' + escapeHtml(pathCopy) + '</span>' +
        '</section>'
      );
    }

    var draft = state.easyConfigDraft;
    var modelOptions = selectEasyOptionValues(availableEasyModels(), draft.primaryModel);
    var fallbackHint = draft.fallbackModels.length
      ? t('easy.fallbackHintSelected', { count: draft.fallbackModels.length })
      : t('easy.fallbackHintEmpty');
    var contextModeOptions = selectEasyOptionValues(['cache-ttl', 'default', 'off'], draft.contextMode).map(function (value) {
      return {
        value: value,
        label: t('easy.contextMode.' + value) === ('easy.contextMode.' + value) ? value : t('easy.contextMode.' + value)
      };
    });
    var ttlOptions = selectEasyOptionValues(['15m', '30m', '1h', '2h', '6h'], draft.contextTtl);
    var compactionOptions = selectEasyOptionValues(['default', 'off'], draft.compactionMode).map(function (value) {
      return {
        value: value,
        label: t('easy.compaction.' + value) === ('easy.compaction.' + value) ? value : t('easy.compaction.' + value)
      };
    });
    var heartbeatOptions = selectEasyOptionValues(['30m', '1h', '2h', '6h', '12h'], draft.heartbeatEvery);
    var providerOptions = selectEasyOptionValues(
      state.config && state.config.models && state.config.models.providers ? Object.keys(state.config.models.providers) : [],
      draft.qqbotSttProvider
    );
    var sttModelOptions = selectEasyOptionValues(modelValuesForProvider(draft.qqbotSttProvider), draft.qqbotSttModel);

    return (
      '<div class="cc-easy-shell">' +
        '<section class="cc-easy-hero">' +
          '<div>' +
            '<span class="cc-eyebrow">' + escapeHtml(t('easy.eyebrow')) + '</span>' +
            '<h3>' + escapeHtml(t('easy.title')) + '</h3>' +
            '<p>' + escapeHtml(t('easy.desc')) + '</p>' +
          '</div>' +
          '<div class="cc-easy-hero-meta">' +
            '<span class="cc-easy-status ' + statusClass + '">' + escapeHtml(t(statusKey)) + '</span>' +
            '<span class="cc-easy-path"><em>' + escapeHtml(t('easy.sourcePath')) + '</em><strong>' + escapeHtml(pathCopy) + '</strong></span>' +
          '</div>' +
        '</section>' +

        '<div class="cc-easy-grid">' +
          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('easy.ai')) + '</span></div>' +
            renderEasyField(
              t('easy.primaryModel'),
              t('easy.primaryModelHelp'),
              '<select class="cc-select cc-easy-select" data-easy-field="primaryModel">' + modelOptions.map(function (value) {
                return '<option value="' + escapeHtml(value) + '"' + (value === draft.primaryModel ? ' selected' : '') + '>' + escapeHtml(formatEasyModelLabel(value)) + '</option>';
              }).join('') + '</select>'
            ) +
            renderEasyField(
              t('easy.fallbackModels'),
              t('easy.fallbackModelsHelp'),
              '<div class="cc-easy-chip-wrap">' + modelOptions.map(function (value) {
                var active = draft.fallbackModels.indexOf(value) >= 0;
                return '<button class="cc-easy-chip' + (active ? ' active' : '') + '" type="button" data-easy-action="toggle-fallback" data-easy-value="' + escapeHtml(value) + '">' + escapeHtml(formatEasyModelLabel(value)) + '</button>';
              }).join('') + '</div>',
              '<div class="cc-easy-inline-note">' + escapeHtml(fallbackHint) + '</div>'
            ) +
            renderEasyField(
              t('easy.contextMode'),
              t('easy.contextModeHelp'),
              renderEasySegment('contextMode', draft.contextMode, contextModeOptions)
            ) +
            renderEasyField(
              t('easy.contextTtl'),
              t('easy.contextTtlHelp'),
              '<select class="cc-select cc-easy-select" data-easy-field="contextTtl">' + ttlOptions.map(function (value) {
                return '<option value="' + escapeHtml(value) + '"' + (value === draft.contextTtl ? ' selected' : '') + '>' + escapeHtml(value) + '</option>';
              }).join('') + '</select>'
            ) +
            renderEasyField(
              t('easy.compactionMode'),
              t('easy.compactionModeHelp'),
              renderEasySegment('compactionMode', draft.compactionMode, compactionOptions)
            ) +
            renderEasyField(
              t('easy.heartbeatEvery'),
              t('easy.heartbeatEveryHelp'),
              renderEasySegment('heartbeatEvery', draft.heartbeatEvery, heartbeatOptions.map(function (value) {
                return { value: value, label: value };
              }))
            ) +
          '</section>' +

          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('easy.voice')) + '</span></div>' +
            renderEasyField(
              t('easy.qqbotEnabled'),
              t('easy.qqbotEnabledHelp'),
              renderEasySegment('qqbotEnabled', String(!!draft.qqbotEnabled), [
                { value: 'true', label: t('easy.on') },
                { value: 'false', label: t('easy.off') }
              ])
            ) +
            renderEasyField(
              t('easy.qqbotSttEnabled'),
              t('easy.qqbotSttEnabledHelp'),
              renderEasySegment('qqbotSttEnabled', String(!!draft.qqbotSttEnabled), [
                { value: 'true', label: t('easy.on') },
                { value: 'false', label: t('easy.off') }
              ])
            ) +
            renderEasyField(
              t('easy.qqbotSttProvider'),
              '',
              '<select class="cc-select cc-easy-select" data-easy-field="qqbotSttProvider">' + providerOptions.map(function (value) {
                return '<option value="' + escapeHtml(value) + '"' + (value === draft.qqbotSttProvider ? ' selected' : '') + '>' + escapeHtml(value || '--') + '</option>';
              }).join('') + '</select>'
            ) +
            renderEasyField(
              t('easy.qqbotSttModel'),
              '',
              '<select class="cc-select cc-easy-select" data-easy-field="qqbotSttModel">' + sttModelOptions.map(function (value) {
                return '<option value="' + escapeHtml(value) + '"' + (value === draft.qqbotSttModel ? ' selected' : '') + '>' + escapeHtml(value || '--') + '</option>';
              }).join('') + '</select>'
            ) +
          '</section>' +

          '<section class="cc-easy-card">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('easy.gateway')) + '</span></div>' +
            renderEasyField(
              t('easy.gatewayBind'),
              t('easy.gatewayBindHelp'),
              renderEasySegment('gatewayBind', draft.gatewayBind, selectEasyOptionValues(['lan', 'loopback'], draft.gatewayBind).map(function (value) {
                var key = 'easy.gatewayBind.' + value;
                return { value: value, label: t(key) === key ? value : t(key) };
              }))
            ) +
            renderEasyField(
              t('easy.restart'),
              t('easy.restartHelp'),
              renderEasySegment('restartEnabled', String(!!draft.restartEnabled), [
                { value: 'true', label: t('easy.on') },
                { value: 'false', label: t('easy.off') }
              ])
            ) +
          '</section>' +

          '<section class="cc-easy-card cc-easy-card-advanced">' +
            '<div class="cc-easy-card-head"><span class="cc-eyebrow">' + escapeHtml(t('easy.advanced')) + '</span></div>' +
            '<p class="cc-easy-card-copy">' + escapeHtml(t('easy.advancedDesc')) + '</p>' +
            '<button class="cc-action" type="button" data-easy-action="open-advanced">' + escapeHtml(t('easy.openAdvanced')) + '</button>' +
          '</section>' +
        '</div>' +

        '<section class="cc-easy-actions">' +
          '<button class="cc-action" type="button" data-easy-action="reset"' + (state.easyConfigDirty ? '' : ' disabled') + '>' + escapeHtml(t('easy.reset')) + '</button>' +
          '<button class="cc-action" type="button" data-easy-action="save"' + (state.easyConfigDirty ? disabled : ' disabled') + '>' + escapeHtml(t('easy.save')) + '</button>' +
          '<button class="cc-action cc-action-primary" type="button" data-easy-action="apply"' + (state.easyConfigDirty ? disabled : ' disabled') + '>' + escapeHtml(t('easy.saveApply')) + '</button>' +
        '</section>' +
      '</div>'
    );
  }

  function updateEasyConfigPanel(force) {
    if (!refs.easyConfigPanel) {
      return;
    }
    if (!state.drawerOpen || !isDrawerShellTab(state.drawerTab)) {
      refs.easyConfigPanel.hidden = true;
      state.lastEasyConfigSignature = '';
      return;
    }

    refs.easyConfigPanel.hidden = false;
    var signature = buildEasyConfigSignature();
    if (!force && signature === state.lastEasyConfigSignature) {
      return;
    }
    state.lastEasyConfigSignature = signature;
    var content = '';
    if (state.drawerTab === 'config') {
      content = renderEasyConfigPanel();
    } else if (state.drawerTab === 'aiAgents') {
      content = isDrawerShellAdvanced('aiAgents') ? renderAdvancedShellToolbar('aiAgents') : renderAiOverviewPanel();
    } else if (state.drawerTab === 'automation') {
      content = isDrawerShellAdvanced('automation') ? renderAdvancedShellToolbar('automation') : renderAutomationOverviewPanel();
    } else if (state.drawerTab === 'infrastructure') {
      content = isDrawerShellAdvanced('infrastructure') ? renderAdvancedShellToolbar('infrastructure') : renderInfrastructureOverviewPanel();
    }
    html(refs.easyConfigPanel, content);
  }

  function roleLabel(message) {
    if (!message) {
      return t('role.unknown');
    }
    if (message.role === 'assistant') {
      return t('role.assistant');
    }
    if (message.role === 'user') {
      return t('role.user');
    }
    if (message.role === 'tool') {
      return t('role.tool');
    }
    if (message.role === 'toolResult') {
      return t('role.toolResult');
    }
    return message.role || t('role.unknown');
  }

  function entryMeta(message) {
    var bits = [];
    if (message.timestamp) {
      bits.push(formatClock(message.timestamp));
    }
    if (message.provider || message.model) {
      bits.push([message.provider, message.model].filter(Boolean).join('/'));
    }
    if (message.toolName) {
      bits.push(message.toolName);
    }
    if (message.usage && typeof message.usage.totalTokens === 'number') {
      bits.push(formatCompact(message.usage.totalTokens) + ' tok');
    }
    return bits.join(' | ') || '--';
  }

  function renderResults() {
    var app = resolveApp();
    var messages = getCurrentMessages();
    var stream = app && app.chatStream ? String(app.chatStream) : '';
    var finalAssistant = stream
      ? {
          role: 'assistant',
          content: [{ type: 'text', text: stream }],
          provider: getCurrentSession() && getCurrentSession().modelProvider,
          model: getCurrentSession() && getCurrentSession().model,
          timestamp: Date.now()
        }
      : getLastAssistantMessage(messages);
    var currentSession = getCurrentSession();
    var finalText = summarizeMessage(finalAssistant);
    var lastUsage = getLastAssistantUsage(messages);

    if (finalText) {
      html(refs.finalOutput, '<pre class="cc-markdown">' + escapeHtml(finalText) + '</pre>');
      text(
        refs.resultMeta,
        [currentSession ? currentSession.key : '--', finalAssistant ? entryMeta(finalAssistant) : '--'].join(' | ')
      );
    } else {
      html(refs.finalOutput, '<div class="cc-placeholder">' + escapeHtml(t('results.placeholder')) + '</div>');
      text(refs.resultMeta, t('results.waiting'));
    }

    var traceMessages = messages.slice(-12).map(function (message) {
      return (
        '<article class="cc-entry cc-entry-' + escapeHtml(message.role || 'unknown') + '">' +
          '<div class="cc-entry-head">' +
            '<span class="cc-entry-role">' + escapeHtml(roleLabel(message)) + '</span>' +
            '<span class="cc-entry-meta">' + escapeHtml(entryMeta(message)) + '</span>' +
          '</div>' +
          '<pre class="cc-entry-body">' + escapeHtml(summarizeMessage(message) || '(empty)') + '</pre>' +
        '</article>'
      );
    });

    if (stream) {
      traceMessages.push(
        '<article class="cc-entry cc-entry-assistant">' +
          '<div class="cc-entry-head">' +
            '<span class="cc-entry-role">' + escapeHtml(t('results.stream')) + '</span>' +
            '<span class="cc-entry-meta">' + escapeHtml(t('results.live')) + '</span>' +
          '</div>' +
          '<pre class="cc-entry-body">' + escapeHtml(stream) + '</pre>' +
        '</article>'
      );
    }

    html(
      refs.traceFeed,
      traceMessages.length ? traceMessages.join('') : '<div class="cc-placeholder">' + escapeHtml(t('results.traceEmpty')) + '</div>'
    );
    text(refs.traceMeta, t('results.events', { count: traceMessages.length }));

    var sessionMetaBits = [];
    if (currentSession) {
      sessionMetaBits.push(normalizeModelValue(currentSession.modelProvider, currentSession.model));
      sessionMetaBits.push(t('common.ctx') + ' ' + formatCompact(currentSession.contextTokens || 0));
      sessionMetaBits.push(t('common.total') + ' ' + formatCompact(currentSession.totalTokens || 0));
    }
    if (lastUsage && typeof lastUsage.output === 'number') {
      sessionMetaBits.push(t('common.lastOut') + ' ' + formatCompact(lastUsage.output));
    }
    text(refs.sessionPill, currentSession ? currentSession.key : t('common.session') + ' --');
    text(refs.modelPill, sessionMetaBits.length ? sessionMetaBits.join(' | ') : t('common.model') + ' --');
  }

  function renderTokens() {
    var currentSession = getCurrentSession();
    var daily = getDailyUsage();
    var today = daily.length ? daily[daily.length - 1] : null;
    var messages = getCurrentMessages();
    var lastUsage = getLastAssistantUsage(messages);
    var contextLoad = currentSession && currentSession.contextTokens
      ? Math.round(((currentSession.inputTokens || 0) / currentSession.contextTokens) * 100)
      : null;

    var cards = [
      {
        label: t('token.current'),
        value: formatCompact(currentSession && currentSession.totalTokens || 0),
        copy: currentSession ? normalizeModelValue(currentSession.modelProvider, currentSession.model) : t('token.noSession')
      },
      {
        label: t('token.today'),
        value: formatCompact(today && (today.totalTokens || today.tokens) || 0),
        copy: today ? t('token.messages', { count: formatCompact(today.messages || 0) }) : t('token.usageNotLoaded')
      },
      {
        label: t('token.last'),
        value: formatCompact(lastUsage && lastUsage.output || 0),
        copy: lastUsage ? t('token.input', { count: formatCompact(lastUsage.input || 0) }) : t('token.noAssistant')
      },
      {
        label: t('token.context'),
        value: contextLoad == null ? '--' : contextLoad + '%',
        copy: currentSession ? t('token.window', { count: formatCompact(currentSession.contextTokens || 0) }) : t('token.unknown')
      }
    ];

    html(
      refs.tokenMetrics,
      cards.map(function (card) {
        return (
          '<article class="cc-metric">' +
            '<div class="cc-metric-head">' +
              '<span class="cc-subtitle">' + escapeHtml(card.label) + '</span>' +
              '<span class="cc-metric-value">' + escapeHtml(card.value) + '</span>' +
            '</div>' +
            '<div class="cc-metric-copy">' + escapeHtml(card.copy) + '</div>' +
          '</article>'
        );
      }).join('')
    );
  }

  function helperServiceTone(service) {
    if (!service || !service.running) {
      return 'cc-badge-warn';
    }
    if (service.processCount > 1) {
      return 'cc-badge-bad';
    }
    return 'cc-badge-ok';
  }

  function helperServiceStatus(service) {
    if (!service || !service.running) {
      return t('mcp.status.stopped');
    }
    if (service.processCount > 1) {
      return t('mcp.status.duplicate');
    }
    return service.managed ? t('mcp.status.managed') : t('mcp.status.running');
  }

  function renderMcpStatus() {
    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);
    if (!helperOk) {
      html(refs.mcpStatus, '<div class="cc-placeholder">' + escapeHtml(t('mcp.helperOffline', { base: state.helperBase })) + '</div>');
      return;
    }

    var services = Array.isArray(state.helperSnapshot.services) ? state.helperSnapshot.services : [];
    html(
      refs.mcpStatus,
      services.map(function (service) {
        var processes = Array.isArray(service.processes) ? service.processes : [];
        var processLines = processes.length
          ? processes.map(function (proc) {
              return (
                '<div class="cc-process-line">' +
                  '<span>' + escapeHtml(t('mcp.pid')) + ' <code>' + escapeHtml(String(proc.pid)) + '</code></span>' +
                  '<span>' + escapeHtml(formatDuration(proc.uptimeMs || 0)) + '</span>' +
                '</div>'
              );
            }).join('')
          : '<div class="cc-placeholder">' + escapeHtml(t('mcp.noProcess')) + '</div>';

        return (
          '<article class="cc-service">' +
            '<div class="cc-service-head">' +
              '<span class="cc-service-name">' + escapeHtml(serviceDisplayName(service)) + '</span>' +
              '<span class="cc-badge ' + helperServiceTone(service) + '">' + escapeHtml(helperServiceStatus(service)) + '</span>' +
            '</div>' +
            '<div class="cc-service-copy">' + escapeHtml(t('mcp.path')) + ': <code>' + escapeHtml(service.path) + '</code></div>' +
            '<div class="cc-service-copy">' + escapeHtml(t('mcp.command')) + ': <code>' + escapeHtml(service.command) + '</code></div>' +
            '<div class="cc-service-processes">' + processLines + '</div>' +
            '<div class="cc-service-actions">' +
              '<button class="cc-action cc-action-small" data-service-action="start" data-service-id="' + escapeHtml(service.id) + '" type="button">' + escapeHtml(t('mcp.start')) + '</button>' +
              '<button class="cc-action cc-action-small cc-action-primary" data-service-action="restart" data-service-id="' + escapeHtml(service.id) + '" type="button">' + escapeHtml(t('mcp.restart')) + '</button>' +
              '<button class="cc-action cc-action-small" data-service-action="stop" data-service-id="' + escapeHtml(service.id) + '" type="button">' + escapeHtml(t('mcp.stop')) + '</button>' +
            '</div>' +
          '</article>'
        );
      }).join('')
    );
  }

  function renderApiWall() {
    var helperOk = !!(state.helperSnapshot && state.helperSnapshot.helper && state.helperSnapshot.helper.ok);
    var diagnostics = helperOk && Array.isArray(state.helperSnapshot.diagnostics)
      ? state.helperSnapshot.diagnostics.slice(-10).reverse()
      : [];
    var hottest = diagnostics[0] || null;
    var hot = !!(hottest && hottest.detectedAt && Date.now() - new Date(hottest.detectedAt).getTime() < 300000);

    refs.apiWall.classList.toggle('is-hot', hot);
    text(refs.apiState, hot ? t('api.state.hot') : helperOk ? t('api.state.clean') : t('api.state.offline'));

    if (!helperOk) {
      html(refs.apiErrors, '<div class="cc-placeholder">' + escapeHtml(t('api.helperOffline')) + '</div>');
      return;
    }

    if (!diagnostics.length) {
      html(refs.apiErrors, '<div class="cc-placeholder">' + escapeHtml(t('api.noErrors')) + '</div>');
      return;
    }

    html(
      refs.apiErrors,
      diagnostics.map(function (entry) {
        var statusText = entry.status ? String(entry.status) : 'ERR';
        var pathValue = entry.fullPath || entry.path || entry.url || 'unknown path';
        var bodyText = entry.responseBody ? JSON.stringify(entry.responseBody) : entry.message || t('api.noBody');
        return (
          '<article class="cc-diagnostic">' +
            '<div class="cc-diagnostic-head">' +
              '<span class="cc-diagnostic-code">' + escapeHtml(statusText) + '</span>' +
              '<span class="cc-entry-meta">' + escapeHtml(formatTime(entry.detectedAt)) + ' | ' + escapeHtml(formatRelative(entry.detectedAt)) + '</span>' +
            '</div>' +
            '<div class="cc-diagnostic-path">' + escapeHtml(pathValue) + '</div>' +
            '<div class="cc-diagnostic-copy">' + escapeHtml(bodyText.slice(0, 240)) + '</div>' +
          '</article>'
        );
      }).join('')
    );
  }

  function clearDrawerSectionSync() {
    if (state.drawerSectionSyncTimer) {
      window.clearTimeout(state.drawerSectionSyncTimer);
      state.drawerSectionSyncTimer = null;
    }
  }

  function matchesNativeSection(node, section) {
    if (!node || !section) {
      return false;
    }
    var textValue = String(node.textContent || '').trim().toLowerCase();
    if (!textValue) {
      return false;
    }
    if (textValue === section) {
      return true;
    }
    if (section === 'models') {
      return textValue === 'model';
    }
    return false;
  }

  function syncDrawerSection(attempt) {
    if (!state.drawerOpen || state.drawerTab !== 'aiAgents' || !state.drawerSection) {
      clearDrawerSectionSync();
      return;
    }

    var app = resolveApp();
    if (!app) {
      return;
    }

    var tries = typeof attempt === 'number' ? attempt : 0;
    var section = state.drawerSection;
    var selected = null;

    try {
      app.aiAgentsActiveSection = section;
      if (typeof app.requestUpdate === 'function') {
        app.requestUpdate();
      }
    } catch (error) {}

    selected = Array.prototype.find.call(
      app.querySelectorAll('[role="tab"][aria-selected="true"]'),
      function (node) {
        return matchesNativeSection(node, section);
      }
    );

    if (selected) {
      state.drawerSection = null;
      clearDrawerSectionSync();
      return;
    }

    var target = Array.prototype.find.call(
      app.querySelectorAll('[role="tab"]'),
      function (node) {
        return matchesNativeSection(node, section);
      }
    );

    if (target) {
      target.click();
      selected = Array.prototype.find.call(
        app.querySelectorAll('[role="tab"][aria-selected="true"]'),
        function (node) {
          return matchesNativeSection(node, section);
        }
      );
      if (selected) {
        state.drawerSection = null;
        clearDrawerSectionSync();
        return;
      }
    }

    if (tries >= 24) {
      clearDrawerSectionSync();
      return;
    }

    clearDrawerSectionSync();
    state.drawerSectionSyncTimer = window.setTimeout(function () {
      syncDrawerSection(tries + 1);
    }, 120);
  }

  function updateDrawer() {
    refs.drawer.classList.toggle('is-open', state.drawerOpen);
    refs.drawer.setAttribute('aria-hidden', state.drawerOpen ? 'false' : 'true');
    refs.drawerBackdrop.hidden = !state.drawerOpen;

    refs.drawerTabs.forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-drawer-tab') === state.drawerTab);
    });

    updateEasyConfigPanel(false);

    var showingShellPanel = state.drawerOpen && isDrawerShellTab(state.drawerTab) && !isDrawerShellAdvanced(state.drawerTab);
    if (refs.nativeHost) {
      refs.nativeHost.hidden = showingShellPanel;
    }

    var app = resolveApp();
    if (!state.drawerOpen) {
      state.appliedDrawerTab = null;
    }
    var desiredNativeTab = showingShellPanel ? null : state.drawerTab;
    if (state.drawerOpen && desiredNativeTab && app && typeof app.setTab === 'function' && state.appliedDrawerTab !== desiredNativeTab) {
      app.setTab(desiredNativeTab);
      state.appliedDrawerTab = desiredNativeTab;
    }

    if (state.drawerOpen && desiredNativeTab === 'aiAgents' && state.drawerSection) {
      syncDrawerSection(0);
      return;
    }

    clearDrawerSectionSync();
  }

  function updateView(options) {
    var shouldSkipDrawer = !!(options && options.skipDrawer);
    applyStaticTranslations();
    renderPilot();
    renderResults();
    renderTokens();
    renderMcpStatus();
    renderApiWall();
    if (!shouldSkipDrawer) {
      updateDrawer();
    }
  }

  async function handleHelperAction(action, serviceId) {
    if (!serviceId) {
      return;
    }
    try {
      var payload = await callHelper({
        type: 'serviceAction',
        action: action,
        serviceId: serviceId
      });
      var result = payload && payload.result ? payload.result : payload;
      if (payload && payload.snapshot) {
        state.helperSnapshot = payload.snapshot;
      }
      showToast((result && result.message) || (serviceId + ' ' + action + ' ok'));
      updateView();
    } catch (error) {
      showToast(t('common.helperActionFailed', { action: t('common.action.' + action) }));
      await fetchHelperSnapshot();
    }
  }

  function bindEvents() {
    if (refs.logoButton) {
      refs.logoButton.addEventListener('click', function () {
        state.drawerOpen = !state.drawerOpen;
        updateDrawer();
      });
    }

    if (refs.settingsButton) {
      refs.settingsButton.addEventListener('click', function () {
        state.drawerOpen = !state.drawerOpen;
        updateDrawer();
      });
    }

    if (refs.drawerCloseButton) {
      refs.drawerCloseButton.addEventListener('click', function () {
        state.drawerOpen = false;
        updateDrawer();
      });
    }

    if (refs.drawerBackdrop) {
      refs.drawerBackdrop.addEventListener('click', function () {
        state.drawerOpen = false;
        updateDrawer();
      });
    }

    refs.drawerTabs.forEach(function (button) {
      button.addEventListener('click', function () {
        state.drawerTab = button.getAttribute('data-drawer-tab') || 'chat';
        state.drawerSection = null;
        setDrawerShellAdvanced(state.drawerTab, false);
        state.drawerOpen = true;
        updateDrawer();
      });
    });

    if (refs.langZhButton) {
      refs.langZhButton.addEventListener('click', function () {
        void setLanguage('zh');
      });
    }

    if (refs.langEnButton) {
      refs.langEnButton.addEventListener('click', function () {
        void setLanguage('en');
      });
    }

    if (refs.themeSelect) {
      refs.themeSelect.addEventListener('change', function () {
        void setTheme(refs.themeSelect.value);
      });
    }

    if (refs.tokenInput) {
      refs.tokenInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          connectApp();
        }
      });
      refs.tokenInput.addEventListener('input', function () {
        setStoredToken(refs.tokenInput.value.trim());
      });
    }
    if (refs.modelConfigButton) {
      refs.modelConfigButton.addEventListener('click', function () {
        state.drawerTab = 'aiAgents';
        state.drawerSection = 'models';
        setDrawerShellAdvanced('aiAgents', false);
        state.drawerOpen = true;
        updateDrawer();
      });
    }

    if (refs.saveTokenButton) {
      refs.saveTokenButton.addEventListener('click', function () {
        setStoredToken(refs.tokenInput.value.trim());
        showToast(t('connect.tokenSaved'));
      });
    }

    if (refs.connectButton) {
      refs.connectButton.addEventListener('click', function () {
        connectApp();
      });
    }

    if (refs.modelSelect) {
      refs.modelSelect.addEventListener('change', function () {
        handleModelChange();
      });
    }

    if (refs.helperRefreshButton) {
      refs.helperRefreshButton.addEventListener('click', function () {
        fetchHelperSnapshot();
      });
    }

    if (refs.mcpStatus) {
      refs.mcpStatus.addEventListener('click', function (event) {
        var target = event.target.closest('[data-service-action]');
        if (!target) {
          return;
        }
        event.preventDefault();
        handleHelperAction(
          target.getAttribute('data-service-action'),
          target.getAttribute('data-service-id')
        );
      });
    }

    if (refs.easyConfigPanel) {
      refs.easyConfigPanel.addEventListener('change', function (event) {
        var themeTarget = event.target.closest('[data-shell-theme]');
        if (themeTarget) {
          setTheme(themeTarget.value);
          return;
        }
        var fieldTarget = event.target.closest('[data-easy-field]');
        if (!fieldTarget) {
          return;
        }
        setEasyConfigField(fieldTarget.getAttribute('data-easy-field'), fieldTarget.value);
      });

      refs.easyConfigPanel.addEventListener('click', function (event) {
        var actionTarget = event.target.closest('[data-easy-action]');
        if (!actionTarget) {
          return;
        }
        event.preventDefault();

        var action = actionTarget.getAttribute('data-easy-action');
        if (action === 'toggle-fallback') {
          toggleEasyFallback(actionTarget.getAttribute('data-easy-value'));
          return;
        }
        if (actionTarget.hasAttribute('data-service-action')) {
          handleHelperAction(
            actionTarget.getAttribute('data-service-action'),
            actionTarget.getAttribute('data-service-id')
          );
          return;
        }
        if (action === 'set-field') {
          setEasyConfigField(
            actionTarget.getAttribute('data-easy-field'),
            actionTarget.getAttribute('data-easy-value')
          );
          return;
        }
        if (action === 'reset') {
          resetEasyConfigDraft();
          return;
        }
        if (action === 'save') {
          saveEasyConfig(false);
          return;
        }
        if (action === 'apply') {
          saveEasyConfig(true);
          return;
        }
        if (action === 'open-advanced') {
          setDrawerShellAdvanced(actionTarget.getAttribute('data-shell-tab') || state.drawerTab, true);
          updateDrawer();
          return;
        }
        if (action === 'back-simple') {
          setDrawerShellAdvanced(actionTarget.getAttribute('data-shell-tab') || state.drawerTab, false);
          updateDrawer();
        }
      });
    }
  }

  async function start() {
    bindEvents();
    attachAppRealtimeSync();
    await syncNativeShellState();
    updateView();

    var app = resolveApp();
    if (refs.tokenInput && !refs.tokenInput.value) {
      refs.tokenInput.value = resolveToken(app);
    }

    if (resolveToken(app)) {
      await applyAppSettings(resolveToken(app));
      if (app && !app.connected && typeof app.connect === 'function') {
        app.connect();
      }
    }

    window.setTimeout(function () {
      refreshGatewayData(true);
    }, 900);
    fetchHelperSnapshot();

    state.refreshTimer = window.setInterval(function () {
      refreshGatewayData(false);
    }, REFRESH_MS);

    state.livePollTimer = window.setInterval(function () {
      syncLiveView(false);
    }, LIVE_SYNC_MS);

    state.helperTimer = window.setInterval(function () {
      fetchHelperSnapshot();
    }, HELPER_REFRESH_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();


