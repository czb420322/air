<template>
  <div class="quick-control-page">
    <div v-if="pageMode === 'list'" class="quick-control-list">
      <div class="page-heading">
        <div class="heading-title">新建快捷控制</div>
        <div class="heading-desc">首页快捷控制最多为8项，长按拖动可调整显示顺序</div>
      </div>

      <div class="list-toolbar">
        <div></div>
        <div class="toolbar-actions">
          <button
            type="button"
            class="toolbar-btn secondary"
            :disabled="selectedControlIds.length === 0"
            @click="deleteSelectedControls"
          >
            批量删除
          </button>
          <button type="button" class="toolbar-btn primary" @click="openCreate">
            <span class="plus-pill">+</span>
            快捷控制
          </button>
        </div>
      </div>

      <div class="table-card">
        <table class="control-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input
                  type="checkbox"
                  :checked="isAllControlsSelected"
                  @change="toggleAllControls"
                >
              </th>
              <th>是否开启</th>
              <th>显示图标</th>
              <th>来源</th>
              <th>控制设备数量</th>
              <th>任务名称</th>
              <th>控制指令</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in quickControls" :key="item.id">
              <td class="checkbox-col">
                <input
                  type="checkbox"
                  :checked="selectedControlIds.includes(item.id)"
                  @change="toggleControlSelection(item.id)"
                >
              </td>
              <td>
                <button
                  type="button"
                  :class="['status-switch', { active: item.enabled }]"
                  @click="toggleControlStatus(item)"
                >
                  <span class="switch-dot"></span>
                  <span>{{ item.enabled ? '启用' : '停用' }}</span>
                </button>
              </td>
              <td>
                <span class="icon-chip">{{ iconTextMap[item.iconKey] }}</span>
              </td>
              <td>{{ item.source }}</td>
              <td>{{ item.deviceCount }}</td>
              <td>{{ item.name }}</td>
              <td class="command-text">{{ formatCommands(item.commands) }}</td>
              <td>
                <button type="button" class="link-btn" @click="openEdit(item)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="quick-control-form">
      <div class="crumb-row">
        <button type="button" class="back-link" @click="backToList">
          <i class="el-icon-arrow-left"></i>
          返回
        </button>
        <span class="crumb-text">设备管理</span>
        <span class="crumb-sep">&gt;</span>
        <span class="crumb-text">快捷控制管理</span>
        <span class="crumb-sep">&gt;</span>
        <span class="crumb-current">{{ formPageTitle }}</span>
      </div>

      <div class="form-header">
        <div class="form-page-title">{{ formPageTitle }}</div>
        <button type="button" class="toolbar-btn ghost" @click="backToList">返回</button>
      </div>

      <div class="wizard-card">
        <div class="wizard-steps">
          <div v-for="step in wizardSteps" :key="step.value" class="wizard-step">
            <div :class="['step-circle', { active: wizardStep === step.value, done: wizardStep > step.value }]">
              {{ step.value }}
            </div>
            <div class="step-text">
              <div :class="['step-title', { active: wizardStep === step.value }]">{{ step.title }}</div>
              <div class="step-desc">{{ step.desc }}</div>
            </div>
            <div v-if="step.value !== wizardSteps.length" class="step-line"></div>
          </div>
        </div>

        <section v-if="wizardStep === 1" class="form-section">
          <div class="section-title">基本信息</div>

          <div class="field-block">
            <label class="field-label required">快捷控制名称</label>
            <div class="text-input">
              <input v-model.trim="form.name" type="text" maxlength="20" placeholder="请输入名称">
              <span class="counter">{{ form.name.length }}/20</span>
            </div>
          </div>

          <div class="field-block">
            <label class="field-label">备注</label>
            <div class="textarea-input">
              <textarea v-model.trim="form.remark" maxlength="100"></textarea>
              <span class="counter">{{ form.remark.length }}/100</span>
            </div>
          </div>

          <div class="field-block">
            <label class="field-label required">展示图标</label>
            <div class="icon-grid">
              <button
                v-for="option in iconOptions"
                :key="option.key"
                type="button"
                :class="['icon-option', { active: form.iconKey === option.key }]"
                @click="form.iconKey = option.key"
              >
                <span class="icon-glyph">{{ option.text }}</span>
              </button>
            </div>
          </div>

          <div class="field-block">
            <label class="field-label required">添至快捷控制</label>
            <button
              type="button"
              :class="['toggle-pill', { active: form.addToHome }]"
              @click="form.addToHome = !form.addToHome"
            >
              <span class="toggle-label">{{ form.addToHome ? '添加' : '关闭' }}</span>
              <span class="toggle-dot"></span>
            </button>
          </div>
        </section>

        <section v-else-if="wizardStep === 2" class="form-section">
          <div class="section-head">
            <div class="section-title">控制设备</div>
            <div class="section-tip">已选择 {{ selectedDeviceIds.length }}/{{ allDeviceIds.length }} 台设备</div>
          </div>

          <div class="device-select-panel">
            <div class="device-toolbar">
              <div class="search-box">
                <i class="el-icon-search"></i>
                <input v-model.trim="deviceKeyword" type="text" placeholder="请输入分区或设备名称">
              </div>
              <label class="plain-check">
                <input
                  type="checkbox"
                  :checked="selectedDeviceIds.length === allDeviceIds.length"
                  @change="toggleAllDevices"
                >
                全选
              </label>
            </div>

            <div class="device-group-list">
              <div v-for="group in filteredDeviceGroups" :key="group.id" class="device-group">
                <div class="group-head">
                  <label class="plain-check">
                    <input
                      type="checkbox"
                      :checked="isGroupChecked(group)"
                      @change="toggleDeviceGroup(group)"
                    >
                    {{ group.name }}（{{ group.items.length }}）
                  </label>
                </div>
                <div class="group-items">
                  <label v-for="device in group.items" :key="device.id" class="device-item">
                    <input
                      type="checkbox"
                      :checked="selectedDeviceIds.includes(device.id)"
                      @change="toggleDevice(device.id)"
                    >
                    <span>{{ device.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-else class="form-section">
          <div class="section-title">设置控制指令</div>

          <div class="command-section">
            <div class="command-title">设备开关</div>
            <div class="choice-row">
              <button
                type="button"
                :class="['choice-btn', { active: commandForm.power === 'off' }]"
                @click="commandForm.power = 'off'"
              >
                关机
              </button>
              <button
                type="button"
                :class="['choice-btn', { active: commandForm.power === 'on' }]"
                @click="commandForm.power = 'on'"
              >
                开机
              </button>
            </div>
          </div>

          <div class="command-section">
            <div class="command-title">设置模式</div>
            <div class="choice-row">
              <button
                v-for="item in modeOptions"
                :key="item.value"
                type="button"
                :class="['choice-btn', { active: commandForm.mode === item.value }]"
                @click="commandForm.mode = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <div class="command-section">
            <div class="command-title">设定温度</div>
            <div class="slider-row">
              <span class="range-label">16℃</span>
              <el-slider v-model="commandForm.temperature" :min="16" :max="30" :step="1"></el-slider>
              <span class="range-value">{{ commandForm.temperature }}℃</span>
            </div>
          </div>

          <div class="command-section">
            <div class="command-title">设定风档</div>
            <div class="slider-row">
              <span class="range-label">1档</span>
              <el-slider v-model="commandForm.windLevel" :min="1" :max="7" :step="1"></el-slider>
              <span class="range-value">{{ commandForm.windLevel }}档</span>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-title">指令预览</div>
            <div class="summary-text">{{ formatCommands(buildCommandSummary(commandForm)) }}</div>
          </div>
        </section>
      </div>

      <div class="wizard-footer">
        <button
          v-if="wizardStep > 1"
          type="button"
          class="footer-btn secondary"
          @click="wizardStep -= 1"
        >
          上一步
        </button>
        <button type="button" class="footer-btn primary" @click="handlePrimaryAction">
          {{ wizardStep === 3 ? (isEditing ? '保存' : '完成') : '下一步' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const ICON_OPTIONS = [
  { key: 'power-on', text: 'ON' },
  { key: 'power-off', text: 'OFF' },
  { key: 'fan', text: 'FAN' },
  { key: 'group', text: 'GRP' },
  { key: 'meet', text: 'MEET' },
  { key: 'sun', text: 'SUN' },
  { key: 'snow', text: 'SNOW' },
  { key: 'home', text: 'HOME' },
  { key: 'file', text: 'DOC' },
  { key: 'food', text: 'FOOD' },
  { key: 'cafe', text: 'CAFE' },
  { key: 'leaf', text: 'LEAF' },
  { key: 'park', text: 'TREE' },
  { key: 'chart', text: 'DATA' }
]

const DEVICE_GROUPS = [
  {
    id: 'group-unassigned',
    name: '未分区',
    items: [
      { id: 'idu-01', label: '1号系统11' },
      { id: 'idu-02', label: '1号系统12' },
      { id: 'idu-03', label: '1号系统15' },
      { id: 'idu-04', label: '1号系统22' },
      { id: 'idu-05', label: '1号系统39' },
      { id: 'idu-06', label: '1号系统40' },
      { id: 'idu-07', label: 'IDU-00625-0-10 零食角' },
      { id: 'idu-08', label: 'IDU-00625-0-11 爱丁堡' }
    ]
  },
  {
    id: 'group-office',
    name: '办公区',
    items: [
      { id: 'idu-09', label: 'IDU-00627-2-14 华芯' },
      { id: 'idu-10', label: 'IDU-00627-2-15 林宏 Tim Jack' },
      { id: 'idu-11', label: 'IDU-00627-2-16 赣哥 朱钰' },
      { id: 'idu-12', label: 'IDU-00627-2-20 Recoo-首尔' },
      { id: 'idu-13', label: 'IDU-00627-2-21 财务隔壁' },
      { id: 'idu-14', label: 'IDU-00627-2-22 档案室-赵姐' }
    ]
  },
  {
    id: 'group-life',
    name: '生活区',
    items: [
      { id: 'idu-15', label: 'IDU-00625-0-4 旧金山' },
      { id: 'idu-16', label: 'IDU-00625-0-5 温哥华' },
      { id: 'idu-17', label: 'IDU-00625-0-6 健身房' },
      { id: 'idu-18', label: 'IDU-00625-0-9 零食角' },
      { id: 'idu-19', label: 'IDU-00625-0-12 慕尼黑' },
      { id: 'idu-20', label: 'IDU-00625-0-13 慕尼黑2' },
      { id: 'idu-21', label: 'IDU-00627-2-1 机房' },
      { id: 'idu-22', label: 'IDU-00627-2-2 展厅' }
    ]
  }
]

const ALL_DEVICE_IDS = DEVICE_GROUPS.reduce((result, group) => {
  return result.concat(group.items.map(item => item.id))
}, [])

function createDefaultForm() {
  return {
    name: '',
    remark: '',
    iconKey: 'power-on',
    addToHome: true
  }
}

function createDefaultCommandForm() {
  return {
    power: 'on',
    mode: 'cool',
    temperature: 26,
    windLevel: 1
  }
}

function buildCommandSummary(commandForm) {
  const result = []

  result.push(commandForm.power === 'off' ? '关机' : '开机')

  if (commandForm.power !== 'off') {
    if (commandForm.mode === 'cool') {
      result.push('制冷')
    } else if (commandForm.mode === 'heat') {
      result.push('制热')
    } else if (commandForm.mode === 'fan') {
      result.push('送风')
    } else if (commandForm.mode === 'dry') {
      result.push('除湿')
    } else {
      result.push('自动')
    }

    result.push(`设置风档 ${commandForm.windLevel}档`)
    result.push(`设置温度 ${commandForm.temperature}℃`)
  }

  return result
}

function createSeedControls() {
  const defaultDevices = ALL_DEVICE_IDS.slice()

  return [
    {
      id: 'qc-01',
      enabled: false,
      iconKey: 'power-on',
      source: '推荐',
      deviceCount: defaultDevices.length,
      deviceIds: defaultDevices,
      name: '设备全开',
      remark: '',
      addToHome: true,
      commands: ['开机', '制冷', '设置风档 1档', '设置温度 26℃'],
      commandForm: createDefaultCommandForm()
    },
    {
      id: 'qc-02',
      enabled: false,
      iconKey: 'power-off',
      source: '推荐',
      deviceCount: defaultDevices.length,
      deviceIds: defaultDevices,
      name: '设备全关',
      remark: '',
      addToHome: true,
      commands: ['关机'],
      commandForm: {
        power: 'off',
        mode: 'cool',
        temperature: 26,
        windLevel: 1
      }
    }
  ]
}

export default {
  name: 'QuickControlPanel',
  data() {
    return {
      pageMode: 'list',
      wizardStep: 1,
      currentEditId: '',
      selectedControlIds: [],
      deviceKeyword: '',
      selectedDeviceIds: [],
      form: createDefaultForm(),
      commandForm: createDefaultCommandForm(),
      iconOptions: ICON_OPTIONS,
      wizardSteps: [
        { value: 1, title: '基本信息', desc: '快捷控制名称' },
        { value: 2, title: '控制设备', desc: '选择控制设备' },
        { value: 3, title: '控制指令', desc: '设置控制指令' }
      ],
      modeOptions: [
        { value: 'auto', label: '自动' },
        { value: 'fan', label: '送风' },
        { value: 'cool', label: '制冷' },
        { value: 'heat', label: '制热' },
        { value: 'dry', label: '除湿' }
      ],
      deviceGroups: DEVICE_GROUPS,
      quickControls: createSeedControls()
    }
  },
  computed: {
    allDeviceIds() {
      return ALL_DEVICE_IDS
    },
    filteredDeviceGroups() {
      if (!this.deviceKeyword) {
        return this.deviceGroups
      }

      const keyword = this.deviceKeyword.toLowerCase()
      return this.deviceGroups
        .map(group => ({
          id: group.id,
          name: group.name,
          items: group.items.filter(item => item.label.toLowerCase().includes(keyword))
        }))
        .filter(group => group.name.toLowerCase().includes(keyword) || group.items.length > 0)
    },
    formPageTitle() {
      return this.isEditing ? '编辑快捷控制' : '新建快捷控制'
    },
    isAllControlsSelected() {
      return this.quickControls.length > 0 && this.selectedControlIds.length === this.quickControls.length
    },
    isEditing() {
      return this.pageMode === 'edit'
    },
    iconTextMap() {
      return this.iconOptions.reduce((result, item) => {
        result[item.key] = item.text
        return result
      }, {})
    }
  },
  methods: {
    buildCommandSummary,
    backToList() {
      this.pageMode = 'list'
      this.wizardStep = 1
      this.currentEditId = ''
      this.deviceKeyword = ''
    },
    deleteSelectedControls() {
      this.quickControls = this.quickControls.filter(item => !this.selectedControlIds.includes(item.id))
      this.selectedControlIds = []
      this.$message.success('已删除选中的快捷控制')
    },
    formatCommands(commands) {
      return commands.join(' | ')
    },
    handlePrimaryAction() {
      if (this.wizardStep === 1) {
        if (!this.form.name) {
          this.$message.warning('请输入快捷控制名称')
          return
        }
        this.wizardStep = 2
        return
      }

      if (this.wizardStep === 2) {
        if (this.selectedDeviceIds.length === 0) {
          this.$message.warning('请至少选择一台设备')
          return
        }
        this.wizardStep = 3
        return
      }

      const commands = this.buildCommandSummary(this.commandForm)
      const payload = {
        id: this.currentEditId || `qc-${Date.now()}`,
        enabled: false,
        iconKey: this.form.iconKey,
        source: '推荐',
        deviceCount: this.selectedDeviceIds.length,
        deviceIds: this.selectedDeviceIds.slice(),
        name: this.form.name,
        remark: this.form.remark,
        addToHome: this.form.addToHome,
        commands,
        commandForm: Object.assign({}, this.commandForm)
      }

      if (this.isEditing) {
        this.quickControls = this.quickControls.map(item => (item.id === payload.id ? payload : item))
        this.$message.success('快捷控制已更新')
      } else {
        this.quickControls.unshift(payload)
        this.$message.success('快捷控制已创建')
      }

      this.selectedControlIds = []
      this.backToList()
    },
    isGroupChecked(group) {
      return group.items.length > 0 && group.items.every(item => this.selectedDeviceIds.includes(item.id))
    },
    openCreate() {
      this.pageMode = 'create'
      this.wizardStep = 1
      this.currentEditId = ''
      this.deviceKeyword = ''
      this.form = createDefaultForm()
      this.commandForm = createDefaultCommandForm()
      this.selectedDeviceIds = []
    },
    openEdit(item) {
      this.pageMode = 'edit'
      this.wizardStep = 1
      this.currentEditId = item.id
      this.deviceKeyword = ''
      this.form = {
        name: item.name,
        remark: item.remark,
        iconKey: item.iconKey,
        addToHome: item.addToHome
      }
      this.commandForm = Object.assign({}, item.commandForm)
      this.selectedDeviceIds = item.deviceIds.slice()
    },
    toggleAllControls() {
      if (this.isAllControlsSelected) {
        this.selectedControlIds = []
      } else {
        this.selectedControlIds = this.quickControls.map(item => item.id)
      }
    },
    toggleAllDevices() {
      if (this.selectedDeviceIds.length === this.allDeviceIds.length) {
        this.selectedDeviceIds = []
      } else {
        this.selectedDeviceIds = this.allDeviceIds.slice()
      }
    },
    toggleControlSelection(id) {
      const index = this.selectedControlIds.indexOf(id)
      if (index > -1) {
        this.selectedControlIds.splice(index, 1)
      } else {
        this.selectedControlIds.push(id)
      }
    },
    toggleControlStatus(item) {
      item.enabled = !item.enabled
    },
    toggleDevice(deviceId) {
      const index = this.selectedDeviceIds.indexOf(deviceId)
      if (index > -1) {
        this.selectedDeviceIds.splice(index, 1)
      } else {
        this.selectedDeviceIds.push(deviceId)
      }
    },
    toggleDeviceGroup(group) {
      const allSelected = this.isGroupChecked(group)

      group.items.forEach(item => {
        const exists = this.selectedDeviceIds.includes(item.id)

        if (allSelected && exists) {
          this.selectedDeviceIds = this.selectedDeviceIds.filter(id => id !== item.id)
        }

        if (!allSelected && !exists) {
          this.selectedDeviceIds.push(item.id)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-control-page {
  min-height: calc(100vh - 125px);
  background: #fff;
}

.page-heading,
.form-header,
.crumb-row {
  display: flex;
  align-items: center;
}

.page-heading {
  gap: 14px;
  padding: 18px 14px;
  border-bottom: 1px solid #edf0f5;
}

.heading-title,
.form-page-title,
.section-title,
.summary-title {
  color: #16233d;
  font-size: 16px;
  font-weight: 700;
}

.heading-desc,
.section-tip,
.step-desc,
.summary-text,
.crumb-text,
.crumb-current {
  color: #6b7c98;
  font-size: 13px;
}

.list-toolbar,
.wizard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-toolbar {
  padding: 22px 14px;
}

.toolbar-actions,
.wizard-footer {
  gap: 14px;
}

.toolbar-btn,
.footer-btn,
.icon-option,
.choice-btn,
.link-btn,
.back-link,
.status-switch,
.toggle-pill {
  cursor: pointer;
}

.toolbar-btn,
.footer-btn {
  min-width: 86px;
  height: 34px;
  padding: 0 18px;
  border-radius: 4px;
  border: 0;
  font-size: 14px;
}

.toolbar-btn.primary,
.footer-btn.primary {
  background: #2d63ff;
  color: #fff;
}

.toolbar-btn.secondary,
.toolbar-btn.ghost,
.footer-btn.secondary {
  background: #e8f1ff;
  color: #2d63ff;
}

.toolbar-btn:disabled {
  background: #d7e6ff;
  color: #8eaadb;
  cursor: not-allowed;
}

.plus-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.table-card,
.wizard-card {
  margin: 0 14px;
  border: 1px solid #edf0f5;
  border-radius: 4px;
  overflow: hidden;
}

.control-table {
  width: 100%;
  border-collapse: collapse;
}

.control-table th,
.control-table td {
  padding: 18px 14px;
  border-bottom: 1px solid #edf0f5;
  color: #2a3d59;
  font-size: 14px;
  text-align: left;
}

.control-table thead th {
  background: #edf4ff;
  color: #516481;
  font-weight: 600;
}

.checkbox-col {
  width: 46px;
}

.status-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px 0 4px;
  border: 1px solid #bbc8da;
  border-radius: 999px;
  background: #fff;
  color: #7b8cab;
}

.status-switch.active {
  border-color: #2d63ff;
  color: #2d63ff;
}

.switch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #9eaec5;
}

.status-switch.active .switch-dot {
  background: #2d63ff;
}

.icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid #2d63ff;
  border-radius: 50%;
  color: #2d63ff;
  font-size: 12px;
  font-weight: 700;
}

.command-text {
  max-width: 460px;
  line-height: 1.6;
}

.link-btn,
.back-link {
  border: 0;
  background: transparent;
  color: #2d63ff;
  font-size: 14px;
}

.crumb-row {
  gap: 8px;
  padding: 16px 14px;
}

.crumb-sep {
  color: #a3afc1;
  font-size: 12px;
}

.form-header {
  justify-content: space-between;
  padding: 12px 14px 14px;
}

.wizard-card {
  padding: 26px 0 34px;
}

.wizard-steps {
  display: flex;
  justify-content: center;
  padding: 0 40px 26px;
}

.wizard-step {
  display: flex;
  align-items: center;
  min-width: 300px;
}

.step-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e8ecf4;
  color: #6c7d98;
  font-size: 16px;
}

.step-circle.active,
.step-circle.done {
  background: #2d63ff;
  color: #fff;
}

.step-text {
  padding-left: 14px;
}

.step-title {
  color: #52637f;
  font-size: 15px;
}

.step-title.active {
  color: #16233d;
  font-weight: 700;
}

.step-line {
  flex: 1;
  height: 1px;
  margin: 0 28px;
  background: #cfd7e5;
}

.form-section {
  max-width: 980px;
  padding: 10px 160px 0 34px;
}

.field-block,
.command-section {
  margin-top: 28px;
}

.field-label {
  display: block;
  margin-bottom: 12px;
  color: #1f2d45;
  font-size: 15px;
}

.field-label.required::before {
  content: '*';
  margin-right: 4px;
  color: #ff4d4f;
}

.text-input,
.textarea-input,
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  background: #fff;
}

.text-input input,
.textarea-input textarea,
.search-box input {
  flex: 1;
  border: 0;
  outline: none;
  color: #1f2d45;
  font-size: 14px;
}

.text-input {
  height: 34px;
  padding: 0 12px;
}

.textarea-input {
  align-items: flex-start;
  padding: 8px 12px 28px;
}

.textarea-input textarea {
  min-height: 70px;
  resize: none;
}

.counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: #6b7c98;
  font-size: 13px;
}

.text-input .counter {
  top: 8px;
  bottom: auto;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.icon-option {
  width: 40px;
  height: 40px;
  border: 1px solid #e4eaf3;
  border-radius: 4px;
  background: #f8faff;
}

.icon-option.active {
  border-color: #2d63ff;
  background: #eef4ff;
}

.icon-glyph {
  color: #6c7d98;
  font-size: 11px;
  font-weight: 700;
}

.icon-option.active .icon-glyph {
  color: #2d63ff;
}

.toggle-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 2px 2px 10px;
  border: 1px solid #c3d5f8;
  border-radius: 999px;
  background: #fff;
}

.toggle-pill.active {
  border-color: #2d63ff;
  background: #edf4ff;
}

.toggle-label {
  color: #2d63ff;
  font-size: 13px;
  font-weight: 600;
}

.toggle-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #2d63ff;
}

.section-head,
.device-toolbar,
.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.device-select-panel {
  margin-top: 18px;
  border: 1px solid #d9e3f3;
  border-radius: 6px;
}

.device-toolbar {
  padding: 16px;
  border-bottom: 1px solid #edf0f5;
}

.search-box {
  width: 320px;
  height: 34px;
  padding: 0 12px;
  gap: 8px;
}

.plain-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2b3d58;
  font-size: 14px;
}

.device-group-list {
  max-height: 420px;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.device-group {
  border-bottom: 1px solid #edf0f5;
}

.group-head {
  padding: 16px 0 12px;
}

.group-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 24px;
  padding: 0 0 16px 26px;
}

.device-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #546781;
  font-size: 14px;
}

.command-title {
  margin-bottom: 14px;
  color: #1f2d45;
  font-size: 14px;
  font-weight: 600;
}

.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.choice-btn {
  min-width: 88px;
  height: 34px;
  padding: 0 16px;
  border: 1px solid #d9e3f3;
  border-radius: 4px;
  background: #fff;
  color: #516481;
  font-size: 14px;
}

.choice-btn.active {
  border-color: #2d63ff;
  background: #edf4ff;
  color: #2d63ff;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider-row ::v-deep .el-slider {
  flex: 1;
}

.range-label,
.range-value {
  color: #516481;
  font-size: 14px;
}

.summary-card {
  margin-top: 26px;
  padding: 16px 18px;
  border-radius: 6px;
  background: #f7faff;
}

.summary-text {
  margin-top: 10px;
  line-height: 1.7;
}

.wizard-footer {
  justify-content: center;
  padding: 18px 0 0;
}

@media (max-width: 1280px) {
  .wizard-steps {
    flex-direction: column;
    gap: 14px;
    align-items: flex-start;
  }

  .wizard-step {
    min-width: auto;
  }

  .step-line {
    display: none;
  }

  .form-section {
    max-width: none;
    padding-right: 34px;
  }

  .device-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }

  .group-items {
    grid-template-columns: 1fr;
  }
}
</style>
