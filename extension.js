const vscode = require('vscode');

/**
 * Markdown → Steam BBCode
 * 支持：# 标题、**粗体**、*斜体*、- 无序列表、1. 有序列表、
 *       [文字](链接)、--- 分割线、空行
 */
function mdToBbcode(md) {
    const lines = md.split(/\r?\n/);
    const out = [];
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
        if (inUl) { out.push('[/list]'); inUl = false; }
        if (inOl) { out.push('[/olist]'); inOl = false; }
    };

    for (const line of lines) {
        const stripped = line.trim();

        // 分割线
        if (/^-{3,}$|^\*{3,}$/.test(stripped)) {
            closeLists();
            out.push('[hr][/hr]');
            continue;
        }

        // 标题
        let m = stripped.match(/^(#{1,3})\s+(.*)$/);
        if (m) {
            closeLists();
            const level = m[1].length;
            out.push(`[h${level}]${m[2]}[/h${level}]`);
            continue;
        }

        // 无序列表
        m = stripped.match(/^[-*+]\s+(.*)$/);
        if (m) {
            if (inOl) { out.push('[/olist]'); inOl = false; }
            if (!inUl) { out.push('[list]'); inUl = true; }
            out.push(`[*]${m[1]}`);
            continue;
        }

        // 有序列表
        m = stripped.match(/^\d+\.\s+(.*)$/);
        if (m) {
            if (inUl) { out.push('[/list]'); inUl = false; }
            if (!inOl) { out.push('[olist]'); inOl = true; }
            out.push(`[*]${m[1]}`);
            continue;
        }

        // 普通行
        closeLists();
        out.push(line);
    }

    closeLists();
    let text = out.join('\n');

    // 行内格式：先链接，再粗体，再斜体
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[url=$2]$1[/url]');
    text = text.replace(/\*\*(.+?)\*\*/g, '[b]$1[/b]');
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '[i]$1[/i]');

    return text;
}

/**
 * 把字符串转成 JSON 字符串字面量（带引号，换行转 \n，转义 \ 和 "）
 * 直接用 JSON.stringify，它输出的就是合法的 JSON 字符串常量
 */
function toJsonStringLiteral(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return JSON.stringify(normalized);
}

function activate(context) {
    const disposable = vscode.commands.registerCommand('mdToBbcode.convert', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('没有打开的编辑器。');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText.trim()) {
            vscode.window.showWarningMessage('请先选中要转换的 Markdown 文本。');
            return;
        }

        const bbcode = mdToBbcode(selectedText);

        const success = await editor.edit((editBuilder) => {
            editBuilder.replace(selection, bbcode);
        });

        if (success) {
            vscode.window.setStatusBarMessage('Markdown 已转换为 BBCode', 3000);
        } else {
            vscode.window.showErrorMessage('替换失败，文档可能已被修改。');
        }
    });

    context.subscriptions.push(disposable);

    const disposable2 = vscode.commands.registerCommand('mdToBbcode.bbCodeToJsonLiteral', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const text = editor.document.getText(editor.selection);
        if (!text.trim()) {
            vscode.window.showWarningMessage('请先选中 Markdown 文本。');
            return;
        }
        const literal = toJsonStringLiteral(text);
        await vscode.env.clipboard.writeText(literal);
        vscode.window.setStatusBarMessage('已复制 JSON 字符串字面量', 3000);
    });
    context.subscriptions.push(disposable2);
}

function deactivate() { }

module.exports = { activate, deactivate };