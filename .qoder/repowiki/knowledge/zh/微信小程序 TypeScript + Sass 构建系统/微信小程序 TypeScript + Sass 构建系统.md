---
kind: build_system
name: 微信小程序 TypeScript + Sass 构建系统
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - tsconfig.json
    - project.config.json
---

## 构建系统与编译流程

本项目基于 `miniprogram-ts-sass-quickstart` 模板，采用微信开发者工具原生支持的 TypeScript 与 Sass 编译管线，无需额外的构建脚本或 CI 配置。

### 核心构建机制

- **编译器插件**：通过 `project.config.json` 中的 `useCompilerPlugins: ["typescript", "sass"]` 启用微信开发者工具的 TS/Sass 编译插件，直接在 IDE 内完成类型检查与样式预处理。
- **TypeScript 配置**：`tsconfig.json` 将目标设为 ES2020、模块系统为 CommonJS，严格模式全开（strictNullChecks、noUnusedLocals 等），类型根目录指向 `./typings`，用于声明微信小程序 API 类型。
- **依赖管理**：仅引入 `miniprogram-api-typings` 作为 devDependency，提供小程序全局 API 的类型定义，无运行时依赖。

### 项目结构约定

- 源码位于 `miniprogram/` 目录，由 `project.config.json` 的 `miniprogramRoot` 指定。
- 每个页面/组件遵循 `.wxml` + `.scss` + `.ts` + `.json` 四文件组织方式。
- 全局入口为 `miniprogram/app.ts` / `app.json` / `app.scss`。

### 开发工作流

- 使用微信开发者工具直接打开项目，工具自动识别 TS/Sass 插件并实时编译。
- 支持热重载（`compileHotReLoad` 可配置）与 SourceMap 上传调试。
- 未配置 npm scripts、Makefile、Dockerfile 或 CI 流水线，构建完全依赖微信开发者工具。

### 限制与注意事项

- 无自动化打包、压缩、发布流程，需手动在开发者工具中点击“上传”进行版本发布。
- 未启用 SWC（`disableSWC: true`），编译性能依赖传统 TypeScript 编译器。
- 无跨平台构建或本地化构建脚本，开发环境强绑定微信开发者工具。