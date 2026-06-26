<template>
  <div class="schedule-page">
    <div v-if="pageMode === 'list'" class="schedule-list-page">
      <div class="schedule-tabs">
        <button v-for="tab in scheduleTabs" :key="tab.key" type="button"
          :class="['schedule-tab', { active: activeScheduleTab === tab.key }]" @click="activeScheduleTab = tab.key">
          {{ tab.label }}
        </button>
      </div>

      <div class="toolbar-card">
        <div class="toolbar-left">
          <div class="toolbar-title">日程计划</div>
          <div class="date-pill">{{ rentTime }}</div>
          <div class="view-switch">
            <button @click="handleSwitch('day')" :class="{ 'active': activeView === 'day' }" type="button"
              class="view-switch-btn ">
              <i class="el-icon-date" />
            </button>
            <button @click="handleSwitch('month')" :class="{ 'active': activeView === 'month' }" type="button"
              class="view-switch-btn">月</button>
            <button @click="handleSwitch('year')" :class="{ 'active': activeView === 'year' }" type="button"
              class="view-switch-btn">年</button>
          </div>
        </div>

        <div class="toolbar-actions">
          <button type="button" class="outline-btn">联动日志</button>
          <button type="button" class="primary-btn" @click="pageMode = 'create'">
            <span class="plus-circle">+</span>
            新建日程
          </button>
          <button type="button" class="outline-btn">日程日志</button>
        </div>
      </div>

      <div class="schedule-content">
        <aside class="calendar-sidebar">
          <div class="calendar-filter">
            <div class="filter-label">日期选择</div>
            <div class="month-input">
              <i class="el-icon-date calendar-icon" :class="[focusDate ? 'redDate' : '']" />
              <el-date-picker @blur="handleBlurDate" @focus="handleFocusDate" :clearable="!1" v-model="rentNewTime"
                @change="handleMonthChange" :type="activeView !== 'year' ? 'month' : 'year'" placeholder="选择月" />
            </div>
          </div>
          <div class="mini-calendar-list">
            <div v-for="month in calendarMonths" :key="month.title" class="mini-calendar-card">
              <div class="mini-title">{{ month.title }}</div>
              <div class="week-row">
                <span v-for="week in weeks" :key="week">{{ week }}</span>
              </div>
              <div class="day-grid">
                <span v-for="day in month.days" :key="`${month.title}-${day.value}-${day.offset}`"
                  :class="['day-cell', { muted: day.muted, active: day.active, mark: day.mark }]">
                  {{ day.value }}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main class="schedule-main">
          <div class="status-pills">
            <button @click="handleActiveStatus(pill.id)" type="button"
              :class="{ 'activePill': pill.id === activeStatusPill }" class="status-pill" v-for="pill in status_pills"
              :key="pill.id">
              {{ pill.label }} ({{ pill.count }})
            </button>
          </div>
          <div class="schedule-list">
            <div class="schedule-empty">
              <div class="empty-icon">📄</div>
              <div class="empty-text">暂无数据</div>
            </div>
          </div>

        </main>
      </div>
    </div>

    <div v-else class="schedule-create-page">
      <div class="create-header">
        <span class="create-title">新建日程</span>
        <button type="button" class="outline-btn" @click="pageMode = 'list'">退出</button>
      </div>

      <section class="create-section">
        <header class="section-head">
          <span>步骤 1. 基本信息</span>
          <button type="button" class="link-btn">收起</button>
        </header>

        <div class="section-body basic-grid">
          <div class="field-block wide">
            <label class="field-label required">日程名称</label>
            <div class="text-input with-counter">
              <input v-model="scheduleForm.name" type="text" placeholder="请输入日程名称">
              <span class="counter">0/30</span>
            </div>
          </div>

          <div class="field-block">
            <label class="field-label required">选择时间</label>
            <div class="range-input">
              <span>开始日期</span>
              <span class="divider">→</span>
              <span>结束日期</span>
              <i class="el-icon-date" />
            </div>
          </div>

          <div class="field-block wide">
            <label class="field-label required">重复</label>
            <div class="repeat-tabs">
              <button v-for="item in repeatTabs" :key="item.key" type="button"
                :class="['repeat-tab', { active: repeatMode === item.key }]" @click="repeatMode = item.key">
                {{ item.label }}
              </button>
            </div>

            <div v-if="repeatMode === 'custom'" class="custom-repeat-box">
              <label class="check-line">
                <input v-model="customRepeat.ignoreHoliday" type="checkbox">
                忽略节假日
              </label>
              <div class="week-checks">
                <label v-for="day in weekdayOptions" :key="day.key" class="check-line">
                  <input v-model="customRepeat.days" type="checkbox" :value="day.key">
                  {{ day.label }}
                </label>
              </div>
              <div class="error-text">请选择重复周期</div>
            </div>
          </div>

          <div class="field-block">
            <label class="field-label">排除日</label>
            <div class="exclude-row">
              <div class="text-input readonly">
                <span>选择排除日</span>
              </div>
              <button type="button" class="secondary-add-btn" @click="showExcludePanel = !showExcludePanel">
                <span class="plus-circle small">+</span>
                新增
              </button>
            </div>
          </div>
        </div>

        <div v-if="showExcludePanel" class="exclude-panel">
          <div class="dual-calendar">
            <div v-for="panel in dualCalendarPanels" :key="panel.title" class="dual-month">
              <div class="dual-month-title">{{ panel.title }}</div>
              <div class="week-row light">
                <span v-for="week in weeks" :key="`${panel.title}-${week}`">{{ week }}</span>
              </div>
              <div class="day-grid compact">
                <span v-for="day in panel.days" :key="`${panel.title}-${day.value}-${day.offset}`"
                  :class="['day-cell', 'compact', { muted: day.muted, active: day.active }]">
                  {{ day.value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="create-columns">
        <section class="create-section half">
          <header class="section-head">
            <span>步骤 2. 选择设备</span>
            <button type="button" class="link-btn">收起</button>
          </header>

          <div class="section-body">
            <div class="search-input">
              <i class="el-icon-search" />
              <input type="text" placeholder="请输入分区/设备名">
            </div>

            <div class="device-select-top">
              <span>已选0/22</span>
              <label class="check-line">
                全选
                <input type="checkbox">
              </label>
            </div>

            <div class="device-tree">
              <div class="device-node">
                <span class="caret">▼</span>
                <span>新节点8h1n (0)</span>
                <input type="checkbox">
              </div>
              <div class="device-node child">
                <span class="caret">▶</span>
                <span>未分区 (22)</span>
                <input type="checkbox">
              </div>
            </div>
          </div>
        </section>

        <section class="create-section half">
          <header class="section-head">
            <span>步骤 3. 添加指令</span>
            <button type="button" class="link-btn">收起</button>
          </header>

          <div class="command-empty">
            <div class="warn-icon">!</div>
            <div class="command-text">请先填写【计划信息】和选择【设备】再设置控制指令！</div>
          </div>
        </section>
      </div>

      <div class="footer-actions">
        <button type="button" class="primary-btn next-btn">下一步</button>
      </div>
    </div>
  </div>
</template>

<script>
function buildMonthDays(days, activeDays = [], markedDays = []) {
  return days.map((value, index) => ({
    value,
    offset: index,
    muted: index < 2 || index > 31,
    active: activeDays.includes(value),
    mark: markedDays.includes(value)
  }))
}

export default {
  name: 'ScheduleManagement',
  created() {
    this.renderCalendar()
  },
  data() {
    return {
      rentTime: null,
      rentNewTime: null,
      focusDate: false,
      pageMode: 'list',
      activeScheduleTab: 'running',
      repeatMode: 'daily',
      showExcludePanel: false,
      scheduleForm: {
        name: ''
      },
      customRepeat: {
        ignoreHoliday: false,
        days: []
      },
      activeView: 'day',
      scheduleTabs: [
        { key: 'running', label: '运行日程' },
        { key: 'recommend', label: '削峰日程' }
      ],
      activeStatusPill: 1,
      status_pills: [{
        id: 1,
        label: "有效日程",
        count: 0
      }, {
        id: 2,
        label: "失效日程",
        count: 0
      },
      {
        id: 3,
        label: "全部",
        count: 0
      }],
      repeatTabs: [
        { key: 'daily', label: '每天' },
        { key: 'workday', label: '工作日' },
        { key: 'weekend', label: '周末' },
        { key: 'holiday', label: '节假日' },
        { key: 'custom', label: '自定义' }
      ],
      weekdayOptions: [
        { key: 'mon', label: '周一' },
        { key: 'tue', label: '周二' },
        { key: 'wed', label: '周三' },
        { key: 'thu', label: '周四' },
        { key: 'fri', label: '周五' },
        { key: 'sat', label: '周六' },
        { key: 'sun', label: '周日' }
      ],
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
      calendarMonths: [
        {
          title: '2026-06',
          days: buildMonthDays([31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4], [17], [20, 21])
        },
        {
          title: '2026-07',
          days: buildMonthDays([28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1], [], [])
        },
        {
          title: '2026-08',
          days: buildMonthDays([26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], [], [])
        }
      ],
      dualCalendarPanels: [
        {
          title: '2026年6月',
          days: buildMonthDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5], [17])
        },
        {
          title: '2026年7月',
          days: buildMonthDays([29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2], [])
        }
      ]
    }
  },
  methods: {
    handleFocusDate() {
      this.focusDate = true
    },
    handleBlurDate() {
      this.focusDate = false
    },
    renderCalendar(val) {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      this.rentTime = `${year}-${month}-${day}`
      this.rentNewTime = `${year}-${month}-${day}`
      return val === 'day' ? `${year}-${month}-${day}` : val === 'month' ? `${year}-${month}` : `${year}`
    },
    handleSwitch(viewMode) {
      this.activeView = viewMode
      switch (viewMode) {
        case 'day':
          this.rentTime = this.renderCalendar('day')
          break;
        case 'month':
          this.rentTime = this.renderCalendar('month')
          break;
        case 'year':
          this.rentTime = this.renderCalendar('year')
          break;
      }
    },
    handleActiveStatus(id) {
      this.activeStatusPill = id
    }
  }
}
</script>

<style lang="scss" scoped>
.schedule-page {
  height: calc(100vh - 84px);
  background: #fff;
  color: #1f2d45;
}

.schedule-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #edf0f5;
}

.schedule-tab {
  min-width: 96px;
  height: 38px;
  border: 0;
  background: #fff;
  color: #2e3f5d;
  font-size: 15px;
  cursor: pointer;
}

.schedule-tab.active {
  background: #f5f7fb;
}

.toolbar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #edf0f5;
}

.toolbar-left,
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-title {
  font-size: 16px;
  font-weight: 500;
  color: #0f111c;
  line-height: 22px;
  padding-right: 4px;
}

.date-pill {
  padding: 6px 14px;
  border: 1px solid #d9e0ee;
  border-radius: 16px;
  color: #7c8ca7;
  font-size: 14px;
}

.view-switch {
  display: inline-flex;
  overflow: hidden;
  border-radius: 6px;
  background: #f2f4f8;
}

.view-switch-btn {
  min-width: 48px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #445672;
  cursor: pointer;
}

.view-switch-btn.active {
  background: #2d63ff;
  color: #fff;
}

.outline-btn,
.primary-btn,
.secondary-add-btn {
  height: 32px;
  padding: 0 18px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.outline-btn {
  border: 1px solid #2d63ff;
  background: #fff;
  color: #2d63ff;
}

.primary-btn {
  border: 0;
  background: #2d63ff;
  color: #fff;
}

.plus-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.plus-circle.small {
  width: 14px;
  height: 14px;
  font-size: 12px;
}

.schedule-content {
  display: flex;
  height: calc(100vh - 150px);
  padding: 16px;

  .schedule-main {
    box-sizing: border-box;
    width: calc(100% - 312px);
    height: 100%;
    padding: 0 0 0 20px
  }
}

.calendar-sidebar {
  width: 312px;
  padding: 4px 16px 0 8px;
  box-sizing: border-box;
  overflow-y: auto;
  position: relative;
}

.calendar-filter {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  color: #2f405d;
  font-size: 14px;
}

.month-input {
  padding: 0 12px;
  position: relative;

  .calendar-icon {
    position: absolute;
    right: 33px;
    top: 8px;
    z-index: 2;
  }
  .redDate{
    color:#1a4fd9;
  }

  ::v-deep .el-input__prefix {
    opacity: 0;
  }

  ::v-deep .el-date-editor {
    width: 180px !important;
    height: 32px !important;
  }

  ::v-deep .el-date-editor .el-input__inner {
    height: 32px !important;
    border-radius: 6px !important;
    padding-left: 10px !important;
  }

  ::v-deep .el-date-editor .el-input__inner:hover {
    border-color: #1a4fd9 !important;
  }

  ::v-deep .el-date-editor .el-input__inner:focus {
    border-color: #2d63ff !important;
  }
}

.status-pills {
  display: flex;
  gap: 12px;
  margin: 0 0 16px;
}

.status-pill {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #b9c5db;
  border-radius: 18px;
  background: #fff;
  color: #40516c;
  cursor: pointer;
}

.status-pill.activePill {
  border-color: #2d63ff;
  color: #2d63ff;
}

.mini-calendar-list {
  height: calc(100vh - 220px);
  overflow-y: auto;
}

.mini-calendar-card {
  margin-bottom: 18px;
}

.mini-title {
  cursor: pointer;
  font-size: 16px;
  color: #0f111c;
  line-height: 22px;
  text-align: center;
  font-weight: 500;
  padding: 15px 0;
}

.week-row,
.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.week-row {
  padding: 10px 8px;
  border-radius: 4px;
  background: #f2f4f8;
  color: #2d3f5d;
  font-size: 14px;
}

.week-row.light {
  background: transparent;
  color: #8a99b0;
}

.day-grid {
  margin-top: 8px;
}

.day-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  border-radius: 6px;
  color: #33425d;
}

.day-cell.muted {
  color: #c0cad9;
}

.day-cell.active {
  background: #2d63ff;
  color: #fff;
}

.day-cell.mark::after {
  content: '*';
  color: #19b552;
  font-size: 12px;
  margin-left: 2px;
}

.day-cell.compact {
  height: 28px;
}

.schedule-list {
  box-sizing: border-box;
  height: calc(100% - 36px);
  padding-top: 20px;
  overflow-y: auto;

  .schedule-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .empty-icon {
    font-size: 56px;
    opacity: 0.3;
  }

  .empty-text {
    margin-top: 10px;
  }
}


.schedule-create-page {
  padding: 8px 12px 16px;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.create-title {
  font-size: 16px;
  font-weight: 700;
}

.create-section {
  margin-bottom: 18px;
  border: 1px solid #c9d3e6;
  border-radius: 8px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #edf0f5;
  font-size: 16px;
  font-weight: 700;
}

.link-btn {
  border: 0;
  background: transparent;
  color: #2d63ff;
  font-size: 14px;
  cursor: pointer;
}

.section-body {
  padding: 18px 20px 22px;
}

.basic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 36px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-block.wide {
  min-width: 0;
}

.field-label {
  font-size: 14px;
  color: #253550;
}

.field-label.required::before {
  content: '* ';
  color: #ff4d4f;
}

.text-input,
.range-input,
.search-input {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #c9d3e6;
  border-radius: 4px;
  color: #9aa6bb;
}

.text-input input,
.search-input input {
  flex: 1;
  border: 0;
  outline: none;
}

.text-input.with-counter {
  justify-content: space-between;
}

.counter {
  color: #2f405d;
}

.range-input {
  justify-content: space-between;
}

.divider {
  margin: 0 12px;
}

.repeat-tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border: 1px solid #c9d3e6;
  border-radius: 6px;
  overflow: hidden;
}

.repeat-tab {
  height: 32px;
  border: 0;
  border-right: 1px solid #d9e0ee;
  background: #fff;
  color: #445672;
  cursor: pointer;
}

.repeat-tab:last-child {
  border-right: 0;
}

.repeat-tab.active {
  background: #2d63ff;
  color: #fff;
}

.custom-repeat-box {
  padding: 8px 0 0 8px;
}

.check-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2f405d;
}

.week-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.error-text {
  margin-top: 4px;
  color: #ff4d4f;
  font-size: 12px;
}

.exclude-row {
  display: flex;
  gap: 12px;
}

.text-input.readonly {
  flex: 1;
}

.secondary-add-btn {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: #eaf3ff;
  color: #2d63ff;
}

.exclude-panel {
  margin: 0 20px 20px;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  padding: 16px;
}

.dual-calendar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.dual-month-title {
  margin-bottom: 10px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
}

.create-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.create-section.half {
  margin-bottom: 0;
}

.search-input {
  gap: 8px;
}

.device-select-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0;
}

.device-tree {
  min-height: 330px;
}

.device-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 10px 0;
  font-size: 15px;
  font-weight: 600;
}

.device-node.child {
  padding-left: 12px;
}

.caret {
  margin-right: 8px;
  color: #6f7d97;
}

.command-empty {
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.warn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
  border-radius: 50%;
  background: #ff8a1f;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}

.command-text {
  max-width: 280px;
  line-height: 1.7;
  font-size: 15px;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.next-btn {
  min-width: 78px;
}

@media (max-width: 1280px) {

  .schedule-content,
  .create-columns,
  .basic-grid,
  .toolbar-card {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-sidebar {
    width: auto;
    border-right: 0;
    border-bottom: 1px solid #edf0f5;
  }

  .dual-calendar {
    grid-template-columns: 1fr;
  }
}
</style>