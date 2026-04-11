<template>
  <div class="roles-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称或编码" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增角色
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="roleName" label="角色名称" min-width="120" />
        <el-table-column prop="roleCode" label="角色编码" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link @click="handleAssignMenu(row)">分配菜单</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="searchForm.pageNum"
        v-model:page-size="searchForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        class="pagination"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="formData.roleCode" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配菜单对话框 -->
    <el-dialog
      v-model="menuDialogVisible"
      title="分配菜单"
      width="600px"
    >
      <el-tree
        ref="menuTreeRef"
        :data="menuTreeData"
        :props="{ label: 'menuName', children: 'children' }"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedMenuIds"
        :check-strictly="false"
      />
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMenuSubmit" :loading="menuSubmitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import {
  getRolePage,
  createRole,
  updateRole,
  deleteRole,
  updateRoleStatus,
  assignMenus,
  getRoleMenuIds,
  type Role,
  type RoleQueryParams
} from '@/api/role'
import { getMenuTree, type Menu } from '@/api/menu'

const loading = ref(false)
const tableData = ref<Role[]>([])
const total = ref(0)

const searchForm = reactive<RoleQueryParams>({
  pageNum: 1,
  pageSize: 10,
  roleName: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<Partial<Role>>({
  roleName: '',
  roleCode: '',
  description: '',
  sort: 0,
  status: 1
})

const formRules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const menuDialogVisible = ref(false)
const menuSubmitLoading = ref(false)
const menuTreeRef = ref()
const menuTreeData = ref<Menu[]>([])
const checkedMenuIds = ref<number[]>([])
const currentRoleId = ref<number>()

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRolePage(searchForm)
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.pageNum = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.roleName = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  formData.value = {
    roleName: '',
    roleCode: '',
    description: '',
    sort: 0,
    status: 1
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Role) => {
  dialogTitle.value = '编辑角色'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (formData.value.id) {
          await updateRole(formData.value.id, formData.value as Role)
          ElMessage.success('更新成功')
        } else {
          await createRole(formData.value as Role)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 状态变更
const handleStatusChange = async (row: Role) => {
  try {
    await updateRoleStatus(row.id!, row.status!)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    loadData()
  }
}

// 删除
const handleDelete = (row: Role) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRole(row.id!)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 分配菜单
const handleAssignMenu = async (row: Role) => {
  console.log('分配菜单 - 角色信息:', row)
  currentRoleId.value = Number(row.id)!
  console.log('当前角色ID:', currentRoleId.value)
  menuDialogVisible.value = true
  
  // 加载菜单树
  try {
    const [menuTreeRes, roleMenuIdsRes] = await Promise.all([
      getMenuTree(),
      getRoleMenuIds(Number(row.id)!)
    ])
    menuTreeData.value = menuTreeRes.data
    checkedMenuIds.value = roleMenuIdsRes.data
  } catch (error) {
    ElMessage.error('加载菜单失败')
  }
}

// 提交菜单分配
const handleMenuSubmit = async () => {
  console.log('提交菜单分配 - 角色ID:', currentRoleId.value)
  menuSubmitLoading.value = true
  try {
    const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys() || []
    const allMenuIds = [...checkedKeys, ...halfCheckedKeys]
    
    console.log('选中的菜单IDs:', allMenuIds)
    console.log('调用 assignMenus, roleId:', currentRoleId.value)
    
    await assignMenus(Number(currentRoleId.value!), allMenuIds)
    ElMessage.success('分配成功')
    menuDialogVisible.value = false
  } catch (error) {
    console.error('分配菜单失败:', error)
    ElMessage.error('分配失败')
  } finally {
    menuSubmitLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.roles-page {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
