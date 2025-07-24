<template>
  <div class="h-screen" style="height: 100vh">
    <el-container class="layout-container-demo h-full">
      <el-aside>
        <el-menu
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            :on-select="handleSelect"
            :router="true"
        >
          <el-menu-item index="/" route="/">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <template #title>数据分析</template>
          </el-menu-item>
          <el-menu-item index="/config" route="/config">
            <el-icon>
              <document/>
            </el-icon>
            <template #title>应用配置</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container class="h-full">
        <el-header style="text-align: right; font-size: 12px">
          <RightTopMenu class="absolute top-4 right-4"/>
        </el-header>

        <el-main class="mt-5 p-10">
          <slot/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'

const isCollapse = ref(false)
const handleSelect = (index: string) => {
  console.log(key, keyPath)
}

</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}

.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}

.layout-container-demo .el-menu {
  border-right: none;
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
