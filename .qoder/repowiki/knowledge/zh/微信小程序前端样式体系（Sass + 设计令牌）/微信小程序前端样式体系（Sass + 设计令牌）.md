---
kind: frontend_style
name: 微信小程序前端样式体系（Sass + 设计令牌）
category: frontend_style
scope:
    - '**'
source_files:
    - miniprogram/styles/variables.scss
    - miniprogram/app.scss
    - miniprogram/components/chat-bubble/chat-bubble.scss
    - miniprogram/components/navigation-bar/navigation-bar.scss
    - miniprogram/pages/user/home/home.scss
---

该微信小程序项目采用 **Sass + 设计令牌（Design Tokens）** 的样式体系，通过统一的变量文件集中管理颜色、间距、圆角、字号与阴影等视觉规范，配合组件级 SCSS 文件实现一致的 UI 风格。

### 1. 样式系统与工具链
- 使用 **Sass** 作为 CSS 预处理器，所有页面与组件均通过 `.scss` 文件组织样式。
- 全局样式入口为 `miniprogram/app.scss`，在应用启动时统一引入。
- 未使用 Tailwind、CSS-in-JS 或第三方 UI 框架（除 navigation-bar 组件引用了 WeUI 的部分样式），纯手写 Sass 方案。

### 2. 设计令牌（Design Tokens）
核心设计令牌集中在 `miniprogram/styles/variables.scss`，分为五大类：
- **颜色系统**：主色（深墨绿 #2D5A45）、辅助色（暖木色 #A0714F）、强调色（金色 #E8A838）、背景色、文字色、边框分割线、状态色（成功/警告/错误/信息）。
- **间距系统**：以 `rpx` 为单位，提供 xs/sm/md/lg/xl 五级间距。
- **圆角系统**：sm(8rpx)/md(16rpx)/lg(24rpx)/round(999rpx)。
- **字号系统**：xs(20rpx) 到 xxl(44rpx) 六级字号。
- **阴影系统**：sm/md/lg 三级阴影。

### 3. 全局通用样式
`app.scss` 中定义了跨页面复用的基础样式类：
- 容器类 `.container`、卡片类 `.card`
- 按钮族 `.btn-primary` / `.btn-secondary` / `.btn-outline`
- 标签 `.tag` 及其变体 `.tag-primary` / `.tag-secondary`
- 分割线 `.divider`、文字省略 `.ellipsis`、安全区域 `.safe-bottom`

### 4. 组件样式组织模式
每个组件目录内遵循 **同名 .scss 文件** 约定，如 `chat-bubble/chat-bubble.scss`、`navigation-bar/navigation-bar.scss`。组件样式通过 `@import '../../styles/variables.scss'` 引用设计令牌，保持视觉一致性。

### 5. 响应式策略
- 全面使用 `rpx` 单位，适配不同屏幕尺寸。
- 通过 `env(safe-area-inset-top/bottom)` 处理刘海屏与安全区域。
- navigation-bar 组件针对 Android/iOS 分别设置导航栏高度。

### 6. 开发者规范
- 新增颜色/间距/字号等必须先在 `variables.scss` 中定义，禁止硬编码数值。
- 组件样式文件命名与组件名保持一致，便于维护。
- 优先复用 `app.scss` 中的通用类（`.btn-*`、`.card`、`.tag` 等），避免重复造轮子。
- 使用 Flexbox 布局为主，结合 `gap` 属性控制间距。