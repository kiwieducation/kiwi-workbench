# Kiwi Education Workbench

企业级内部工作台系统 - 基于 Next.js + Supabase 构建

## 🎯 项目简介

柯维留学工作台是一个为50人团队设计的企业级内部管理系统，严格遵循产品设计文档v8.0规范。

### 核心特性

- ✅ **Next.js App Router** - 使用最新的App Router架构
- ✅ **Supabase全栈** - Auth + PostgreSQL + RLS + Realtime
- ✅ **TypeScript** - 完整的类型安全
- ✅ **shadcn/ui** - 现代化UI组件库
- ✅ **Tailwind CSS** - 原子化CSS框架
- ✅ **企业级权限** - 基于RLS的三级权限体系
- ✅ **模块化设计** - 16个独立业务模块

## 📦 快速开始

### 1. 环境要求

- **Node.js 20.9+** (必需 - Next.js 16 要求)
- **npm 10+** (推荐)
- Supabase账号

### 2. 检查环境

```bash
# 检查 Node 版本（必须 >= 20.9.0）
node --version

# 检查 npm 版本
npm --version
```

### 3. 安装依赖

```bash
# 使用 npm ci（推荐，严格按 lockfile 安装）
npm ci

# 或使用 npm install（开发环境）
npm install
```

### 4. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 填入你的Supabase信息
```

### 5. 启动开发服务器

```bash
# 使用 Turbopack（默认，更快）
npm run dev

# 或使用 Webpack（需要时）
npm run dev:webpack
```

访问 http://localhost:3000

## 🏗️ 项目结构

详见 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

```
kiwi-workbench/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证路由组
│   ├── (dashboard)/       # 工作台路由组
│   └── api/               # API Routes
├── components/            # React组件
│   ├── layout/           # 布局组件
│   ├── ui/               # shadcn/ui组件
│   └── shared/           # 共享组件
├── lib/                  # 工具函数
│   ├── supabase/        # Supabase客户端
│   └── utils/           # 通用工具
├── types/               # TypeScript类型
├── hooks/               # 自定义Hooks
└── store/               # 状态管理
```

## 🔐 权限体系

系统采用三级权限模型（严格遵循v8.0设计）：

1. **本人** - 只能看自己创建/负责的数据
2. **本部门** - 可看本部门所有成员的数据
3. **全公司** - 可看全公司数据（仅管理层）

权限通过Supabase RLS (Row Level Security) 在数据库层面强制执行。

## 📋 模块列表

### 公司级能力（7个）
1. 个人首页
2. 待办中心
3. 企业微信会话中心
4. 企业知识库
5. 项目协作中心
6. 销售素材中台
7. 通讯录

### 部门工作台（6个）
8. 销售工作台
9. BD渠道工作台
10. 市场工作台
11. 导师工作台
12. 教务工作台
13. 财务人事工作台

### 管理与外部（3个）
14. 管理质检中心
15. 外部协作平台
16. 系统设置

## 🚀 部署

### Vercel部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 环境变量

在Vercel项目设置中添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📖 开发指南

详见 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

### 代码规范

- 使用TypeScript，避免any
- 组件使用函数式组件
- 优先使用Server Components
- 交互组件使用'use client'标记
- 样式使用Tailwind CSS
- className合并使用cn()工具

### Git提交规范

```bash
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

## 🛠️ 技术栈

### 核心框架
- **Next.js 16.1.4** - React全栈框架（使用稳定版本）
- **React 19.2.3** - UI库（修复 GHSA-9qr9-h5gf-34mp 安全漏洞）
- **TypeScript 5** - 类型系统
- **Node.js 20.9+** - 运行环境（必需）

> 🔒 **安全提示:** 项目使用 React 19.2.3 修复 XSS 漏洞（GHSA-9qr9-h5gf-34mp）。详见 [SECURITY_PATCH.md](./SECURITY_PATCH.md)

### 后端服务
- **Supabase** - BaaS平台
  - PostgreSQL - 数据库
  - Auth - 认证
  - RLS - 权限控制
  - Realtime - 实时订阅

### UI组件
- **shadcn/ui** - 组件库
- **Radix UI** - 无样式组件
- **Tailwind CSS** - CSS框架
- **Lucide React** - 图标库

### 状态管理
- **Zustand** - 客户端状态
- **React Query** - 服务端状态

## 📄 许可

Private - 仅供柯维留学内部使用

## 🤝 贡献

本项目为内部系统，请联系技术负责人获取开发权限。

## 📧 联系

技术支持：tech@kiwi-education.com
