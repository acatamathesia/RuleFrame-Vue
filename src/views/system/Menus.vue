<template>
  <div class="menus-page">
    <el-card class="toolbar-card">
      <el-button type="success" @click="handleAdd">
        <el-icon><Plus /></el-icon> 新增菜单
      </el-button>
    </el-card>

    <el-card class="table-card">
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
      >
        <el-table-column prop="menuName" label="菜单名称" min-width="180" />
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="menuType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.menuType === 1" type="primary">目录</el-tag>
            <el-tag v-else-if="row.menuType === 2" type="success">菜单</el-tag>
            <el-tag v-else-if="row.menuType === 3" type="warning">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="150" />
        <el-table-column prop="component" label="组件路径" min-width="150" />
        <el-table-column prop="permission" label="权限标识" min-width="150" />
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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="menuTreeOptions"
            :props="{ label: 'menuName', value: 'id' }"
            check-strictly
            :render-after-expand="false"
            placeholder="请选择上级菜单"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="formData.menuType">
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">菜单</el-radio>
            <el-radio :value="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="formData.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单编码" prop="menuCode">
          <el-input v-model="formData.menuCode" placeholder="请输入菜单编码" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path" v-if="formData.menuType !== 3">
          <el-input v-model="formData.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="formData.menuType === 2">
          <el-input v-model="formData.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission" v-if="formData.menuType === 3">
          <el-input v-model="formData.permission" placeholder="请输入权限标识，如：system:user:list" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="formData.menuType !== 3">
          <el-input v-model="formData.icon" placeholder="请输入图标名称，如：Setting" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  updateMenuStatus,
  type Menu
} from '@/api/menu'

const loading = ref(false)
const tableData = ref<Menu[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formData = ref<Partial<Menu>>({
  parentId: 0,
  menuName: '',
  menuCode: '',
  menuType: 2,
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  status: 1
})

const formRules: FormRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuCode: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

// 菜单树选项
const menuTreeOptions = computed(() => {
  return [
    { id: 0, menuName: '顶级菜单', children: tableData.value }
  ]
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getAllMenus()
    // 构建树形结构
    tableData.value = buildTree(res.data)
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 构建树形结构
const buildTree = (menus: Menu[]): Menu[] => {
  const map = new Map<number, Menu>()
  const tree: Menu[] = []

  menus.forEach(menu => {
    map.set(menu.id!, { ...menu, children: [] })
  })

  menus.forEach(menu => {
    const node = map.get(menu.id!)!
    if (menu.parentId === 0) {
      tree.push(node)
    } else {
      const parent = map.get(menu.parentId!)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    }
  })

  return tree
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增菜单'
  formData.value = {
    parentId: 0,
    menuName: '',
    menuCode: '',
    menuType: 2,
    path: '',
    component: '',
    permission: '',
    icon: '',
    sort: 0,
    status: 1
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Menu) => {
  dialogTitle.value = '编辑菜单'
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
          await updateMenu(formData.value.id, formData.value as Menu)
          ElMessage.success('更新成功')
        } else {
          await createMenu(formData.value as Menu)
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
const handleStatusChange = async (row: Menu) => {
  try {
    await updateMenuStatus(row.id!, row.status!)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    loadData()
  }
}

// 删除
const handleDelete = (row: Menu) => {
  ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMenu(row.id!)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.menus-page {
  .toolbar-card {
    margin-bottom: 16px;
    
    :deep(.el-card__body) {
      padding: 16px;
    }
  }
}
</style>
