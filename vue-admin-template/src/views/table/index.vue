<template>
  <div class="device-page">
    <div class="top-tabs">
      <button
        v-for="tab in topTabs"
        :key="tab.key"
        type="button"
        :class="['top-tab', { active: activeTopTab === tab.key }]"
        @click="activeTopTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content-shell">
      <aside :class="['sidebar', { editing: zoneEditMode }]">
        <div class="machine-switch">
          <button
            v-for="tab in machineTabs"
            :key="tab.key"
            type="button"
            :class="['machine-tab', { active: activeMachineTab === tab.key }]"
            @click="switchMachineTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <template v-if="zoneEditMode && activeMachineTab === 'indoor'">
          <div class="zone-edit-header">
            <span class="zone-edit-title">设备分区</span>
            <button type="button" class="more-link" @click.stop="toggleMoreMenu">更多操作</button>
            <div v-if="showMoreMenu" class="dropdown-menu more-menu">
              <button type="button" @click="openImportDialog">导入</button>
              <button type="button">导出</button>
              <button type="button" @click="openGuideDialog">操作指引</button>
              <button type="button" @click="openSmartNamingDialog">智能命名</button>
            </div>
          </div>

          <div class="zone-edit-tree">
            <div
              v-for="group in editableZoneGroups"
              :key="group.id"
              :class="['editable-zone-item', { active: selectedEditZone === group.id }]"
              @click="selectedEditZone = group.id"
            >
              <span class="editable-zone-name">{{ group.name }} ({{ group.count }})</span>
              <div class="editable-zone-actions">
                <button type="button" class="icon-btn" @click.stop="toggleNodeMenu(group.id)">+</button>
                <button type="button" class="icon-btn" @click.stop>✎</button>
                <button type="button" class="icon-btn" @click.stop>🗑</button>
              </div>

              <div v-if="nodeMenuId === group.id" class="dropdown-menu node-menu">
                <button type="button" @click="createPeerZone(group.id)">同级分区</button>
                <button type="button" @click="createChildZone(group.id)">子级分区</button>
              </div>
            </div>
          </div>

          <div v-if="!editableZoneGroups.length" class="empty-zone-tip">
            <div>暂无分区</div>
            <button type="button" class="text-link" @click="openImportDialog">请 添加/导入</button>
          </div>

          <button type="button" class="create-zone-btn" @click="createTopLevelZone">
            <span class="plus-badge">+</span>
            新建一级分区
          </button>
        </template>

        <template v-else>
          <div class="zone-panel">
            <div class="zone-header">分区管理</div>
            <div class="zone-summary">
              <span>全部（{{ currentZoneCount }}）</span>
              <button type="button" class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
                {{ sidebarCollapsed ? '»' : '«' }}
              </button>
            </div>

            <div class="zone-tree">
              <div
                v-for="group in currentZoneGroups"
                :key="group.id"
                class="zone-group"
              >
                <div
                  :class="['zone-group-title', { active: selectedZone === group.id }]"
                  @click="selectZone(group.id)"
                >
                  <div class="zone-group-main">
                    <span class="caret">{{ group.expanded ? '▼' : '▶' }}</span>
                    <span>{{ group.name }}（{{ group.items.length }}）</span>
                  </div>
                  <i class="el-icon-edit-outline"></i>
                </div>

                <div v-if="group.expanded" class="zone-items">
                  <div
                    v-for="item in group.items"
                    :key="item.id"
                    :class="['zone-item', { active: selectedZone === item.id }]"
                    @click="selectZone(item.id)"
                  >
                    <span>{{ item.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="activeMachineTab === 'indoor'"
              type="button"
              class="edit-zone-btn"
              @click="enterZoneEditMode"
            >
              编辑分区
            </button>
          </div>
        </template>
      </aside>

      <main class="main-panel">
        <div class="toolbar-header">
          <div v-if="zoneEditMode" class="edit-mode-title">
            <span>未分区设备（0）</span>
            <span class="mode-text">拓扑模式</span>
          </div>

          <button
            v-if="zoneEditMode"
            type="button"
            class="exit-btn"
            @click="exitZoneEditMode"
          >
            退出
          </button>

          <div v-else class="toolbar-view-switch">
            <button
              type="button"
              :class="['view-btn', { active: viewMode === 'card' }]"
              @click="viewMode = 'card'"
            >
              <i class="el-icon-s-grid"></i>
            </button>
            <button
              type="button"
              :class="['view-btn', { active: viewMode === 'table' }]"
              @click="viewMode = 'table'"
            >
              <i class="el-icon-s-unfold"></i>
            </button>
          </div>
        </div>

        <div class="filter-panel">
          <div class="filter-row">
            <div class="search-combo">
              <div class="combo-label">设备名称</div>
              <input
                v-model="filters.keyword"
                type="text"
                class="combo-input"
                placeholder="请输入设备名称"
              >
              <i class="el-icon-search search-icon"></i>
            </div>

            <div class="filter-box">
              <span class="filter-label">{{ activeMachineTab === 'indoor' ? '所属系统' : '所属系统' }}</span>
              <div class="fake-select">
                <span>请选择</span>
                <i class="el-icon-arrow-down"></i>
              </div>
            </div>

            <div class="filter-box">
              <span class="filter-label">{{ activeMachineTab === 'indoor' ? '实时状态' : '运行状态' }}</span>
              <div class="fake-select">
                <span>请选择</span>
                <i class="el-icon-arrow-down"></i>
              </div>
            </div>

            <button
              type="button"
              class="expand-link"
              @click="expandedFilters = !expandedFilters"
            >
              {{ expandedFilters ? '收起' : '展开' }}
              <i :class="expandedFilters ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
            </button>
          </div>
        </div>

        <div v-if="zoneEditMode" class="edit-top-actions">
          <label class="check-all">
            <input type="checkbox">
            全选（0/22）
          </label>

          <div class="edit-mode-actions">
            <button type="button" class="action-btn secondary">刷新</button>
            <button type="button" class="action-btn primary">批量删除</button>
            <button type="button" class="action-btn secondary">批量重命名</button>
          </div>
        </div>

        <div v-else class="action-row">
          <div class="action-spacer"></div>
          <div class="actions">
            <button
              v-if="activeMachineTab === 'indoor' && viewMode === 'card'"
              type="button"
              class="action-btn secondary"
            >
              排序配置
            </button>
            <button type="button" class="action-btn secondary">重置筛选</button>
            <button type="button" class="action-btn secondary">刷新</button>
            <button
              v-if="activeMachineTab === 'outdoor'"
              type="button"
              class="action-btn primary"
            >
              批量删除
            </button>
            <button type="button" class="action-btn primary">批量控制</button>
            <button
              v-if="activeMachineTab === 'indoor' && viewMode === 'card'"
              type="button"
              class="action-btn primary wide"
            >
              下载全部设备二维码
            </button>
          </div>
        </div>

        <div v-if="zoneEditMode" class="edit-layout">
          <div class="edit-transfer">
            <button type="button" class="transfer-btn disabled">移出</button>
            <button type="button" class="transfer-btn active">移入</button>
          </div>

          <div class="edit-card-grid">
            <div v-for="item in indoorEditCards" :key="item.id" class="device-card edit-card">
              <div class="card-title-row with-check">
                <div class="card-title-wrap">
                  <span class="card-icon">🌀</span>
                  <input :value="item.name" class="rename-input">
                </div>
                <input type="checkbox">
              </div>

              <div class="card-body">
                <div class="temperature-row">
                  <strong>{{ item.currentTemp }}</strong>
                  <span>/</span>
                  <span>{{ item.targetTemp }}</span>
                </div>

                <div class="card-footer">
                  <div class="card-tags">
                    <span>{{ item.contract }}</span>
                    <span>|</span>
                    <span>{{ item.status }}</span>
                  </div>
                  <i class="el-icon-close"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="viewMode === 'card'" class="card-grid">
          <div v-for="item in currentCards" :key="item.id" class="device-card">
            <div class="card-title-row">
              <div class="card-title-wrap">
                <span class="card-icon">{{ activeMachineTab === 'indoor' ? '🌀' : '▥' }}</span>
                <span class="card-title">{{ item.name }}</span>
              </div>
            </div>

            <div v-if="activeMachineTab === 'outdoor'" class="outdoor-power">
              <div>交流电表：{{ item.acPower }}</div>
              <div>直流电表：{{ item.dcPower }}</div>
            </div>

            <div class="card-body">
              <div class="card-metrics">
                <span>{{ item.metricA }}</span>
                <span>{{ item.metricB }}</span>
                <span>{{ item.metricC }}</span>
              </div>

              <div class="card-footer">
                <div class="card-tags">
                  <span>{{ item.contract }}</span>
                  <span>|</span>
                  <span>{{ item.status }}</span>
                </div>
                <div class="card-extra">
                  <span v-if="item.extra">{{ item.extra }}</span>
                  <i class="el-icon-close"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="table-shell">
          <table class="device-table">
            <thead>
              <tr>
                <th>{{ activeMachineTab === 'indoor' ? '室内机编号' : '室外机编号' }}</th>
                <th>设备名称</th>
                <th>运行状态</th>
                <th>{{ activeMachineTab === 'indoor' ? '设备地址' : '所属系统' }}</th>
                <th>{{ activeMachineTab === 'indoor' ? '系统' : '机型' }}</th>
                <th>{{ activeMachineTab === 'indoor' ? '附属舰' : '静音模式' }}</th>
                <th>{{ activeMachineTab === 'indoor' ? '内机型号' : '模式优先设置' }}</th>
                <th v-if="activeMachineTab === 'indoor'">模式</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in currentTableRows" :key="row.id">
                <td>{{ row.code }}</td>
                <td>{{ row.name }}</td>
                <td>
                  <span class="status-dot"></span>
                  {{ row.status }}
                </td>
                <td>{{ row.address }}</td>
                <td>{{ row.system }}</td>
                <td>{{ row.attachment }}</td>
                <td>{{ row.model }}</td>
                <td v-if="activeMachineTab === 'indoor'">{{ row.mode }}</td>
                <td class="operate-links">
                  <a href="javascript:void(0)">控制</a>
                  <a href="javascript:void(0)">编辑</a>
                  <a v-if="activeTopTab === 'logs'" href="javascript:void(0)">日志</a>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination-bar">
            <span>{{ currentPaginationText }}</span>
            <div class="pagination-controls">
              <button type="button" class="page-btn">‹</button>
              <button type="button" class="page-btn active">1</button>
              <button type="button" class="page-btn">2</button>
              <button type="button" class="page-btn">›</button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="showImportDialog || showGuideDialog || showSmartNamingDialog" class="modal-mask" @click="closeAllDialogs">
      <div v-if="showImportDialog" class="modal-card import-modal" @click.stop>
        <div class="modal-header">
          <span>导入</span>
          <button type="button" class="close-btn" @click="showImportDialog = false">×</button>
        </div>
        <div class="modal-content">
          <p>请按照模版要求导入数据，若已创建请忽略 <a href="javascript:void(0)">批量导入分区模版.xlsx</a></p>
          <div class="upload-row">
            <span class="required">*</span>
            <span>上传分区数据：</span>
            <button type="button" class="upload-btn">点击上传</button>
          </div>
        </div>
      </div>

      <div v-if="showGuideDialog" class="modal-card guide-modal" @click.stop>
        <div class="modal-header">
          <span>操作指引</span>
          <button type="button" class="close-btn" @click="showGuideDialog = false">×</button>
        </div>
        <div class="modal-content guide-content">
          <div class="guide-section">
            <div class="guide-title">自动分区：</div>
            <p>点击导入按钮，本地导入分区数据即可分区。</p>
            <p>若本地无分区数据，可点击蓝色链接下载模版 <a href="javascript:void(0)">批量导入分区模版.xlsx</a></p>
          </div>

          <div class="guide-section">
            <div class="guide-title">手动分区：</div>
            <div class="guide-action-row">
              <button type="button" class="guide-btn">同级分区</button>
              <span>选中一个分组后，点击此按钮可新建一个同级的分组。</span>
            </div>
            <div class="guide-action-row">
              <button type="button" class="guide-btn light">子集分区</button>
              <span>选中一个分区后，点击此按钮可新建选中对象的子集分区。</span>
            </div>
          </div>

          <div class="guide-section">
            <div class="guide-title">设备拖动：</div>
            <p>右侧分区列表下的设备，可以通过长按拖动的形式，更改设备所属的分区。</p>
          </div>
        </div>
      </div>

      <div v-if="showSmartNamingDialog" class="modal-card confirm-modal" @click.stop>
        <div class="modal-header">
          <span>提示</span>
          <button type="button" class="close-btn" @click="showSmartNamingDialog = false">×</button>
        </div>
        <div class="modal-content">
          <p>是否将未命名的设备按分区名称进行智能命名？</p>
          <p class="sub-tip">例如位于“2栋”-“3层”-“大厅”的内机将被自动依次命名为“2栋-3层-大厅1”、“2栋-3层-大厅2”</p>
          <div class="confirm-actions">
            <button type="button" class="ghost-btn" @click="showSmartNamingDialog = false">取消</button>
            <button type="button" class="solid-btn" @click="confirmSmartNaming">确定</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EquipmentManagement',
  data() {
    return {
      activeTopTab: 'management',
      activeMachineTab: 'indoor',
      viewMode: 'card',
      expandedFilters: false,
      sidebarCollapsed: false,
      zoneEditMode: false,
      showMoreMenu: false,
      nodeMenuId: '',
      showImportDialog: false,
      showGuideDialog: false,
      showSmartNamingDialog: false,
      selectedZone: 'group-unassigned',
      selectedEditZone: '',
      topTabs: [
        { key: 'management', label: '设备管理' },
        { key: 'control', label: '快捷控制' },
        { key: 'logs', label: '控制日志' }
      ],
      machineTabs: [
        { key: 'indoor', label: '室内机' },
        { key: 'outdoor', label: '室外机' }
      ],
      filters: {
        keyword: ''
      },
      indoorZones: [
        {
          id: 'group-unassigned',
          name: '未分区',
          expanded: true,
          items: [
            { id: 'idu-11', label: '1号系统11' },
            { id: 'idu-12', label: '1号系统12' },
            { id: 'idu-15', label: '1号系统15' },
            { id: 'idu-22', label: '1号系统22' },
            { id: 'idu-39', label: '1号系统39' },
            { id: 'idu-40', label: '1号系统40' },
            { id: 'idu-010', label: 'IDU-00625-0-10 零食角...' },
            { id: 'idu-011', label: 'IDU-00625-0-11爱丁堡' },
            { id: 'idu-012', label: 'IDU-00625-0-12 慕尼黑' },
            { id: 'idu-013', label: 'IDU-00625-0-13 慕尼黑...' },
            { id: 'idu-004', label: 'IDU-00625-0-4 旧金山...' },
            { id: 'idu-005', label: 'IDU-00625-0-5 温哥华' },
            { id: 'idu-006', label: 'IDU-00625-0-6 健身房' },
            { id: 'idu-009', label: 'IDU-00625-0-9 零食角' },
            { id: 'idu-141', label: 'IDU-00627-2-14华芯' },
            { id: 'idu-152', label: 'IDU-00627-2-15 林宏 Ti...' },
            { id: 'idu-162', label: 'IDU-00627-2-16 赣哥 朱钰' }
          ]
        }
      ],
      outdoorZones: [
        {
          id: 'vrf-1',
          name: 'VRF-00625-01',
          expanded: true,
          items: [
            { id: 'odu-129-a', label: 'ODU-00625-1-129' },
            { id: 'odu-130-a', label: 'ODU-00625-1-130' }
          ]
        },
        {
          id: 'vrf-2',
          name: 'VRF-00627-02',
          expanded: true,
          items: [
            { id: 'odu-129-b', label: 'ODU-00627-2-129' },
            { id: 'odu-130-b', label: 'ODU-00627-2-130' }
          ]
        }
      ],
      editableZoneGroups: [],
      indoorCards: [
        { id: 'c1', name: 'IDU-00627-2-20 Recoo-首尔', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' },
        { id: 'c2', name: '1号系统15', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' },
        { id: 'c3', name: 'IDU-00627-2-16 赣哥 朱钰', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' },
        { id: 'c4', name: 'IDU-00627-2-21财务隔壁', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' },
        { id: 'c5', name: '1号系统39', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' },
        { id: 'c6', name: '1号系统40', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' },
        { id: 'c7', name: 'IDU-00627-2-22 档案室-赵姐', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' },
        { id: 'c8', name: 'IDU-00627-2-14华芯', metricA: '-°C / 负 -°C', metricB: '-% / 负 -%', metricC: '', contract: '合约中', status: '离线', extra: '' }
      ],
      outdoorCards: [
        { id: 'o1', name: 'ODU-00627-2-129', metricA: '- 摄氏度', metricB: '', metricC: '', contract: '合约中', status: '离线', extra: '内机台数: 11', acPower: '147236.70kWh', dcPower: '-' },
        { id: 'o2', name: 'ODU-00627-2-130', metricA: '- 摄氏度', metricB: '', metricC: '', contract: '合约中', status: '离线', extra: '内机台数: 11', acPower: '147236.70kWh', dcPower: '-' }
      ],
      indoorEditCards: [
        { id: 'e1', name: 'IDU-00627-2-20 Recoo-首尔', currentTemp: '20°C', targetTemp: '29°C', contract: '合约中', status: '离线' },
        { id: 'e2', name: 'IDU-00627-2-21财务隔壁', currentTemp: '26°C', targetTemp: '29°C', contract: '合约中', status: '离线' },
        { id: 'e3', name: 'IDU-00627-2-1机房', currentTemp: '17°C', targetTemp: '28°C', contract: '合约中', status: '离线' },
        { id: 'e4', name: 'IDU-00625-0-9 零食角', currentTemp: '27°C', targetTemp: '27°C', contract: '合约中', status: '离线' },
        { id: 'e5', name: 'IDU-00625-0-10 零食角隔壁', currentTemp: '27°C', targetTemp: '28°C', contract: '合约中', status: '离线' },
        { id: 'e6', name: 'IDU-00625-0-12 慕尼黑', currentTemp: '28°C', targetTemp: '28°C', contract: '合约中', status: '离线' },
        { id: 'e7', name: 'IDU-00627-2-14华芯', currentTemp: '--°C', targetTemp: '28°C', contract: '合约中', status: '离线' },
        { id: 'e8', name: 'IDU-00627-2-15 林宏 Tim Jack', currentTemp: '22°C', targetTemp: '28°C', contract: '合约中', status: '离线' }
      ],
      indoorTableRows: [
        { id: 't1', code: 'IDU-00627-2-20', name: 'IDU-00627-2-20 Recoo-首尔', status: '离线', address: '20', system: '0000CC311178CCM...', attachment: 'v4/v4+内机', model: '--', mode: '制冷' },
        { id: 't2', code: 'IDU-00627-2-19', name: '1号系统15', status: '离线', address: '19', system: '0000CC311178CCM...', attachment: 'v4/v4+内机', model: '--', mode: '制热' }
      ],
      outdoorTableRows: [
        { id: 'ot1', code: 'ODU-00625-1-129', name: 'ODU-00625-1-129', status: '离线', address: '0000CC311178CCM...', system: '大多联', attachment: '--', model: '自动优先' },
        { id: 'ot2', code: 'ODU-00625-1-130', name: 'ODU-00625-1-130', status: '离线', address: '0000CC311178CCM...', system: '大多联', attachment: '--', model: '自动优先' },
        { id: 'ot3', code: 'ODU-00627-2-129', name: 'ODU-00627-2-129', status: '离线', address: '0000CC311178CCM...', system: '大多联', attachment: '--', model: '自动优先' },
        { id: 'ot4', code: 'ODU-00627-2-130', name: 'ODU-00627-2-130', status: '离线', address: '0000CC311178CCM...', system: '大多联', attachment: '--', model: '自动优先' }
      ]
    }
  },
  computed: {
    currentZoneGroups() {
      return this.activeMachineTab === 'indoor' ? this.indoorZones : this.outdoorZones
    },
    currentCards() {
      return this.activeMachineTab === 'indoor' ? this.indoorCards : this.outdoorCards
    },
    currentTableRows() {
      return this.activeMachineTab === 'indoor' ? this.indoorTableRows : this.outdoorTableRows
    },
    currentZoneCount() {
      return this.currentZoneGroups.reduce((sum, group) => sum + group.items.length, 0)
    },
    currentPaginationText() {
      return this.activeMachineTab === 'indoor' ? '第1-20条/共22条' : '第1-4条/共4条'
    }
  },
  methods: {
    switchMachineTab(tab) {
      this.activeMachineTab = tab
      this.viewMode = tab === 'indoor' ? 'card' : 'table'
      this.zoneEditMode = false
      this.showMoreMenu = false
      this.nodeMenuId = ''
    },
    selectZone(id) {
      this.selectedZone = id
    },
    enterZoneEditMode() {
      this.zoneEditMode = true
      this.showMoreMenu = false
      this.nodeMenuId = ''
      this.editableZoneGroups = []
      this.selectedEditZone = ''
    },
    exitZoneEditMode() {
      this.zoneEditMode = false
      this.showMoreMenu = false
      this.nodeMenuId = ''
    },
    toggleMoreMenu() {
      this.showMoreMenu = !this.showMoreMenu
      this.nodeMenuId = ''
    },
    toggleNodeMenu(id) {
      this.nodeMenuId = this.nodeMenuId === id ? '' : id
      this.showMoreMenu = false
    },
    createTopLevelZone() {
      const nextIndex = this.editableZoneGroups.length + 1
      const newZone = {
        id: `zone-${Date.now()}`,
        name: nextIndex === 1 ? '新节点8h1n' : `新建一级分区${nextIndex}`,
        count: 0
      }
      this.editableZoneGroups.push(newZone)
      this.selectedEditZone = newZone.id
    },
    createPeerZone(groupId) {
      const current = this.editableZoneGroups.find(item => item.id === groupId)
      if (!current) return
      this.editableZoneGroups.push({
        id: `zone-${Date.now()}`,
        name: `${current.name}-同级`,
        count: 0
      })
      this.nodeMenuId = ''
    },
    createChildZone(groupId) {
      const current = this.editableZoneGroups.find(item => item.id === groupId)
      if (!current) return
      this.editableZoneGroups.push({
        id: `zone-${Date.now()}`,
        name: `${current.name}-子级`,
        count: 0
      })
      this.nodeMenuId = ''
    },
    openImportDialog() {
      this.showImportDialog = true
      this.showGuideDialog = false
      this.showSmartNamingDialog = false
      this.showMoreMenu = false
    },
    openGuideDialog() {
      this.showGuideDialog = true
      this.showImportDialog = false
      this.showSmartNamingDialog = false
      this.showMoreMenu = false
    },
    openSmartNamingDialog() {
      this.showSmartNamingDialog = true
      this.showImportDialog = false
      this.showGuideDialog = false
      this.showMoreMenu = false
    },
    closeAllDialogs() {
      this.showImportDialog = false
      this.showGuideDialog = false
      this.showSmartNamingDialog = false
    },
    confirmSmartNaming() {
      this.showSmartNamingDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.device-page {
  min-height: calc(100vh - 84px);
  background: #fff;
}

.top-tabs {
  display: flex;
  border-bottom: 1px solid #edf0f5;
}

.top-tab {
  min-width: 112px;
  height: 40px;
  border: 0;
  background: #fff;
  color: #1f2d45;
  font-size: 15px;
  cursor: pointer;

  &.active {
    color: #2d63ff;
  }
}

.content-shell {
  display: flex;
  min-height: calc(100vh - 125px);
}

.sidebar {
  position: relative;
  width: 278px;
  border-right: 1px solid #edf0f5;
  background: #fff;
}

.sidebar.editing {
  width: 280px;
}

.machine-switch {
  display: flex;
  gap: 32px;
  padding: 0 0 0 2px;
}

.machine-tab {
  position: relative;
  padding: 12px 0;
  border: 0;
  background: transparent;
  color: #1f2d45;
  font-size: 15px;
  cursor: pointer;

  &.active {
    color: #2d63ff;
    font-weight: 600;
  }

  &.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: #2d63ff;
  }
}

.zone-panel,
.zone-edit-header {
  border-top: 1px solid #edf0f5;
}

.zone-header,
.zone-edit-header {
  padding: 18px 0 18px 2px;
  color: #16233d;
  font-size: 16px;
  font-weight: 700;
}

.zone-edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.more-link {
  border: 0;
  background: transparent;
  color: #2d63ff;
  font-size: 14px;
  cursor: pointer;
}

.zone-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 14px 2px;
  border-top: 1px solid #edf0f5;
  color: #182642;
  font-size: 16px;
  font-weight: 700;
}

.collapse-btn {
  border: 0;
  background: transparent;
  color: #6e7f9d;
  font-size: 22px;
  cursor: pointer;
}

.zone-tree,
.zone-edit-tree {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  padding-right: 12px;
}

.zone-group-title,
.zone-item {
  color: #1e2f4d;
  cursor: pointer;
}

.zone-group-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 10px 8px;
  font-size: 15px;
  font-weight: 600;
}

.zone-group-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zone-items {
  padding-left: 28px;
}

.zone-item {
  padding: 8px 0;
  font-size: 14px;
}

.zone-group-title.active,
.zone-item.active {
  color: #1d57ea;
}

.editable-zone-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 14px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #eaf3ff;
}

.editable-zone-item.active {
  background: #deebff;
}

.editable-zone-name {
  color: #1e2f4d;
  font-size: 14px;
  font-weight: 600;
}

.editable-zone-actions {
  display: flex;
  gap: 10px;
}

.icon-btn {
  border: 0;
  background: transparent;
  color: #55647e;
  font-size: 14px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  z-index: 10;
  min-width: 86px;
  padding: 8px 0;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(25, 46, 86, 0.18);
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: 0;
  background: transparent;
  color: #17253f;
  text-align: left;
  cursor: pointer;
}

.more-menu {
  top: 48px;
  right: 0;
}

.node-menu {
  top: 34px;
  right: 34px;
}

.empty-zone-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  color: #1e2f4d;
  font-size: 15px;
}

.text-link {
  margin-top: 8px;
  border: 0;
  background: transparent;
  color: #2d63ff;
  font-size: 16px;
  cursor: pointer;
}

.edit-zone-btn,
.create-zone-btn {
  width: 112px;
  height: 32px;
  margin: 18px 0 0 60px;
  border: 0;
  border-radius: 4px;
  background: #2d63ff;
  color: #fff;
  cursor: pointer;
}

.edit-zone-btn {
  width: 92px;
  margin-left: 74px;
  background: #e8f1ff;
  color: #2d63ff;
}

.plus-badge {
  display: inline-flex;
  width: 14px;
  height: 14px;
  margin-right: 6px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.main-panel {
  flex: 1;
  padding: 0 18px 18px;
}

.toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}

.edit-mode-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e2f4d;
  font-size: 15px;
  font-weight: 700;
}

.mode-text {
  font-weight: 600;
}

.toolbar-view-switch {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.exit-btn {
  min-width: 62px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  background: #2d63ff;
  color: #fff;
  cursor: pointer;
}

.view-btn {
  border: 0;
  background: transparent;
  color: #7b8ba8;
  font-size: 22px;
  cursor: pointer;

  &.active {
    color: #2d63ff;
  }
}

.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.filter-row {
  display: grid;
  grid-template-columns: 1.45fr 1fr 1fr auto;
  gap: 14px;
  align-items: center;
}

.search-combo,
.fake-select {
  height: 34px;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  background: #fff;
}

.search-combo {
  display: grid;
  grid-template-columns: 112px 1fr 36px;
  overflow: hidden;
}

.combo-label {
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-right: 1px solid #9fb5dc;
  color: #17253f;
  font-size: 14px;
}

.combo-input,
.rename-input {
  border: 0;
  outline: none;
  padding: 0 14px;
  color: #17253f;
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7b8ba8;
  font-size: 18px;
}

.filter-box {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.filter-label {
  color: #17253f;
  font-size: 14px;
}

.fake-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  color: #6f7d97;
  font-size: 14px;
}

.expand-link {
  justify-self: end;
  border: 0;
  background: transparent;
  color: #2d63ff;
  font-size: 14px;
  cursor: pointer;
}

.action-row,
.edit-top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 18px 0 20px;
}

.check-all {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e2f4d;
  font-size: 14px;
}

.actions,
.edit-mode-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  min-width: 72px;
  height: 32px;
  border: 0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &.secondary {
    background: #e9f1ff;
    color: #2d63ff;
  }

  &.primary {
    background: #2d63ff;
    color: #fff;
  }

  &.wide {
    padding: 0 14px;
  }
}

.edit-layout {
  display: flex;
  gap: 16px;
}

.edit-transfer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.transfer-btn {
  width: 56px;
  height: 52px;
  border: 1px solid #dbe4f2;
  border-radius: 4px;
  background: #fff;
  color: #9aabc6;
}

.transfer-btn.active {
  background: #2d63ff;
  color: #fff;
}

.transfer-btn.disabled {
  color: #b6c2d8;
}

.edit-card-grid,
.card-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.device-card {
  border: 1px solid #e4e9f2;
  border-radius: 4px;
  background: #fff;
  padding: 12px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title-row.with-check {
  align-items: flex-start;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.card-icon {
  color: #c7d3e8;
  font-size: 18px;
}

.card-title {
  color: #7f94bb;
  font-size: 15px;
}

.rename-input {
  width: 260px;
  height: 30px;
  border: 1px solid #dce4f1;
  border-radius: 4px;
  padding: 0 10px;
}

.outdoor-power {
  margin-bottom: 8px;
  color: #7f94bb;
  font-size: 13px;
  line-height: 1.45;
}

.card-body {
  padding: 12px 10px 10px;
  background: #f8f9fb;
  border-radius: 4px;
}

.card-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #8b9ab7;
  font-size: 13px;
}

.temperature-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #34445f;
}

.temperature-row strong {
  font-size: 18px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.card-tags,
.card-extra {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7f94bb;
  font-size: 13px;
}

.table-shell {
  border: 1px solid #eef2f7;
  border-bottom: 0;
}

.device-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 18px 20px;
    text-align: left;
    border-bottom: 1px solid #f0f3f8;
    color: #c7cedb;
    font-size: 14px;
    font-weight: 400;
  }

  th {
    background: #fbfbfc;
    color: #30415e;
  }
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 50%;
  background: #d9d9d9;
}

.operate-links a {
  margin-right: 12px;
  color: #2d63ff;
  text-decoration: none;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 0;
  color: #1d2a44;
}

.pagination-controls {
  display: flex;
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

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 30, 54, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 520px;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(13, 30, 63, 0.2);
}

.guide-modal {
  width: 540px;
}

.confirm-modal {
  width: 480px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  color: #14253f;
  font-size: 16px;
  font-weight: 700;
}

.modal-header span {
  position: relative;
  padding-left: 10px;
}

.modal-header span::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  width: 4px;
  height: 18px;
  border-radius: 4px;
  background: #2d63ff;
}

.close-btn {
  border: 0;
  background: transparent;
  color: #8999b5;
  font-size: 28px;
  cursor: pointer;
}

.modal-content {
  padding: 12px 20px 26px;
  color: #33435f;
  font-size: 14px;
  line-height: 1.8;
}

.modal-content a {
  color: #2d63ff;
  text-decoration: none;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

.required {
  color: #ff4d4f;
}

.upload-btn,
.guide-btn,
.ghost-btn,
.solid-btn {
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.upload-btn {
  width: 108px;
  height: 30px;
  background: #f5f8ff;
  color: #2d63ff;
}

.guide-content {
  padding-top: 0;
}

.guide-section {
  margin-bottom: 18px;
}

.guide-title {
  margin-bottom: 10px;
  color: #1d2a44;
  font-size: 15px;
  font-weight: 700;
}

.guide-action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.guide-btn {
  min-width: 92px;
  height: 34px;
  padding: 0 16px;
  background: #2d63ff;
  color: #fff;
}

.guide-btn.light {
  background: #edf2ff;
  color: #2d63ff;
}

.sub-tip {
  color: #6e7f9d;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 24px;
}

.ghost-btn,
.solid-btn {
  min-width: 106px;
  height: 34px;
}

.ghost-btn {
  background: #edf2ff;
  color: #2d63ff;
}

.solid-btn {
  background: #2d63ff;
  color: #fff;
}

@media (max-width: 1600px) {
  .card-grid,
  .edit-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .content-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid #edf0f5;
  }

  .card-grid,
  .edit-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .card-grid,
  .edit-card-grid {
    grid-template-columns: 1fr;
  }

  .edit-layout {
    flex-direction: column;
  }

  .device-table {
    display: block;
    overflow-x: auto;
  }

  .modal-card,
  .guide-modal,
  .confirm-modal {
    width: calc(100vw - 24px);
  }
}
</style>
