<template>
  <div class="billing-page">
    <div class="page-head">
      <div>
        <h2 class="page-title">分户计费管理看板</h2>
        <p class="page-subtitle">聚合查看分户计费条件状态，支持按条件快速筛选外机设备。</p>
      </div>
      <div class="page-notice">
        {{ noticeText }}
      </div>
    </div>

    <div class="overview-grid">
      <section class="overview-card progress-card">
        <div class="card-title">开通分户计费统计</div>
        <div class="total-row">
          <strong>{{ openedOutdoorCount }}</strong>
          <span>台</span>
        </div>
        <el-progress :percentage="100" :show-text="false" color="#73e6c5" />
        <div class="condition-list">
          <div class="condition-item">
            <span class="dot success"></span>
            <span class="label">满足</span>
            <span class="count">{{ conditionStats.satisfied.count }}</span>
            <span class="ratio">{{ conditionStats.satisfied.ratio }}</span>
          </div>
          <div class="condition-item">
            <span class="dot warning"></span>
            <span class="label">不满足</span>
            <span class="count">{{ conditionStats.unsatisfied.count }}</span>
            <span class="ratio">{{ conditionStats.unsatisfied.ratio }}</span>
          </div>
        </div>
      </section>

      <section class="overview-card summary-card">
        <div class="card-title">设备统计</div>
        <div class="summary-list">
          <div v-for="item in summaryCards" :key="item.label" class="summary-item">
            <div class="summary-label">
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </section>

      <section class="overview-card chart-card">
        <div class="card-title">设备统计</div>
        <div ref="seriesChart" class="series-chart"></div>
      </section>
    </div>

    <section class="device-section">
      <div class="section-title-row">
        <h3>分户计费设备</h3>
      </div>

      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">分户计费条件</span>
          <el-select
            v-model="searchForm.condition"
            size="small"
            placeholder="请选择"
            clearable
            class="filter-select"
          >
            <el-option
              v-for="item in conditionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">外机系列</span>
          <el-select
            v-model="searchForm.series"
            size="small"
            placeholder="请选择"
            clearable
            class="filter-select"
          >
            <el-option
              v-for="item in seriesOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">外机SN</span>
          <el-input
            v-model.trim="searchForm.outdoorSn"
            size="small"
            placeholder="请输入"
            class="filter-input"
          />
        </div>

        <div class="filter-item">
          <span class="filter-label">外机名称</span>
          <el-input
            v-model.trim="searchForm.outdoorName"
            size="small"
            placeholder="请输入"
            class="filter-input"
          />
        </div>

        <div class="filter-actions">
          <el-button size="small" type="primary" @click="handleSearch">查询</el-button>
          <el-button size="small" @click="handleReset">重置</el-button>
        </div>
      </div>

      <el-table
        :data="filteredRows"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
        :header-cell-style="tableHeaderStyle"
      >
        <el-table-column prop="outdoorSn" label="外机SN" min-width="210" />
        <el-table-column prop="outdoorName" label="外机名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="outdoorSeries" label="外机系列" width="120" />
        <el-table-column prop="airType" label="出风类型" width="100" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="网关状态" width="110">
          <template slot-scope="{ row }">
            <span :class="['status-text', row.gatewayStatus === '在线' ? 'success' : 'danger']">
              {{ row.gatewayStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="分户计费条件" width="130">
          <template slot-scope="{ row }">
            <span :class="['condition-tag', row.billingCondition === '满足' ? 'success' : 'warning']">
              {{ row.billingCondition }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="管家状态" width="140">
          <template slot-scope="{ row }">
            <span class="manager-status">{{ row.managerStatus }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import * as echarts from 'echarts'

function cloneNode(node) {
  return {
    id: node.id,
    outdoorSn: node.outdoorSn,
    outdoorName: node.outdoorName,
    outdoorSeries: node.outdoorSeries,
    airType: node.airType,
    category: node.category,
    gatewayStatus: node.gatewayStatus,
    billingCondition: node.billingCondition,
    managerStatus: node.managerStatus,
    systemId: node.systemId,
    meterConnected: node.meterConnected,
    children: []
  }
}

export default {
  name: 'BillingManagement',
  data() {
    return {
      resizeHandler: null,
      chart: null,
      searchForm: {
        condition: '',
        series: '',
        outdoorSn: '',
        outdoorName: ''
      },
      appliedFilters: {
        condition: '',
        series: '',
        outdoorSn: '',
        outdoorName: ''
      },
      conditionOptions: [
        { value: '满足', label: '满足' },
        { value: '不满足', label: '不满足' }
      ],
      seriesOptions: [
        { value: 'V4/V4+', label: 'V4/V4+' },
        { value: 'V6/V7', label: 'V6/V7' },
        { value: 'V8', label: 'V8' },
        { value: 'V9', label: 'V9' }
      ],
      billingRows: [
        {
          id: 'billing-1',
          systemId: 'VRF-00625-01',
          outdoorSn: '0000CC31127000X681121...',
          outdoorName: 'ODU-00625-1-129',
          outdoorSeries: 'V6/V7',
          airType: '-',
          category: '主机',
          gatewayStatus: '离线',
          billingCondition: '不满足',
          managerStatus: '合约履行中',
          meterConnected: true,
          children: [
            {
              id: 'billing-1-1',
              systemId: 'VRF-00625-01',
              outdoorSn: '0000CC31127000X681124...',
              outdoorName: 'ODU-00625-1-130',
              outdoorSeries: 'V6/V7',
              airType: '-',
              category: '从机',
              gatewayStatus: '离线',
              billingCondition: '不满足',
              managerStatus: '合约履行中',
              meterConnected: false
            }
          ]
        },
        {
          id: 'billing-2',
          systemId: 'VRF-00627-02',
          outdoorSn: '0000CC31127000X681124...',
          outdoorName: 'ODU-00627-2-129',
          outdoorSeries: 'V6/V7',
          airType: '-',
          category: '主机',
          gatewayStatus: '离线',
          billingCondition: '不满足',
          managerStatus: '合约履行中',
          meterConnected: true,
          children: [
            {
              id: 'billing-2-1',
              systemId: 'VRF-00627-02',
              outdoorSn: '0000CC31127000X681126...',
              outdoorName: 'ODU-00627-2-130',
              outdoorSeries: 'V6/V7',
              airType: '-',
              category: '从机',
              gatewayStatus: '离线',
              billingCondition: '不满足',
              managerStatus: '合约履行中',
              meterConnected: false
            }
          ]
        }
      ],
      summaryCards: [
        { label: '系统总数', value: 2, icon: 'el-icon-s-platform' },
        { label: '外机总数', value: 4, icon: 'el-icon-s-order' },
        { label: '内机总数', value: 88, icon: 'el-icon-office-building' },
        { label: '电表总数', value: 2, icon: 'el-icon-lightning' }
      ]
    }
  },
  computed: {
    flattenedRows() {
      return this.flattenRows(this.billingRows)
    },
    openedOutdoorCount() {
      return this.flattenedRows.length
    },
    conditionStats() {
      var total = this.flattenedRows.length
      var satisfied = this.flattenedRows.filter(function(item) {
        return item.billingCondition === '满足'
      }).length
      var unsatisfied = total - satisfied

      return {
        satisfied: {
          count: satisfied,
          ratio: total === 0 ? '0.00%' : ((satisfied / total) * 100).toFixed(2) + '%'
        },
        unsatisfied: {
          count: unsatisfied,
          ratio: total === 0 ? '0.00%' : ((unsatisfied / total) * 100).toFixed(2) + '%'
        }
      }
    },
    noticeText() {
      return '检测到该项目有' + this.conditionStats.satisfied.count + '台外机满足分户计费，如需使用云计费能力，可联系经销商或美的售后（售后电话：4008899315）采购开通电量计费功能'
    },
    filteredRows() {
      var filters = this.appliedFilters

      return this.billingRows.reduce(function(list, row) {
        var parentMatched = this.matchRow(row, filters)
        var current = cloneNode(row)
        var children = (row.children || []).filter(function(child) {
          return this.matchRow(child, filters)
        }, this)

        current.children = children

        if (parentMatched || children.length) {
          if (!parentMatched && children.length) {
            current.outdoorSn = row.outdoorSn
            current.outdoorName = row.outdoorName
            current.outdoorSeries = row.outdoorSeries
            current.airType = row.airType
            current.category = row.category
            current.gatewayStatus = row.gatewayStatus
            current.billingCondition = row.billingCondition
            current.managerStatus = row.managerStatus
          }

          list.push(current)
        }

        return list
      }.bind(this), [])
    }
  },
  mounted() {
    this.initChart()
    this.resizeHandler = this.handleResize.bind(this)
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeHandler)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    tableHeaderStyle() {
      return {
        background: '#f7f9fc',
        color: '#51607a',
        fontWeight: '600'
      }
    },
    flattenRows(rows) {
      return rows.reduce(function(list, row) {
        list.push({
          id: row.id,
          outdoorSn: row.outdoorSn,
          outdoorName: row.outdoorName,
          outdoorSeries: row.outdoorSeries,
          airType: row.airType,
          category: row.category,
          gatewayStatus: row.gatewayStatus,
          billingCondition: row.billingCondition,
          managerStatus: row.managerStatus,
          systemId: row.systemId,
          meterConnected: row.meterConnected
        })

        ;(row.children || []).forEach(function(child) {
          list.push({
            id: child.id,
            outdoorSn: child.outdoorSn,
            outdoorName: child.outdoorName,
            outdoorSeries: child.outdoorSeries,
            airType: child.airType,
            category: child.category,
            gatewayStatus: child.gatewayStatus,
            billingCondition: child.billingCondition,
            managerStatus: child.managerStatus,
            systemId: child.systemId,
            meterConnected: child.meterConnected
          })
        })

        return list
      }, [])
    },
    matchRow(row, filters) {
      var condition = filters.condition
      var series = filters.series
      var outdoorSn = filters.outdoorSn
      var outdoorName = filters.outdoorName

      if (condition && row.billingCondition !== condition) {
        return false
      }

      if (series && row.outdoorSeries !== series) {
        return false
      }

      if (outdoorSn && row.outdoorSn.toLowerCase().indexOf(outdoorSn.toLowerCase()) === -1) {
        return false
      }

      if (outdoorName && row.outdoorName.toLowerCase().indexOf(outdoorName.toLowerCase()) === -1) {
        return false
      }

      return true
    },
    handleSearch() {
      this.appliedFilters = Object.assign({}, this.searchForm)
    },
    handleReset() {
      this.searchForm = {
        condition: '',
        series: '',
        outdoorSn: '',
        outdoorName: ''
      }
      this.appliedFilters = Object.assign({}, this.searchForm)
    },
    initChart() {
      if (!this.$refs.seriesChart) {
        return
      }

      this.chart = echarts.init(this.$refs.seriesChart)
      this.chart.setOption({
        color: ['#2f63ff', '#8fb6ff'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: 24,
          right: 16,
          bottom: 20,
          left: 40
        },
        legend: {
          top: 0,
          right: 0,
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: '#6c7a95'
          },
          data: ['外机数', '电表数']
        },
        xAxis: {
          type: 'category',
          data: ['V4/V4+', 'V6/V7', 'V8', 'V9'],
          axisLine: {
            lineStyle: {
              color: '#dce5f2'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#8d99b0'
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          splitLine: {
            lineStyle: {
              color: '#ebf1f8',
              type: 'dashed'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#8d99b0'
          }
        },
        series: [
          {
            name: '外机数',
            type: 'bar',
            barWidth: 18,
            data: [0, 4, 0, 0],
            itemStyle: {
              borderRadius: [4, 4, 0, 0]
            }
          },
          {
            name: '电表数',
            type: 'bar',
            barWidth: 18,
            data: [0, 2, 0, 0],
            itemStyle: {
              borderRadius: [4, 4, 0, 0]
            }
          }
        ]
      })
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.billing-page {
  min-height: calc(100vh - 84px);
  padding: 24px;
  background: linear-gradient(180deg, #f6f9ff 0%, #ffffff 180px);
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  color: #1a2740;
  font-size: 28px;
  line-height: 1.2;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #73819b;
  font-size: 14px;
}

.page-notice {
  max-width: 760px;
  color: #2f63ff;
  font-size: 13px;
  line-height: 1.7;
  text-align: right;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1.1fr 1.05fr 1.2fr;
  gap: 18px;
  margin-bottom: 24px;
}

.overview-card,
.device-section {
  border: 1px solid #e8eef8;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(31, 63, 118, 0.06);
}

.overview-card {
  padding: 22px 24px;
}

.card-title {
  margin-bottom: 18px;
  color: #1a2740;
  font-size: 18px;
  font-weight: 600;
}

.total-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
  color: #26344f;
}

.total-row strong {
  font-size: 44px;
  line-height: 1;
}

.total-row span {
  margin-left: 4px;
  font-size: 18px;
}

.condition-list {
  margin-top: 22px;
}

.condition-item {
  display: grid;
  grid-template-columns: 16px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #50617d;
  font-size: 14px;
}

.condition-item .count,
.condition-item .ratio {
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.success {
  background: #2f63ff;
}

.dot.warning {
  background: #73e6c5;
}

.summary-list {
  display: grid;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f5f8fd;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4a5b77;
}

.summary-label i {
  color: #2f63ff;
  font-size: 18px;
}

.summary-item strong {
  color: #24324d;
  font-size: 24px;
}

.series-chart {
  width: 100%;
  height: 260px;
}

.device-section {
  padding: 22px 24px 26px;
}

.section-title-row {
  margin-bottom: 18px;
}

.section-title-row h3 {
  margin: 0;
  color: #1a2740;
  font-size: 20px;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: 14px;
  align-items: end;
  margin-bottom: 18px;
}

.filter-item {
  display: grid;
  gap: 8px;
}

.filter-label {
  color: #62728f;
  font-size: 13px;
}

.filter-select,
.filter-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.status-text.danger {
  color: #ff5d4d;
}

.status-text.success {
  color: #1fbb75;
}

.condition-tag {
  font-weight: 600;
}

.condition-tag.success {
  color: #1fbb75;
}

.condition-tag.warning {
  color: #ff8a34;
}

.manager-status {
  color: #2f63ff;
}

.billing-page ::v-deep .el-progress-bar__outer {
  background: #edf4f7;
}

.billing-page ::v-deep .el-progress-bar__inner {
  box-shadow: 0 8px 18px rgba(115, 230, 197, 0.32);
}

.billing-page ::v-deep .el-table {
  border-radius: 12px;
  overflow: hidden;
}

.billing-page ::v-deep .el-table th,
.billing-page ::v-deep .el-table td {
  padding: 12px 0;
}

.billing-page ::v-deep .el-table .cell {
  padding-left: 14px;
  padding-right: 14px;
}

@media (max-width: 1360px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .page-head {
    flex-direction: column;
  }

  .page-notice {
    max-width: none;
    text-align: left;
  }
}

@media (max-width: 960px) {
  .billing-page {
    padding: 16px;
  }

  .filter-bar {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: flex-start;
  }
}
</style>
