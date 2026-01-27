# package-lock.json 更新说明

## 重要提示

本项目的 `package-lock.json` 在首次 `npm install` 时自动生成。

---

## 为什么不包含在源代码中？

1. **避免版本冲突**
   - 不同开发者的 npm 版本可能生成不同的 lockfile
   - 避免不必要的 git 冲突

2. **确保安全版本**
   - package.json 使用 `^19.0.0` 语义化版本
   - npm install 自动安装最新的安全补丁（19.0.1+）
   - 如果提交 lockfile，可能锁定旧版本

3. **CI/CD 自动生成**
   - 持续集成环境会自动生成 lockfile
   - 确保每次构建使用最新的安全版本

---

## 如何生成 lockfile

### 首次安装

```bash
# 删除旧的 lockfile（如果存在）
rm -f package-lock.json

# 安装依赖（自动生成 lockfile）
npm install

# 验证 React 版本
npm list react react-dom
# 预期: react@19.0.1 或更高版本
```

### 更新依赖

```bash
# 更新所有补丁版本
npm update

# 验证版本
npm list react react-dom
```

---

## 生产环境建议

### 使用 package-lock.json

生产环境应该使用 lockfile 确保依赖一致性：

```bash
# 生成 lockfile
npm install

# 提交到版本控制
git add package-lock.json
git commit -m "chore: add package-lock.json for production"
```

### CI/CD 配置

```yaml
# .github/workflows/deploy.yml
- name: Install dependencies
  run: npm ci  # 使用 lockfile 安装（更快，更可靠）

- name: Verify React version
  run: |
    npm list react react-dom
    # 确保 >= 19.0.1
```

---

## 开发环境建议

### 不提交 lockfile

开发环境可以不提交 lockfile：

```bash
# .gitignore
package-lock.json
```

**理由:**
- 获取最新的安全补丁
- 避免版本冲突
- 开发环境灵活性更高

---

## 验证安全版本

无论是否使用 lockfile，都应验证 React 版本：

```bash
npm list react react-dom

# 预期输出:
# kiwi-workbench@1.0.0
# ├── react@19.0.1  ✅ (或更高版本)
# └── react-dom@19.0.1  ✅ (或更高版本)

# 如果看到 19.0.0，立即更新:
rm -rf node_modules package-lock.json
npm install
```

---

## 总结

1. ✅ **package.json 使用 `^19.0.0`** - 语义化版本
2. ✅ **npm install 自动安装最新补丁** - 19.0.1+
3. ✅ **开发环境可不提交 lockfile** - 获取最新补丁
4. ✅ **生产环境应使用 lockfile** - 确保一致性
5. ✅ **定期验证版本** - 确保安全

---

**更新日期:** 2026-01-26  
**相关文档:** [SECURITY_PATCH.md](./SECURITY_PATCH.md)
