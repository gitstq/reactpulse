<p align="center">
  <img src="https://img.shields.io/npm/v/reactpulse?color=blue&label=version" alt="npm version" />
  <img src="https://img.shields.io/npm/l/reactpulse?color=green" alt="license" />
  <img src="https://img.shields.io/node/v/reactpulse?color=orange" alt="node version" />
</p>

<p align="center">
  <a href="#简体中文">简体中文</a> | <a href="#繁體中文">繁體中文</a> | <a href="#english">English</a>
</p>

<h1 align="center">💓 ReactPulse</h1>

<p align="center">
  <strong>轻量级 React 代码健康度扫描器</strong><br>
  检测反模式，生成健康评分，让你的 React 代码更健康！
</p>

---

## 简体中文

### 🎉 项目介绍

**ReactPulse** 是一款轻量级的 React 代码健康度扫描工具，能够智能检测 React 项目中的常见反模式，并生成 0-100 的健康评分。

**💡 灵感来源**: 受到 react-doctor 项目的启发，ReactPulse 采用完全独立自研的架构设计，提供更轻量、更易用的代码健康检测方案。

**🚀 自研亮点**:
- 🎯 **零配置启动** - 无需复杂配置，开箱即用
- 📊 **智能评分系统** - 基于问题严重程度的加权评分算法
- 🔍 **9 大检测规则** - 覆盖状态管理、性能、安全、可访问性等核心领域
- 🌐 **中文友好** - 完善的中文诊断信息和建议
- ⚡ **极速扫描** - 基于 Babel AST 的高性能解析引擎

### ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 🔧 **useEffect 依赖检测** | 检测缺失的依赖数组，避免无限循环 |
| 📦 **派生状态检测** | 识别不必要的 useState 派生状态 |
| 🔑 **Key 属性检测** | 发现列表渲染中缺失的 key 属性 |
| ⚡ **性能优化建议** | 检测内联函数等性能反模式 |
| 🔒 **安全漏洞扫描** | 识别 dangerouslySetInnerHTML 等 XSS 风险 |
| ♿ **可访问性检查** | 检测缺失的 alt 属性等问题 |
| 🧹 **代码清理建议** | 发现 console.log 等调试代码 |
| 🏗️ **架构问题检测** | 识别直接 DOM 操作等反模式 |
| 🌐 **数据获取检测** | 发现 useEffect 中未清理的 fetch 调用 |

### 🚀 快速开始

#### 环境要求
- Node.js >= 16.0.0
- npm 或 yarn

#### 安装使用

```bash
# 在项目目录下运行
npx reactpulse .

# 或全局安装
npm install -g reactpulse
reactpulse .
```

#### 命令选项

```bash
reactpulse [directory] [options]

选项:
  -v, --verbose     显示详细输出
  --json            输出 JSON 格式结果
  --fail-on <level> 遇到问题时退出 (error/warning/none)
  --rules           列出所有可用规则
  --help            显示帮助信息
```

### 📖 详细使用指南

#### 配置文件

在项目根目录创建 `reactpulse.config.json`:

```json
{
  "ignore": {
    "rules": ["reactpulse/no-console-log"],
    "files": ["**/generated/**"]
  },
  "rules": {
    "reactpulse/no-missing-deps": "error",
    "reactpulse/no-inline-function": "warning"
  },
  "failOn": "none"
}
```

#### CI/CD 集成

```yaml
# GitHub Actions 示例
name: ReactPulse

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx reactpulse . --fail-on error
```

### 💡 设计思路

ReactPulse 采用 **AST 静态分析** 技术，通过 Babel 解析器将代码转换为抽象语法树，然后遍历 AST 节点进行模式匹配和问题检测。

**技术选型**:
- **Babel Parser** - 成熟稳定的 JavaScript/TypeScript 解析器
- **Commander** - 优雅的 CLI 框架
- **Chalk** - 终端彩色输出
- **cli-table3** - 表格格式化输出

### 📦 打包与部署

```bash
# 构建
npm run build

# 本地测试
npm link
reactpulse .
```

### 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

---

## 繁體中文

### 🎉 專案介紹

**ReactPulse** 是一款輕量級的 React 程式碼健康度掃描工具，能夠智慧檢測 React 專案中的常見反模式，並生成 0-100 的健康評分。

**💡 靈感來源**: 受到 react-doctor 專案的啟發，ReactPulse 採用完全獨立自研的架構設計，提供更輕量、更易用的程式碼健康檢測方案。

**🚀 自研亮點**:
- 🎯 **零配置啟動** - 無需複雜配置，開箱即用
- 📊 **智慧評分系統** - 基於問題嚴重程度的加權評分演算法
- 🔍 **9 大檢測規則** - 涵蓋狀態管理、效能、安全、可存取性等核心領域
- 🌐 **中文友善** - 完善的中文診斷訊息和建議
- ⚡ **極速掃描** - 基於 Babel AST 的高效能解析引擎

### ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 🔧 **useEffect 依賴檢測** | 檢測缺失的依賴陣列，避免無限迴圈 |
| 📦 **衍生狀態檢測** | 識別不必要的 useState 衍生狀態 |
| 🔑 **Key 屬性檢測** | 發現列表渲染中缺失的 key 屬性 |
| ⚡ **效能最佳化建議** | 檢測內聯函式等效能反模式 |
| 🔒 **安全漏洞掃描** | 識別 dangerouslySetInnerHTML 等 XSS 風險 |
| ♿ **可存取性檢查** | 檢測缺失的 alt 屬性等問題 |
| 🧹 **程式碼清理建議** | 發現 console.log 等除錯程式碼 |
| 🏗️ **架構問題檢測** | 識別直接 DOM 操作等反模式 |
| 🌐 **資料獲取檢測** | 發現 useEffect 中未清理的 fetch 呼叫 |

### 🚀 快速開始

#### 環境要求
- Node.js >= 16.0.0
- npm 或 yarn

#### 安裝使用

```bash
# 在專案目錄下執行
npx reactpulse .

# 或全域安裝
npm install -g reactpulse
reactpulse .
```

#### 命令選項

```bash
reactpulse [directory] [options]

選項:
  -v, --verbose     顯示詳細輸出
  --json            輸出 JSON 格式結果
  --fail-on <level> 遇到問題時退出 (error/warning/none)
  --rules           列出所有可用規則
  --help            顯示說明資訊
```

### 📄 開源協議

本專案基於 [MIT](LICENSE) 協議開源。

---

## English

### 🎉 Introduction

**ReactPulse** is a lightweight React code health scanner that intelligently detects common anti-patterns in React projects and generates a 0-100 health score.

**💡 Inspiration**: Inspired by the react-doctor project, ReactPulse adopts a completely independent architecture design, providing a lighter and easier-to-use code health detection solution.

**🚀 Highlights**:
- 🎯 **Zero Configuration** - Works out of the box without complex setup
- 📊 **Smart Scoring System** - Weighted scoring algorithm based on issue severity
- 🔍 **9 Detection Rules** - Covering state management, performance, security, accessibility, and more
- 🌐 **Developer Friendly** - Clear diagnostic messages and suggestions
- ⚡ **Fast Scanning** - High-performance parsing engine based on Babel AST

### ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🔧 **useEffect Dependency Detection** | Detect missing dependency arrays to avoid infinite loops |
| 📦 **Derived State Detection** | Identify unnecessary useState derived state |
| 🔑 **Key Prop Detection** | Find missing key props in list rendering |
| ⚡ **Performance Optimization** | Detect inline functions and other anti-patterns |
| 🔒 **Security Vulnerability Scan** | Identify XSS risks like dangerouslySetInnerHTML |
| ♿ **Accessibility Check** | Detect missing alt attributes and other issues |
| 🧹 **Code Cleanup Suggestions** | Find console.log and other debug code |
| 🏗️ **Architecture Issue Detection** | Identify anti-patterns like direct DOM manipulation |
| 🌐 **Data Fetching Detection** | Find uncleaned fetch calls in useEffect |

### 🚀 Quick Start

#### Requirements
- Node.js >= 16.0.0
- npm or yarn

#### Installation

```bash
# Run in your project directory
npx reactpulse .

# Or install globally
npm install -g reactpulse
reactpulse .
```

#### CLI Options

```bash
reactpulse [directory] [options]

Options:
  -v, --verbose     Show verbose output
  --json            Output results as JSON
  --fail-on <level> Exit with error on issues (error/warning/none)
  --rules           List all available rules
  --help            Show help information
```

### 📖 Usage Guide

#### Configuration File

Create `reactpulse.config.json` in your project root:

```json
{
  "ignore": {
    "rules": ["reactpulse/no-console-log"],
    "files": ["**/generated/**"]
  },
  "rules": {
    "reactpulse/no-missing-deps": "error",
    "reactpulse/no-inline-function": "warning"
  },
  "failOn": "none"
}
```

#### CI/CD Integration

```yaml
# GitHub Actions Example
name: ReactPulse

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx reactpulse . --fail-on error
```

### 💡 Design Philosophy

ReactPulse uses **AST static analysis** technology. It converts code to an Abstract Syntax Tree through the Babel parser, then traverses AST nodes for pattern matching and issue detection.

**Tech Stack**:
- **Babel Parser** - Mature and stable JavaScript/TypeScript parser
- **Commander** - Elegant CLI framework
- **Chalk** - Terminal colored output
- **cli-table3** - Table formatted output

### 📦 Build & Deploy

```bash
# Build
npm run build

# Local test
npm link
reactpulse .
```

### 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### 📄 License

This project is licensed under the [MIT](LICENSE) License.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/gitstq">gitstq</a>
</p>
