<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>仪表盘</h2>
      <p>欢迎回来，{{ authStore.user?.nickname || authStore.user?.username }}！</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">规则总数</div>
              <div class="stat-value">{{ stats.totalRules }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">用户总数</div>
              <div class="stat-value">{{ stats.totalUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon :size="24"><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">执行次数</div>
              <div class="stat-value">{{ stats.todayExecutions?.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <el-icon :size="24"><SuccessFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">成功率</div>
              <div class="stat-value">{{ stats.successRate }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>规则执行趋势</span>
              <el-button text @click="refreshData">刷新</el-button>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表区域 - 可接入 ECharts 等图表库" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.time"
              placement="top"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getDashboardStats } from '@/api/system'
import type { DashboardStats } from '@/api/types'

const authStore = useAuthStore()

const stats = ref<DashboardStats>({
  totalRules: 0,
  totalUsers: 0,
  todayExecutions: 0,
  successRate: 0,
  activeRules: 0,
  runningDays: 0
})

const activities = ref([
  { content: '用户 admin 更新了规则 #128', time: '2024-02-12 14:30' },
  { content: '系统执行了 1,234 次规则', time: '2024-02-12 13:00' },
  { content: '新用户 test_user 已注册', time: '2024-02-12 11:45' },
  { content: '规则 #127 已发布到生产环境', time: '2024-02-12 10:20' },
  { content: '系统备份已完成', time: '2024-02-12 08:00' }
])

const fetchData = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res.data
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

const refreshData = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.dashboard-header {
  margin-bottom: 20px;
}

.dashboard-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.dashboard-header p {
  font-size: 14px;
  color: #666;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.content-row {
  margin-bottom: 20px;
}

.chart-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
