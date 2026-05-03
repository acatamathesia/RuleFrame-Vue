<template>
  <div class="dictionary-page">
    <!-- 字典类型列表 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="字典名称">
          <el-input v-model="searchForm.dictName" placeholder="字典名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAddType">
            <el-icon><Plus /></el-icon> 新增字典
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="dictName" label="字典名称" min-width="150" />
        <el-table-column prop="dictCode" label="字典编码" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleTypeStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleManageData(row)">
              <el-icon><DataAnalysis /></el-icon> 数据管理
            </el-button>
            <el-button type="primary" link @click="handleEditType(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteType(row)">删除</el-button>
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

    <!-- 字典类型新增/编辑对话框 -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeDialogTitle"
      width="550px"
      :close-on-click-modal="false"
      @close="handleTypeDialogClose"
    >
      <el-form
        ref="typeFormRef"
        :model="typeFormData"
        :rules="typeFormRules"
        label-width="90px"
      >
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeFormData.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="typeFormData.dictCode" placeholder="请输入字典编码，如：sys_user_sex" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="typeFormData.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="typeFormData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="typeFormData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTypeSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典数据管理对话框 -->
    <el-dialog
      v-model="dataDialogVisible"
      :title="'字典数据管理 - ' + currentDictName"
      width="800px"
      :close-on-click-modal="false"
      top="5vh"
      @close="handleDataDialogClose"
    >
      <div class="data-toolbar">
        <el-button type="success" @click="handleAddData">
          <el-icon><Plus /></el-icon> 新增数据
        </el-button>
      </div>

      <el-table :data="dataTableData" border stripe v-loading="dataLoading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="dictLabel" label="字典标签" min-width="140" />
        <el-table-column prop="dictValue" label="字典键值" min-width="140" />
        <el-table-column prop="dictSort" label="排序" width="80" />
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleDataStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEditData(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteData(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="dataPagination.pageNum"
          v-model:page-size="dataPagination.pageSize"
          :total="dataPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleDataSizeChange"
          @current-change="handleDataCurrentChange"
        />
      </div>
    </el-dialog>

    <!-- 字典数据新增/编辑对话框 -->
    <el-dialog
      v-model="dataFormDialogVisible"
      :title="dataFormDialogTitle"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDataFormDialogClose"
    >
      <el-form
        ref="dataFormRef"
        :model="dataFormData"
        :rules="dataFormRules"
        label-width="90px"
      >
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dataFormData.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="dataFormData.dictValue" placeholder="请输入字典键值" />
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number v-model="dataFormData.dictSort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dataFormData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="dataFormData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDataSubmit" :loading="dataSubmitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, DataAnalysis } from '@element-plus/icons-vue'
import {
  getDictTypePage,
  createDictType,
  updateDictType,
  deleteDictType,
  updateDictTypeStatus,
  getDictDataPage,
  createDictData,
  updateDictData,
  deleteDictData,
  updateDictDataStatus,
  type DictType,
  type DictData
} from '@/api/dict'

// ========== 字典类型 ==========
const loading = ref(false)
const tableData = ref<DictType[]>([])
const searchForm = reactive({
  dictName: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').substring(0, 19)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getDictTypePage({
      dictName: searchForm.dictName || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data.records
    pagination.total = res.data.total
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
  searchForm.dictName = ''
  pagination.pageNum = 1
  fetchData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchData()
}

// 字典类型表单
const typeDialogVisible = ref(false)
const typeDialogTitle = ref('新增字典')
const submitLoading = ref(false)
const typeFormRef = ref<FormInstance>()
const typeFormData = ref<Partial<DictType>>({
  dictName: '',
  dictCode: '',
  status: 1,
  sort: 0,
  remark: ''
})
const typeFormRules: FormRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictCode: [{ required: true, message: '请输入字典编码', trigger: 'blur' }]
}

const handleAddType = () => {
  typeDialogTitle.value = '新增字典'
  typeFormData.value = { dictName: '', dictCode: '', status: 1, sort: 0, remark: '' }
  typeDialogVisible.value = true
}

const handleEditType = (row: DictType) => {
  typeDialogTitle.value = '编辑字典'
  typeFormData.value = { ...row }
  typeDialogVisible.value = true
}

const handleTypeSubmit = async () => {
  if (!typeFormRef.value) return
  await typeFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (typeFormData.value.id) {
          await updateDictType(typeFormData.value.id, typeFormData.value as DictType)
          ElMessage.success('更新成功')
        } else {
          await createDictType(typeFormData.value as DictType)
          ElMessage.success('创建成功')
        }
        typeDialogVisible.value = false
        fetchData()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleTypeDialogClose = () => {
  typeFormRef.value?.resetFields()
}

const handleTypeStatusChange = async (row: DictType) => {
  try {
    await updateDictTypeStatus(row.id!, row.status!)
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    fetchData()
  }
}

const handleDeleteType = (row: DictType) => {
  ElMessageBox.confirm(`确定要删除字典 "${row.dictName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDictType(row.id!)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

// ========== 字典数据管理 ==========
const dataDialogVisible = ref(false)
const dataLoading = ref(false)
const currentDictTypeId = ref(0)
const currentDictName = ref('')
const dataTableData = ref<DictData[]>([])
const dataPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const fetchDataData = async () => {
  dataLoading.value = true
  try {
    const res = await getDictDataPage({
      dictTypeId: currentDictTypeId.value,
      pageNum: dataPagination.pageNum,
      pageSize: dataPagination.pageSize
    })
    dataTableData.value = res.data.records
    dataPagination.total = res.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取字典数据失败')
  } finally {
    dataLoading.value = false
  }
}

const handleManageData = (row: DictType) => {
  currentDictTypeId.value = row.id!
  currentDictName.value = row.dictName
  dataPagination.pageNum = 1
  dataDialogVisible.value = true
  fetchDataData()
}

const handleDataSizeChange = (size: number) => {
  dataPagination.pageSize = size
  fetchDataData()
}

const handleDataCurrentChange = (page: number) => {
  dataPagination.pageNum = page
  fetchDataData()
}

const handleDataDialogClose = () => {
  // 关闭数据弹窗后，刷新字典列表（状态可能变化）
  fetchData()
}

// 字典数据表单
const dataFormDialogVisible = ref(false)
const dataFormDialogTitle = ref('新增数据')
const dataSubmitLoading = ref(false)
const dataFormRef = ref<FormInstance>()
const dataFormData = ref<Partial<DictData>>({
  dictTypeId: 0,
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  status: 1,
  remark: ''
})
const dataFormRules: FormRules = {
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典键值', trigger: 'blur' }]
}

const resetDataForm = () => {
  dataFormData.value = {
    dictTypeId: currentDictTypeId.value,
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    status: 1,
    remark: ''
  }
}

const handleAddData = () => {
  resetDataForm()
  dataFormDialogTitle.value = '新增数据'
  dataFormDialogVisible.value = true
}

const handleEditData = (row: DictData) => {
  dataFormDialogTitle.value = '编辑数据'
  dataFormData.value = { ...row }
  dataFormDialogVisible.value = true
}

const handleDataSubmit = async () => {
  if (!dataFormRef.value) return
  await dataFormRef.value.validate(async (valid) => {
    if (valid) {
      dataSubmitLoading.value = true
      try {
        if (dataFormData.value.id) {
          await updateDictData(dataFormData.value.id, dataFormData.value as DictData)
          ElMessage.success('更新成功')
        } else {
          dataFormData.value.dictTypeId = currentDictTypeId.value
          await createDictData(dataFormData.value as DictData)
          ElMessage.success('创建成功')
        }
        dataFormDialogVisible.value = false
        fetchDataData()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        dataSubmitLoading.value = false
      }
    }
  })
}

const handleDataFormDialogClose = () => {
  dataFormRef.value?.resetFields()
}

const handleDataStatusChange = async (row: DictData) => {
  try {
    await updateDictDataStatus(row.id!, row.status!)
    ElMessage.success('状态更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '状态更新失败')
    fetchDataData()
  }
}

const handleDeleteData = (row: DictData) => {
  ElMessageBox.confirm(`确定要删除字典数据 "${row.dictLabel}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDictData(row.id!)
      ElMessage.success('删除成功')
      fetchDataData()
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dictionary-page {
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

.data-toolbar {
  margin-bottom: 16px;
}
</style>
