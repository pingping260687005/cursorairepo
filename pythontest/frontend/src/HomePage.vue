<template>
  <div class="home-bg">
    <div class="home-card">
      <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4ca.svg" class="logo" alt="logo" />
      <h1>CSV数据智能比对平台</h1>
      <p class="desc">支持字段映射、关键字段配置，智能生成美观Excel报告。</p>
      <el-button type="primary" size="large" @click="$router.push('/mapping')" class="go-btn">立即体验 Mapping</el-button>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}
.home-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.13);
  padding: 48px 36px 36px 36px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
}
.logo {
  width: 60px;
  margin-bottom: 12px;
}
h1 {
  color: #f57c00;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 10px 0;
}
.desc {
  color: #888;
  font-size: 1.1rem;
  margin-bottom: 32px;
}
.go-btn {
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 8px;
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
  border: none;
  box-shadow: 0 2px 8px #fda08533;
}
.go-btn:hover {
  background: linear-gradient(90deg, #fda085 0%, #f6d365 100%);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: none; }
}
</style>
