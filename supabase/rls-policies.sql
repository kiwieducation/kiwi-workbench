-- ============================================
-- Kiwi Workbench RLS 权限矩阵
-- Phase 5: 完善权限控制
-- ============================================

-- 权限层级说明：
-- 1. 本人（self）：只能访问自己创建或分配给自己的数据
-- 2. 部门（department）：可以访问同部门所有数据
-- 3. 公司（company）：可以访问公司所有数据（admin/manager）

-- ============================================
-- 1. 客户表 (customers) RLS
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 删除旧策略
DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON customers;
DROP POLICY IF EXISTS "customers_update_policy" ON customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON customers;

-- 查询策略：本人分配 + 同部门 + admin/manager 全局
CREATE POLICY "customers_select_policy" ON customers
  FOR SELECT
  TO authenticated
  USING (
    -- 分配给自己
    assigned_to = auth.uid()
    OR
    -- 同部门（通过 users 表关联）
    EXISTS (
      SELECT 1 FROM users u1, users u2
      WHERE u1.id = auth.uid()
        AND u2.id = customers.assigned_to
        AND u1.department = u2.department
        AND u1.department IS NOT NULL
    )
    OR
    -- admin/manager 可看全部
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
    )
    OR
    -- 未分配的客户所有人可见
    assigned_to IS NULL
  );

-- 插入策略：所有认证用户可创建
CREATE POLICY "customers_insert_policy" ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 更新策略：本人分配 + admin/manager
CREATE POLICY "customers_update_policy" ON customers
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'team_leader')
    )
  );

-- 删除策略：仅 admin
CREATE POLICY "customers_delete_policy" ON customers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================
-- 2. 知识库文件夹表 (knowledge_folders) RLS
-- ============================================

ALTER TABLE knowledge_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_folders_select_policy" ON knowledge_folders;
DROP POLICY IF EXISTS "knowledge_folders_insert_policy" ON knowledge_folders;
DROP POLICY IF EXISTS "knowledge_folders_update_policy" ON knowledge_folders;
DROP POLICY IF EXISTS "knowledge_folders_delete_policy" ON knowledge_folders;

-- 查询：所有认证用户可读
CREATE POLICY "knowledge_folders_select_policy" ON knowledge_folders
  FOR SELECT
  TO authenticated
  USING (true);

-- 插入：所有认证用户可创建
CREATE POLICY "knowledge_folders_insert_policy" ON knowledge_folders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 更新：创建者 + admin/manager
CREATE POLICY "knowledge_folders_update_policy" ON knowledge_folders
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- 删除：创建者 + admin
CREATE POLICY "knowledge_folders_delete_policy" ON knowledge_folders
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================
-- 3. 知识库文件表 (knowledge_files) RLS
-- ============================================

ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_files_select_policy" ON knowledge_files;
DROP POLICY IF EXISTS "knowledge_files_insert_policy" ON knowledge_files;
DROP POLICY IF EXISTS "knowledge_files_update_policy" ON knowledge_files;
DROP POLICY IF EXISTS "knowledge_files_delete_policy" ON knowledge_files;

-- 查询：所有认证用户可读
CREATE POLICY "knowledge_files_select_policy" ON knowledge_files
  FOR SELECT
  TO authenticated
  USING (true);

-- 插入：所有认证用户可上传
CREATE POLICY "knowledge_files_insert_policy" ON knowledge_files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 更新：创建者 + admin/manager
CREATE POLICY "knowledge_files_update_policy" ON knowledge_files
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- 删除：创建者 + admin
CREATE POLICY "knowledge_files_delete_policy" ON knowledge_files
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================
-- 4. 质检审核表 (quality_reviews) RLS
-- ============================================

ALTER TABLE quality_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quality_reviews_select_policy" ON quality_reviews;
DROP POLICY IF EXISTS "quality_reviews_insert_policy" ON quality_reviews;
DROP POLICY IF EXISTS "quality_reviews_update_policy" ON quality_reviews;

-- 查询：admin/manager/team_leader 可查看所有
CREATE POLICY "quality_reviews_select_policy" ON quality_reviews
  FOR SELECT
  TO authenticated
  USING (
    reviewed_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'team_leader')
    )
  );

-- 插入：所有认证用户可创建
CREATE POLICY "quality_reviews_insert_policy" ON quality_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 更新：创建者 + admin/manager
CREATE POLICY "quality_reviews_update_policy" ON quality_reviews
  FOR UPDATE
  TO authenticated
  USING (
    reviewed_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- ============================================
-- 5. 企业微信消息表 (wechat_messages) RLS
-- ============================================

ALTER TABLE wechat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wechat_messages_select_policy" ON wechat_messages;

-- 查询：按关联客户的权限控制 + admin/manager 全局
CREATE POLICY "wechat_messages_select_policy" ON wechat_messages
  FOR SELECT
  TO authenticated
  USING (
    -- admin/manager 可看全部
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'team_leader')
    )
    OR
    -- 与自己相关的消息
    from_user_id = auth.uid()::text
    OR
    to_user_id = auth.uid()::text
    OR
    -- 与自己负责客户相关的消息
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.assigned_to = auth.uid()
        AND (
          wechat_messages.related_type = 'customer'
          AND wechat_messages.related_id = c.id
        )
    )
  );

-- ============================================
-- 6. 用户表 (users) RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- 查询：所有认证用户可读（用于显示负责人名称等）
CREATE POLICY "users_select_policy" ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- 更新：仅本人可更新自己的信息，admin 可更新所有
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================
-- 7. Storage Bucket 策略 (files)
-- ============================================

-- 在 Supabase Dashboard > Storage > Policies 中配置以下策略：

-- Bucket: files
-- Policy: Allow authenticated uploads
-- INSERT policy:
--   bucket_id = 'files'
--   AND auth.role() = 'authenticated'
--   AND (storage.foldername(name))[1] = 'knowledge'

-- Policy: Allow authenticated reads
-- SELECT policy:
--   bucket_id = 'files'
--   AND auth.role() = 'authenticated'

-- Policy: Allow owner deletes
-- DELETE policy:
--   bucket_id = 'files'
--   AND auth.role() = 'authenticated'
--   AND (storage.foldername(name))[2] = auth.uid()::text

-- ============================================
-- 创建表语句（如果不存在）
-- ============================================

-- 创建 quality_reviews 表
CREATE TABLE IF NOT EXISTS quality_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id TEXT NOT NULL UNIQUE,
  alert_type TEXT NOT NULL,
  related_type TEXT,
  related_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'ignored')),
  notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 conversation_analyses 表（AI 分析结果）
CREATE TABLE IF NOT EXISTS conversation_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  -- 意图分析
  intent_primary TEXT NOT NULL,
  intent_confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  intent_secondary TEXT[],
  -- 情绪分析
  sentiment_overall TEXT NOT NULL CHECK (sentiment_overall IN ('positive', 'neutral', 'negative', 'mixed')),
  sentiment_score NUMERIC(4,3) NOT NULL DEFAULT 0,
  sentiment_emotions TEXT[],
  -- 关键点
  key_points JSONB,
  -- 风险评估
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors TEXT[],
  risk_suggestions TEXT[],
  -- 建议回复
  suggested_replies JSONB,
  -- AI 元数据
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  tokens_used INT,
  processing_time_ms INT,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- conversation_analyses 索引
CREATE INDEX IF NOT EXISTS idx_conversation_analyses_conversation_id ON conversation_analyses(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_analyses_idempotency_key ON conversation_analyses(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_conversation_analyses_created_at ON conversation_analyses(created_at DESC);

-- conversation_analyses RLS
ALTER TABLE conversation_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_analyses_select_policy" ON conversation_analyses;
DROP POLICY IF EXISTS "conversation_analyses_insert_policy" ON conversation_analyses;

-- 查询：所有认证用户可读
CREATE POLICY "conversation_analyses_select_policy" ON conversation_analyses
  FOR SELECT
  TO authenticated
  USING (true);

-- 插入：所有认证用户可创建（系统自动生成）
CREATE POLICY "conversation_analyses_insert_policy" ON conversation_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 创建 knowledge_folders 表
CREATE TABLE IF NOT EXISTS knowledge_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES knowledge_folders(id),
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 knowledge_files 表
CREATE TABLE IF NOT EXISTS knowledge_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES knowledge_folders(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_url TEXT,
  file_type TEXT NOT NULL DEFAULT 'document',
  mime_type TEXT,
  size BIGINT DEFAULT 0,
  tags TEXT[],
  view_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_stage ON customers(stage);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_folder_id ON knowledge_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_folders_parent_id ON knowledge_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_quality_reviews_alert_id ON quality_reviews(alert_id);
CREATE INDEX IF NOT EXISTS idx_wechat_messages_room_id ON wechat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_wechat_messages_send_time ON wechat_messages(send_time DESC);

-- ============================================
-- 角色权限说明
-- ============================================
-- admin:       全局读写，可删除
-- manager:     全局读写，不可删除
-- team_leader: 部门读写
-- sales/tutor/bd/etc: 本人分配数据读写

-- ============================================
-- 使用说明
-- ============================================
-- 1. 在 Supabase Dashboard > SQL Editor 中执行此脚本
-- 2. 确保 users 表已存在并有 role 和 department 字段
-- 3. 在 Storage 中创建 "files" bucket 并配置策略
-- 4. 测试各角色的权限是否符合预期
