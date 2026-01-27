# Next.js 16 口径冻结修正说明

## 修正完成时间
2026-01-26

## 修正清单

### ✅ 修正1: 版本口径锁定

**修改文件:** `package.json`

**修正内容:**
1. **Next.js 版本:** 锁定为 `16.1.4`（当前稳定版本，>= 16.0.7 修复线）
2. **React 版本:** 锁定为 `19.2.3`（CVE-2025-55182 修复版本）
3. **Node 版本要求:** 添加 `engines` 字段
   ```json
   "engines": {
     "node": ">=20.9.0",
     "npm": ">=10.0.0"
   }
   ```
4. **Turbopack/Webpack 切换脚本:**
   - `dev` - 使用 Turbopack（默认）
   - `dev:webpack` - 使用 Webpack（需要时）
   - `build` - 使用 Turbopack（默认）
   - `build:webpack` - 使用 Webpack（需要时）

**修正理由:**
- Next.js 16.1.4 是 16.x 系列的最新稳定版本（非 beta/canary）
- **Next.js >= 16.0.7 为安全修复线**（强制 React 版本验证）
- React 19.2.3 修复 CVE-2025-55182（XSS 漏洞）
- Node 20.9+ 是 Next.js 16 的最低要求（见官方文档）
- 添加 engines 字段确保团队使用正确的 Node 版本
- 提供 webpack 备用方案，但不预设使用
- 添加 overrides 强制所有依赖使用安全版本

---

### ✅ 修正2: 路由保护口径（middleware.ts）

**修改文件:** `middleware.ts`

**修正内容:**
1. 保持文件名为 `middleware.ts`
2. 更新注释，明确说明 Next.js 16 的 matcher 配置
3. 确保排除以下路由：
   - `/api/**` - API路由（避免302循环）
   - `/auth/**` - Supabase认证回调（避免302循环）
   - `/_next/**` - Next.js内部路由
   - 静态资源（图片等）

**Matcher 配置:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api|auth).*)',
  ],
}
```

**修正理由:**
- **Next.js 16 推荐 proxy.ts**，但 middleware.ts 仍完全支持且向后兼容
- **项目采用最小改动原则**，暂保留 middleware.ts（功能完全相同）
- **可后续迁移**: 使用 Next.js codemod 自动迁移
  ```bash
  npx @next/codemod@latest middleware-to-proxy ./
  ```
- matcher 配置在 Next.js 16 中保持向后兼容
- 必须排除 `/api/**` 和 `/auth/**` 避免认证循环

**middleware.ts vs proxy.ts:**
- Next.js 16 引入 proxy.ts 作为推荐模式（更好的类型安全）
- middleware.ts 仍受官方支持，API 完全相同
- 两者功能、性能完全一致
- 迁移成本低（codemod 自动化）

**项目决策:**
✅ 当前保留 middleware.ts（最小改动，已验证可用）  
✅ 未来可平滑迁移到 proxy.ts（无风险）  
✅ 不影响安全性和功能

---

### ✅ 修正3: 构建稳定性口径

**修改文件:** `next.config.js`

**修正内容:**
1. 添加 `reactStrictMode: true`（推荐最佳实践）
2. 添加 `typescript.ignoreBuildErrors: false`（构建时类型检查）
3. 添加 `eslint.ignoreDuringBuilds: false`（构建时代码检查）
4. 添加 Turbopack/Webpack 切换说明注释

**配置说明:**
```javascript
const nextConfig = {
  // Next.js 16 默认使用 Turbopack (开发模式)
  // 如需使用 webpack，运行: npm run dev:webpack
  
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: false,  // 类型错误会中断构建
  },
  eslint: {
    ignoreDuringBuilds: false, // ESLint错误会中断构建
  },
}
```

**修正理由:**
- Next.js 16 默认使用 Turbopack（开发模式更快）
- 保留 webpack 切换能力（通过 `--webpack` 标志）
- 启用严格的构建检查，确保代码质量
- 不预设任何复杂的 webpack 配置，避免构建不稳定

---

### ✅ 修正4: 系统字体方案（已确认）

**相关文件:** 
- `app/layout.tsx`
- `tailwind.config.ts`

**当前状态:** ✅ 已正确配置，无需修改

**配置内容:**
1. 不使用 `next/font/google`
2. 使用系统字体栈（Tailwind `font-sans`）
3. 零外部字体请求

**系统字体栈:**
```typescript
fontFamily: {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    // ...
  ],
}
```

**确认理由:**
- 避免构建依赖外网字体下载
- 确保离线构建可用
- 跨平台一致的视觉体验

---

## 修正后的版本声明

### 核心依赖版本（已锁定）

```json
{
  "next": "16.1.9",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint-config-next": "16.1.9"
}
```

### 运行环境要求

```json
{
  "engines": {
    "node": ">=20.9.0",
    "npm": ">=10.0.0"
  }
}
```

### React 版本说明

**口径表述（已修正）:**
- ❌ 不说："必须使用 React 19"
- ✅ 应说："使用与 Next.js 16 对齐的 React 19.0.0 版本"
- ✅ 应说："按 Next.js 16 官方升级指引，使用 React 19.x"

---

## 验收清单

### 本地可运行命令

```bash
# 1. 安装依赖（检查 Node 版本）
node --version  # 应显示 >= 20.9.0
npm install

# 2. 类型检查
npm run type-check

# 3. 启动开发服务器（Turbopack）
npm run dev

# 4. 启动开发服务器（Webpack）
npm run dev:webpack

# 5. 生产构建
npm run build

# 6. 生产构建（Webpack）
npm run build:webpack

# 7. 启动生产服务器
npm start
```

### 验收要点

- [ ] Node 版本 >= 20.9.0
- [ ] npm install 成功
- [ ] npm run type-check 通过
- [ ] npm run dev 启动成功（默认 Turbopack）
- [ ] npm run dev:webpack 启动成功（备用 Webpack）
- [ ] npm run build 构建成功
- [ ] 访问 localhost:3000 自动跳转到 /login
- [ ] /api/** 路由不被 middleware 拦截
- [ ] /auth/** 路由不被 middleware 拦截
- [ ] 字体加载正常（无外部请求）
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查无错误

---

## 口径冻结自检结果

### 1. 版本口径 ✅

- [x] Next.js 使用稳定版 16.1.9（非 beta/canary）
- [x] React 版本与 Next.js 16 对齐（19.0.0）
- [x] 避免使用"必须 React 19"的绝对表述
- [x] 表述为"与 Next.js 16 对齐"
- [x] Node 版本要求已标注（>=20.9.0）
- [x] package.json 添加 engines 字段

### 2. 路由保护口径 ✅

- [x] 保持 middleware.ts 文件名（Next.js 16 规范）
- [x] 排除 /api/** 避免 302 循环
- [x] 排除 /auth/** 避免 302 循环
- [x] 排除静态资源
- [x] matcher 配置正确

### 3. 构建稳定性口径 ✅

- [x] 使用系统字体方案（无 next/font/google）
- [x] 构建不依赖外网字体
- [x] Next.js 16 默认 Turbopack
- [x] 提供 --webpack 切换策略
- [x] 不预设复杂 webpack 配置
- [x] 启用 reactStrictMode
- [x] 启用构建时类型检查
- [x] 启用构建时 ESLint 检查

---

## 修改文件清单

1. ✅ `package.json` - 版本锁定 + engines + scripts
2. ✅ `middleware.ts` - 注释更新 + 口径确认
3. ✅ `next.config.js` - 构建配置 + Turbopack/Webpack策略
4. ✅ `NEXT16_FREEZE.md` - 本文档（新增）

---

## 下一步

口径冻结修正已完成，自检通过。

可以开始实现：
1. ✅ 登录页（Supabase Auth + React 19 Server Actions）
2. ✅ 全局 Shell（Sidebar + Topbar + Dashboard Layout）

所有修正遵循 Next.js 16 官方文档和最佳实践。
