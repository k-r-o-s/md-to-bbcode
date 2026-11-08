# Markdown to BBCode

一个 VS Code 扩展：把选中的 Markdown 文本就地转换成 Steam 创意工坊可用的 BBCode 格式，并可一键复制为 JSON 字符串字面量，方便粘贴进 `workspace.json`。

## 功能

- **Markdown → BBCode**：选中 Markdown 文本，运行命令或按快捷键，选区内容就地替换为 BBCode。
- **复制为 JSON 字面量**：转换结果自动转义（换行转 `\n`、转义 `\` 和 `"`），复制到剪贴板，可直接粘进 `"description": ...` 的位置。
- **BBCode 语法速查**: 快速查看 steam 官网 BBCode 的语法说明页面
- **跨平台**：转换逻辑纯 JavaScript 实现，不依赖外部工具。

## 支持的格式

| Markdown | BBCode |
|---|---|
| `# 标题` / `## 标题` / `### 标题` | `[h1]…[/h1]` / `[h2]…[/h2]` / `[h3]…[/h3]` |
| `**加粗**` | `[b]…[/b]` |
| `*斜体*` | `[i]…[/i]` |
| `- 列表项` / `* 列表项` | `[list][*]…[/list]` |
| `1. 列表项` | `[olist][*]…[/olist]` |
| `[文字](链接)` | `[url=链接]文字[/url]` |
| `---` 或 `***` | `[hr][/hr]` |
| 空行 | 保留换行 |

不支持：代码块、表格、嵌套列表（Steam BBCode 本身不支持这些结构，硬转只会产生无意义标签）。

## 使用方法

1. 在 VS Code 中打开任意 Markdown 文件。
2. 选中要转换的文本。
3. 运行命令面板（`Ctrl+Shift+P` / `Cmd+Shift+P`），执行以下任一命令：
   - **`MD2BBCode: Markdown 转 BBCode`**：选区就地替换为 BBCode。
   - **`MD2BBCode: BBCode 内容转换并复制为 JSON 字面量`**：选中的 BBCode 内容转换为 string 字面量并结果复制到剪贴板
   - **`MD2BBCode: 查看 steam 的 BBCode 语法帮助`**：查看 steam 官网 BBCode 的语法说明页面

## 使用示例

选中以下 Markdown：

```markdown
## 简介

本模组为 **XXX** 提供了完整的中文翻译。

- 卡牌文本
- 遗物描述
- 事件对话

详见[创意工坊页面](https://steamcommunity.com/sharedfiles/filedetails/?id=123456)。
```

运行“Markdown 转 BBCode”后，选区变为：

```
[h2]简介[/h2]

本模组为 [b]XXX[/b] 提供了完整的中文翻译。

[list][*]卡牌文本
[*]遗物描述
[*]事件对话[/list]

详见[url=https://steamcommunity.com/sharedfiles/filedetails/?id=123456]创意工坊页面[/url]。
```

运行“复制为 JSON 字面量”后，剪贴板里是可直接粘进 `workspace.json` 的转义字符串：

```
"[h2]简介[/h2]\n\n本模组为 [b]XXX[/b] 提供了完整的中文翻译。\n\n[list][*]卡牌文本\n[*]遗物描述\n[*]事件对话[/list]\n\n详见[url=…]创意工坊页面[/url]。"
```

## 安装

### 从 VSIX 安装

1. 下载 `.vsix` 文件。
2. 打开扩展视图（`Ctrl+Shift+X`），点击右上角 `...`，选择 **“从 VSIX 安装…”**。
3. 或者命令行安装：

```bash
code --install-extension md-to-bbcode-0.0.1.vsix
```

### 从源码构建

```bash
npm install -g @vscode/vsce
npm run build
```

`npm run build` 会依次执行：打包 `.vsix` 到 `build/` 目录 → 清理旧版本 → 用 `code --install-extension --force` 安装到当前 VS Code。

## 开发

```bash
# 在 VS Code 中打开项目，按 F5 启动扩展开发宿主窗口
# 在新窗口里打开 .md 文件，选中文本测试命令
```

项目结构：

```
md-to-bbcode/
├── package.json          # 扩展清单与命令注册
├── extension.js          # 激活入口与转换逻辑
├── scripts/
│   └── build-vsix.js     # 打包 + 安装脚本
├── build/                # 打包产物（已 gitignore）
└── .vscodeignore
```

## 注意事项

- **就地替换会覆盖原文**：转换后选区内容直接变成 BBCode。建议在 git 仓库里操作，或先备份，方便对比回退。
- **斜体正则的边界**：`(?<!\*)\*(?!\*)` 能避开 `**粗体**` 和行首列表的 `* `，但一行内同时出现列表标记和斜体的极端写法可能仍需手动检查。
- **换行统一为 `\n`**：`toJsonStringLiteral` 会先把 `\r\n` 和孤立的 `\r` 统一成 `\n` 再转义，保证写入 `workspace.json` 的字符串干净、跨平台一致。

## License

MIT