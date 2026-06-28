<template>
  <div class="system-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>
    
    <div class="content-wrapper">
      <el-form :model="form" label-width="120px" style="max-width: 600px;">
        <el-form-item label="网关地址">
          <el-input v-model="form.gatewayAddress" placeholder="请输入网关地址"></el-input>
        </el-form-item>
        <el-form-item label="网关token">
          <el-input v-model="form.gatewayToken" placeholder="请输入网关token"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">保存</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSettings',
  data() {
    return {
      form: {
        gatewayAddress: '',
        gatewayToken: ''
      }
    }
  },
  methods: {
    onSubmit() {
        if (!this.form.gatewayAddress) {
          this.$message.error('网关地址不能为空')
          return
        }
        if (!this.form.gatewayToken) {
          this.$message.error('网关token不能为空')
          return
        }
        this.$message.success('保存成功')
},
    onReset() {
      this.form.gatewayAddress = ''
      this.form.gatewayToken = ''
    }
  }
}
</script>

<style scoped>
.system-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.content-wrapper {
  background: #fff;
  border-radius: 4px;
  padding: 40px;
  min-height: 400px;
}
</style>
