<template>
  <div class="energy-page">
    <div class="primary-tabs">
      <button
        v-for="tab in primaryTabs"
        :key="tab.key"
        type="button"
        :class="['primary-tab', { active: activePrimaryTab === tab.key }]"
        @click="handlePrimaryTabClick(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <template v-if="activePrimaryTab === 'energy-analysis'">
      <div class="secondary-tabs">
        <button
          v-for="tab in secondaryTabs"
          :key="tab.key"
          type="button"
          :class="['secondary-tab', { active: activeMonitorTab === tab.key }]"
          @click="handleMonitorTabClick(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <template v-if="activeMonitorTab === 'energy-monitor'">
        <div class="monitor-card-grid">
          <div v-for="item in monitorCards" :key="item.label" class="monitor-card">
            <div class="monitor-icon">
              <i :class="item.icon"></i>
            </div>
            <div class="monitor-label">{{ item.label }}</div>
            <div class="monitor-value">{{ item.value }}</div>
          </div>
        </div>

        <div class="warning-banner">
          <i class="el-icon-warning-outline"></i>
          <span>
            异常提示：识别到部分外机未安装电表，如需获取准确的电量计量数据，请联系经销商或美的售后400-889-9315安装电表。
          </span>
        </div>

        <div class="view-tabs">
          <button
            v-for="tab in summaryTabs"
            :key="tab.key"
            type="button"
            :class="['view-tab', { active: summaryView === tab.key }]"
            @click="summaryView = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <template v-if="summaryView === 'energy-stats'">
          <div class="tariff-row">
            <div class="tariff-text">
              周期电价： {{ selectedYear }}-12-01~永久
              <strong>0.8元/kWh</strong>
            </div>
            <button type="button" class="plain-link" @click="showInfoMessage('周期电价详情')">
              查看更多
              <i class="el-icon-edit-outline"></i>
            </button>
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-icon blue">
                <i class="el-icon-lightning"></i>
              </div>
              <div class="summary-content">
                <div class="summary-label">总能耗（kWh）</div>
                <div class="summary-value-row">
                  <strong>{{ displaySummary.totalEnergy }}</strong>
                  <span class="summary-trend">
                    同比
                    <i class="el-icon-top"></i>
                    {{ displaySummary.yoy }}%
                  </span>
                </div>
              </div>
            </div>

            <div class="summary-card compact">
              <div class="summary-icon orange">
                <i class="el-icon-money"></i>
              </div>
              <div class="summary-content">
                <div class="summary-label">市电电费（元）</div>
                <div class="summary-value-row">
                  <strong class="orange-text">{{ displaySummary.energyCost }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="control-bar">
            <div class="control-group">
              <span class="control-label">所属系统</span>
              <el-select
                v-model="selectedSystem"
                size="small"
                class="system-select"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in systemOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>

            <div class="switch-group">
              <span class="control-label">显示节能潜力占比</span>
              <el-switch v-model="showPotentialLine"></el-switch>
            </div>

            <div class="switch-group">
              <span class="control-label">显示天气</span>
              <el-switch v-model="showWeather"></el-switch>
            </div>

            <div class="switch-group">
              <span class="control-label">显示日历</span>
              <el-switch v-model="showCalendar"></el-switch>
            </div>

            <div class="spacer"></div>

            <div class="period-toggle">
              <button
                v-for="mode in periodModes"
                :key="mode.key"
                type="button"
                :class="['period-btn', { active: periodMode === mode.key }]"
                @click="periodMode = mode.key"
              >
                {{ mode.label }}
              </button>
            </div>

            <el-date-picker
              v-model="selectedYear"
              type="year"
              format="yyyy"
              value-format="yyyy"
              size="small"
              class="year-picker"
              placeholder="选择年份"
            />
          </div>

          <div class="overview-layout">
            <div class="overview-chart-card">
              <div ref="overviewChart" class="overview-chart"></div>
            </div>

            <div v-if="showCalendar" class="calendar-heatmap-card">
              <div class="heatmap-title">热力区逐年 / kWh</div>
              <div class="heatmap-head">
                <span>0</span>
                <div class="heatmap-bar"></div>
                <span>{{ maxHeatmapValue }}</span>
              </div>
              <div class="heatmap-grid">
                <div
                  v-for="item in displayHeatmap"
                  :key="item.month"
                  :class="['heatmap-item', item.tone]"
                >
                  <div class="heatmap-month">{{ item.month }}</div>
                  <div class="heatmap-value">{{ item.value }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="insight-grid">
            <div class="insight-card">
              <div class="insight-title">节能潜力</div>
              <div class="potential-layout">
                <div ref="potentialChart" class="potential-chart"></div>
                <div class="potential-list">
                  <div v-for="item in displayPotentialItems" :key="item.key" class="potential-item">
                    <div class="potential-item-head">
                      <span :class="['bullet', item.color]"></span>
                      <span class="potential-name">{{ item.label }}</span>
                    </div>
                    <div class="potential-metric">
                      <strong>{{ item.value }}</strong>
                      <span class="unit">kWh</span>
                      <span class="rate">占比 {{ item.percent }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="insight-card">
              <div class="insight-title">节能策略</div>
              <div class="strategy-grid">
                <div
                  v-for="item in strategyItems"
                  :key="item.title"
                  :class="['strategy-card', item.theme]"
                >
                  <div class="strategy-icon">
                    <i :class="item.icon"></i>
                  </div>
                  <div class="strategy-main">
                    <div class="strategy-title">{{ item.title }}</div>
                    <button type="button" class="strategy-link" @click="showInfoMessage(item.title)">
                      查看
                      <i class="el-icon-arrow-right"></i>
                    </button>
                  </div>
                  <button type="button" class="strategy-action" @click="showInfoMessage(item.action)">
                    {{ item.action }}
                    <i class="el-icon-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="system-rank-layout">
            <div class="system-rank-chart-card">
              <div class="section-card-title">系统能耗排名</div>
              <div ref="systemRankChart" class="system-rank-chart"></div>
            </div>

            <div class="system-rank-list-card">
              <div class="section-card-title">系统能耗概览</div>
              <div class="system-rank-list">
                <div v-for="(item, index) in systemRankings" :key="item.name" class="system-rank-item">
                  <div class="system-rank-no">{{ index + 1 }}</div>
                  <div class="system-rank-main">
                    <div class="system-rank-name">{{ item.name }}</div>
                    <div class="system-rank-sub">
                      电费 {{ item.cost }} 元
                      <span class="divider">|</span>
                      外机 {{ item.outdoorCount }} 台
                      <span class="divider">|</span>
                      内机 {{ item.indoorCount }} 台
                    </div>
                  </div>
                  <div class="system-rank-value">{{ item.energy }} kWh</div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="detail-anchor-tabs">
          <button
            v-for="tab in detailTabs"
            :key="tab.key"
            type="button"
            :class="['detail-anchor-btn', { active: activeDetailTab === tab.key }]"
            @click="scrollToDetail(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <section ref="forgotSection" class="detail-section">
          <div class="detail-chart-panel">
            <div class="detail-title">忘关机能耗</div>
            <div ref="forgotChart" class="detail-chart"></div>
          </div>
          <div class="detail-rank-panel">
            <div class="rank-panel-head">
              <div class="rank-title">忘关机能耗排名（kWh）</div>
              <button type="button" class="export-link" @click="handleExport('忘关机能耗')">
                <i class="el-icon-download"></i>
                导出数据
              </button>
            </div>
            <div class="top-three-grid">
              <div
                v-for="item in detailRankings.forgot.topThree"
                :key="item.rank"
                :class="['top-three-card', `rank-${item.rank}`]"
              >
                <div class="top-three-badge">{{ item.rank }}</div>
                <div class="top-three-name">{{ item.name }}</div>
                <div class="top-three-value">{{ item.value }}</div>
              </div>
            </div>
            <div class="rank-list">
              <div v-for="item in detailRankings.forgot.others" :key="item.rank" class="rank-list-item">
                <div class="rank-no">{{ item.rank }}</div>
                <div class="rank-item-main">
                  <div class="rank-item-name">{{ item.name }}</div>
                  <div class="rank-progress">
                    <span class="rank-progress-bar" :style="{ width: `${item.ratio}%` }"></span>
                  </div>
                </div>
                <div class="rank-item-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </section>

        <section ref="temperatureSection" class="detail-section">
          <div class="detail-chart-panel">
            <div class="detail-title">温度设定过高过低能耗</div>
            <div ref="temperatureChart" class="detail-chart"></div>
          </div>
          <div class="detail-rank-panel">
            <div class="rank-panel-head">
              <div class="rank-title">温度设定过高过低能耗排名（kWh）</div>
              <button type="button" class="export-link" @click="handleExport('温度设定过高过低能耗')">
                <i class="el-icon-download"></i>
                导出数据
              </button>
            </div>
            <div class="top-three-grid">
              <div
                v-for="item in detailRankings.temperature.topThree"
                :key="item.rank"
                :class="['top-three-card', `rank-${item.rank}`]"
              >
                <div class="top-three-badge">{{ item.rank }}</div>
                <div class="top-three-name">{{ item.name }}</div>
                <div class="top-three-value">{{ item.value }}</div>
              </div>
            </div>
            <div class="rank-list">
              <div v-for="item in detailRankings.temperature.others" :key="item.rank" class="rank-list-item">
                <div class="rank-no">{{ item.rank }}</div>
                <div class="rank-item-main">
                  <div class="rank-item-name">{{ item.name }}</div>
                  <div class="rank-progress">
                    <span class="rank-progress-bar" :style="{ width: `${item.ratio}%` }"></span>
                  </div>
                </div>
                <div class="rank-item-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </section>

        <section ref="loadSection" class="detail-section last">
          <div class="detail-chart-panel">
            <div class="detail-title">建筑负荷异常能耗</div>
            <div ref="loadChart" class="detail-chart"></div>
          </div>
          <div class="detail-rank-panel">
            <div class="rank-panel-head">
              <div class="rank-title">建筑负荷异常能耗排名（kWh）</div>
              <button type="button" class="export-link" @click="handleExport('建筑负荷异常能耗')">
                <i class="el-icon-download"></i>
                导出数据
              </button>
            </div>
            <div class="empty-rank-state">
              <div class="empty-rank-icon">
                <i class="el-icon-data-analysis"></i>
              </div>
              <div class="empty-rank-text">暂无异常负荷数据</div>
            </div>
          </div>
        </section>
      </template>

      <div v-else class="placeholder-panel">
        <div class="placeholder-title">运行监控</div>
        <div class="placeholder-text">运行监控视图预留中，当前先完成能耗监控页面。</div>
      </div>
    </template>

    <div v-else class="placeholder-panel large">
      <div class="placeholder-title">{{ activePrimaryTabLabel }}</div>
      <div class="placeholder-text">该页签的正式内容暂未接入，当前能耗分析页已按设计稿完成。</div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

function buildYearData() {
  return {
    labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    current: [3384, 1454, 1268, 5051, 739, 144, 0, 0, 0, 0, 0, 0],
    previous: [3205, 1308, 1186, 4788, 668, 120, 0, 0, 0, 0, 0, 0],
    potential: [8, 6, 4, 2, 18, 0, 0, 0, 0, 0, 0, 0],
    tempCurrent: [7, 10, 13, 18, 24, 28, 31, 31, 27, 21, 15, 9],
    tempPrevious: [8, 9, 12, 17, 23, 27, 30, 30, 26, 20, 14, 10]
  }
}

function buildMonthData() {
  var labels = []
  var current = []
  var previous = []
  var potential = []
  var tempCurrent = []
  var tempPrevious = []
  var currentSeed = [162, 148, 155, 166, 178, 184, 176, 169, 152, 143, 136, 128, 120, 132, 141, 149, 161, 168, 176, 181, 192, 198, 202, 210, 218, 224, 206, 188, 174, 160]
  var previousSeed = [151, 139, 144, 152, 168, 172, 164, 157, 145, 136, 128, 119, 114, 122, 130, 138, 148, 154, 161, 165, 174, 181, 186, 192, 198, 205, 190, 176, 162, 149]
  var potentialSeed = [11, 9, 8, 8, 9, 10, 12, 11, 10, 9, 8, 8, 7, 9, 11, 10, 12, 14, 13, 15, 16, 18, 17, 16, 14, 13, 12, 11, 10, 9]
  var tempCurrentSeed = [19, 20, 21, 22, 24, 24, 25, 26, 27, 28, 29, 29, 30, 31, 31, 30, 29, 28, 27, 27, 26, 25, 24, 24, 23, 22, 21, 21, 20, 20]
  var tempPreviousSeed = [18, 19, 20, 21, 22, 22, 23, 24, 25, 26, 27, 27, 28, 29, 29, 28, 27, 26, 25, 25, 24, 23, 22, 22, 21, 20, 20, 19, 19, 18]

  for (var i = 0; i < 30; i += 1) {
    labels.push(String(i + 1).padStart(2, '0'))
    current.push(currentSeed[i])
    previous.push(previousSeed[i])
    potential.push(potentialSeed[i])
    tempCurrent.push(tempCurrentSeed[i])
    tempPrevious.push(tempPreviousSeed[i])
  }

  return {
    labels: labels,
    current: current,
    previous: previous,
    potential: potential,
    tempCurrent: tempCurrent,
    tempPrevious: tempPrevious
  }
}

function buildDayData() {
  var labels = []
  var current = []
  var previous = []
  var potential = []
  var tempCurrent = []
  var tempPrevious = []
  var currentSeed = [42, 38, 35, 30, 28, 26, 34, 48, 66, 72, 81, 86, 92, 96, 102, 109, 113, 106, 94, 82, 74, 68, 59, 48]
  var previousSeed = [39, 36, 31, 28, 26, 24, 31, 44, 59, 66, 74, 80, 86, 91, 97, 104, 108, 101, 90, 78, 71, 64, 54, 45]
  var potentialSeed = [4, 4, 3, 3, 2, 2, 4, 5, 7, 9, 10, 10, 11, 12, 12, 13, 13, 12, 10, 8, 6, 5, 5, 4]
  var tempCurrentSeed = [24, 23, 23, 22, 22, 21, 21, 23, 25, 27, 29, 30, 31, 32, 32, 31, 30, 29, 28, 27, 26, 25, 24, 24]
  var tempPreviousSeed = [23, 22, 22, 21, 21, 20, 20, 22, 24, 26, 28, 29, 30, 31, 31, 30, 29, 28, 27, 26, 25, 24, 23, 23]

  for (var i = 0; i < 24; i += 1) {
    labels.push(String(i).padStart(2, '0'))
    current.push(currentSeed[i])
    previous.push(previousSeed[i])
    potential.push(potentialSeed[i])
    tempCurrent.push(tempCurrentSeed[i])
    tempPrevious.push(tempPreviousSeed[i])
  }

  return {
    labels: labels,
    current: current,
    previous: previous,
    potential: potential,
    tempCurrent: tempCurrent,
    tempPrevious: tempPrevious
  }
}

function buildDetailRanking(topThree, others) {
  return {
    topThree: topThree,
    others: others.map(function(item) {
      return Object.assign({}, item, {
        ratio: item.maxValue === 0 ? 0 : Math.round((item.value / item.maxValue) * 100)
      })
    })
  }
}

export default {
  name: 'EnergyManagement',
  data() {
    return {
      activePrimaryTab: 'energy-analysis',
      activeMonitorTab: 'energy-monitor',
      summaryView: 'energy-stats',
      activeDetailTab: 'forgot',
      selectedSystem: 'all',
      periodMode: 'year',
      selectedYear: '2026',
      showPotentialLine: true,
      showWeather: false,
      showCalendar: true,
      charts: {
        overview: null,
        potential: null,
        forgot: null,
        temperature: null,
        load: null,
        systemRank: null
      },
      resizeHandler: null,
      primaryTabs: [
        { key: 'energy-analysis', label: '能耗分析' },
        { key: 'operation-analysis', label: '运行分析' },
        { key: 'analysis-report', label: '分析报告' },
        { key: 'billing-local', label: '分户计费(本地)' }
      ],
      secondaryTabs: [
        { key: 'energy-monitor', label: '能耗监控' },
        { key: 'operation-monitor', label: '运行监控' }
      ],
      summaryTabs: [
        { key: 'energy-stats', label: '能耗统计' },
        { key: 'system-rank', label: '系统能耗排名' }
      ],
      detailTabs: [
        { key: 'forgot', label: '忘关机能耗' },
        { key: 'temperature', label: '温度设定过高/过低能耗' },
        { key: 'load', label: '建筑负荷异常能耗' }
      ],
      periodModes: [
        { key: 'day', label: '日' },
        { key: 'month', label: '月' },
        { key: 'year', label: '年' }
      ],
      monitorCards: [
        { label: '电表数', value: 2, icon: 'el-icon-coin' },
        { label: '系统数', value: 2, icon: 'el-icon-s-platform' },
        { label: '外机数', value: 4, icon: 'el-icon-s-order' },
        { label: '内机数', value: 22, icon: 'el-icon-document-copy' }
      ],
      systemOptions: [
        { value: 'all', label: '全部系统' },
        { value: 'vrf-00625-01', label: 'VRF-00625-01' },
        { value: 'vrf-00627-02', label: 'VRF-00627-02' }
      ],
      baseSummary: {
        totalEnergy: 12044,
        yoy: 46,
        energyCost: 9636
      },
      basePotentialItems: [
        { key: 'forgot', label: '忘关机能耗', value: 453, color: 'blue' },
        { key: 'temperature', label: '温度设定过高过低能耗', value: 245, color: 'orange' },
        { key: 'load', label: '建筑负荷异常常能耗', value: 0, color: 'teal' }
      ],
      heatmapValues: [
        { month: '01', value: 3384, tone: 'strong' },
        { month: '02', value: 1454, tone: 'medium' },
        { month: '03', value: 1268, tone: 'medium' },
        { month: '04', value: 5051, tone: 'deep' },
        { month: '05', value: 739, tone: 'light' },
        { month: '06', value: 144, tone: 'soft' },
        { month: '07', value: 0, tone: 'muted' },
        { month: '08', value: 0, tone: 'muted' },
        { month: '09', value: 0, tone: 'muted' },
        { month: '10', value: 0, tone: 'muted' },
        { month: '11', value: 0, tone: 'muted' },
        { month: '12', value: 0, tone: 'muted' }
      ],
      strategyItems: [
        { title: '忘关机能耗', action: '一键忘关机节能', icon: 'el-icon-switch-button', theme: 'violet' },
        { title: '温度锁定设置', action: '一键控温节能', icon: 'el-icon-temperature', theme: 'orange' },
        { title: '建筑负荷异常能耗', action: '负荷异常排查', icon: 'el-icon-data-analysis', theme: 'cyan' },
        { title: '舒享日程', action: '创建舒享日程', icon: 'el-icon-date', theme: 'blue' }
      ],
      overviewSeries: {
        year: buildYearData(),
        month: buildMonthData(),
        day: buildDayData()
      },
      detailSeries: {
        forgot: {
          title: '忘关机能耗',
          color: '#6460e9',
          labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
          values: [204, 82, 50, 84, 33, 0, 0, 0, 0, 0, 0, 0]
        },
        temperature: {
          title: '温度设定过高过低能耗',
          color: '#ff851d',
          labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
          values: [95, 15, 5, 57, 75, 0, 0, 0, 0, 0, 0, 0]
        },
        load: {
          title: '建筑负荷异常能耗',
          color: '#28a6d9',
          labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
          values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      },
      systemRankings: [
        { name: 'VRF-00627-02', energy: 6036, cost: 4828, outdoorCount: 2, indoorCount: 11 },
        { name: 'VRF-00625-01', energy: 6008, cost: 4808, outdoorCount: 2, indoorCount: 11 }
      ],
      detailRankings: {
        forgot: buildDetailRanking(
          [
            { rank: 2, name: '1号系统39', value: 111 },
            { rank: 1, name: 'IDU-00627-2-22 …', value: 115 },
            { rank: 3, name: 'IDU-00627-2-…', value: 93 }
          ],
          [
            { rank: 4, name: 'IDU-00627-2-15 林宏 Tim Jack', value: 30, maxValue: 30 },
            { rank: 5, name: 'IDU-00627-2-21 财务隔壁', value: 24, maxValue: 30 },
            { rank: 6, name: 'IDU-00625-0-13 慕尼黑', value: 21, maxValue: 30 },
            { rank: 7, name: 'IDU-00625-0-6 健身房', value: 17, maxValue: 30 },
            { rank: 8, name: 'IDU-00627-2-14 华芯', value: 10, maxValue: 30 },
            { rank: 9, name: '1号系统22', value: 9, maxValue: 30 }
          ]
        ),
        temperature: buildDetailRanking(
          [
            { rank: 2, name: 'IDU-00627-2-…', value: 63 },
            { rank: 1, name: 'IDU-00627-2-15 …', value: 72 },
            { rank: 3, name: 'IDU-00627-2-…', value: 62 }
          ],
          [
            { rank: 4, name: '1号系统11', value: 28, maxValue: 28 },
            { rank: 5, name: 'IDU-00627-2-20 Recoo-…', value: 20, maxValue: 28 },
            { rank: 6, name: 'IDU-00625-0-13 慕尼黑', value: 0, maxValue: 28 },
            { rank: 7, name: 'IDU-00627-2-14 华芯', value: 0, maxValue: 28 },
            { rank: 8, name: 'IDU-00625-0-6 健身房', value: 0, maxValue: 28 },
            { rank: 9, name: 'IDU-00627-2-2 餐厅', value: 0, maxValue: 28 }
          ]
        )
      }
    }
  },
  computed: {
    activePrimaryTabLabel() {
      var found = this.primaryTabs.find(function(item) {
        return item.key === this.activePrimaryTab
      }, this)
      return found ? found.label : ''
    },
    currentOverviewData() {
      return this.overviewSeries[this.periodMode]
    },
    displaySummary() {
      var factor = this.systemFactor

      return {
        totalEnergy: Math.round(this.baseSummary.totalEnergy * factor),
        yoy: this.baseSummary.yoy,
        energyCost: Math.round(this.baseSummary.energyCost * factor)
      }
    },
    displayPotentialItems() {
      var total = 0
      var factor = this.systemFactor
      var items = this.basePotentialItems.map(function(item) {
        var value = Math.round(item.value * factor)
        total += value
        return Object.assign({}, item, { value: value })
      })

      return items.map(function(item) {
        return Object.assign({}, item, {
          percent: total === 0 ? '0.00' : ((item.value / total) * 100).toFixed(2)
        })
      })
    },
    displayPotentialTotal() {
      return this.displayPotentialItems.reduce(function(sum, item) {
        return sum + item.value
      }, 0)
    },
    displayHeatmap() {
      var factor = this.systemFactor
      return this.heatmapValues.map(function(item) {
        return Object.assign({}, item, {
          value: Math.round(item.value * factor)
        })
      })
    },
    maxHeatmapValue() {
      return this.displayHeatmap.reduce(function(max, item) {
        return Math.max(max, item.value)
      }, 0)
    },
    systemFactor() {
      if (this.selectedSystem === 'vrf-00625-01') {
        return 0.49
      }

      if (this.selectedSystem === 'vrf-00627-02') {
        return 0.51
      }

      return 1
    }
  },
  watch: {
    selectedSystem() {
      this.renderOverviewChart()
      this.renderPotentialChart()
    },
    periodMode() {
      this.renderOverviewChart()
    },
    selectedYear() {
      this.renderOverviewChart()
      this.renderSystemRankChart()
    },
    showPotentialLine() {
      this.renderOverviewChart()
    },
    showWeather() {
      this.renderOverviewChart()
    },
    showCalendar() {
      this.$nextTick(function() {
        this.resizeCharts()
      })
    },
    summaryView() {
      this.$nextTick(function() {
        this.initVisibleCharts()
        this.resizeCharts()
      })
    },
    activePrimaryTab() {
      this.$nextTick(function() {
        this.initVisibleCharts()
        this.resizeCharts()
      })
    },
    activeMonitorTab() {
      this.$nextTick(function() {
        this.initVisibleCharts()
        this.resizeCharts()
      })
    }
  },
  mounted() {
    this.$nextTick(function() {
      this.initVisibleCharts()
      this.bindResize()
    })
  },
  beforeDestroy() {
    this.unbindResize()
    this.disposeCharts()
  },
  methods: {
    bindResize() {
      var vm = this
      this.resizeHandler = function() {
        vm.resizeCharts()
      }
      window.addEventListener('resize', this.resizeHandler)
    },
    buildDetailOption(config) {
      return {
        grid: {
          left: '4%',
          right: '4%',
          top: 16,
          bottom: 28,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: config.labels,
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#d8dfeb'
            }
          },
          axisLabel: {
            color: '#95a2b6'
          }
        },
        yAxis: {
          type: 'value',
          name: 'kWh',
          nameTextStyle: {
            color: '#9aa8be',
            padding: [0, 26, 0, 0]
          },
          min: 0,
          axisTick: { show: false },
          axisLine: { show: false },
          splitLine: {
            lineStyle: {
              color: '#d6deea',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#9aa8be'
          }
        },
        series: [
          {
            name: config.title,
            type: 'bar',
            data: config.values,
            barWidth: 12,
            itemStyle: {
              color: config.color,
              borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 12,
                shadowColor: 'rgba(61, 91, 255, 0.18)'
              }
            }
          }
        ]
      }
    },
    buildOverviewOption() {
      var vm = this
      var factor = this.systemFactor
      var source = this.currentOverviewData
      var current = source.current.map(function(item) {
        return Math.round(item * factor)
      })
      var previous = source.previous.map(function(item) {
        return Math.round(item * factor)
      })
      var legendData = ['2026年市电电量', '2025年市电电量']
      var series = [
        {
          name: '2026年市电电量',
          type: 'bar',
          data: current,
          barWidth: source.labels.length > 24 ? 8 : 12,
          itemStyle: {
            color: '#2f63ff',
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '2025年市电电量',
          type: 'bar',
          data: previous,
          barWidth: source.labels.length > 24 ? 8 : 12,
          itemStyle: {
            color: '#d7dbe4',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]

      if (this.showPotentialLine) {
        legendData.push('节能潜力占比')
        series.push({
          name: '节能潜力占比',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: source.potential,
          lineStyle: {
            color: '#2fc35b',
            width: 2
          },
          itemStyle: {
            color: '#2fc35b'
          }
        })
      }

      if (this.showWeather) {
        legendData.push('2026年气温')
        legendData.push('2025年气温')
        series.push({
          name: '2026年气温',
          type: 'line',
          yAxisIndex: 2,
          smooth: true,
          symbol: 'none',
          data: source.tempCurrent,
          lineStyle: {
            color: '#c9c9c9',
            width: 2,
            type: 'solid'
          }
        })
        series.push({
          name: '2025年气温',
          type: 'line',
          yAxisIndex: 2,
          smooth: true,
          symbol: 'none',
          data: source.tempPrevious,
          lineStyle: {
            color: '#d9d9d9',
            width: 2,
            type: 'dashed'
          }
        })
      }

      return {
        color: ['#2f63ff', '#d7dbe4', '#2fc35b', '#bfc4cf', '#d7dbe4'],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 8,
          right: 0,
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: '#8b97ab',
            fontSize: 12
          },
          data: legendData
        },
        grid: {
          left: '4%',
          right: this.showWeather ? '11%' : '6%',
          top: 48,
          bottom: 36,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: source.labels,
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#d8dfeb'
            }
          },
          axisLabel: {
            color: '#95a2b6',
            fontSize: 11
          }
        },
        yAxis: [
          {
            type: 'value',
            name: 'kWh',
            nameTextStyle: {
              color: '#9aa8be',
              padding: [0, 28, 0, 0]
            },
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: {
              lineStyle: {
                color: '#d6deea',
                type: 'dashed'
              }
            },
            axisLabel: {
              color: '#9aa8be',
              fontSize: 11
            }
          },
          {
            type: 'value',
            min: 0,
            max: 100,
            position: 'right',
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel: {
              color: '#9aa8be',
              fontSize: 11,
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            min: 0,
            max: 40,
            position: 'right',
            offset: 46,
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel: {
              color: '#b0b7c6',
              fontSize: 11,
              formatter: function(value) {
                return vm.showWeather ? value : ''
              }
            }
          }
        ],
        series: series
      }
    },
    buildPotentialOption() {
      var total = this.displayPotentialTotal
      return {
        color: ['#6460e9', '#ff851d', '#28a6d9'],
        tooltip: {
          trigger: 'item'
        },
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: '41%',
            style: {
              text: '节能潜力（kWh）',
              fill: '#7f90ab',
              fontSize: 14
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '52%',
            style: {
              text: String(total),
              fill: '#1d2e49',
              fontSize: 24,
              fontWeight: 700
            }
          }
        ],
        series: [
          {
            type: 'pie',
            radius: ['62%', '82%'],
            center: ['50%', '54%'],
            avoidLabelOverlap: false,
            label: { show: false },
            labelLine: { show: false },
            data: this.displayPotentialItems.map(function(item) {
              return {
                name: item.label,
                value: item.value
              }
            }),
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 6
            }
          }
        ]
      }
    },
    buildSystemRankOption() {
      return {
        grid: {
          left: '8%',
          right: '6%',
          top: 24,
          bottom: 28,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: this.systemRankings.map(function(item) {
            return item.name
          }),
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#d8dfeb'
            }
          },
          axisLabel: {
            color: '#95a2b6'
          }
        },
        yAxis: {
          type: 'value',
          name: 'kWh',
          nameTextStyle: {
            color: '#9aa8be',
            padding: [0, 22, 0, 0]
          },
          axisTick: { show: false },
          axisLine: { show: false },
          splitLine: {
            lineStyle: {
              color: '#d6deea',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#9aa8be'
          }
        },
        series: [
          {
            name: '年能耗',
            type: 'bar',
            data: this.systemRankings.map(function(item) {
              return item.energy
            }),
            barWidth: 34,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#7ca7ff' },
                { offset: 1, color: '#2f63ff' }
              ]),
              borderRadius: [8, 8, 0, 0]
            }
          }
        ]
      }
    },
    disposeCharts() {
      Object.keys(this.charts).forEach(function(key) {
        if (this.charts[key]) {
          this.charts[key].dispose()
          this.charts[key] = null
        }
      }, this)
    },
    handleExport(title) {
      this.$message.success(title + '导出数据成功')
    },
    handleMonitorTabClick(tabKey) {
      this.activeMonitorTab = tabKey
    },
    handlePrimaryTabClick(tabKey) {
      this.activePrimaryTab = tabKey
    },
    initChart(refName, key) {
      if (!this.$refs[refName]) {
        return null
      }

      if (!this.charts[key]) {
        this.charts[key] = echarts.init(this.$refs[refName])
      }

      return this.charts[key]
    },
    initVisibleCharts() {
      if (this.activePrimaryTab !== 'energy-analysis' || this.activeMonitorTab !== 'energy-monitor') {
        return
      }

      if (this.summaryView === 'energy-stats') {
        this.initChart('overviewChart', 'overview')
        this.initChart('potentialChart', 'potential')
        this.renderOverviewChart()
        this.renderPotentialChart()
      } else {
        this.initChart('systemRankChart', 'systemRank')
        this.renderSystemRankChart()
      }

      this.initChart('forgotChart', 'forgot')
      this.initChart('temperatureChart', 'temperature')
      this.initChart('loadChart', 'load')
      this.renderDetailCharts()
    },
    renderDetailCharts() {
      if (this.charts.forgot) {
        this.charts.forgot.setOption(this.buildDetailOption(this.detailSeries.forgot))
      }

      if (this.charts.temperature) {
        this.charts.temperature.setOption(this.buildDetailOption(this.detailSeries.temperature))
      }

      if (this.charts.load) {
        this.charts.load.setOption(this.buildDetailOption(this.detailSeries.load))
      }
    },
    renderOverviewChart() {
      if (this.charts.overview) {
        this.charts.overview.setOption(this.buildOverviewOption(), true)
      }
    },
    renderPotentialChart() {
      if (this.charts.potential) {
        this.charts.potential.setOption(this.buildPotentialOption(), true)
      }
    },
    renderSystemRankChart() {
      if (this.charts.systemRank) {
        this.charts.systemRank.setOption(this.buildSystemRankOption(), true)
      }
    },
    resizeCharts() {
      Object.keys(this.charts).forEach(function(key) {
        if (this.charts[key]) {
          this.charts[key].resize()
        }
      }, this)
    },
    scrollToDetail(key) {
      var targetMap = {
        forgot: 'forgotSection',
        temperature: 'temperatureSection',
        load: 'loadSection'
      }
      var targetRef = this.$refs[targetMap[key]]

      this.activeDetailTab = key

      if (targetRef && typeof targetRef.scrollIntoView === 'function') {
        targetRef.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    },
    showInfoMessage(title) {
      this.$message.info(title + '功能示意已接入')
    },
    unbindResize() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
        this.resizeHandler = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.energy-page {
  min-height: calc(100vh - 84px);
  background: #fff;
  color: #1f2d45;
}

.primary-tabs,
.secondary-tabs,
.view-tabs,
.detail-anchor-tabs,
.period-toggle,
.warning-banner,
.control-group,
.switch-group,
.strategy-link,
.rank-panel-head,
.rank-list-item,
.monitor-card,
.summary-card,
.top-three-card,
.system-rank-item,
.potential-item-head,
.potential-metric,
.control-bar {
  display: flex;
  align-items: center;
}

.primary-tabs {
  border-bottom: 1px solid #edf0f5;
}

.primary-tab,
.secondary-tab,
.view-tab,
.detail-anchor-btn,
.period-btn,
.plain-link,
.strategy-action,
.strategy-link,
.export-link {
  cursor: pointer;
}

.primary-tab {
  min-width: 104px;
  height: 42px;
  border: 0;
  border-right: 1px solid #edf0f5;
  background: #fff;
  color: #2a3d59;
  font-size: 14px;
}

.primary-tab.active {
  background: #f7f9fc;
  color: #1f2d45;
}

.secondary-tabs {
  gap: 24px;
  padding: 12px 12px 0;
}

.secondary-tab {
  position: relative;
  border: 0;
  background: transparent;
  color: #4c5f7d;
  font-size: 14px;
  padding: 0 0 12px;
}

.secondary-tab.active {
  color: #2f63ff;
}

.secondary-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: #2f63ff;
}

.monitor-card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  padding: 16px 12px 10px;
}

.monitor-card {
  gap: 14px;
  justify-content: space-between;
  min-height: 62px;
  padding: 0 20px;
  border-radius: 6px;
  background: #eaf3ff;
}

.monitor-icon {
  color: #506482;
  font-size: 20px;
}

.monitor-label {
  flex: 1;
  color: #233651;
  font-size: 14px;
}

.monitor-value {
  color: #101f38;
  font-size: 22px;
  font-weight: 700;
}

.warning-banner {
  gap: 10px;
  padding: 2px 12px 14px;
  color: #ff7e16;
  font-size: 14px;
}

.warning-banner i {
  font-size: 16px;
}

.view-tabs {
  gap: 10px;
  padding: 8px 12px 0;
}

.view-tab {
  min-width: 92px;
  height: 30px;
  border: 0;
  border-radius: 4px;
  background: #f2f3f5;
  color: #4c5f7d;
  font-size: 14px;
}

.view-tab.active {
  background: #2f63ff;
  color: #fff;
}

.tariff-row,
.summary-grid,
.overview-layout,
.insight-grid,
.system-rank-layout,
.detail-section {
  display: grid;
}

.tariff-row {
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 18px 12px 10px;
}

.tariff-text {
  color: #334863;
  font-size: 14px;
}

.tariff-text strong {
  margin-left: 6px;
  color: #101f38;
  font-size: 16px;
}

.plain-link {
  border: 0;
  background: transparent;
  color: #2f63ff;
  font-size: 14px;
}

.summary-grid {
  grid-template-columns: 350px 244px;
  gap: 16px;
  padding: 4px 12px 14px;
}

.summary-card {
  gap: 16px;
  min-height: 72px;
  padding: 0 18px;
  border-radius: 10px;
  background: #eaf3ff;
}

.summary-card.compact {
  max-width: 244px;
}

.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 18px;
}

.summary-icon.blue {
  color: #2f63ff;
  background: rgba(47, 99, 255, 0.12);
}

.summary-icon.orange {
  color: #ff7e16;
  background: rgba(255, 126, 22, 0.12);
}

.summary-content {
  flex: 1;
}

.summary-label {
  color: #4c5f7d;
  font-size: 14px;
}

.summary-value-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 8px;
}

.summary-value-row strong {
  color: #101f38;
  font-size: 24px;
  line-height: 1;
}

.summary-value-row strong.orange-text {
  color: #ff7e16;
}

.summary-trend {
  color: #30b959;
  font-size: 14px;
  font-weight: 600;
}

.control-bar {
  gap: 24px;
  padding: 0 12px 16px;
  flex-wrap: wrap;
}

.control-group,
.switch-group {
  gap: 10px;
}

.control-label {
  color: #334863;
  font-size: 14px;
  white-space: nowrap;
}

.system-select {
  width: 160px;
}

.spacer {
  flex: 1;
  min-width: 20px;
}

.period-toggle {
  overflow: hidden;
  border-radius: 4px;
  background: #f2f3f5;
}

.period-btn {
  min-width: 50px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #4c5f7d;
  font-size: 14px;
}

.period-btn.active {
  background: #2f63ff;
  color: #fff;
}

.year-picker {
  width: 150px;
}

.overview-layout {
  grid-template-columns: minmax(0, 1fr) 392px;
  gap: 18px;
  padding: 0 12px;
}

.overview-chart-card,
.calendar-heatmap-card,
.insight-card,
.system-rank-chart-card,
.system-rank-list-card,
.detail-chart-panel,
.detail-rank-panel {
  border-radius: 10px;
  background: #fff;
}

.overview-chart-card {
  overflow: hidden;
}

.overview-chart {
  height: 250px;
}

.calendar-heatmap-card {
  padding-top: 4px;
}

.heatmap-title {
  color: #8797ae;
  font-size: 12px;
  text-align: right;
}

.heatmap-head {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  margin-top: -2px;
  color: #8b97ab;
  font-size: 11px;
}

.heatmap-bar {
  width: 148px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #d8e8ff 0%, #7aa9ff 100%);
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.heatmap-item {
  min-height: 58px;
  padding: 10px 8px;
  border-radius: 4px;
  text-align: center;
}

.heatmap-item.muted {
  background: #f4f7fc;
}

.heatmap-item.soft {
  background: #eaf2ff;
}

.heatmap-item.light {
  background: #dceafe;
}

.heatmap-item.medium {
  background: #bcd5ff;
}

.heatmap-item.strong {
  background: #92bbff;
}

.heatmap-item.deep {
  background: #7faefe;
}

.heatmap-month {
  color: #101f38;
  font-size: 18px;
}

.heatmap-value {
  margin-top: 4px;
  color: #ff7e16;
  font-size: 13px;
}

.insight-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.06fr);
  gap: 18px;
  padding: 18px 12px 10px;
}

.insight-card {
  padding: 16px;
  background: #f8fbff;
}

.insight-title,
.section-card-title,
.detail-title,
.rank-title {
  color: #1f2d45;
  font-size: 18px;
  font-weight: 700;
}

.potential-layout {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 24px;
  align-items: center;
  margin-top: 10px;
}

.potential-chart {
  height: 240px;
}

.potential-list {
  display: grid;
  gap: 18px;
}

.bullet {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.bullet.blue {
  background: #6460e9;
}

.bullet.orange {
  background: #ff851d;
}

.bullet.teal {
  background: #28a6d9;
}

.potential-name {
  color: #4c5f7d;
  font-size: 14px;
}

.potential-metric {
  gap: 8px;
  margin-top: 8px;
}

.potential-metric strong {
  color: #101f38;
  font-size: 24px;
  line-height: 1;
}

.unit {
  color: #7f90ab;
  font-size: 14px;
}

.rate {
  margin-left: auto;
  color: #4d63ff;
  font-size: 14px;
  font-weight: 600;
}

.strategy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.strategy-card {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 14px;
  min-height: 64px;
  padding: 12px 14px;
  border-radius: 8px;
}

.strategy-card.violet {
  background: rgba(100, 96, 233, 0.08);
}

.strategy-card.orange {
  background: rgba(255, 133, 29, 0.08);
}

.strategy-card.cyan {
  background: rgba(40, 166, 217, 0.08);
}

.strategy-card.blue {
  background: rgba(47, 99, 255, 0.08);
}

.strategy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  font-size: 20px;
}

.strategy-card.violet .strategy-icon {
  background: #6460e9;
}

.strategy-card.orange .strategy-icon {
  background: #ff851d;
}

.strategy-card.cyan .strategy-icon {
  background: #28a6d9;
}

.strategy-card.blue .strategy-icon {
  background: #2f63ff;
}

.strategy-title {
  color: #1f2d45;
  font-size: 15px;
}

.strategy-link {
  margin-top: 4px;
  border: 0;
  background: transparent;
  color: #4c5f7d;
  padding: 0;
  font-size: 14px;
}

.strategy-action {
  border: 0;
  background: transparent;
  color: #2f63ff;
  font-size: 14px;
}

.system-rank-layout {
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 18px;
  padding: 18px 12px 10px;
}

.system-rank-chart-card,
.system-rank-list-card {
  padding: 16px;
  background: #f8fbff;
}

.system-rank-chart {
  height: 360px;
  margin-top: 12px;
}

.system-rank-list {
  margin-top: 16px;
}

.system-rank-item {
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #e8eef8;
}

.system-rank-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eef4ff;
  color: #2f63ff;
  font-size: 14px;
  font-weight: 700;
}

.system-rank-main {
  flex: 1;
}

.system-rank-name {
  color: #1f2d45;
  font-size: 15px;
  font-weight: 600;
}

.system-rank-sub {
  margin-top: 6px;
  color: #7f90ab;
  font-size: 13px;
}

.divider {
  margin: 0 6px;
  color: #c4ccda;
}

.system-rank-value {
  color: #101f38;
  font-size: 20px;
  font-weight: 700;
}

.detail-anchor-tabs {
  position: sticky;
  top: 0;
  z-index: 5;
  gap: 2px;
  padding: 10px 12px 14px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.detail-anchor-btn {
  min-width: 106px;
  height: 30px;
  padding: 0 16px;
  border: 0;
  border-radius: 4px;
  background: #f2f3f5;
  color: #4c5f7d;
  font-size: 14px;
}

.detail-anchor-btn.active {
  background: #2f63ff;
  color: #fff;
}

.detail-section {
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 24px;
  padding: 0 12px 28px;
}

.detail-section.last {
  padding-bottom: 40px;
}

.detail-chart-panel {
  min-height: 240px;
}

.detail-chart {
  height: 260px;
  margin-top: 12px;
}

.detail-rank-panel {
  padding-top: 10px;
}

.rank-panel-head {
  justify-content: space-between;
  gap: 14px;
}

.export-link {
  border: 0;
  background: transparent;
  color: #2f63ff;
  font-size: 14px;
}

.top-three-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.top-three-card {
  min-height: 106px;
  padding: 14px 12px;
  border-radius: 12px;
  text-align: center;
  background: linear-gradient(180deg, #f5f8ff 0%, #e8effd 100%);
}

.top-three-card.rank-1 {
  transform: translateY(-12px);
  background: linear-gradient(180deg, #e9f2ff 0%, #d8e6ff 100%);
}

.top-three-card.rank-2 {
  background: linear-gradient(180deg, #f4f7fd 0%, #e7edf8 100%);
}

.top-three-card.rank-3 {
  background: linear-gradient(180deg, #eef7f3 0%, #ddece3 100%);
}

.top-three-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  color: #63728e;
  font-size: 18px;
  font-weight: 700;
}

.top-three-name {
  margin-top: 12px;
  color: #334863;
  font-size: 14px;
  min-height: 40px;
}

.top-three-value {
  margin-top: 8px;
  color: #1f2d45;
  font-size: 16px;
  font-weight: 700;
}

.rank-list {
  margin-top: 12px;
}

.rank-list-item {
  gap: 12px;
  padding: 10px 0;
}

.rank-no {
  width: 18px;
  color: #5e6f8c;
  font-size: 14px;
  font-weight: 700;
}

.rank-item-main {
  flex: 1;
}

.rank-item-name {
  color: #334863;
  font-size: 14px;
}

.rank-progress {
  height: 6px;
  margin-top: 6px;
  border-radius: 999px;
  background: #eceff4;
  overflow: hidden;
}

.rank-progress-bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #2f63ff;
}

.rank-item-value {
  color: #556681;
  font-size: 14px;
  font-weight: 700;
}

.empty-rank-state,
.placeholder-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-rank-state {
  min-height: 320px;
  color: #9aa8be;
}

.empty-rank-icon {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: #f2f5fb;
  color: #c8d1df;
  font-size: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-rank-text {
  margin-top: 14px;
  font-size: 15px;
}

.placeholder-panel {
  min-height: 520px;
  gap: 12px;
}

.placeholder-panel.large {
  min-height: calc(100vh - 180px);
}

.placeholder-title {
  color: #1f2d45;
  font-size: 22px;
  font-weight: 700;
}

.placeholder-text {
  color: #7f90ab;
  font-size: 15px;
}

@media (max-width: 1440px) {
  .monitor-card-grid,
  .summary-grid,
  .overview-layout,
  .insight-grid,
  .system-rank-layout,
  .detail-section {
    grid-template-columns: 1fr;
  }

  .summary-card.compact {
    max-width: none;
  }

  .calendar-heatmap-card,
  .detail-rank-panel {
    padding-top: 0;
  }

  .potential-layout,
  .strategy-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .monitor-card-grid,
  .heatmap-grid,
  .top-three-grid {
    grid-template-columns: 1fr 1fr;
  }

  .control-bar {
    align-items: flex-start;
  }

  .spacer {
    display: none;
  }
}

@media (max-width: 640px) {
  .primary-tabs,
  .summary-grid,
  .monitor-card-grid,
  .heatmap-grid,
  .top-three-grid,
  .strategy-grid {
    grid-template-columns: 1fr;
  }

  .monitor-card,
  .summary-card {
    padding: 14px;
  }

  .tariff-row,
  .control-bar,
  .rank-panel-head {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
