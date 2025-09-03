<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const fieldMappingRows = ref([]) // [{source: '', target: '', desc: ''}]
const keyFields = ref([])

// 加载mapping.csv
async function fetchMapping() {
  loading.value = true
  try {
    const resp = await fetch('/api/mapping')
    const data = await resp.json()
    // 转为表格行
    fieldMappingRows.value = Object.entries(data.field_mapping || {}).map(([source, {target, desc}]) => ({ source, target, desc }))
    keyFields.value = data.key_fields || []
  } catch (e) {
    ElMessage.error('获取字段映射失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchMapping)

function addRow() {
  fieldMappingRows.value.push({ source: '', target: '' , desc: '' })
}
function removeRow(index) {
  fieldMappingRows.value.splice(index, 1)
}
function addKeyField() {
  keyFields.value.push('')
}
function removeKeyField(index) {
  keyFields.value.splice(index, 1)
}

async function onSubmit() {
  // 校验
  const mapping = {}
  for (const row of fieldMappingRows.value) {
    if (!row.source || !row.target || !row.desc) {
      ElMessage.error('字段映射不能为空')
      return
    }
    mapping[row.source] = {target: row.target, desc: row.desc}
  }
  if (!keyFields.value.length || keyFields.value.some(f => !f)) {
    ElMessage.error('关键字段不能为空')
    return
  }
  loading.value = true
  try {
    const resp = await fetch('/api/mapping', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field_mapping: mapping, key_fields: keyFields.value })
    })
    if (resp.ok) {
      ElMessage.success('保存成功')
      fetchMapping()
    } else {
      ElMessage.error('保存失败')
    }
  } catch (e) {
    ElMessage.error('请求失败: ' + e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-gradient mapping-page-root">
    <div class="center-card animate-slide-up">
      <div class="header-area">
        <div class="logo-container">
          <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4ca.svg" alt="logo" class="logo animate-bounce" />
        </div>
        <h1 class="animate-fade-in">字段映射配置</h1>
        <p class="subtitle animate-fade-in">可增删改字段映射和关键字段，保存即写入 mapping.csv</p>
      </div>
      <el-table 
        :data="fieldMappingRows" 
        border 
        class="custom-table animate-fade-in"
        :header-cell-style="{ background: '#f8fafc', color: '#606266', fontWeight: '600' }"
        :cell-style="{ background: '#ffffff' }"
      >
        <el-table-column label="数据1" prop="source">
          <template #default="scope">
            <el-input 
              v-model="scope.row.source" 
              placeholder="数据表格1"
              class="custom-input"
            />
          </template>
        </el-table-column>
        <el-table-column label="数据2" prop="target">
          <template #default="scope">
            <el-input 
              v-model="scope.row.target" 
              placeholder="数据表格2"
              class="custom-input"
            />
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="desc">
          <template #default="scope">
            <el-input 
              v-model="scope.row.desc" 
              placeholder="描述"
              class="custom-input"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small" 
              @click="removeRow(scope.$index)"
              class="delete-btn"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" plain size="small" @click="addRow" style="margin-bottom:18px">添加字段映射</el-button>
      <div style="margin-bottom:12px;font-weight:600;">关键字段：</div>
      <div v-for="(field, idx) in keyFields" :key="idx" style="display:flex;align-items:center;margin-bottom:8px;gap:8px;">
        <el-input v-model="keyFields[idx]" placeholder="关键字段名" style="flex:1" />
        <el-button type="danger" size="small" @click="removeKeyField(idx)">删除</el-button>
      </div>
      <el-button type="primary" plain size="small" @click="addKeyField" style="margin-bottom:18px">添加关键字段</el-button>
      <el-button type="primary" @click="onSubmit" :loading="loading" class="submit-btn" style="width:100%;margin-top:10px">保存配置</el-button>
    </div>
  </div>
</template>

<style scoped>
/* 动画效果 */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-bounce {
  animation: bounce 2s infinite ease-in-out;
}

/* 背景渐变 */
.bg-gradient {
  min-height: 100vh;
  height: 100vh;
  overflow: hidden !important;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.center-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 32px 28px 24px 28px;
  min-width: 420px;
  max-width: 900px;
  width: 100%;
  overflow: visible;
  transition: transform 0.3s ease-in-out;
}

.center-card:hover {
  transform: translateY(-2px);
}
body, html, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden !important;
}
.header-area {
  text-align: center;
  margin-bottom: 28px;
}

.logo-container {
  display: inline-block;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(253, 160, 133, 0.2);
}

.logo {
  width: 54px;
  height: 54px;
  filter: drop-shadow(0 2px 8px rgba(253, 160, 133, 0.4));
}

h1 {
  color: #f57c00;
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
  background: linear-gradient(45deg, #f57c00, #fda085);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: #888;
  font-size: 1.08rem;
  margin-bottom: 0;
  letter-spacing: 0.5px;
  line-height: 1.6;
}
/* 自定义表格样式 */
.custom-table {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.custom-input :deep(.el-input__inner) {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.custom-input :deep(.el-input__inner:focus) {
  border-color: #f57c00;
  box-shadow: 0 0 0 2px rgba(253, 160, 133, 0.2);
}

.delete-btn {
  transition: all 0.3s ease;
  border-radius: 4px;
  border: none;
  background: #ff4d4f;
  opacity: 0.8;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* 按钮样式 */
.submit-btn {
  width: 100%;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(253, 160, 133, 0.2);
  transition: all 0.3s ease;
  padding: 12px 0;
  margin-top: 20px;
}

.submit-btn:hover {
  background: linear-gradient(90deg, #fda085 0%, #f6d365 100%);
  box-shadow: 0 4px 16px rgba(253, 160, 133, 0.3);
  transform: translateY(-2px);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(253, 160, 133, 0.2);
}

@media (max-width: 600px) {
  .center-card {
    padding: 18px 4vw 16px 4vw;
    max-width: 98vw;
  }
  h1 {
    font-size: 1.3rem;
  }
}
</style>
