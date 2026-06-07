<template>
  <div class="rule-group-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="组编码/名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增组
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
        <el-table-column prop="groupCode" label="组编码" width="150" />
        <el-table-column prop="groupName" label="组名称" min-width="150" />
        <el-table-column prop="strategy" label="策略" width="130">
          <template #default="{ row }">
            <el-tag :type="row.strategy === 'ALL' ? 'success' : 'warning'" size="small">
              {{ row.strategy === 'ALL' ? '全量执行' : '首个匹配' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
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
      width="550px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="组编码" prop="groupCode">
          <el-input v-model="formData.groupCode" placeholder="请输入组编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="组名称" prop="groupName">
          <el-input v-model="formData.groupName" placeholder="请输入组名称" />
        </el-form-item>
        <el-form-item label="策略" prop="strategy">
          <el-select v-model="formData.strategy" placeholder="请选择策略" class="full-width">
            <el-option label="全量执行 (ALL)" value="ALL" />
            <el-option label="首个匹配 (FIRST)" value="FIRST" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
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
  pageQueryRuleGroups,
  createRuleGroup,
  updateRuleGroup,
  deleteRuleGroup,
  type RuleGroupDTO,
  type RuleGroupCreateRequest,
  type RuleGroupUpdateRequest,
} from '@/api/ruleGroup'

const searchForm = reactive({ keyword: '' })
const tableData = ref<RuleGroupDTO[]>([])
const loading = ref(false)
const selectedRows = ref<RuleGroupDTO[]>([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0,
})

async function loadData() {
  loading.value = true
  try {
    const res = await pageQueryRuleGroups({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch {
    // error handled by interceptor
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
  handleSearch()
}

function handleSelectionChange(rows: RuleGroupDTO[]) {
  selectedRows.value = rows
}

// ===== 新增/编辑 =====

const dialogVisible = ref(false)
const dialogTitle = ref('新增规则组')
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<RuleGroupUpdateRequest>({
  id: undefined,
  groupCode: '',
  groupName: '',
  strategy: 'ALL',
  description: '',
  status: 1,
})

const formRules: FormRules = {
  groupCode: [{ required: true, message: '请输入组编码', trigger: 'blur' }],
  groupName: [{ required: true, message: '请输入组名称', trigger: 'blur' }],
  strategy: [{ required: true, message: '请选择策略', trigger: 'change' }],
}

function resetForm() {
  formData.id = undefined
  formData.groupCode = ''
  formData.groupName = ''
  formData.strategy = 'ALL'
  formData.description = ''
  formData.status = 1
}

function handleAdd() {
  isEdit.value = false
  dialogTitle.value = '新增规则组'
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: RuleGroupDTO) {
  isEdit.value = true
  dialogTitle.value = '编辑规则组'
  formData.id = row.id
  formData.groupCode = row.groupCode
  formData.groupName = row.groupName
  formData.strategy = row.strategy
  formData.description = row.description || ''
  formData.status = row.status
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateRuleGroup(formData.id!, formData)
      ElMessage.success('更新成功')
    } else {
      await createRuleGroup(formData as RuleGroupCreateRequest)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}

// ===== 删除 =====

async function handleDelete(row: RuleGroupDTO) {
  try {
    await ElMessageBox.confirm('确定要删除该规则组吗？删除后关联的规则定义也会被移除。', '删除确认', {
      type: 'warning',
    })
    await deleteRuleGroup(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // user cancelled or error
  }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      '确定要删除选中的 ' + selectedRows.value.length + ' 条规则组吗？',
      '批量删除确认',
      { type: 'warning' },
    )
    for (const row of selectedRows.value) {
      await deleteRuleGroup(row.id)
    }
    ElMessage.success('批量删除成功')
    loadData()
  } catch {
    // user cancelled or error
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.rule-group-page {
  padding: 16px;
}
.rule-group-page .search-card {
  margin-bottom: 16px;
}
.rule-group-page .table-card {
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
</style>
