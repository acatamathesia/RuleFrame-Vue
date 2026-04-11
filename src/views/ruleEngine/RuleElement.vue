<template>
  <div class="rule-element-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="元素名称/路径" clearable />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select class = "type-select" v-model="searchForm.dataType" placeholder="请选择数据类型" clearable>
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增元素
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
        <el-table-column prop="elementName" label="元素名称" min-width="150" />
        <el-table-column prop="elementPath" label="元素路径" min-width="200" />
        <el-table-column prop="needConvert" label="是否类型转换" width="120">
          <template #default="{ row }">
            <el-tag :type="row.needConvert ? 'success' : 'info'">
              {{ row.needConvert ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dataType" label="数据类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getDataTypeTagType(row.dataType)">
              {{ getDataTypeLabel(row.dataType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="groupName" label="分组" min-width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑元素对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="元素名称" prop="elementName">
          <el-input v-model="formData.elementName" placeholder="请输入元素名称" />
        </el-form-item>
        <el-form-item label="元素路径" prop="elementPath">
          <el-input v-model="formData.elementPath" placeholder="请输入元素路径" />
        </el-form-item>
        <el-form-item label="是否类型转换" prop="needConvert">
          <el-switch v-model="formData.needConvert" />
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="formData.dataType" placeholder="请选择数据类型">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔" value="boolean" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>
        <el-form-item label="分组" prop="groupName">
          <el-input v-model="formData.groupName" placeholder="请输入分组名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'

interface RuleElement {
  id: number
  elementName: string
  elementPath: string
  needConvert: boolean
  dataType: string
  groupName: string
  updateTime: string
}

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const selectedRows = ref<RuleElement[]>([])

const searchForm = reactive({
  keyword: '',
  dataType: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<RuleElement[]>([])

const dialogTitle = ref('新增元素')

const formData = reactive({
  id: undefined as number | undefined,
  elementName: '',
  elementPath: '',
  needConvert: false,
  dataType: 'string',
  groupName: ''
})

const formRules: FormRules = {
  elementName: [
    { required: true, message: '请输入元素名称', trigger: 'blur' }
  ],
  elementPath: [
    { required: true, message: '请输入元素路径', trigger: 'blur' }
  ],
  dataType: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  groupName: [
    { required: true, message: '请输入分组名称', trigger: 'blur' }
  ]
}

const getDataTypeLabel = (dataType: string) => {
  const map: Record<string, string> = {
    string: '字符串',
    number: '数字',
    boolean: '布尔',
    date: '日期'
  }
  return map[dataType] || dataType
}

const getDataTypeTagType = (dataType: string) => {
  const map: Record<string, string> = {
    string: 'primary',
    number: 'success',
    boolean: 'warning',
    date: 'info'
  }
  return map[dataType] || ''
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').substring(0, 19)
}

const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的 API 接口
    // const res = await listRuleElements({
    //   keyword: searchForm.keyword || undefined,
    //   dataType: searchForm.dataType || undefined,
    //   pageNum: pagination.pageNum,
    //   pageSize: pagination.pageSize
    // })
    // tableData.value = res.data.list
    // pagination.total = res.data.total
    
    // 模拟数据
    tableData.value = [
      {
        id: 1,
        elementName: '用户名称',
        elementPath: '$.user.name',
        needConvert: false,
        dataType: 'string',
        groupName: '用户信息',
        updateTime: '2024-01-15T10:30:00'
      },
      {
        id: 2,
        elementName: '用户年龄',
        elementPath: '$.user.age',
        needConvert: true,
        dataType: 'number',
        groupName: '用户信息',
        updateTime: '2024-01-15T11:20:00'
      }
    ]
    pagination.total = 2
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.dataType = ''
  pagination.pageNum = 1
  fetchData()
}

const resetForm = () => {
  formData.id = undefined
  formData.elementName = ''
  formData.elementPath = ''
  formData.needConvert = false
  formData.dataType = 'string'
  formData.groupName = ''
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogTitle.value = '新增元素'
  dialogVisible.value = true
}

const handleEdit = (row: RuleElement) => {
  resetForm()
  isEdit.value = true
  dialogTitle.value = '编辑元素'
  formData.id = row.id
  formData.elementName = row.elementName
  formData.elementPath = row.elementPath
  formData.needConvert = row.needConvert
  formData.dataType = row.dataType
  formData.groupName = row.groupName
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // TODO: 调用实际的 API 接口
        if (isEdit.value) {
          // await updateRuleElement(formData.id!, formData)
          ElMessage.success('更新成功')
        } else {
          // await createRuleElement(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = (row: RuleElement) => {
  ElMessageBox.confirm(`确定要删除元素 "${row.elementName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用实际的 API 接口
      // await deleteRuleElement(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个元素吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用实际的 API 接口
      // const ids = selectedRows.value.map(row => row.id)
      // await batchDeleteRuleElements(ids)
      ElMessage.success('批量删除成功')
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const handleSelectionChange = (selection: RuleElement[]) => {
  selectedRows.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.rule-element-page {
  width: 100%;
}

.search-card,
.table-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-form {
  margin-bottom: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.type-select {
  width: 100px;
}
</style>
