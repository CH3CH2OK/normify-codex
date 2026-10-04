# Normify for Codex

[English](README_EN.md) · 简体中文 · [MIT](LICENSE)

把代码仓库转换成可校验的模块树与可逐层下钻的交互式架构图，并随代码变更维护。
本项目将 [yan-mc/dsh-normify](https://github.com/yan-mc/dsh-normify) 的 31 个工具
接入 Codex，提供标准 MCP 服务器及 `normify-gen` 技能。

**这是社区适配版，不是原作者或 OpenAI 发布的官方产品。** 基于上游 v0.5.4，
基准提交为 `ed404e5b8db0010ff57ec8486ec8749421072545`。

## 功能

- 31 个原有工具：项目初始化、模块编辑、依赖查询、指纹、校验、编译、渲染和变更管理。
- 双语模块树与 API 契约；叶子 API、跨模块依赖及指向具体 API 的箭头。
- 原有 L1/L2/L3 校验、架构规则与 SHA-256 编译回执。
- 生成零外部依赖的单文件 HTML，可逐层浏览、搜索及切换中英文。
- MCP stdio 接入，保留参数结构并补充参数校验、错误标记和顺序执行。
- Codex 技能与本地命令入口；技能安装后可独立运行。

不需要 DSH 桌面端、DeepSeek 账号或 API key。DSH 的可选编辑后提醒钩子未移植；
使用伴随开发流程时，由技能在收尾阶段显式同步。

## 安装

需要 Node.js 18+、npm，以及本地 Codex。

```sh
git clone https://github.com/CH3CH2OK/normify-codex.git
cd normify-codex
npm ci --omit=dev --legacy-peer-deps
```

安装完成后会自动准备 `codex/skills/normify-gen/runtime`。
如果安装时使用了 `--ignore-scripts`，请再运行 `npm run codex:sync-runtime`。

**Windows：** 在项目目录执行 `./codex/install.ps1`。脚本安装技能并登记 MCP；
已有同名技能或服务器时会停止，以便保留已有安装。

**其他系统或手动安装：**

1. 将 `codex/skills/normify-gen` 完整复制到 `$CODEX_HOME/skills/`，
   未设置 `CODEX_HOME` 时使用 `~/.codex/skills/`。当前版本也可使用
   `~/.agents/skills/`；选择一个位置，避免重复安装。
2. 用实际绝对路径登记服务器：

```sh
codex mcp add normify -- node /absolute/path/to/normify-codex/codex/mcp.mjs
codex mcp get normify
```

请保留项目目录供 MCP 启动。下一轮对话即可尝试技能；如果工具或技能没有出现，
重启 Codex。详细说明见 [Codex 接入说明](codex/README.zh-CN.md)。

## 使用

```text
用 $normify-gen 为当前仓库生成模块树和交互式架构图，先只分析，不修改源码。
```

```text
用 $normify-gen 同步已有架构图，修复代码与模块契约的漂移后重新渲染。
```

```text
用 $normify-gen 先设计限流模块的计划态结构，再实现、激活模块并关闭变更。
```

结构数据位于选定的 `normify-<slug>/` 目录，产物包括 `tree.json`、
`outline.md`、`api-index.json`、`receipt.json` 和 `normify.html`。
仅请求架构分析时，不修改源码。

也可以直接使用命令入口：

```sh
npm run codex:list
node codex/skills/normify-gen/scripts/normify.mjs call normify_help --args-file args.json
```

`args.json` 示例：`{"topic":"tool:normify_project_init"}`。
工具失败时 CLI 返回非零状态，MCP 设置 `isError`。

## 开发与测试

```sh
npm ci --legacy-peer-deps
npm run build
npm run typecheck
npm test
npm run test:codex
```

构建会同步技能内置的引擎。原有五组测试覆盖引擎、伴随开发及历史回归；
新增集成测试启动真实 MCP 进程，验证 31 个工具的发现、错误传播、参数拒绝、
dry-run、无 Git 激活、指纹漂移、编译渲染和技能独立运行。
GitHub Actions 在 Linux 和 Windows 上运行这些检查。

## 来源与许可证

继续采用 [MIT 许可证](LICENSE)，完整保留原作者 `yan-mc` 的版权和许可声明。
Codex 适配部分由 `CH3CH2OK` 发布，原引擎和渲染器来自上游。
具体改动见 [适配记录](codex/ADAPTATION.json)，署名见 [NOTICE](NOTICE)。
第三方代码保留各自许可证，见 [第三方说明](THIRD_PARTY_NOTICES.md)。
依赖库遵循其自己的许可证。

上游完整说明：[中文](UPSTREAM_README.zh-CN.md) · [English](UPSTREAM_README.en.md)。
