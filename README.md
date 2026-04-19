# telegram-relay-admin

Telegram 多机器人网关的**管理台前端**（Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router），通过 `/api/v2` 与后端通信。

## 配套后端

后端仓库：[telegram-relay](https://github.com/yclenove/telegram-relay)。

本地开发推荐：**`VITE_API_BASE_URL` 留空**，由 Vite 把浏览器的 `/api/*` 代理到 relay（默认 `http://127.0.0.1:8080`，可通过 `.env` 里的 `VITE_PROXY_TARGET` 修改）。这样无需在后端开 CORS。

若你希望浏览器**直连**后端（不经过代理），再把 `VITE_API_BASE_URL` 设为完整网关地址，并确保 relay 已配置允许该前端源的 CORS。

## 快速开始

```bash
cp .env.example .env
# 按需编辑 .env（例如 relay 非 8080 时改 VITE_PROXY_TARGET）
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

**生产环境**必须在构建前设置 **`VITE_API_BASE_URL`** 为后端 API 根地址（含协议与主机），否则 `main.ts` 会在启动时抛错，避免把 `/api` 误打到静态站点自身。

产物在 `dist/`。将 `dist` 部署到 CDN/Nginx，或把路径配置到后端的 `admin_static_dir` / 环境变量 `ADMIN_STATIC_DIR`，由网关进程托管静态文件。

## 功能概览

- 仪表盘、机器人、**发送目标**（Destination）、路由规则（目标下拉）、事件、审计
- **用户管理**：列表、新增/编辑（表单内**角色多选**）、删除；依赖后端 `user.manage` 权限（超级管理员默认具备）
- 登录态将 **access_token、refresh_token 与 permissions** 写入 `localStorage`；接口返回 **401** 时会自动尝试 `POST /api/v2/auth/refresh` 换发新 access，失败再跳转登录。
- **安全说明**：`localStorage` 会话在 **XSS** 场景下可被窃取；生产环境应通过 **CSP**、依赖审计与输入转义降低风险。页面上的权限展示仅作体验，**真实授权完全由后端 JWT 与接口校验**。

## 与后端联调

1. 启动后端（需 PostgreSQL 等，见后端 README），确保已执行迁移（含 `002_user_manage_permission.sql` 或重新引导库）。
2. 本仓库 `npm run dev`，浏览器访问 Vite 提示的本地端口。
3. 使用后端引导的管理员账号登录。

## 首次推送到 GitHub

若你已在 GitHub 创建空仓库（例如 `yclenove/telegram-relay-admin`），在本地执行：

```bash
git remote add origin https://github.com/yclenove/telegram-relay-admin.git
git push -u origin main
```

（若已添加过 `origin`，只需 `git push -u origin main`。）
