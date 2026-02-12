<template>
  <div class="rules-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="规则名称">
          <el-input v-model="searchForm.name" placeholder="请输入规则名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增规则
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="规则名称" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            <el-button type="success" link @click="handleToggleStatus(row)">
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Rule {
  id: number
  name: string
  description: string
  type: string
  status: string
  createTime: string
}

const loading = ref(false)
const searchForm = reactive({
  name: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<Rule[]>([
  { id: 1, name: '用户验证规则', description: '验证用户输入数据的合法性', type: '验证', status: 'enabled', createTime: '2024-02-12 10:00:00' },
  { id: 2, name: '价格计算规则', description: '根据条件计算产品价格', type: '计算', status: 'enabled', createTime: '2024-02-11 14:30:00' },
  { id: 3, name: '库存预警规则', description: '库存低于阈值时发送预警', type: '预警', status: 'enabled', createTime: '2024-02-10 09:15:00' },
  { id: 4, name: '订单审核规则', description: '自动审核符合条件的订单', type: '审核', status: 'disabled', createTime: '2024-02-09 16:45:00' },
  { id: 5, name: '会员积分规则', description: '根据消费金额计算积分', type: '计算', status: 'enabled', createTime: '2024-02-08 11:20:00' }
])

pagination.total = 5

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询成功')
  }, 500)
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  ElMessage.info('已重置查询条件')
}

const handleAdd = () => {
  ElMessage.info('新增规则功能开发中')
}

const handleEdit = (row: Rule) => {
  ElMessage.info(`编辑规则: ${row.name}`)
}

const handleDelete = (row: Rule) => {
  ElMessageBox.confirm(`确定要删除规则 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      pagination.total--
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleToggleStatus = (row: Rule) => {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(`${row.status === 'enabled' ? '启用' : '禁用'}成功`)
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  ElMessage.info(`每页显示 ${size} 条`)
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  ElMessage.info(`当前第 ${page} 页`)
}
</script>

<style scoped>
.rules-page {
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
</style>