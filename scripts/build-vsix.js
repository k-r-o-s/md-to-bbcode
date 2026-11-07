const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const pkg = require('../package.json');
const root = path.resolve(__dirname, '..');
const buildDir = path.join(root, 'builds');
const outFile = path.join(buildDir, `${pkg.name}-${pkg.version}.vsix`);

console.log(`[build] 开始打包：${outFile}`);
console.log('--------------------------------------------------\n');

// 确保 build 目录存在
fs.mkdirSync(buildDir, { recursive: true });

// --------------------------------- 打包
console.log(`[build] 正在编译`);
console.log(`[build] vsce package --allow-missing-repository --out "${outFile}"`);
console.log('--------------------------------------------------\n');

// 直接打包到 build 目录
execSync(`vsce package --allow-missing-repository --out "${outFile}"`, { stdio: 'inherit', cwd: root });

// --------------------------------- 安装
console.log(`\n`);
console.log(`[build] 正在安装：${outFile}`);
console.log(`[build] code --install-extension "${outFile}" --force`);
console.log('--------------------------------------------------\n');

// --force 是必须的：VS Code 默认拒绝覆盖已安装的同 ID 扩展，不加 --force 安装会静默失败或报错。
// code 命令要在 PATH 里：Windows 上如果在 VS Code 安装时没勾选“添加到 PATH”，code 会找不到
// 可以在 VS Code 里按 Ctrl+Shift+P 运行 “Shell Command: Install 'code' command in PATH” 补上。
execSync(`code --install-extension "${outFile}" --force`, { stdio: 'inherit' });

console.log('\n--------------------------------------------------');
console.log(`[build] 已打包并安装：${outFile}`);