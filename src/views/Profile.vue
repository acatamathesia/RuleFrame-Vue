<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="avatar-section">
            <el-avatar :size="100" :icon="UserFilled" />
            <h3 class="username">{{ user?.username || '用户' }}</h3>
            <p class="role">
              <el-tag :type="user?.role === 'admin' ? 'danger' : 'primary'">
                {{ user?.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </p>
          </div>
          <el-divider />
          <div class="info-section">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>昵称：{{ user?.nickname || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>邮箱：{{ user?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>手机：{{ user?.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>注册时间：{{ formatDateTime(user?.createTime) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="form-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-width="100px"
                class="profile-form"
              >
                <el-form-item label="用户名">
                  <el-input :value="user?.username" disabled />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateProfile" :loading="loading">
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="修改密码" name="password">
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px"
                class="password-form"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    placeholder="请输入当前密码" 
                    show-password 
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    placeholder="请输入新密码" 
                    show-password 
                  />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    placeholder="请再次输入新密码" 
                    show-password 
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword" :loading="loading">
                    修改密码
                  </el-button>
                  <el-button @click="handleResetPasswordForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="操作日志" name="logs">
              <el-table :data="operationLogs" border stripe max-height="400">
                <el-table-column prop="time" label="时间" width="180" />
                <el-table-column prop="action" label="操作" min-width="150" />
                <el-table-column prop="ip" label="IP地址" width="140" />
                <el-table-column prop="result" label="结果" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.result === '成功' ? 'success' : 'danger'">
                      {{ row.result }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, changePassword } from '@/api/user'

const authStore = useAuthStore()
const user = authStore.user

const activeTab = ref('basic')
const loading = ref(false)
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const profileForm = reactive({
  nickname: user?.nickname || '',
  email: user?.email || '',
  phone: user?.phone || ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 模拟操作日志数据
const operationLogs = ref([
  { time: '2024-02-12 14:30:00', action: '用户登录', ip: '192.168.1.100', result: '成功' },
  { time: '2024-02-12 13:00:00', action: '修改密码', ip: '192.168.1.100', result: '成功' },
  { time: '2024-02-12 11:45:00', action: '更新个人信息', ip: '192.168.1.100', result: '成功' },
  { time: '2024-02-12 10:20:00', action: '用户登录', ip: '192.168.1.100', result: '成功' },
  { time: '2024-02-11 16:30:00', action: '用户登录', ip: '192.168.1.101', result: '失败' }
])

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').substring(0, 19)
}

const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (valid && user) {
      loading.value = true
      try {
        await updateProfile(user.id, profileForm.nickname, profileForm.email, profileForm.phone)
        // 更新store中的用户信息
        authStore.user = {
          ...user,
          nickname: profileForm.nickname,
          email: profileForm.email,
          phone: profileForm.phone
        }
        localStorage.setItem('user', JSON.stringify(authStore.user))
        ElMessage.success('个人信息更新成功')
      } catch (error: any) {
        ElMessage.error(error.message || '更新失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid && user) {
      loading.value = true
      try {
        await changePassword(user.id, passwordForm.oldPassword, passwordForm.newPassword)
        ElMessage.success('密码修改成功，请重新登录')
        // 清空表单
        handleResetPasswordForm()
      } catch (error: any) {
        ElMessage.error(error.message || '修改失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleResetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}

onMounted(() => {
  // 初始化表单数据
  profileForm.nickname = user?.nickname || ''
  profileForm.email = user?.email || ''
  profileForm.phone = user?.phone || ''
})
</script>

<style scoped>
.profile-page {
  width: 100%;
}

.profile-card,
.form-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.avatar-section {
  text-align: center;
  padding: 20px 0;
}

.username {
  margin: 15px 0 10px;
  font-size: 20px;
  color: #333;
}

.role {
  margin: 0;
}

.info-section {
  padding: 0 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #606266;
}

.info-item:last-child {
  border-bottom: none;
}

.profile-form,
.password-form {
  padding: 20px;
  max-width: 500px;
}
</style>
