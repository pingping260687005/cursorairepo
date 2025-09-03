<template>
  <el-container class="app-bg">
    <el-header height="64px" class="nav-header">
      <el-menu :default-active="$route.path" mode="horizontal" router background-color="#fff" text-color="#333" active-text-color="#f57c00" class="nav-menu">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/upload">上传</el-menu-item>
        <el-menu-item index="/mapping">Mapping</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
</script>

<style scoped>
.app-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
}
.nav-header {
  box-shadow: 0 2px 8px #fda08522;
  background: #fff;
  padding: 0;
}
.nav-menu {
  border-bottom: none;
  font-size: 1.1rem;
  font-weight: 600;
  background: #fff;
}

.el-main {
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 20px;
}
</style>
