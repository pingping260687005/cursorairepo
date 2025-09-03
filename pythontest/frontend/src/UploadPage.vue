<template>
	<div class="center-card">
		<div class="header-area">
			<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c2.svg" alt="upload" class="logo" />
			<h2>上传CSV文件并比对</h2>
			<p class="subtitle">请上传源CSV和目标CSV文件，系统将自动比对并下载报告</p>
		</div>
		<el-form class="upload-form">
			<el-form-item label="源CSV文件" required>
				<el-upload class="upload-demo" drag :auto-upload="false" :show-file-list="true"
					:on-change="file => handleFileChange(file, 'source_csv')" :file-list="fileListSource" accept=".csv">
					<el-icon-upload style="font-size:32px;color:#409EFF;" />
					<div class="el-upload__text">拖拽或点击上传 <span class="file-label">源CSV</span></div>
				</el-upload>
			</el-form-item>
			<el-form-item label="目标CSV文件" required>
				<el-upload class="upload-demo" drag :auto-upload="false" :show-file-list="true"
					:on-change="file => handleFileChange(file, 'target_csv')" :file-list="fileListTarget" accept=".csv">
					<el-icon-upload style="font-size:32px;color:#67C23A;" />
					<div class="el-upload__text">拖拽或点击上传 <span class="file-label">目标CSV</span></div>
				</el-upload>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onUpload" :loading="loading" class="submit-btn">上传并比对</el-button>
			</el-form-item>
 			<el-alert title="💡 使用说明" type="success" :closable="false" class="note"
				description="1. 上传CSV文件后自动比对 2. 下载Excel报告 3. 字段映射请前往Mapping页面维护" />
		</el-form>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const fileListSource = ref([])
const fileListTarget = ref([])
const files = reactive({
	source_csv: null,
	target_csv: null
})
const loading = ref(false)

function handleFileChange(file, type) {
	if (type === 'source_csv') {
		fileListSource.value = [file]
		files.source_csv = file.raw
	} else {
		fileListTarget.value = [file]
		files.target_csv = file.raw
	}
}

async function onUpload() {
	if (!files.source_csv || !files.target_csv) {
		ElMessage.error('请上传源和目标CSV文件')
		return
	}
	loading.value = true
	try {
		const formData = new FormData()
		formData.append('source_csv', files.source_csv)
		formData.append('target_csv', files.target_csv)
		// 假设 /data/compare 直接返回比对结果Excel
		const resp = await fetch('/data/compare', {
			method: 'POST',
			body: formData
		})
		if (resp.ok) {
			const blob = await resp.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `csv_comparison_report_${Date.now()}.xlsx`
			document.body.appendChild(a)
			a.click()
			a.remove()
			window.URL.revokeObjectURL(url)
			ElMessage.success('报告已下载')
		} else {
			const err = await resp.json()
			ElMessage.error(err.message || '比对失败')
		}
	} catch (e) {
		ElMessage.error('请求失败: ' + e)
	} finally {
		loading.value = false
	}
}
</script>

<style scoped>
.center-card {
	background: #fff;
	border-radius: 18px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.13);
	padding: 20px 32px;
	max-width: 480px;
	width: 100%;
	margin: 15px auto 0 auto;
	position: relative;
	animation: fadeIn 0.7s cubic-bezier(.4, 0, .2, 1);
}

.header-area {
	text-align: center;
	margin-bottom: 18px;
}

.logo {
	width: 54px;
	height: 54px;
	margin-bottom: 8px;
	filter: drop-shadow(0 2px 8px #fda08533);
}

h2 {
	color: #f57c00;
	font-size: 1.5rem;
	font-weight: 800;
	margin: 0 0 4px 0;
	letter-spacing: 1px;
}

.subtitle {
	color: #888;
	font-size: 1.08rem;
	margin-bottom: 0;
	letter-spacing: 0.5px;
}

.upload-form {
	background: transparent;
	box-shadow: none;
	border-radius: 0;
	padding: 0;
	max-width: 100%;
	margin: 0;
}

.el-form-item {
	margin-bottom: 22px;
}

.upload-demo {
	width: 100%;
}

.el-upload {
	width: 100%;
}

.el-upload__text {
	color: #f57c00;
	font-size: 15px;
	font-weight: 500;
}

.file-label {
	color: #409EFF;
	font-weight: bold;
}

.submit-btn {
	width: 100%;
	font-size: 1.1rem;
	font-weight: 700;
	letter-spacing: 1px;
	border-radius: 8px;
	background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
	border: none;
	box-shadow: 0 2px 8px #fda08533;
	transition: background 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
	background: linear-gradient(90deg, #fda085 0%, #f6d365 100%);
	box-shadow: 0 4px 16px #fda08544;
}

.note {
	margin-top: 20px;
	font-size: 15px;
	border-radius: 8px;
	box-shadow: 0 2px 8px #fda08522;
	background: #f6f8fa;
	border: 1.5px solid #fda085;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(30px);
	}

	to {
		opacity: 1;
		transform: none;
	}
}
</style>
