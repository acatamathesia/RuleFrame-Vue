<template>
  <div class="main-layout">
    <el-container>
      <el-aside :width="appStore.sidebarCollapsed ? '64px' : '200px'" class="sidebar">
        <div class="logo-container">
          <el-icon class="logo-icon" :size="28"><Monitor /></el-icon>
          <span v-show="!appStore.sidebarCollapsed" class="logo-text">RuleFrame</span>
        </div>
        <el-menu
          :default-active="currentRoute"
          :collapse="appStore.sidebarCollapsed"
          router
          class="sidebar-menu"
        >
          <!-- 动态菜单 -->
          <template v-for="menu in authStore.menus" :key="menu.id">
            <!-- 目录类型(menuType=1)或有子菜单的显示为子菜单 -->
            <el-sub-menu v-if="menu.menuType === 1 || (menu.children && menu.children.length > 0)" :index="menu.menuCode">
              <template #title>
                <el-icon><component :is="getIconComponent(menu.icon)" /></el-icon>
                <span>{{ menu.menuName }}</span>
              </template>
              <el-menu-item 
                v-for="child in menu.children" 
                :key="child.id" 
                :index="child.path"
              >
                <el-icon><component :is="getIconComponent(child.icon)" /></el-icon>
                <template #title>{{ child.menuName }}</template>
              </el-menu-item>
            </el-sub-menu>
            <!-- 菜单类型(menuType=2)且无子菜单的显示为菜单项 -->
            <el-menu-item v-else :index="menu.path">
              <el-icon><component :is="getIconComponent(menu.icon)" /></el-icon>
              <template #title>{{ menu.menuName }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
              <Fold v-if="!appStore.sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRouteMeta">{{ currentRouteMeta }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :icon="UserFilled" />
                <span class="username">{{ authStore.user?.nickname || authStore.user?.username || '用户' }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="/system/settings">系统设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, Menu, Setting, Document, DataAnalysis, User } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const currentRoute = computed(() => route.path)
const currentRouteMeta = computed(() => route.meta.title as string | undefined)

// 动态获取图标组件
const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Document
  return (ElementPlusIconsVue as any)[iconName] || Document
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        authStore.logout()
        router.push('/login')
        ElMessage.success('已退出登录')
      }).catch(() => {})
      break
  }
}
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100%;
}

.el-container {
  height: 100%;
}

.sidebar {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  color: #409eff;
  flex-shrink: 0;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

:deep(.el-menu) {
  background: #304156;
}

:deep(.el-menu-item) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover) {
  background: #263445;
  color: #409eff;
}

:deep(.el-menu-item.is-active) {
  background: #263445;
  color: #409eff;
  border-right: 3px solid #409eff;
}

:deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

:deep(.el-sub-menu__title:hover) {
  background: #263445;
  color: #409eff;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #409eff;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #333;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
