# telegram-relay-admin

Telegram 多机器人网关的**管理台前端**（Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router），通过 `/api/v2` 与后端通信。

## 配套后端

后端仓库：[telegram-notification](https://github.com/yclenove/telegram-notification)（或你自建的同名服务）。

本地开发时将 `VITE_API_BASE_URL` 指向后端 HTTP 地址（如 `http://127.0.0.1:8080`）。

## 快速开始

```bash
cp .env.example .env
# 编辑 .env：VITE_API_BASE_URL=http://127.0.0.1:8080
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

产物在 `dist/`。将 `dist` 部署到 CDN/Nginx，或把路径配置到后端的 `admin_static_dir` / 环境变量 `ADMIN_STATIC_DIR`，由网关进程托管静态文件。

## 与后端联调

1. 启动后端（需 PostgreSQL 等，见后端 README）。
2. 本仓库 `npm run dev`，浏览器访问 Vite 提示的本地端口。
3. 使用后端引导的管理员账号登录。
