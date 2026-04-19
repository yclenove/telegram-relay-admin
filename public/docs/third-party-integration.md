# 第三方系统接入说明

面向需要将告警、工单、自定义业务事件推入本平台的**外部系统开发者 / 运维**。

更偏「产品使用」的说明见同目录 `user-manual.md`；本文侧重**对接步骤、请求格式与排障**。

---

## 1. 能力与边界（必读）

### 1.1 当前已支持

| 能力 | 说明 |
|------|------|
| HTTP JSON 入队 | `POST /api/v1/notify` 或 `POST /api/v2/notify` |
| 鉴权 | `Authorization: Bearer <token>`；`security.level` 为 medium/strict 时需 `X-Timestamp` + `X-Signature` |
| 幂等 | v1 必填 `event_id`；v2 可省略，由服务生成 `evt-<纳秒>` |
| 限流 | 实例级全局限流（与路径无关，v1/v2 共用） |

### 1.2 当前未支持（与「一接入方一密钥」相关）

**当前版本没有在平台内为「每个第三方接入方」单独签发、轮换、吊销独立 Bearer Token 或独立 API Secret 的能力。**

运行时仅配置 **一个** `AUTH_TOKEN`（对应 `security.token`），以及 medium/strict 下的 **一个** `HMAC_SECRET`。

过渡方案：前置 API 网关为不同厂商配置不同密钥后统一调用 relay；或按安全域拆分多实例。产品级「入站凭证」表与控制台管理——**尚未实现**，以服务端仓库文档为准。

---

## 2. 环境与 URL

- **默认监听**：`:8780`（可用 `LISTEN_ADDR` 覆盖）。
- **生产**：建议仅对公网暴露 **HTTPS**。
- 路径：`POST https://<域名>/api/v1/notify` 或 `POST .../api/v2/notify`。

---

## 3. 请求体（JSON）

| 字段 | v1 | v2 | 说明 |
|------|----|----|------|
| `title` | 必填 | 必填 | 标题 |
| `message` | 必填 | 必填 | 正文 |
| `source` | 必填 | 必填 | 来源，建议与路由规则一致 |
| `level` | 可选 | 可选 | 用于规则匹配 |
| `event_id` | **必填** | 可选 | 幂等键 |
| `event_time` | 可选 | 可选 | 展示用 |
| `labels` | 可选 | 可选 | JSON 对象 |

成功响应示例：`{"event_db_id": 123, "status": "queued"}`。

---

## 4. 鉴权：`security.level`

### basic

`Authorization: Bearer <AUTH_TOKEN>`，`Content-Type: application/json`。

### medium / strict

另加 `X-Timestamp`（Unix 秒）、`X-Signature`：

```text
payload = "<timestamp>." + <原始请求体字符串>
X-Signature = hex( HMAC_SHA256( HMAC_SECRET, payload ) )
```

strict 另校验 IP 白名单；反代场景见完整版文档（后端仓库 `docs/user-manual.md`）。

---

## 5. 调用示例

### curl（basic + v2）

```bash
curl -sS -X POST "https://relay.example.com/api/v2/notify" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"订单异常","message":"库存不足","source":"order-service","level":"warning"}'
```

### Python（basic）

```python
import json, urllib.request

url = "https://relay.example.com/api/v2/notify"
body = {"title": "心跳", "message": "ok", "source": "cron-health", "level": "info"}
req = urllib.request.Request(
    url,
    data=json.dumps(body).encode("utf-8"),
    headers={
        "Authorization": "Bearer YOUR_AUTH_TOKEN",
        "Content-Type": "application/json",
    },
    method="POST",
)
with urllib.request.urlopen(req, timeout=10) as resp:
    print(resp.read().decode())
```

---

## 6. 常见错误码

| HTTP | 常见原因 |
|------|----------|
| 400 | JSON 非法、缺必填字段 |
| 401 | Bearer/签名/IP 白名单失败 |
| 429 | 限流 |
| 502 | 入队写库失败（查 relay 日志） |
