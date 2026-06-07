<template>
  <div class="rule-def-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="规则组">
          <el-select v-model="searchForm.groupId" placeholder="请选择规则组" clearable class="group-select">
            <el-option
              v-for="g in groupOptions"
              :key="g.id"
              :label="g.groupCode + ' - ' + g.groupName"
              :value="g.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="规则编码/名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增规则
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="ruleCode" label="规则编码" width="150" />
        <el-table-column prop="ruleName" label="规则名称" min-width="150" />
        <el-table-column prop="priority" label="优先级" width="90" align="center" />
        <el-table-column label="结果动作" width="130">
          <template #default="{ row }">
            <el-tag :type="row.resultAction === 'PASS' ? 'success' : 'danger'" size="small">
              {{ row.resultAction === 'PASS' ? '通过' : row.resultAction === 'REJECT' ? '拒绝' : row.resultAction }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resultMessage" label="结果消息" min-width="160" show-overflow-tooltip />
        <el-table-column label="统一返回" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.unifiedReturn === 1 ? 'success' : 'info'" size="small">
              {{ row.unifiedReturn === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @current-change="loadData"
        @size-change="loadData"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-form-item label="所属规则组" prop="groupId">
          <el-select v-model="formData.groupId" placeholder="请选择规则组" class="full-width" :disabled="isEdit">
            <el-option
              v-for="g in groupOptions"
              :key="g.id"
              :label="g.groupCode + ' - ' + g.groupName"
              :value="g.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规则编码" prop="ruleCode">
          <el-input v-model="formData.ruleCode" placeholder="请输入规则编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="formData.priority" :min="0" :max="9999" class="full-width" />
        </el-form-item>
        <el-form-item label="结果动作" prop="resultAction">
          <el-select v-model="formData.resultAction" placeholder="请选择结果动作" class="full-width">
            <el-option label="通过 (PASS)" value="PASS" />
            <el-option label="拒绝 (REJECT)" value="REJECT" />
            <el-option label="警告 (WARN)" value="WARN" />
          </el-select>
        </el-form-item>
        <el-form-item label="结果消息" prop="resultMessage">
          <el-input v-model="formData.resultMessage" placeholder="请输入结果消息" />
        </el-form-item>
        <el-form-item label="统一返回" prop="unifiedReturn">
          <el-switch v-model="formData.unifiedReturn" :active-value="1" :inactive-value="0" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="条件表达式" prop="conditionsJson">
          <el-input
            v-model="formData.conditionsJson"
            type="textarea"
            :rows="5"
            placeholder='请输入条件JSON，例如：[{&#34;operator&#34;: &#34;EQUALS&#34;, &#34;element&#34;: &#34;amount&#34;, &#34;value&#34;: 100}]'
          />
          <div class="form-tip">
            支持运算符：EQUALS, NOT_EQUALS, GREATER_THAN, GREATER_THAN_OR_EQUAL, LESS_THAN, LESS_THAN_OR_EQUAL, IS_TRUE, IS_FALSE, STRING_EQUALS 等
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Edit } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  pageQueryRuleDefs,
  createRuleDef,
  updateRuleDef,
  deleteRuleDef,
  type RuleDefDTO,
  type RuleDefCreateRequest,
  type RuleDefUpdateRequest,
} from '@/api/ruleDef'
import { listAllRuleGroups, type RuleGroupDTO } from '@/api/ruleGroup'

const searchForm = reactive({
  keyword: '',
  groupId: undefined as number | undefined,
})
const tableData = ref<RuleDefDTO[]>([])
const loading = ref(false)
const selectedRows = ref<RuleDefDTO[]>([])
const groupOptions = ref<RuleGroupDTO[]>([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0,
})

async function fetchGroups() {
  try {
    const res = await listAllRuleGroups()
    groupOptions.value = res.data
  } catch {
    // handled by interceptor
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryRuleDefs({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      groupId: searchForm.groupId,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  loadData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.groupId = undefined
  handleSearch()
}

function handleSelectionChange(rows: RuleDefDTO[]) {
  selectedRows.value = rows
}

// ===== 新增/编辑 =====

const dialogVisible = ref(false)
const dialogTitle = ref('新增规则定义')
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<RuleDefUpdateRequest>({
  id: undefined,
  groupId: 0,
  ruleCode: '',
  ruleName: '',
  priority: 0,
  conditionsJson: '[]',
  resultAction: 'PASS',
  resultMessage: '',
  unifiedReturn: 0,
  status: 1,
})

const formRules: FormRules = {
  groupId: [{ required: true, message: '请选择规则组', trigger: 'change' }],
  ruleCode: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  resultAction: [{ required: true, message: '请选择结果动作', trigger: 'change' }],
}

function resetForm() {
  formData.id = undefined
  formData.groupId = 0
  formData.ruleCode = ''
  formData.ruleName = ''
  formData.priority = 0
  formData.conditionsJson = '[]'
  formData.resultAction = 'PASS'
  formData.resultMessage = ''
  formData.unifiedReturn = 0
  formData.status = 1
}

function handleAdd() {
  isEdit.value = false
  dialogTitle.value = '新增规则定义'
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: RuleDefDTO) {
  isEdit.value = true
  dialogTitle.value = '编辑规则定义'
  formData.id = row.id
  formData.groupId = row.groupId
  formData.ruleCode = row.ruleCode
  formData.ruleName = row.ruleName
  formData.priority = row.priority
  formData.conditionsJson = row.conditionsJson || '[]'
  formData.resultAction = row.resultAction
  formData.resultMessage = row.resultMessage || ''
  formData.unifiedReturn = row.unifiedReturn
  formData.status = row.status
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateRuleDef(formData.id!, formData)
      ElMessage.success('更新成功')
    } else {
      await createRuleDef(formData as RuleDefCreateRequest)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

// ===== 删除 =====

async function handleDelete(row: RuleDefDTO) {
  try {
    await ElMessageBox.confirm('确定要删除规则定义 "' + row.ruleName + '" 吗？', '删除确认', {
      type: 'warning',
    })
    await deleteRuleDef(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // user cancelled or error
  }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      '确定要删除选中的 ' + selectedRows.value.length + ' 条规则定义吗？',
      '批量删除确认',
      { type: 'warning' },
    )
    for (const row of selectedRows.value) {
      await deleteRuleDef(row.id)
    }
    ElMessage.success('批量删除成功')
    loadData()
  } catch {
    // user cancelled or error
  }
}

onMounted(() => {
  fetchGroups()
  loadData()
})
</script>

<style scoped>
.rule-def-page {
  padding: 16px;
}
.rule-def-page .search-card {
  margin-bottom: 16px;
}
.rule-def-page .table-card {
  margin-bottom: 16px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
.full-width {
  width: 100%;
}
.group-select {
  width: 240px;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>
