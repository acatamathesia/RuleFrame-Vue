<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
              <el-button type="primary" text @click="fetchSystemInfo">
                <el-icon><Refresh /></el-icon> 刷新
              </el-button>
            </div>
          </template>
          <el-descriptions :column="2" border v-loading="loading">
            <el-descriptions-item label="应用名称">{{ systemInfo.appName }}</el-descriptions-item>
            <el-descriptions-item label="应用版本">{{ systemInfo.version }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{ systemInfo.osName }}</el-descriptions-item>
            <el-descriptions-item label="系统架构">{{ systemInfo.osArch }}</el-descriptions-item>
            <el-descriptions-item label="Java版本">{{ systemInfo.javaVersion }}</el-descriptions-item>
            <el-descriptions-item label="CPU核心数">{{ systemInfo.cpuCores }} 核</el-descriptions-item>
            <el-descriptions-item label="总内存">{{ systemInfo.totalMemory }} MB</el-descriptions-item>
            <el-descriptions-item label="可用内存">{{ systemInfo.freeMemory }} MB</el-descriptions-item>
            <el-descriptions-item label="已使用内存">
              <el-progress 
                :percentage="memoryUsagePercent" 
                :status="memoryUsagePercent > 80 ? 'exception' : memoryUsagePercent > 60 ? 'warning' : 'success'"
              />
              <span class="memory-text">{{ systemInfo.usedMemory }} MB ({{ memoryUsagePercent }}%)</span>
            </el-descriptions-item>
            <el-descriptions-item label="运行时间">{{ formatUptime(systemInfo.uptime) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="config-card">
          <template #header>
            <span>系统配置</span>
          </template>
          <el-form :model="configForm" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="configForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-input v-model="configForm.logo" placeholder="请输入Logo URL" />
            </el-form-item>
            <el-form-item label="登录验证码">
              <el-switch v-model="configForm.captchaEnabled" />
            </el-form-item>
            <el-form-item label="登录超时时间">
              <el-input-number v-model="configForm.loginTimeout" :min="5" :max="120" />
              <span class="unit-text">分钟</span>
            </el-form-item>
            <el-form-item label="会话超时时间">
              <el-input-number v-model="configForm.sessionTimeout" :min="10" :max="480" />
              <span class="unit-text">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
              <el-button @click="handleResetConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="quick-card">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" class="action-btn" @click="handleClearCache">
              <el-icon><Delete /></el-icon>
              清理缓存
            </el-button>
            <el-button type="warning" class="action-btn" @click="handleExportLogs">
              <el-icon><Download /></el-icon>
              导出日志
            </el-button>
            <el-button type="danger" class="action-btn" @click="handleRestartSystem">
              <el-icon><RefreshRight /></el-icon>
              重启系统
            </el-button>
          </div>
        </el-card>

        <el-card class="status-card">
          <template #header>
            <span>系统状态</span>
          </template>
          <div class="status-list">
            <div class="status-item">
              <span class="status-label">CPU使用率</span>
              <el-progress :percentage="cpuUsage" :status="cpuUsage > 80 ? 'exception' : 'success'" />
            </div>
            <div class="status-item">
              <span class="status-label">内存使用率</span>
              <el-progress :percentage="memoryUsagePercent" :status="memoryUsagePercent > 80 ? 'exception' : 'success'" />
            </div>
            <div class="status-item">
              <span class="status-label">磁盘使用率</span>
              <el-progress :percentage="diskUsage" :status="diskUsage > 80 ? 'exception' : 'success'" />
            </div>
          </div>
        </el-card>

        <el-card class="about-card">
          <template #header>
            <span>关于系统</span>
          </template>
          <div class="about-content">
            <p><strong>RuleFrame</strong> - 规则引擎管理系统</p>
            <p>版本：1.0.0</p>
            <p>技术栈：Spring Boot + Vue 3 + Element Plus</p>
            <p>© 2024 RuleFrame. All rights reserved.</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSystemInfo } from '@/api/system'
import type { SystemInfo } from '@/api/types'

const loading = ref(false)

const systemInfo = ref<SystemInfo>({
  appName: '',
  version: '',
  uptime: 0,
  javaVersion: '',
  osName: '',
  osArch: '',
  cpuCores: 0,
  totalMemory: 0,
  freeMemory: 0,
  usedMemory: 0
})

const configForm = reactive({
  systemName: 'RuleFrame',
  logo: '',
  captchaEnabled: true,
  loginTimeout: 30,
  sessionTimeout: 60
})

// 模拟数据
const cpuUsage = ref(45)
const diskUsage = ref(62)

const memoryUsagePercent = computed(() => {
  if (systemInfo.value.totalMemory === 0) return 0
  return Math.round((systemInfo.value.usedMemory / systemInfo.value.totalMemory) * 100)
})

const formatUptime = (ms: number) => {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

const fetchSystemInfo = async () => {
  loading.value = true
  try {
    const res = await getSystemInfo()
    systemInfo.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '获取系统信息失败')
  } finally {
    loading.value = false
  }
}

const handleSaveConfig = () => {
  ElMessage.success('配置保存成功')
}

const handleResetConfig = () => {
  configForm.systemName = 'RuleFrame'
  configForm.logo = ''
  configForm.captchaEnabled = true
  configForm.loginTimeout = 30
  configForm.sessionTimeout = 60
  ElMessage.info('配置已重置')
}

const handleClearCache = () => {
  ElMessageBox.confirm('确定要清理系统缓存吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('缓存清理成功')
  }).catch(() => {})
}

const handleExportLogs = () => {
  ElMessage.info('日志导出功能开发中')
}

const handleRestartSystem = () => {
  ElMessageBox.confirm('确定要重启系统吗？这可能会导致服务暂时不可用。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('系统重启中...')
  }).catch(() => {})
}

onMounted(() => {
  fetchSystemInfo()
})
</script>

<style scoped>
.settings-page {
  width: 100%;
}

.info-card,
.config-card,
.quick-card,
.status-card,
.about-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.memory-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.unit-text {
  margin-left: 10px;
  color: #909399;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-label {
  font-size: 14px;
  color: #606266;
}

.about-content {
  font-size: 14px;
  color: #606266;
  line-height: 2;
}

.about-content p {
  margin: 0;
}
</style>
