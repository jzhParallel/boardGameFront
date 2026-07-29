---
kind: logging_system
name: 微信小程序原生 console 调试输出（无统一日志框架）
category: logging_system
scope:
    - '**'
source_files:
    - miniprogram/utils/request.ts
    - miniprogram/pages/login/login.ts
    - miniprogram/pages/staff/reservation-mgmt/reservation-mgmt.ts
---

本仓库未引入任何第三方日志框架或统一的日志模块，所有调试与错误输出均直接使用微信小程序提供的 `console.log` / `console.warn` / `console.error` 等 API。具体表现如下：

1. **使用方式**：各页面 `.ts` 文件中直接调用 `console.warn('xxx失败:', err)`、`console.error('登录失败:', err)` 等语句进行错误打印，属于最基础的浏览器/小程序控制台输出。
2. **无集中封装**：未发现 `utils/logger.ts`、`log/`、`logging/` 等目录，也没有对 `console` 做全局包装或分级管理；请求层 `utils/request.ts` 通过 `wx.showToast` 向用户展示错误提示，但并未将请求结果写入结构化日志。
3. **无日志级别策略**：代码中仅混用 `console.warn` 和 `console.error`，没有统一的日志等级定义（如 debug/info/warn/error），也未根据环境变量切换输出开关。
4. **无结构化字段**：日志内容为简单字符串拼接，不包含时间戳、页面路径、用户 ID、traceId 等上下文信息。
5. **无独立 sink**：日志仅输出到开发者工具控制台，未接入远程收集、文件持久化或自定义上报通道。

因此，该项目当前不存在成体系的 logging_system，仅依赖微信原生的 console API 进行开发期调试。若需完善，建议抽取统一的 logger 模块并规范日志级别与字段结构。