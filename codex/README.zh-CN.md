# Normify 的 Codex 适配版

基于上游 `yan-mc/dsh-normify` 0.5.4，提交
`ed404e5b8db0010ff57ec8486ec8749421072545`。这是 CH3CH2OK 发布的社区适配版，
不是上游作者发布的官方 Codex 版本。保留 MIT 许可证与作者信息。

## 包含的功能

- 完整的 31 个 `normify_*` 工具，由原工具注册表直接导出。
- 模块树、双语 API 契约、依赖箭头、计划态开发、架构规则、变更记录。
- 原有 L1/L2/L3 校验、指纹、编译回执和单文件交互式 HTML 渲染。
- 标准 MCP stdio 入口、参数校验、读写顺序执行和错误标记。
- 可独立安装的 Codex `normify-gen` 技能，内置本地入口与运行依赖。

需要 Node.js 18 或更高版本。使用不需要 DSH、DeepSeek 账号或 API key。
DSH 的可选编辑后提醒钩子没有移植；技能在伴随开发收尾时显式同步。

## 安装技能

将本包 `codex/skills/normify-gen` 文件夹完整复制到
`$CODEX_HOME/skills/`（未设置时为 `~/.codex/skills/`）。也可按当前官方
技能文档，放到 `~/.agents/skills/`。选择一个位置，避免重复安装。
仓库源码需要先执行 `npm ci --omit=dev --legacy-peer-deps`，准备完整技能运行时。
下一轮对话即可尝试 `$normify-gen`；未出现时重启 Codex。

技能自身包含 YAML 解析器、参数校验器及许可证，安装后无需执行 npm。
MCP 工具尚未加载的会话，可直接使用技能的本地命令入口。

## 配置 MCP

解压后保持整个目录完整，执行（用实际绝对路径替换示例）：

```powershell
codex mcp add normify -- node "C:/path/to/dsh-normify-codex/codex/mcp.mjs"
codex mcp get normify
```

如果使用已准备好的离线包，无需再安装依赖；从仓库下载源码时请先安装依赖。如果 Node 不在 PATH，
将 `node` 替换为 `node.exe` 的绝对路径。需要默认结构目录位置时，
在服务器命令后加 `--root "C:/your/project"`；实际工作时技能始终传绝对
`dir` 和 `repoRoot`，不依赖 MCP 的启动目录。

Codex 的 MCP 配置位于 `~/.codex/config.toml`，示例：

```toml
[mcp_servers.normify]
command = "node"
args = ["C:/path/to/dsh-normify-codex/codex/mcp.mjs"]
```

重新打开会话后检查工具是否加载；如仍未加载，重启 Codex。
可用 `codex mcp remove normify` 移除该服务器配置。

## 使用示例

```text
用 $normify-gen 为 C:/projects/my-app 建模块树并生成交互式架构图。
结构数据放在 C:/projects/my-app/normify-my-app，先只分析，不修改源码。
```

```text
用 $normify-gen 同步当前项目已有的 Normify 架构图，修复漂移后重新渲染。
```

```text
用 $normify-gen 先设计限流模块的计划态结构，再实现代码，激活模块并关闭变更。
```

本地入口：

```powershell
node codex/skills/normify-gen/scripts/normify.mjs list
node codex/skills/normify-gen/scripts/normify.mjs call normify_help --args-file args.json
```

其中 `args.json` 可以是 `{"topic":"tool:normify_project_init"}`。
先查询工具参数，再执行写操作。输出 `ok:false` 时命令返回失败状态。

## 开发与验证

改引擎后沿用原项目构建流程，再执行 `node codex/sync-runtime.mjs`，
以更新技能内置运行时。执行原 `npm test` 和新增的 `npm run test:codex`。
适配测试通过 MCP 客户端真正启动服务器，验证工具发现、错误传播、建树、
参数拒绝、激活、证据校验、编译和 HTML 产物，并验证技能独立运行。

官方接入方式参考：[MCP 配置](https://developers.openai.com/codex/mcp)、
[Codex 技能](https://developers.openai.com/codex/skills)。
