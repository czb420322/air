<template>
  <div class="operation-log-page">
    <div class="operation-log-filters">
      <div class="operation-filter-item time-item">
        <span class="operation-filter-label">操作时间</span>
        <el-date-picker
          v-model="operationLogDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          format="yyyy 年 MM 月"
          unlink-panels
          popper-class="operation-log-date-popper"
          class="operation-date-picker"
        />

      </div>

      <div class="operation-filter-item">
        <span class="operation-filter-label">操作类型</span>
        <el-select v-model="selectedOperationType" placeholder="请选择" class="operation-select">
          <el-option
            v-for="item in operationTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div class="operation-filter-item">
        <span class="operation-filter-label">操作模块</span>
        <el-select v-model="selectedOperationModule" placeholder="请选择" class="operation-select">
          <el-option
            v-for="item in operationModuleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div class="operation-log-actions">
        <button type="button" class="action-btn primary">查询</button>
        <button type="button" class="action-btn light" @click="resetOperationLogFilters">重置</button>
      </div>
    </div>

    <div class="operation-log-table-shell">
      <table class="operation-log-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>操作时间</th>
            <th>账号</th>
            <th>姓名</th>
            <th>操作模块</th>
            <th>操作类型</th>
            <th>操作内容</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredOperationLogs" :key="row.id">
            <td>{{ row.index }}</td>
            <td>{{ row.operateTime }}</td>
            <td>{{ row.account }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.module }}</td>
            <td>{{ row.type }}</td>
            <td class="operation-content-cell">{{ row.content }}</td>
          </tr>
        </tbody>
      </table>

      <div class="operation-log-footer">
        <span>{{ operationLogPaginationText }}</span>
        <div class="operation-log-pagination">
          <button type="button" class="page-btn">‹</button>
          <button type="button" class="page-btn active">1</button>
          <button type="button" class="page-btn">›</button>
          <el-select v-model="pageSize" class="page-size-select">
            <el-option v-for="size in pageSizeOptions" :key="size" :label="`${size} 条/页`" :value="size" />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OperationLogsPage',
  data() {
    return {
      operationLogDateRange: [],
      selectedOperationType: '',
      selectedOperationModule: '',
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
      operationTypeOptions: [
        { value: 'create-tenant', label: '新增租户' },
        { value: 'edit-tenant', label: '编辑租户' },
        { value: 'delete-tenant', label: '删除租户' },
        { value: 'create-park', label: '新增公区' },
        { value: 'edit-park', label: '修改公区' },
        { value: 'delete-park', label: '删除公区' },
        { value: 'create-price', label: '新增电价' },
        { value: 'edit-price', label: '修改电价' }
      ],
      operationModuleOptions: [
        { value: 'tenant', label: '租户管理' },
        { value: 'price', label: '电价配置' },
        { value: 'park', label: '公区' },
        { value: 'push', label: '公摊配置' }
      ],
      operationLogs: [
        {
          id: 'op-1',
          index: 1,
          operateTime: '2026-06-06\n22:31:11',
          account: '73645',
          name: '管忠高',
          module: '-',
          type: '-',
          content: '-'
        },
        {
          id: 'op-2',
          index: 2,
          operateTime: '2025-12-31\n13:08:06',
          account: '21990',
          name: '13357198833',
          module: '电价配置',
          type: '删除电价',
          content: '删除电价: 固定电价\n周期 2020-01-01~2025-11-30\n电价: 1.2元'
        },
        {
          id: 'op-3',
          index: 3,
          operateTime: '2025-12-31\n13:07:57',
          account: '21990',
          name: '13357198833',
          module: '电价配置',
          type: '新增电价',
          content: '新增电价: 固定电价\n周期 2025-12-01~永久\n电价: 0.80元'
        },
        {
          id: 'op-4',
          index: 4,
          operateTime: '2026-06-06\n22:31:11',
          account: '73645',
          name: '管忠高',
          module: '-',
          type: '-',
          content: '-'
        },
        {
          id: 'op-5',
          index: 5,
          operateTime: '2025-12-31\n13:08:06',
          account: '21990',
          name: '13357198833',
          module: '电价配置',
          type: '删除电价',
          content: '删除电价: 固定电价\n周期 2020-01-01~2025-11-30\n电价: 1.2元'
        },
        {
          id: 'op-6',
          index: 6,
          operateTime: '2025-12-31\n13:07:57',
          account: '21990',
          name: '13357198833',
          module: '电价配置',
          type: '新增电价',
          content: '新增电价: 固定电价\n周期 2025-12-01~永久\n电价: 0.80元'
        }
      ]
    }
  },
  computed: {
    filteredOperationLogs() {
      return this.operationLogs.filter(item => {
        const selectedType = this.operationTypeOptions.find(option => option.value === this.selectedOperationType)
        const selectedModule = this.operationModuleOptions.find(option => option.value === this.selectedOperationModule)
        const matchedType = !selectedType || item.type === selectedType.label
        const matchedModule = !selectedModule || item.module === selectedModule.label
        const matchedDate = !this.operationLogDateRange.length || (
          item.operateTime.replace('\n', ' ') >= `${this.operationLogDateRange[0]} 00:00:00` &&
          item.operateTime.replace('\n', ' ') <= `${this.operationLogDateRange[1]} 23:59:59`
        )
        return matchedType && matchedModule && matchedDate
      })
    },
    operationLogPaginationText() {
      return `第1-${Math.min(this.pageSize, this.filteredOperationLogs.length)}条/总共${this.filteredOperationLogs.length}条`
    }
  },
  methods: {
    resetOperationLogFilters() {
      this.operationLogDateRange = []
      this.selectedOperationType = ''
      this.selectedOperationModule = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-log-page {
  min-height: calc(100vh - 125px);
  padding: 20px 16px 24px;
  background: #fff;
}

.operation-log-filters {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.operation-filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operation-filter-label {
  color: #1d2a44;
  font-size: 14px;
  white-space: nowrap;
}

.operation-date-picker {
  width: 340px;
}

.operation-select {
  width: 160px;
}

.operation-log-actions {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.action-btn {
  min-width: 62px;
  height: 32px;
  padding: 0 18px;
  border: 0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.action-btn.primary {
  background: #2d63ff;
  color: #fff;
}

.action-btn.light {
  background: #e8f1ff;
  color: #2d63ff;
}

.operation-log-table-shell {
  border: 1px solid #edf0f5;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.operation-log-table {
  width: 100%;
  border-collapse: collapse;
}

.operation-log-table th,
.operation-log-table td {
  padding: 12px 20px;
  text-align: left;
  border-bottom: 1px solid #edf0f5;
  color: #30415e;
  font-size: 14px;
  font-weight: 400;
  vertical-align: top;
  white-space: pre-line;
}

.operation-log-table th {
  background: #f8f9fb;
  color: #7b8ba8;
}

.operation-log-table td:nth-child(2) {
  width: 90px;
  line-height: 1.6;
}

.operation-log-table td:nth-child(7) {
  color: #2c4677;
  line-height: 1.6;
}

.operation-content-cell {
  min-width: 320px;
}

.operation-log-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  color: #1d2a44;
}

.operation-log-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #d5dceb;
  border-radius: 4px;
  background: #fff;
  color: #7082a3;
  cursor: pointer;
}

.page-btn.active {
  border-color: #2d63ff;
  color: #2d63ff;
}

.page-size-select {
  width: 98px;
}
</style>

<style lang="scss">
.operation-log-date-popper {
  .el-picker-panel__content {
    .el-date-table th {
      color: #7b8ba8;
      font-weight: 400;
    }
  }

  .el-date-range-picker__header {
    div {
      font-size: 28px;
      font-weight: 600;
      color: #1d2a44;
    }
  }
}
</style>
