# Kiwi Education Workbench - 第一阶段实现指南

## ✅ 已完成基础配置

### 1. 项目初始化
- ✅ package.json（依赖管理）
- ✅ tsconfig.json（TypeScript配置）
- ✅ tailwind.config.ts（样式配置）
- ✅ next.config.js（Next.js配置）

### 2. Supabase集成
- ✅ lib/supabase/client.ts（浏览器端客户端）
- ✅ lib/supabase/server.ts（服务端客户端）
- ✅ middleware.ts（路由保护中间件）

### 3. 类型系统
- ✅ types/database.ts（数据库类型）
- ✅ types/entities.ts（业务实体类型）

### 4. 基础工具
- ✅ lib/utils/cn.ts（className合并工具）

### 5. 全局样式
- ✅ app/globals.css
- ✅ app/layout.tsx

## 📋 下一步实现顺序

### 阶段1：UI基础组件（shadcn/ui）
需要安装和配置以下shadcn/ui组件：

```bash
# 安装shadcn/ui CLI
npx shadcn-ui@latest init

# 添加基础组件
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add select
```

### 阶段2：布局组件
创建以下布局组件：

1. **components/layout/sidebar.tsx**
   - 侧边栏导航
   - 模块分组展示
   - 收起/展开功能
   - 当前路由高亮

2. **components/layout/topbar.tsx**
   - 全局搜索栏
   - 通知中心
   - 用户菜单
   - 语言切换

3. **components/shared/empty-state.tsx**
   - 空状态组件
   - 不同场景的空状态提示

4. **components/shared/access-denied.tsx**
   - 无权限页面

### 阶段3：认证页面
创建登录页：

1. **app/(auth)/login/page.tsx**
   - 邮箱+密码登录
   - Supabase Auth集成
   - 表单验证
   - 错误处理

### 阶段4：Dashboard布局
创建工作台布局：

1. **app/(dashboard)/layout.tsx**
   - 包含Sidebar和Topbar
   - 统一容器样式
   - 路由组布局

### 阶段5：个人首页
创建首页组件：

1. **app/(dashboard)/page.tsx**
   - KPI卡片组件
   - 待办列表组件
   - 快捷操作组件
   - 最近活动组件

### 阶段6：企业微信会话中心
创建会话中心：

1. **app/(dashboard)/messages/page.tsx**
   - 会话列表
   - 筛选器
   - 搜索功能

2. **app/(dashboard)/messages/[conversationId]/page.tsx**
   - 会话详情
   - 消息列表
   - 只读模式
   - AI辅助区（预留）

### 阶段7：销售工作台
创建销售工作台：

1. **app/(dashboard)/sales/page.tsx**
   - 客户列表
   - 筛选器
   - 表格视图

2. **app/(dashboard)/sales/customers/[customerId]/page.tsx**
   - 客户详情
   - 信息卡片
   - 时间轴
   - 相关任务

### 阶段8：企业知识库
创建知识库：

1. **app/(dashboard)/knowledge/page.tsx**
   - 左侧目录树
   - 右侧文件列表
   - 上传功能

### 阶段9：管理质检中心
创建质检中心：

1. **app/(dashboard)/quality/page.tsx**
   - KPI概览
   - 筛选区
   - 数据表格

## 🔧 环境变量配置

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🚀 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 📊 Mock数据策略

第一阶段使用Mock数据，结构完全对齐Supabase表设计：

1. **lib/mock/users.ts** - 用户数据
2. **lib/mock/customers.ts** - 客户数据
3. **lib/mock/students.ts** - 学员数据
4. **lib/mock/tasks.ts** - 任务数据
5. **lib/mock/messages.ts** - 企业微信消息数据

Mock数据的优势：
- 前端开发不依赖后端
- 快速验证UI和交互
- 数据结构与真实数据库完全一致
- 后续可无缝切换真实数据

## 🔐 权限控制实现

### 1. RLS策略（Supabase端）

```sql
-- 示例：客户表的RLS策略
CREATE POLICY "sales_own_customers" ON customers
  FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "team_leader_department_customers" ON customers
  FOR SELECT
  USING (
    assigned_to IN (
      SELECT id FROM users 
      WHERE team_id = (SELECT team_id FROM users WHERE id = auth.uid())
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) = 'team_leader'
  );
```

### 2. 前端权限检查

```typescript
// hooks/use-permissions.ts
export function usePermissions() {
  const user = useUser()
  
  const hasPermission = (permission: Permission) => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
  }
  
  return { hasPermission }
}
```

### 3. 组件层面使用

```typescript
const { hasPermission } = usePermissions()

if (!hasPermission('sales:view')) {
  return <AccessDenied />
}
```

## 📝 代码规范

### 1. 组件命名
- 使用PascalCase
- 文件名与组件名一致
- 使用描述性名称

### 2. 类型定义
- 所有组件必须有TypeScript类型
- Props使用interface定义
- 避免使用any类型

### 3. 代码组织
- 一个文件一个组件
- 共享组件放在components/shared
- 业务组件放在对应模块文件夹

### 4. 样式规范
- 优先使用Tailwind CSS
- 使用cn()函数合并className
- 避免内联样式

## 🎯 下一步行动

我将按以下顺序为你创建文件：

1. ✅ 创建shadcn/ui配置
2. ✅ 创建Mock数据
3. ✅ 创建布局组件（Sidebar + Topbar）
4. ✅ 创建登录页
5. ✅ 创建Dashboard布局
6. ✅ 创建个人首页
7. ✅ 创建企业微信会话中心
8. ✅ 创建销售工作台
9. ✅ 创建企业知识库
10. ✅ 创建管理质检中心

每个阶段我会提供完整的、可运行的代码，你可以逐步验证和调整。

准备好开始了吗？我们先从Mock数据和布局组件开始！
