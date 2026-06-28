<template>
  <div class="dashboard-container">
    <div class="top-header">
      <div class="machine-tabs">
        <button
          v-for="tab in machineTabs"
          :key="tab.key"
          type="button"
          :class="['machine-tab', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="header-panel">
        <div class="weather-line">
          <span class="weather-temp">29°C</span>
          <span>多云</span>
          <span>东北偏东 3级</span>
          <span>湿度: 69%</span>
          <span>23.8~32.4°C</span>
          <span>2026-06-17 19:31:22</span>
        </div>
        <div class="energy-summary">
          <div class="energy-item">
            <span class="label">今日</span>
            <span class="value">-</span>
          </div>
          <div class="energy-item">
            <span class="label">本月</span>
            <span class="value">145 <em>kWh</em></span>
            <span class="trend up">同比 96.37%</span>
          </div>
          <div class="energy-item">
            <span class="label">今年</span>
            <span class="value">12044 <em>kWh</em></span>
            <span class="trend down">同比 36.48%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <section class="panel status-panel">
        <header class="section-header">
          <div class="header-left">
            <span class="title">设备实时状态</span>
            <span class="info-icon">i</span>
            <span class="meta-text">设备总数(台) <strong>{{ currentData.deviceStatus.total }}</strong></span>
            <span class="meta-text">试用/合约中设备数(台) <strong>{{ currentData.deviceStatus.contractCount }}</strong></span>
          </div>
        </header>

        <div class="status-body">
          <div class="status-overview">
            <div class="status-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#d8deec" stroke-width="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#b8c3d9"
                  stroke-width="10"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="ringOffset"
                  stroke-linecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div class="ring-center">
                <span class="ring-label">{{ currentData.summaryLabel }}</span>
                <strong>{{ currentData.deviceStatus.total }}</strong>
              </div>
            </div>

            <div class="status-list">
              <div v-for="item in currentData.statusItems" :key="item.label" class="status-list-item">
                <span class="dot" :style="{ backgroundColor: item.color }"></span>
                <span class="label">{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </div>

          <div class="mode-board">
            <div class="mode-title">{{ currentData.modeTitle }}</div>
            <div class="mode-grid">
              <div v-for="mode in currentData.modeData" :key="mode.name" class="mode-item">
                <span class="mode-value">{{ mode.value }}</span>
                <span class="mode-bar" :style="{ backgroundColor: mode.color }"></span>
                <span class="mode-label">{{ mode.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lock-section">
          <div class="sub-title">{{ currentData.lockTitle }}</div>
          <div class="lock-grid">
            <div v-for="item in currentData.lockStats" :key="item.label" class="lock-item">
              <span class="lock-icon" v-html="item.icon"></span>
              <span class="lock-label">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="panel chart-panel">
        <header class="section-header chart-header">
          <div class="header-left">
            <span class="title">近12个月能耗统计</span>
            <span class="subtle">统计时间 2025.07-2026.06</span>
          </div>
          <span class="link-text">查看详情</span>
        </header>

        <div class="chart-legend">
          <span class="legend-item"><i class="square blue"></i>电网电</span>
          <span class="legend-item"><i class="square teal"></i>光伏电</span>
          <span class="legend-item"><i class="line green"></i>节能潜力占比</span>
        </div>
        <div ref="energyChart" class="chart-container"></div>
      </section>

      <section class="panel strategy-panel">
        <header class="section-header">
          <div class="header-left">
            <span class="title">智慧控制策略</span>
            <span class="info-icon">i</span>
          </div>
          <div class="strategy-switch">
            <button
              type="button"
              :class="['switch-btn', { active: strategyTab === 'schedule' }]"
              @click="strategyTab = 'schedule'"
            >
              智能日程
            </button>
            <button
              type="button"
              :class="['switch-btn', { active: strategyTab === 'temperature' }]"
              @click="strategyTab = 'temperature'"
            >
              温度锁定
            </button>
          </div>
        </header>

        <div v-if="strategyTab === 'schedule'" class="strategy-content">
          <div class="strategy-stats">
            <div class="stat-box">
              <span class="label">有效日程数</span>
              <div class="value-row">
                <strong>0</strong>
                <span class="arrow">›</span>
              </div>
            </div>
            <div class="stat-box">
              <span class="label">日程设备数</span>
              <div class="value-row">
                <strong>0</strong>
              </div>
            </div>
          </div>

          <div class="schedule-list">
            <div v-for="(item, index) in strategyList" :key="index" class="schedule-item">
              <div class="schedule-main">
                <span class="schedule-dot"></span>
                <span>{{ item.type }}</span>
                <span>{{ item.count }}</span>
              </div>
              <span class="schedule-time">{{ item.time }}</span>
            </div>
          </div>
        </div>

        <div v-else class="temperature-content">
          <div class="temperature-summary">
            <div class="temperature-box">
              <span>制冷温度下限</span>
              <strong>0</strong>
              <span class="arrow">›</span>
            </div>
            <div class="temperature-box">
              <span>制热温度上限</span>
              <strong>0</strong>
              <span class="arrow">›</span>
            </div>
          </div>
          <div class="temperature-empty">暂无日程</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

const indoorLockIcon = {
  powerOn: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v8"></path><path d="M6.2 4.9a8 8 0 1 0 11.6 0"></path></svg>',
  powerOff: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v8"/><path d="M8 5.5A8 8 0 1 0 16 5.5"/></svg>',
  snow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M4.9 6l14.2 12M19.1 6L4.9 18"/><path d="M4 12h16"/></svg>',
  heat: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3c2.2 2 4 4.5 4 7a4 4 0 1 1-8 0c0-2.2 1.2-4.4 4-7z"/><path d="M12 14c1.8 1.2 3 2.9 3 4.5a3 3 0 0 1-6 0c0-1.5.9-3 3-4.5z"/></svg>',
  fan: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="1.6"/><path d="M12 4c1.7 0 2.8 1.4 2.4 3-.4 1.5-2.1 3.9-2.1 3.9S9.6 8.8 9.2 7.1C8.8 5.4 10 4 12 4zM20 12c0 1.7-1.4 2.8-3 2.4-1.5-.4-3.9-2.1-3.9-2.1s2.1-2.7 3.8-3.1c1.7-.4 3.1.8 3.1 2.8zM12 20c-1.7 0-2.8-1.4-2.4-3 .4-1.5 2.1-3.9 2.1-3.9s2.7 2.1 3.1 3.8c.4 1.7-.8 3.1-2.8 3.1z"/></svg>',
  remote: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="2.5" width="10" height="19" rx="3"/><circle cx="12" cy="7" r="1"/><path d="M10 11h4M10 15h4"/></svg>',
  wired: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 9h8M8 13h5"/><path d="M12 17v3"/></svg>'
}

export default {
  name: 'Dashboard',
  data() {
    return {
      activeTab: 'indoor',
      strategyTab: 'schedule',
      circumference: 2 * Math.PI * 40,
      resizeHandler: null,
      machineTabs: [
        { key: 'indoor', label: '室内机' },
        { key: 'outdoor', label: '室外机' }
      ],
      indoorData: {
        summaryLabel: '内机总数(台)',
        modeTitle: '实时运行模式',
        lockTitle: '室内机锁定状态统计',
        deviceStatus: {
          total: 22,
          contractCount: 22,
          offline: 22
        },
        statusItems: [
          { label: '运行', value: 0, color: '#2f63ff' },
          { label: '关机', value: 0, color: '#6ea2ff' },
          { label: '故障', value: 0, color: '#ff3b3b' },
          { label: '离线', value: 22, color: '#bcc6d8' }
        ],
        modeData: [
          { name: '送风', value: 0, color: '#1bc760' },
          { name: '制冷', value: 0, color: '#2f63ff' },
          { name: '制热', value: 0, color: '#ff8c25' },
          { name: '除湿', value: 0, color: '#18a7df' },
          { name: '自动', value: 0, color: '#6d63f6' }
        ],
        lockStats: [
          { label: '只响应开机', value: 0, icon: indoorLockIcon.powerOn },
          { label: '制冷锁定', value: 22, icon: indoorLockIcon.snow },
          { label: '风档锁定', value: 0, icon: indoorLockIcon.fan },
          { label: '禁用遥控器', value: 22, icon: indoorLockIcon.remote },
          { label: '只响应关机', value: 22, icon: indoorLockIcon.powerOff },
          { label: '制热锁定', value: 0, icon: indoorLockIcon.heat },
          { label: '送风锁定', value: 0, icon: indoorLockIcon.fan },
          { label: '禁用线控器', value: 0, icon: indoorLockIcon.wired }
        ]
      },
      outdoorData: {
        summaryLabel: '外机总数(台)',
        modeTitle: '模式优先设置',
        lockTitle: '室外机锁定状态统计',
        deviceStatus: {
          total: 4,
          contractCount: 4,
          offline: 4
        },
        statusItems: [
          { label: '运行', value: 0, color: '#2f63ff' },
          { label: '关机', value: 0, color: '#6ea2ff' },
          { label: '故障', value: 0, color: '#ff3b3b' },
          { label: '离线', value: 4, color: '#bcc6d8' }
        ],
        modeData: [
          { name: '自动优先', value: 4, color: '#7b6cff' },
          { name: '制冷优先', value: 0, color: '#2f63ff' },
          { name: '只制热', value: 0, color: '#ff8c25' },
          { name: '只制冷', value: 0, color: '#2f63ff' },
          { name: '制热优先', value: 0, color: '#ff8c25' }
        ],
        lockStats: [
          { label: '压缩机锁定', value: 4, icon: indoorLockIcon.powerOn },
          { label: '风扇锁定', value: 4, icon: indoorLockIcon.fan },
          { label: '四通阀锁定', value: 0, icon: indoorLockIcon.wired },
          { label: '电子膨胀阀锁定', value: 0, icon: indoorLockIcon.remote },
          { label: '高压保护', value: 0, icon: indoorLockIcon.heat },
          { label: '低压保护', value: 0, icon: indoorLockIcon.powerOff },
          { label: '过载保护', value: 0, icon: indoorLockIcon.wired },
          { label: '温度保护', value: 4, icon: indoorLockIcon.snow }
        ]
      },
      strategyList: [
        { time: '2026-05-30 23:30:07', type: '每日关机2', count: '(1)' },
        { time: '2026-05-29 23:30:07', type: '每日关机2', count: '(1)' },
        { time: '2026-05-28 23:30:07', type: '每日关机2', count: '(1)' },
        { time: '2026-05-27 23:30:09', type: '每日关机2', count: '(1)' },
        { time: '2026-05-26 23:30:07', type: '每日关机2', count: '(1)' },
        { time: '2026-05-25 23:30:08', type: '每日关机2', count: '(1)' }
      ],
      energyChart: null
    }
  },
  computed: {
    currentData() {
      return this.activeTab === 'indoor' ? this.indoorData : this.outdoorData
    },
    ringOffset() {
      const total = this.currentData.deviceStatus.total || 1
      const offline = this.currentData.deviceStatus.offline || 0
      return this.circumference - (this.circumference * offline) / total
    }
  },
  mounted() {
    this.initEnergyChart()
  },
  beforeDestroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
    if (this.energyChart) {
      this.energyChart.dispose()
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
    },
    initEnergyChart() {
      this.energyChart = echarts.init(this.$refs.energyChart)
      this.energyChart.setOption({
        grid: {
          left: '5%',
          right: '4%',
          top: 30,
          bottom: 24,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['25/07', '25/08', '25/09', '25/10', '25/11', '25/12', '26/01', '26/02', '26/03', '26/04', '26/05', '26/06'],
          axisTick: { show: false },
          axisLine: {
            lineStyle: { color: '#d8dfeb' }
          },
          axisLabel: { color: '#8b97ab', fontSize: 11 }
        },
        yAxis: [
          {
            type: 'value',
            name: 'kWh',
            nameTextStyle: { color: '#9aa8be', padding: [0, 26, 0, 0] },
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: {
              lineStyle: {
                color: '#d6deea',
                type: 'dashed'
              }
            },
            axisLabel: { color: '#9aa8be', fontSize: 11 }
          },
          {
            type: 'value',
            max: 100,
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel: { color: '#9aa8be', fontSize: 11, formatter: '{value}' }
          }
        ],
        series: [
          {
            name: '电网电',
            type: 'bar',
            data: [7300, 14828, 12680, 6900, 3000, 2500, 3400, 1400, 1300, 4800, 700, 120],
            barWidth: 12,
            itemStyle: {
              color: '#2f63ff'
            }
          },
          {
            name: '节能潜力占比',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'none',
            data: [12, 12, 10, 24, 38, 14, 8, 6, 4, 1, 14, null],
            lineStyle: {
              color: '#2fc35b',
              width: 2
            }
          }
        ]
      })

      this.resizeHandler = () => {
        if (this.energyChart) {
          this.energyChart.resize()
        }
      }
      window.addEventListener('resize', this.resizeHandler)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 8px;
  background: #dfeeff;
}

.top-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.machine-tabs,
.header-panel,
.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #cfe0f5;
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.machine-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 0;
  overflow: hidden;
}

.machine-tab {
  height: 42px;
  border: 0;
  background: #c1ddff;
  color: #1b2a43;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 0 0 14px 14px;
  

  &.active {
    background: transparent;
  }
}

.header-panel {
  padding: 10px 16px;
}

.weather-line {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #27415f;
  font-size: 13px;
  white-space: nowrap;
}

.weather-temp {
  font-size: 28px;
  font-weight: 700;
  color: #13263f;
}

.energy-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-top: 12px;
}

.energy-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .label {
    color: #1f2f4b;
    font-size: 15px;
  }

  .value {
    color: #07162b;
    font-size: 34px;
    font-weight: 700;
  }

  em {
    font-style: normal;
    font-size: 14px;
    font-weight: 500;
    color: #71809a;
  }
}

.trend {
  font-size: 13px;
  font-weight: 600;

  &.up {
    color: #35bf5a;
  }

  &.down {
    color: #ff5a5a;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.panel {
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.title {
  color: #03152d;
  font-size: 16px;
  font-weight: 700;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid #8ea5c5;
  border-radius: 50%;
  color: #6d83a6;
  font-size: 12px;
  line-height: 1;
}

.meta-text,
.subtle {
  color: #6982a6;
  font-size: 14px;
}

.meta-text strong {
  margin-left: 6px;
  color: #03152d;
  font-size: 18px;
}

.status-panel {
  min-height: 520px;
}

.status-body {
  display: grid;
  grid-template-columns: 0.98fr 1.02fr;
  gap: 18px;
  margin-top: 18px;
}

.status-overview {
  display: flex;
  align-items: center;
  gap: 28px;
  padding-right: 18px;
  border-right: 1px solid #dbe4f0;
}

.status-ring {
  position: relative;
  width: 140px;
  height: 140px;
  flex: none;

  svg {
    width: 100%;
    height: 100%;
  }
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #12233d;
  text-align: center;

  .ring-label {
    font-size: 12px;
  }

  strong {
    margin-top: 6px;
    font-size: 44px;
    line-height: 1;
  }
}

.status-list {
  display: grid;
  gap: 14px;
  min-width: 110px;
}

.status-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #31507b;
  font-size: 14px;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  strong {
    margin-left: 2px;
    color: #102543;
    font-size: 16px;
  }
}

.mode-board {
  min-height: 250px;
  padding-left: 6px;
}

.mode-title,
.sub-title {
  color: #102543;
  font-size: 16px;
  font-weight: 700;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  align-items: end;
  min-height: 200px;
  padding-top: 28px;
}

.mode-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 170px;
}

.mode-item::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  bottom: 30px;
  border-top: 1px dashed #dce5f1;
  border-bottom: 1px dashed #dce5f1;
}

.mode-value {
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
  color: #2a4772;
  font-size: 22px;
  line-height: 1;
}

.mode-bar {
  position: relative;
  z-index: 1;
  width: 26px;
  height: 6px;
  border-radius: 999px;
}

.mode-label {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  color: #27415f;
  font-size: 14px;
}

.lock-section {
  margin-top: 18px;
}

.lock-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 18px;
  margin-top: 14px;
}

.lock-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2d4a76;
  min-width: 0;

  strong {
    margin-left: auto;
    color: #102543;
    font-size: 16px;
  }
}

.lock-icon {
  display: inline-flex;
  color: #386cff;
}

.lock-label {
  font-size: 14px;
  white-space: nowrap;
}

.chart-panel {
  min-height: 520px;
}

.chart-header {
  margin-bottom: 6px;
}

.link-text {
  color: #215ef5;
  font-size: 14px;
  cursor: pointer;
}

.chart-legend {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  color: #7c8ea8;
  font-size: 12px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.square,
.line {
  display: inline-block;
}

.square {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.square.blue {
  background: #2f63ff;
}

.square.teal {
  background: #53d4bd;
}

.line {
  width: 12px;
  height: 2px;
  border-radius: 999px;
}

.line.green {
  background: #2fc35b;
}

.chart-container {
  height: 360px;
  margin-top: 8px;
}

.strategy-panel {
  min-height: 360px;
}

.strategy-switch {
  display: inline-flex;
  gap: 8px;
}

.switch-btn {
  min-width: 92px;
  height: 30px;
  border: 0;
  border-radius: 4px;
  background: #f1f1f1;
  color: #5d6c84;
  font-size: 14px;
  cursor: pointer;

  &.active {
    background: #2f63ff;
    color: #fff;
  }
}

.strategy-content,
.temperature-content {
  margin-top: 14px;
}

.strategy-stats,
.temperature-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.stat-box,
.temperature-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #eef3fb;
  border-radius: 4px;
  color: #223858;
}

.stat-box .label,
.temperature-box span {
  font-size: 14px;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 8px;

  strong {
    font-size: 18px;
    color: #07162b;
  }
}

.arrow {
  color: #253d63;
  font-size: 18px;
}

.schedule-list {
  margin-top: 10px;
}

.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px;
  color: #243a5b;
}

.schedule-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3bcb60;
}

.schedule-time {
  color: #7d8da8;
}

.temperature-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 170px;
  color: #94a3bb;
  font-size: 28px;
}

@media (max-width: 1400px) {
  .dashboard-grid,
  .top-header,
  .status-body {
    grid-template-columns: 1fr;
  }

  .status-overview {
    border-right: 0;
    border-bottom: 1px solid #dbe4f0;
    padding-right: 0;
    padding-bottom: 18px;
  }

  .lock-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 8px;
  }

  .energy-summary,
  .strategy-stats,
  .temperature-summary,
  .lock-grid {
    grid-template-columns: 1fr;
  }

  .weather-line {
    flex-wrap: wrap;
    white-space: normal;
  }

  .mode-grid {
    gap: 10px;
  }

  .machine-tab {
    font-size: 14px;
  }
}
</style>
