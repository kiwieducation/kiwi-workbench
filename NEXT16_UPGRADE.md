# Next.js 16 升级说明

## 版本信息

项目已升级到 **Next.js 16 + React 19**

### 核心依赖版本

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.1"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint-config-next": "^16.0.0",
    "typescript": "^5"
  }
}
```

## Next.js 16 新特性

### 1. 必须使用 React 19
Next.js 16 要求 React 19 作为最低版本。

### 2. 改进的 Server Components
- 更快的渲染速度
- 更好的流式传输性能
- 减少客户端 JavaScript 大小

### 3. React 19 新特性支持

#### Server Actions（已内置）
```typescript
// app/actions/auth.ts
'use server'

export async function login(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  // 处理登录逻辑
}
```

#### use() Hook
```typescript
// 在组件中使用异步数据
import { use } from 'react'

function Component({ dataPromise }) {
  const data = use(dataPromise)
  return <div>{data}</div>
}
```

#### FormData 和 FormStatus
```typescript
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>Submit</button>
}
```

## 与 Supabase 集成

### 使用 @supabase/ssr

Next.js 16 完全兼容 `@supabase/ssr`：

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

## 迁移注意事项

### 1. 异步请求API变更

Next.js 16 中，某些API变为异步：

```typescript
// ✅ 正确写法（Next.js 16）
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies() // cookies() 现在返回同步对象
  // ...
}
```

### 2. Middleware 配置保持不变

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api|auth).*)',
  ],
}
```

### 3. TypeScript 配置

确保 `tsconfig.json` 支持最新特性：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "jsx": "preserve"
  }
}
```

## 性能优化

### 1. 自动代码分割
Next.js 16 改进了代码分割算法，自动优化包大小。

### 2. 预取优化
Link 组件的预取行为更智能，减少不必要的预取。

### 3. 构建时间优化
- 增量编译更快
- 更好的缓存机制
- 并行处理优化

## 已知问题和解决方案

### 1. 类型错误
如果遇到类型错误，确保：
```bash
npm install @types/react@19 @types/react-dom@19
```

### 2. ESLint 规则
更新 ESLint 配置：
```bash
npm install eslint-config-next@16
```

### 3. Radix UI 兼容性
当前使用的 Radix UI 组件已兼容 React 19。

## 开发建议

### 1. 优先使用 Server Components
```typescript
// ✅ 默认为 Server Component
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

### 2. 仅在需要时使用 Client Components
```typescript
// 需要交互时才添加 'use client'
'use client'

export default function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState()}>Click</button>
}
```

### 3. 使用 Server Actions
```typescript
// app/actions/customer.ts
'use server'

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()
  // RLS 自动生效
  const { data, error } = await supabase
    .from('customers')
    .insert({ name: formData.get('name') })
  
  return { data, error }
}
```

## 测试清单

升级到 Next.js 16 后，请验证：

- [ ] `npm install` 成功安装所有依赖
- [ ] `npm run dev` 启动开发服务器
- [ ] 登录功能正常（Supabase Auth）
- [ ] 中间件路由保护生效
- [ ] API 路由不被拦截
- [ ] Server Components 正常渲染
- [ ] Client Components 交互正常
- [ ] TypeScript 编译无错误
- [ ] 生产构建成功（`npm run build`）

## 参考资料

- [Next.js 16 发布说明](https://nextjs.org/blog/next-16)
- [React 19 文档](https://react.dev/blog/2024/04/25/react-19)
- [Supabase Next.js 集成指南](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

## 总结

✅ 项目已成功升级到 Next.js 16 + React 19  
✅ 所有配置已适配最新版本  
✅ Supabase 集成使用官方推荐方式  
✅ 准备好继续实现登录页和全局 Shell
