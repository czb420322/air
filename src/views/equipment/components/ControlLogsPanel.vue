<template>
  <div class="control-log-page">
    <div class="top-tabs">
      <button
        v-for="tab in logTabs"
        :key="tab.key"
        type="button"
        :class="['top-tab', { active: activeLogTab === tab.key }]"
        @click="activeLogTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="toolbar-row">
      <div class="toolbar-filters">
        <div class="filter-item">
          <span class="filter-label">日程名称</span>
          <input v-model.trim="keyword" type="text" class="filter-input" placeholder="请输入日程名称">
        </div>
        <div class="filter-item">
          <span class="filter-label">执行时间</span>
          <div class="range-box">
            <span>开始日期</span>
            <span class="range-sep">→</span>
            <span>结束日期</span>
            <i class="el-icon-date"></i>
          </div>
        </div>
        <div class="filter-item">
          <span class="filter-label">任务状态</span>
          <el-select v-model="selectedStatus" placeholder="请选择任务状态" class="status-select">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </div>

      <button type="button" class="export-btn">导出</button>
    </div>

    <div class="log-table-card">
      <table class="log-table">
        <thead>
          <tr>
            <th>日程日期范围 | 执行时间</th>
            <th>日程名称</th>
            <th>执行时间</th>
            <th>执行指令</th>
            <th>执行范围</th>
            <th>设备响应成功率</th>
            <th>任务状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredLogs" :key="item.id">
            <td>{{ item.dateRange }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.executeAt }}</td>
            <td>{{ item.command }}</td>
            <td>{{ item.scope }}</td>
            <td>
              <div class="success-rate">
                <div class="rate-bar">
                  <span class="rate-fill" :style="{ width: item.successRate + '%' }"></span>
                </div>
                <span>{{ item.successRate }}%</span>
              </div>
            </td>
            <td>{{ item.statusLabel }}</td>
            <td>
              <button type="button" class="detail-link" @click="openDetail(item)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-drawer
      :visible.sync="showDetail"
      :direction="'rtl'"
      :size="'520px'"
      custom-class="log-detail-drawer"
    >
      <div v-if="currentLog" class="detail-drawer">
        <div class="drawer-head">
          <span class="drawer-title">控制日志详情</span>
          <button type="button" class="close-btn" @click="showDetail = false">
            <i class="el-icon-close"></i>
          </button>
        </div>

        <div class="drawer-section">
          <div class="drawer-row">
            <span class="drawer-label">任务名称</span>
            <span class="drawer-value">{{ currentLog.name }}</span>
          </div>
          <div class="drawer-row">
            <span class="drawer-label">执行时间</span>
            <span class="drawer-value">{{ currentLog.executeAt }}</span>
          </div>
          <div class="drawer-row">
            <span class="drawer-label">执行范围</span>
            <span class="drawer-value">{{ currentLog.scope }}</span>
          </div>
          <div class="drawer-row">
            <span class="drawer-label">执行指令</span>
            <span class="drawer-value">{{ currentLog.command }}</span>
          </div>
          <div class="drawer-row">
            <span class="drawer-label">任务状态</span>
            <span class="drawer-value">{{ currentLog.statusLabel }}</span>
          </div>
          <div class="drawer-row">
            <span class="drawer-label">设备响应成功率</span>
            <span class="drawer-value">{{ currentLog.successRate }}%</span>
          </div>
        </div>

        <div class="drawer-section">
          <div class="section-title">执行明细</div>
          <div class="device-result-list">
            <div v-for="device in currentLog.devices" :key="device.name" class="device-result-item">
              <span>{{ device.name }}</span>
              <span :class="['device-result-tag', device.success ? 'success' : 'fail']">
                {{ device.success ? '成功' : '失败' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
function createLogs() {
  const baseDevices = [
    { name: 'IDU-00627-2-20 Recoo-首尔', success: true },
    { name: 'IDU-00627-2-21 财务隔壁', success: true },
    { name: 'IDU-00625-0-9 零食角', success: true }
  ]

  return [
    {
      id: 'log-01',
      tab: 'schedule',
      dateRange: '2026-01-01~2026-05-30 | 23:30',
      name: '每日关机2（1）',
      executeAt: '2026-05-30 23:30:07',
      command: '关机',
      scope: '未分区 共21台',
      successRate: 100,
      status: 'success',
      statusLabel: '全部执行成功',
      devices: baseDevices
    },
    {
      id: 'log-02',
      tab: 'schedule',
      dateRange: '2026-01-01~2026-05-29 | 23:30',
      name: '每日关机2（1）',
      executeAt: '2026-05-29 23:30:07',
      command: '关机',
      scope: '未分区 共21台',
      successRate: 100,
      status: 'success',
      statusLabel: '全部执行成功',
      devices: baseDevices
    },
    {
      id: 'log-03',
      tab: 'single',
      dateRange: '2026-05-28 | 09:20',
      name: '单控开机',
      executeAt: '2026-05-28 09:20:11',
      command: '开机 | 制冷 | 设置温度 26℃',
      scope: '办公区 共1台',
      successRate: 100,
      status: 'success',
      statusLabel: '全部执行成功',
      devices: [{ name: 'IDU-00627-2-14 华芯', success: true }]
    },
    {
      id: 'log-04',
      tab: 'batch',
      dateRange: '2026-05-27 | 14:05',
      name: '批量控温',
      executeAt: '2026-05-27 14:05:08',
      command: '开机 | 制冷 | 设置温度 24℃',
      scope: '办公区 共8台',
      successRate: 87,
      status: 'partial',
      statusLabel: '部分执行成功',
      devices: [
        { name: 'IDU-00627-2-14 华芯', success: true },
        { name: 'IDU-00627-2-15 林宏 Tim Jack', success: true },
        { name: 'IDU-00627-2-16 赣哥 朱钰', success: false }
      ]
    },
    {
      id: 'log-05',
      tab: 'quick',
      dateRange: '2026-05-26 | 08:10',
      name: '设备全开',
      executeAt: '2026-05-26 08:10:12',
      command: '开机 | 制冷 | 设置风档 1档 | 设置温度 26℃',
      scope: '未分区 共22台',
      successRate: 100,
      status: 'success',
      statusLabel: '全部执行成功',
      devices: baseDevices
    },
    {
      id: 'log-06',
      tab: 'peak',
      dateRange: '2026-05-25 | 16:40',
      name: '削峰任务',
      executeAt: '2026-05-25 16:40:06',
      command: '设定温度 28℃',
      scope: '办公区 共6台',
      successRate: 0,
      status: 'fail',
      statusLabel: '执行失败',
      devices: [
        { name: 'IDU-00627-2-20 Recoo-首尔', success: false },
        { name: 'IDU-00627-2-21 财务隔壁', success: false }
      ]
    },
    {
      id: 'log-07',
      tab: 'linkage',
      dateRange: '2026-05-24 | 12:00',
      name: '联动场景1',
      executeAt: '2026-05-24 12:00:09',
      command: '关机',
      scope: '生活区 共5台',
      successRate: 100,
      status: 'success',
      statusLabel: '全部执行成功',
      devices: baseDevices
    }
  ]
}

export default {
  name: 'ControlLogsPanel',
  data() {
    return {
      activeLogTab: 'schedule',
      keyword: '',
      selectedStatus: '',
      showDetail: false,
      currentLog: null,
      logTabs: [
        { key: 'schedule', label: '日程控制' },
        { key: 'batch', label: '批量控制' },
        { key: 'single', label: '单控' },
        { key: 'quick', label: '快捷控制' },
        { key: 'peak', label: '削峰' },
        { key: 'linkage', label: '联动控制' }
      ],
      statusOptions: [
        { value: 'running', label: '执行中' },
        { value: 'partial', label: '部分执行成功' },
        { value: 'success', label: '全部执行成功' },
        { value: 'fail', label: '执行失败' }
      ],
      logs: createLogs()
    }
  },
  computed: {
    filteredLogs() {
      return this.logs.filter(item => {
        const matchedTab = item.tab === this.activeLogTab
        const matchedKeyword = !this.keyword || item.name.includes(this.keyword)
        const matchedStatus = !this.selectedStatus || item.status === this.selectedStatus
        return matchedTab && matchedKeyword && matchedStatus
      })
    }
  },
  methods: {
    openDetail(item) {
      this.currentLog = item
      this.showDetail = true
    }
  }
}
</script>

<style lang="scss" scoped>
.control-log-page {
  min-height: calc(100vh - 125px);
  background: #fff;
}

.top-tabs {
  display: flex;
  gap: 26px;
  padding: 12px 8px 0;
}

.top-tab {
  padding: 14px 0 10px;
  border: 0;
  background: transparent;
  color: #2b3d58;
  font-size: 14px;
  cursor: pointer;
}

.top-tab.active {
  border-bottom: 2px solid #2d63ff;
  color: #2d63ff;
}

.toolbar-row,
.toolbar-filters,
.filter-item,
.range-box,
.success-rate,
.drawer-head,
.drawer-row,
.device-result-item {
  display: flex;
  align-items: center;
}

.toolbar-row {
  justify-content: space-between;
  padding: 16px 8px 14px;
}

.toolbar-filters {
  gap: 14px;
  flex-wrap: wrap;
}

.filter-item {
  gap: 10px;
}

.filter-label {
  color: #2a3d59;
  font-size: 14px;
}

.filter-input,
.range-box {
  height: 32px;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  background: #fff;
}

.filter-input {
  width: 200px;
  padding: 0 12px;
  color: #1f2d45;
  outline: none;
}

.range-box {
  gap: 14px;
  min-width: 280px;
  padding: 0 12px;
  color: #6c7d98;
  font-size: 14px;
}

.range-sep {
  color: #b0bbcc;
}

.status-select {
  width: 160px;
}

.export-btn {
  min-width: 74px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  background: #e8f1ff;
  color: #2d63ff;
  cursor: pointer;
}

.log-table-card {
  margin: 0 8px;
  border: 1px solid #edf0f5;
  border-radius: 4px;
  overflow: hidden;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
}

.log-table th,
.log-table td {
  padding: 14px 20px;
  border-bottom: 1px solid #edf0f5;
  color: #2b3d58;
  font-size: 14px;
  text-align: left;
}

.log-table thead th {
  background: #f7f9fc;
  color: #576b87;
  font-weight: 600;
}

.success-rate {
  gap: 12px;
}

.rate-bar {
  width: 100px;
  height: 6px;
  border-radius: 999px;
  background: #dfe7f2;
  overflow: hidden;
}

.rate-fill {
  display: block;
  height: 100%;
  background: #28c44d;
}

.detail-link,
.close-btn {
  border: 0;
  background: transparent;
  color: #2d63ff;
  cursor: pointer;
}

.detail-drawer {
  height: 100%;
  padding: 18px 22px;
  background: #fff;
}

.drawer-head {
  justify-content: space-between;
  margin-bottom: 18px;
}

.drawer-title,
.section-title {
  color: #1f2d45;
  font-size: 16px;
  font-weight: 700;
}

.drawer-section {
  padding: 18px 0;
  border-top: 1px solid #edf0f5;
}

.drawer-row {
  justify-content: space-between;
  padding: 10px 0;
  gap: 20px;
}

.drawer-label {
  color: #6d7e99;
  font-size: 14px;
}

.drawer-value {
  color: #1f2d45;
  font-size: 14px;
  text-align: right;
}

.device-result-list {
  margin-top: 14px;
}

.device-result-item {
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f1f4f8;
  color: #2b3d58;
  font-size: 14px;
}

.device-result-tag {
  min-width: 52px;
  height: 24px;
  border-radius: 999px;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
}

.device-result-tag.success {
  background: #e9f8ee;
  color: #28c44d;
}

.device-result-tag.fail {
  background: #fff1f0;
  color: #ff4d4f;
}

@media (max-width: 1280px) {
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .toolbar-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    justify-content: space-between;
  }

  .filter-input,
  .range-box,
  .status-select {
    flex: 1;
    width: auto;
  }
}
</style>
