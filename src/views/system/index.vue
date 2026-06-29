<template>
  <div class="system-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <div class="content-wrapper">
      <el-form :model="form" label-width="120px" style="max-width: 600px;">
        <el-form-item label="网关地址">
          <el-input v-model="form.gateway_url" placeholder="请输入网关地址"></el-input>
        </el-form-item>
        <el-form-item label="网关token">
          <el-input v-model="form.gateway_token" placeholder="请输入网关token"></el-input>
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
        gateway_url: '',
        gateway_token: ''
      }
    }
  },
  mounted() {
    this.getGatewayConfig()
  },
  methods: {

    // =========
    //查询网关配置
    getGatewayConfig() {
      this.$http.get("/api/gateway/config").then((res) => {
        if (res.code === 200) {
          const { gateway_token, gateway_url } = res.data
          this.form.gateway_url = gateway_url;
          this.form.gateway_token = gateway_token;
        } else {
          this.$message.error(res.message)
        }
      });
    },
    //保存网关配置
    saveGatewayConfig() {
      this.$http.post("/api/gateway/config", this.form).then((res) => {
        if (res.code === 200) {
          this.$message.success('保存成功');
        } else {
          this.$message.error(res.message);
        }
      });
    },

    //==========
    onSubmit() {
      if (!this.form.gateway_url) {
        this.$message.error('网关地址不能为空')
        return
      }
      if (!this.form.gateway_token) {
        this.$message.error('网关token不能为空')
        return
      }
      this.saveGatewayConfig()
    },
    onReset() {
      this.form.gateway_url = ''
      this.form.gateway_token = ''
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
