<template>
  <div class="fault-page">
    <div class="fault-tabs">
      <button
        v-for="tab in faultTabs"
        :key="tab.key"
        type="button"
        :class="['fault-tab', { active: activeFaultTab === tab.key }]"
        @click="activeFaultTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="fault-toolbar">
      <button type="button" class="history-btn" @click="goToHistory">历史保修记录</button>
      <button type="button" class="primary-btn warranty-btn" @click="openWarrantyDialog">一键保修</button>
    </div>

    <div class="table-shell">
      <table class="fault-table">
        <thead>
          <tr>
            <th>设备名称/区域</th>
            <th>设备品类/型号</th>
            <th>设备条码</th>
            <th>故障代码/名称</th>
            <th>故障时间</th>
            <th>服务进度</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in faultList" :key="row.id">
            <td>{{ row.deviceName }}</td>
            <td>{{ row.deviceModel }}</td>
            <td>{{ row.deviceCode }}</td>
            <td>{{ row.faultCode }}</td>
            <td>{{ row.faultTime }}</td>
            <td>{{ row.serviceProgress }}</td>
            <td>
              <span :class="['status-tag', row.status]">{{ row.statusText }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!faultList.length" class="empty-state">
        <i class="el-icon-document-empty"></i>
        <span>暂无数据</span>
      </div>

      <div v-if="faultList.length" class="pagination-bar">
        <span>第1-{{ faultList.length }}条/共{{ faultList.length }}条</span>
        <div class="pagination-controls">
          <button type="button" class="page-btn">‹</button>
          <button type="button" class="page-btn active">1</button>
          <button type="button" class="page-btn">›</button>
        </div>
      </div>
    </div>

    <el-dialog
      :visible.sync="showWarrantyDialog"
      width="600px"
      custom-class="warranty-dialog"
      :show-close="false"
      append-to-body
    >
      <div class="dialog-header">
        <span class="dialog-title">一键保修</span>
        <button type="button" class="dialog-close" @click="showWarrantyDialog = false">×</button>
      </div>

      <div class="dialog-body">
        <div class="form-grid">
          <div class="form-item">
            <span class="field-label required">报修类型：</span>
            <div class="radio-group">
              <label class="radio-item">
                <input v-model="warrantyForm.type" type="radio" value="normal">
                <span>常规报修</span>
              </label>
              <label class="radio-item">
                <input v-model="warrantyForm.type" type="radio" value="emergency">
                <span>紧急报修</span>
              </label>
            </div>
          </div>

          <div class="form-item">
            <span class="field-label required">设备名称：</span>
            <input v-model="warrantyForm.deviceName" type="text" class="form-input" placeholder="请输入设备名称">
          </div>

          <div class="form-item">
            <span class="field-label">设备条码：</span>
            <input v-model="warrantyForm.deviceCode" type="text" class="form-input" placeholder="请输入设备条码">
          </div>

          <div class="form-item">
            <span class="field-label">故障描述：</span>
            <textarea v-model="warrantyForm.description" class="form-textarea" placeholder="请描述故障情况"></textarea>
          </div>

          <div class="form-item">
            <span class="field-label">联系人：</span>
            <input v-model="warrantyForm.contact" type="text" class="form-input" placeholder="请输入联系人">
          </div>

          <div class="form-item">
            <span class="field-label">联系电话：</span>
            <input v-model="warrantyForm.phone" type="text" class="form-input" placeholder="请输入联系电话">
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button type="button" class="secondary-btn" @click="showWarrantyDialog = false">取消</button>
        <button type="button" class="primary-btn" @click="submitWarranty">提交报修</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FaultPage',
  data() {
    return {
      activeFaultTab: 'realtime',
      showWarrantyDialog: false,
      faultTabs: [
        { key: 'realtime', label: '实时故障' }
      ],
      faultList: [],
      warrantyForm: {
        type: 'normal',
        deviceName: '',
        deviceCode: '',
        description: '',
        contact: '',
        phone: ''
      }
    }
  },
  methods: {
    goToHistory() {
      this.activeFaultTab = 'history'
    },
    openWarrantyDialog() {
      this.showWarrantyDialog = true
    },
    submitWarranty() {
      this.showWarrantyDialog = false
      this.$message.success('报修提交成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.fault-page {
  min-height: calc(100vh - 84px);
  background: #fff;
}

.fault-tabs {
  display: flex;
  border-bottom: 1px solid #edf0f5;
}

.fault-tab {
  min-width: 112px;
  height: 40px;
  border: 0;
  background: #fff;
  color: #1f2d45;
  font-size: 15px;
  cursor: pointer;

  &.active {
    color: #2d63ff;
    font-weight: 600;
    border-bottom: 2px solid #2d63ff;
  }
}

.fault-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.history-btn {
  height: 32px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: #2d63ff;
  font-size: 14px;
  cursor: pointer;
}

.primary-btn {
  min-width: 80px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  background: #2d63ff;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.warranty-btn {
  min-width: 96px;
}

.table-shell {
  padding: 20px 0;
}

.fault-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 18px;
    text-align: left;
    border-bottom: 1px solid #edf0f5;
    color: #30415e;
    font-size: 14px;
    font-weight: 400;
  }

  th {
    background: #f8f9fb;
    color: #7b8ba8;
    font-weight: 600;
  }
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;

  &.pending {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.processing {
    background: #e6f7ff;
    color: #1890ff;
  }

  &.completed {
    background: #f6ffed;
    color: #52c41a;
  }

  &.cancelled {
    background: #f5f5f5;
    color: #999;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #9fb5dc;
  font-size: 14px;

  i {
    font-size: 48px;
    margin-bottom: 12px;
  }
}

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  color: #7b8ba8;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 4px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dbe4f2;
  border-radius: 4px;
  background: #fff;
  color: #7b8ba8;
  font-size: 14px;
  cursor: pointer;

  &.active {
    background: #2d63ff;
    color: #fff;
    border-color: #2d63ff;
  }
}

.dialog-header,
.dialog-footer,
.form-grid,
.radio-group {
  display: flex;
  align-items: center;
}

.dialog-header {
  justify-content: space-between;
  margin-bottom: 24px;
}

.dialog-title {
  color: #1d2a44;
  font-size: 16px;
  font-weight: 700;
}

.dialog-close {
  border: 0;
  background: transparent;
  color: #7b8ba8;
  font-size: 24px;
  cursor: pointer;
}

.dialog-body {
  padding: 0 12px;
}

.form-grid {
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.field-label {
  width: 100px;
  color: #30415e;
  font-size: 14px;
  white-space: nowrap;
  padding-top: 6px;
}

.field-label.required::before {
  content: '*';
  margin-right: 2px;
  color: #ff4d4f;
}

.radio-group {
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #30415e;
  font-size: 14px;
}

.form-input {
  width: 280px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  color: #30415e;
  font-size: 14px;
}

.form-textarea {
  width: 280px;
  height: 80px;
  padding: 10px 12px;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  color: #30415e;
  font-size: 14px;
  resize: vertical;
}

.secondary-btn {
  min-width: 72px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  background: #e8f1ff;
  color: #2d63ff;
  font-size: 14px;
  cursor: pointer;
}

.dialog-footer {
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 12px 0;
}
</style>
