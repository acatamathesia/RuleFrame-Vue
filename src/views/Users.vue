<template>
  <div class="users-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增用户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            <el-button type="warning" link @click="handleResetPassword(row)">重置密码</el-button>
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

interface User {
  id: number
  username: string
  email: string
  role: string
  status: string
  lastLogin: string
}

const loading = ref(false)
const searchForm = reactive({
  username: '',
  role: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<User[]>([
  { id: 1, username: 'admin', email: 'admin@ruleframe.com', role: 'admin', status: 'active', lastLogin: '2024-02-12 14:30:00' },
  { id: 2, username: 'user001', email: 'user001@example.com', role: 'user', status: 'active', lastLogin: '2024-02-12 10:15:00' },
  { id: 3, username: 'user002', email: 'user002@example.com', role: 'user', status: 'active', lastLogin: '2024-02-11 16:45:00' },
  { id: 4, username: 'user003', email: 'user003@example.com', role: 'user', status: 'disabled', lastLogin: '2024-02-10 09:20:00' },
  { id: 5, username: 'manager', email: 'manager@ruleframe.com', role: 'admin', status: 'active', lastLogin: '2024-02-12 08:00:00' }
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
  searchForm.username = ''
  searchForm.role = ''
  ElMessage.info('已重置查询条件')
}

const handleAdd = () => {
  ElMessage.info('新增用户功能开发中')
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
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

const handleResetPassword = (row: User) => {
  ElMessageBox.confirm(`确定要重置用户 "${row.username}" 的密码吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置，新密码已发送至用户邮箱')
  }).catch(() => {})
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
.users-page {
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