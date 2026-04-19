/** 与后端 docs/user-quick-guide.md 对齐的要点摘要（构建时不跨仓读文件）。 */

export const quickGuideIntro =
  '按顺序完成：数据库与私密配置 → 启动 relay → 启动管理台 → 配置机器人 / 发送目标 / 规则 → 在事件中心或「测试推送」验证。'

export const quickGuideSteps: { title: string; description: string }[] = [
  {
    title: '环境准备',
    description:
      'PostgreSQL 可用；填写 AUTH_TOKEN、JWT_SECRET、BOOTSTRAP_*、数据库 DSN 等。默认 relay 监听 :8780，可用 LISTEN_ADDR 覆盖。若 Telegram 需代理，设置 TELEGRAM_PROXY。',
  },
  {
    title: '启动 relay',
    description: '在后端仓库执行 go run ./cmd/relay，确认 /healthz 返回 ok。',
  },
  {
    title: '启动管理台',
    description:
      '在 telegram-relay-admin 执行 npm run dev；确认 .env 中 VITE_PROXY_TARGET 指向 relay（默认 http://127.0.0.1:8780）。',
  },
  {
    title: '控制台配置',
    description: '依次：机器人 → 发送目标 → 路由规则；再在事件中心 / 发送任务查看投递状态。',
  },
  {
    title: '验证',
    description:
      '具备 bot.manage 时可用「测试推送」；或外部脚本调用 POST /api/v2/notify（需 Bearer 与 security 配置一致）。',
  },
]

export const quickGuideFaq: { q: string; a: string }[] = [
  { q: '管理台一直 401', a: '若曾用旧密码启动过，仅改 .env 不会更新库内哈希；可短期开启 BOOTSTRAP_PASSWORD_SYNC=true 重启一次后改回。' },
  { q: '接口全失败', a: '检查 VITE_PROXY_TARGET 与 relay 实际端口是否一致。' },
  { q: '公开 notify 401', a: '检查 Authorization、以及 medium/strict 下的 X-Timestamp、X-Signature。' },
  { q: 'strict 下仍 401', a: '白名单按 RemoteAddr 校验；经反代时可能是内网 IP，需评估网络与部署方式（详见使用手册）。' },
]
