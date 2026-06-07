<template>
  <div class="rule-execution-page">
    <el-card class="header-card">
      <div class="page-header">
        <div>
          <h3 class="page-title">规则执行测试</h3>
          <span class="page-desc">选择规则组或单条规则，输入事实数据并执行</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleExecute" :loading="executing">
            <el-icon><CaretRight /></el-icon> 执行规则
          </el-button>
          <el-button @click="handleClearResult">清除结果</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="content-row">
      <!-- 左侧：执行参数 -->
      <el-col :span="12">
        <el-card class="param-card">
          <template #header>
            <span class="card-title"><el-icon><Setting /></el-icon> 执行参数</span>
          </template>

          <el-form label-width="90px">
            <el-form-item label="执行模式">
              <el-radio-group v-model="execForm.mode">
                <el-radio value="GROUP">按规则组</el-radio>
                <el-radio value="SINGLE">按单规则</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="execForm.mode === 'GROUP'" label="选择规则组">
              <el-select v-model="execForm.groupCode" placeholder="请选择规则组" class="full-width">
                <el-option
                  v-for="g in groupOptions"
                  :key="g.groupCode"
                  :label="g.groupCode + ' - ' + g.groupName"
                  :value="g.groupCode"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-if="execForm.mode === 'SINGLE'" label="规则编码">
              <el-input v-model="execForm.ruleCode" placeholder="请输入规则编码" />
            </el-form-item>

            <el-form-item label="事实数据">
              <el-input
                v-model="execForm.factsText"
                type="textarea"
                :rows="10"
                placeholder='请输入JSON格式的事实数据，例如：&#10;{&#10;  "age": 25,&#10;  "amount": 5000,&#10;  "isVip": true&#10;}'
              />
              <div class="form-tip">
                输入键值对形式的 JSON 对象，作为规则匹配的事实上下文
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：执行结果 -->
      <el-col :span="12">
        <el-card class="result-card">
          <template #header>
            <span class="card-title"><el-icon><Document /></el-icon> 执行结果</span>
          </template>

          <div v-if="!result && !executing" class="empty-result">
            <el-empty description="点击'执行规则'查看结果" :image-size="80" />
          </div>

          <div v-if="executing" class="loading-result">
            <el-skeleton :rows="6" animated />
          </div>

          <div v-if="result && !executing" class="result-content">
            <div class="result-summary">
              <el-tag :type="result.allPassed ? 'success' : 'danger'" size="large" effect="dark">
                {{ result.allPassed ? '全部通过' : '存在未通过' }}
              </el-tag>
              <span v-if="result.error" class="error-msg">{{ result.error }}</span>
            </div>

            <!-- 规则组模式：详情列表 -->
            <div v-if="result.details && result.details.length > 0" class="details-section">
              <h4 class="section-title">规则明细</h4>
              <div
                v-for="(item, idx) in result.details"
                :key="idx"
                class="detail-item"
                :class="{ passed: item.passed, failed: !item.passed }"
              >
                <div class="detail-header">
                  <el-tag :type="item.passed ? 'success' : 'danger'" size="small">
                    {{ item.passed ? 'PASS' : 'FAIL' }}
                  </el-tag>
                  <span class="detail-name">{{ item.ruleName || item.ruleCode }}</span>
                  <span class="detail-action">{{ item.resultAction }}</span>
                </div>
                <div v-if="item.message" class="detail-message">{{ item.message }}</div>
              </div>
            </div>

            <!-- 打印原始 JSON -->
            <div class="raw-section">
              <h4 class="section-title">原始响应</h4>
              <pre class="json-block">{{ JSON.stringify(result, null, 2) }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CaretRight, Setting, Document } from '@element-plus/icons-vue'
import { listAllRuleGroups, type RuleGroupDTO } from '@/api/ruleGroup'
import request from '@/api/request'

interface ExecutionResult {
  allPassed: boolean
  error?: string
  details?: Array<{
    ruleCode?: string
    ruleName?: string
    passed: boolean
    resultAction?: string
    message?: string
  }>
  [key: string]: unknown
}

const executing = ref(false)
const result = ref<ExecutionResult | null>(null)
const groupOptions = ref<RuleGroupDTO[]>([])

const execForm = reactive({
  mode: 'GROUP' as 'GROUP' | 'SINGLE',
  groupCode: '',
  ruleCode: '',
  factsText: '{\n  \n}',
})

async function fetchGroups() {
  try {
    const res = await listAllRuleGroups()
    groupOptions.value = res.data
  } catch {
    // handled by interceptor
  }
}

async function handleExecute() {
  // 参数校验
  if (execForm.mode === 'GROUP' && !execForm.groupCode) {
    ElMessage.warning('请选择规则组')
    return
  }
  if (execForm.mode === 'SINGLE' && !execForm.ruleCode) {
    ElMessage.warning('请输入规则编码')
    return
  }

  let facts: Record<string, unknown>
  try {
    facts = JSON.parse(execForm.factsText || '{}')
  } catch {
    ElMessage.error('事实数据 JSON 格式不正确')
    return
  }

  executing.value = true
  result.value = null
  try {
    const res = await request<Record<string, unknown>>({
      url: '/rules/execute',
      method: 'post',
      data: {
        mode: execForm.mode,
        groupCode: execForm.mode === 'GROUP' ? execForm.groupCode : undefined,
        ruleCode: execForm.mode === 'SINGLE' ? execForm.ruleCode : undefined,
        facts,
      },
    })
    // 转换后端响应为前端展示格式
    const raw = res.data as Record<string, unknown>
    const groups = (raw.groups || []) as Array<Record<string, unknown>>
    const details: ExecutionResult['details'] = []
    for (const g of groups) {
      const rules = (g.rules || []) as Array<Record<string, unknown>>
      for (const r of rules) {
        details.push({
          ruleCode: r.ruleId as string,
          ruleName: r.ruleName as string,
          passed: r.passed as boolean,
          message: r.message as string,
        })
      }
    }
    result.value = {
      allPassed: raw.allPassed as boolean,
      error: raw.error as string,
      details,
    }
  } catch {
    // handled by interceptor
  } finally {
    executing.value = false
  }
}

function handleClearResult() {
  result.value = null
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.rule-execution-page {
  padding: 16px;
}
.header-card {
  margin-bottom: 16px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  margin: 0 0 4px 0;
  font-size: 18px;
}
.page-desc {
  color: #909399;
  font-size: 13px;
}
.header-actions {
  display: flex;
  gap: 8px;
}

.content-row {
  margin: 0 !important;
}

.param-card,
.result-card {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.full-width {
  width: 100%;
}

/* 结果区域 */
.empty-result {
  padding: 40px 0;
}
.loading-result {
  padding: 24px;
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.error-msg {
  color: #f56c6c;
  font-size: 13px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.details-section {
  margin-bottom: 16px;
}

.detail-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fafafa;
}
.detail-item.passed {
  border-left: 3px solid #67c23a;
}
.detail-item.failed {
  border-left: 3px solid #f56c6c;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.detail-name {
  font-weight: 500;
  flex: 1;
}
.detail-action {
  font-size: 12px;
  color: #909399;
}
.detail-message {
  font-size: 13px;
  color: #606266;
  margin-left: 44px;
}

.raw-section {
  margin-top: 12px;
}
.json-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
