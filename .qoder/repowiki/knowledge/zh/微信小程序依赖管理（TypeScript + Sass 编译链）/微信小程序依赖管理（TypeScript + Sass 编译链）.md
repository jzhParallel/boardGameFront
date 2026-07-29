---
kind: dependency_management
name: 微信小程序依赖管理（TypeScript + Sass 编译链）
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - tsconfig.json
    - project.config.json
    - typings/index.d.ts
---

本仓库是一个基于 miniprogram-ts-sass-quickstart 模板的微信小程序工程，依赖管理非常轻量，主要围绕 TypeScript 类型声明与微信开发者工具编译插件展开。

1. **使用的系统与工具**
   - **包管理器**：npm（根目录 `package.json`），但当前未声明任何运行时依赖，仅包含一个开发依赖。
   - **类型声明**：通过 `miniprogram-api-typings@^2.8.3-1` 提供微信小程序 API 的 TypeScript 类型定义。
   - **编译链**：由微信开发者工具内置的 TypeScript 和 Sass 编译器驱动，无需额外构建脚本。
   - **项目配置**：`project.config.json` 中启用 `useCompilerPlugins: ["typescript", "sass"]`，并关闭 SWC、Babel 等额外转换。

2. **关键文件**
   - `package.json`：唯一 npm 依赖入口，仅声明 `miniprogram-api-typings` 作为 devDependency。
   - `tsconfig.json`：严格模式 TypeScript 配置，`typeRoots` 指向本地 `./typings`，排除 `node_modules`。
   - `project.config.json`：微信开发者工具配置，指定 `miniprogramRoot`、编译器插件、库版本 `libVersion: 2.32.3` 及 appid。
   - `typings/`：本地类型声明目录，覆盖 `wx` 命名空间下的各类 API 类型定义。

3. **架构与约定**
   - 无第三方运行时库依赖，所有业务逻辑直接调用微信原生 API。
   - 类型系统完全基于 `miniprogram-api-typings` + 本地 `typings/` 扩展，不引入额外的 UI 框架或工具库。
   - 构建过程完全依赖微信开发者工具，无独立打包步骤；`packNpmManually` 和 `packNpmRelationList` 均为空，表明不手动打包 npm 包。
   - 源码位于 `miniprogram/` 目录下，按组件、页面、服务、工具等模块组织，无跨模块共享的公共依赖。

4. **开发者应遵循的规则**
   - 新增依赖需通过 npm 安装并更新 `package.json`，但应避免引入运行时依赖，优先使用微信原生能力。
   - 如需自定义类型，应在 `typings/` 下维护 `.d.ts` 文件，并通过 `tsconfig.json` 的 `typeRoots` 引用。
   - 不要修改 `project.config.json` 中的编译器插件设置，保持 TypeScript 与 Sass 编译链稳定。
   - 升级微信基础库版本时，同步更新 `libVersion` 字段并确保类型兼容。