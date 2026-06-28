<template>
  <div class="device-page">
    <div class="top-tabs">
      <button v-for="tab in topTabs" :key="tab.key" type="button"
        :class="['top-tab', { active: activeTopTab === tab.key }]" @click="handleTopTabChange(tab.key)">
        {{ tab.label }}
      </button>
    </div>

    <template v-if="activeTopTab === 'management'">
      <div :class="['content-shell', { 'sidebar-collapsed': sidebarCollapsed }]">
        <aside :class="[
          'sidebar',
          { editing: zoneEditMode, collapsed: sidebarCollapsed },
        ]">
          <div class="machine-switch">
            <button v-for="tab in machineTabs" :key="tab.key" type="button"
              :class="['machine-tab', { active: activeMachineTab === tab.key }]" @click="switchMachineTab(tab.key)">
              {{ tab.label }}
            </button>
            <span />
          </div>

          <template v-if="zoneEditMode && activeMachineTab === 'indoor'">
            <div class="zone-edit-header">
              <span class="zone-edit-title">设备分区</span>
              <button type="button" class="more-link" @click.stop="toggleMoreMenu">
                更多操作
              </button>
              <div v-if="showMoreMenu" class="dropdown-menu more-menu">
                <button type="button" @click="openImportDialog">导入</button>
                <button type="button">导出</button>
                <button type="button" @click="openGuideDialog">操作指引</button>
                <button type="button" @click="openSmartNamingDialog">
                  智能命名
                </button>
              </div>
            </div>

            <div class="zone-edit-tree">
              <el-tree :data="zoneTreeData" :props="{ children: 'children', label: 'label' }" :highlight-current="true"
                :expand-on-click-node="false" @node-click="handleZoneNodeClick">
                <span slot-scope="{ node, data }" class="custom-tree-node">
                  <span :class="[
                    'editable-zone-name',
                    { active: selectedEditZone === data.id },
                  ]">{{ node.label }}</span>
                  <span class="editable-zone-actions">
                    <button type="button" class="icon-btn" @click.stop="toggleNodeMenu(data.id)">
                      +
                    </button>
                    <button type="button" class="icon-btn" @click.stop>
                      ✎
                    </button>
                    <button type="button" class="icon-btn" @click.stop>
                      🗑
                    </button>
                  </span>
                </span>
              </el-tree>
            </div>

            <div v-if="!editableZoneGroups.length" class="empty-zone-tip">
              <div>暂无分区</div>
              <button type="button" class="text-link" @click="openImportDialog">
                请 添加/导入
              </button>
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
              </div>

              <div class="zone-tree">
                <el-tree :data="currentZoneTreeData" :props="zoneTreeProps" node-key="id" :highlight-current="true"
                  :expand-on-click-node="false" :default-expanded-keys="defaultExpandedZoneKeys"
                  @node-click="handleCurrentZoneNodeClick" @node-expand="handleCurrentZoneNodeExpand"
                  @node-collapse="handleCurrentZoneNodeCollapse">
                  <span slot-scope="{ node, data }" :class="[
                    'zone-tree-node',
                    data.type,
                    { active: selectedZone === data.id },
                  ]">
                    <span class="zone-tree-content">
                      <input v-if="showBatchControl" type="checkbox" :checked="isCurrentZoneNodeSelected(data)"
                        @click.stop="toggleCurrentZoneNodeSelect(data)" />
                      <input v-if="isEditingOutdoorZoneNode(data)" ref="outdoorZoneEditInput"
                        class="zone-tree-edit-input" type="text" v-model="outdoorZoneEditValue" @click.stop
                        @keydown.enter.stop.prevent="
                          saveOutdoorZoneNodeEdit(data)
                          " @keydown.esc.stop.prevent="cancelOutdoorZoneNodeEdit" />
                      <span v-else class="zone-tree-label">{{
                        node.label
                      }}</span>
                    </span>
                    <button v-if="isEditingOutdoorZoneNode(data)" type="button" class="zone-tree-confirm-btn" title="确认"
                      @click.stop="saveOutdoorZoneNodeEdit(data)">
                      确认
                    </button>
                    <button v-if="
                      activeMachineTab === 'outdoor' &&
                      ['group', 'item'].includes(data.type) &&
                      !isEditingOutdoorZoneNode(data)
                    " type="button" class="zone-tree-edit-btn" title="编辑" @click.stop="editOutdoorZoneNode(data)"
                      @mousedown.prevent>
                      <i class="el-icon-edit"></i>
                    </button>
                  </span>
                </el-tree>
              </div>
              <button v-if="activeMachineTab === 'indoor'" type="button" class="edit-zone-btn"
                @click="enterZoneEditMode">
                编辑分区
              </button>
            </div>
          </template>
        </aside>

        <button type="button" class="collapse-btn" @click="toggleSidebar">
          {{ sidebarCollapsed ? "»" : "«" }}
        </button>

        <main class="main-panel">
          <div class="toolbar-header">
            <div v-if="zoneEditMode" class="edit-mode-title">
              <span>未分区设备（0）</span>
              <span class="mode-text">拓扑模式</span>
            </div>

            <button v-if="zoneEditMode" type="button" class="exit-btn" @click="exitZoneEditMode">
              退出
            </button>

            <div v-else class="toolbar-view-switch">
              <button type="button" :class="['view-btn', { active: viewMode === 'card' }]" @click="viewMode = 'card'">
                <i class="el-icon-s-grid"></i>
              </button>
              <button type="button" :class="['view-btn', { active: viewMode === 'table' }]" @click="viewMode = 'table'">
                <i class="el-icon-s-unfold"></i>
              </button>
            </div>
          </div>

          <div class="filter-panel">
            <div class="filter-row">
              <div class="search-combo">
                <div class="combo-select" @click="showSearchDropdown = !showSearchDropdown">
                  <span>{{ currentSearchField }}</span>
                  <i class="el-icon-arrow-down"></i>
                  <div class="combo-dropdown" v-if="showSearchDropdown">
                    <div v-for="item in searchFieldOptions" :key="item.value" class="dropdown-item"
                      @click.stop="selectSearchField(item)">
                      {{ item.label }}
                    </div>
                  </div>
                </div>
                <!-- 室内机条码使用下拉框 -->
                <el-select v-if="currentSearchField === '室内机条码'" v-model="filters.keyword" placeholder="" filterable
                  clearable size="small" class="indoor-barcode-select">
                  <el-option v-for="item in indoorBarcodeOptions" :key="item" :label="item" :value="item">
                  </el-option>
                </el-select>
                <!-- 室外机条码使用下拉框 -->
                <el-select v-if="currentSearchField === '室外机条码'" v-model="filters.keyword" placeholder="" filterable
                  clearable size="small" class="outdoor-barcode-select">
                  <el-option v-for="item in outdoorBarcodeOptions" :key="item" :label="item" :value="item">
                  </el-option>
                </el-select>
                <!-- 其他字段使用输入框 -->
                <input v-if="
                  currentSearchField !== '室内机条码' &&
                  currentSearchField !== '室外机条码'
                " v-model="filters.keyword" type="text" class="combo-input" :placeholder="`请输入${currentSearchField}`"
                  @input="handleSearchInput" />
                <i v-if="
                  currentSearchField !== '室内机条码' &&
                  currentSearchField !== '室外机条码'
                " class="el-icon-search search-icon" @click="handleSearch"></i>

                <div v-if="showSuggestions && suggestions.length > 0" class="suggestion-list">
                  <div v-for="(item, index) in suggestions" :key="index" class="suggestion-item"
                    @click="selectSuggestion(item)">
                    {{ item }}
                  </div>
                </div>
              </div>

              <div class="filter-box">
                <span class="filter-label">{{
                  activeMachineTab === "indoor" ? "所属系统" : "所属系统"
                }}</span>

                <el-select v-model="system" multiple collapse-tags size="small" class="system-select" placeholder="请选择">
                  <el-option v-for="item in systemOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <div class="filter-box">
                <span class="filter-label">{{
                  activeMachineTab === "indoor" ? "实时状态" : "运行状态"
                }}</span>
                <el-cascader v-if="activeMachineTab === 'indoor'" :options="indoorOptions" :props="props"
                  @change="handleCascaderChange" size="small" class="status-cascader" collapse-tags placeholder="请选择"
                  clearable></el-cascader>
                <el-select v-else v-model="filters.runningStatus" placeholder="请选择" size="small" class="status-select"
                  collapse-tags clearable>
                  <el-option v-for="item in runningOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>

              <button type="button" class="expand-link" @click="expandedFilters = !expandedFilters">
                {{ expandedFilters ? "收起" : "展开" }}
                <i :class="expandedFilters ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
                  "></i>
              </button>
            </div>

            <div v-if="expandedFilters" class="filter-row expanded-row">
              <!-- 室内机筛选条件 -->
              <div v-if="activeMachineTab === 'indoor'" class="filter-box">
                <span class="filter-label">锁定状态</span>
                <el-select v-model="filters.lockStatus" placeholder="请选择" size="small"
                  class="expanded-select lock-status-select">
                  <el-option v-for="item in lockStatusOptions" :key="item.value" :label="item.label"
                    :value="item.value"></el-option>
                </el-select>
              </div>

              <div v-if="activeMachineTab === 'indoor'" class="filter-box">
                <span class="filter-label">合约状态</span>
                <el-select v-model="filters.contractStatus" placeholder="请选择" size="small"
                  class="expanded-select contract-status-select">
                  <el-option v-for="item in contractStatusOptions" :key="item.value" :label="item.label"
                    :value="item.value"></el-option>
                </el-select>
              </div>

              <div v-if="activeMachineTab === 'indoor'" class="filter-box">
                <span class="filter-label">设备机型</span>
                <el-select v-model="filters.indoorModel" placeholder="请选择" size="small"
                  class="expanded-select indoor-model-select">
                  <el-option v-for="item in indoorModelOptions" :key="item.value" :label="item.label"
                    :value="item.value"></el-option>
                </el-select>
              </div>
            </div>

            <!-- 室外机展开筛选条件 -->
            <div v-if="expandedFilters && activeMachineTab === 'outdoor'" class="outdoor-filter-rows">
              <div class="filter-row">
                <div class="filter-box">
                  <span class="filter-label">静音模式</span>
                  <el-select v-model="filters.outdoorMuteMode" placeholder="请选择" size="small"
                    class="expanded-select mute-mode-select">
                    <el-option label="静音" value="mute"></el-option>
                    <el-option label="静音停止" value="muteStop"></el-option>
                  </el-select>
                </div>
                <div class="filter-box">
                  <span class="filter-label">合约状态</span>
                  <el-select v-model="filters.outdoorContractStatus" placeholder="请选择" size="small"
                    class="expanded-select contract-status-select">
                    <el-option label="合约中" value="contract"></el-option>
                    <el-option label="试用中" value="trial"></el-option>
                    <el-option label="未启用" value="disabled"></el-option>
                    <el-option label="已过期" value="expired"></el-option>
                  </el-select>
                </div>
                <div class="filter-box">
                  <span class="filter-label">设备机型</span>
                  <el-select v-model="filters.outdoorDeviceModel" placeholder="请选择" size="small"
                    class="expanded-select device-model-select">
                    <el-option label="大多联" value="largeMulti"></el-option>
                    <el-option label="小多联" value="smallMulti"></el-option>
                    <el-option label="其他" value="other"></el-option>
                  </el-select>
                </div>
              </div>
              <div class="filter-row">
                <div class="filter-box">
                  <span class="filter-label">模式优先</span>
                  <el-select v-model="filters.modePriority" placeholder="请选择" size="small"
                    class="expanded-select mode-priority-select">
                    <el-option label="自动优先" value="autoPriority"></el-option>
                    <el-option label="制冷优先" value="coolPriority"></el-option>
                    <el-option label="制热优先" value="heatPriority"></el-option>
                    <el-option label="能需优先" value="energyPriority"></el-option>
                    <el-option label="先开优先" value="firstOpenPriority"></el-option>
                    <el-option label="只制热" value="heatOnly"></el-option>
                    <el-option label="只制冷" value="coolOnly"></el-option>
                    <el-option label="ChangeOver" value="changeOver"></el-option>
                    <el-option label="多开优先" value="multiOpenPriority"></el-option>
                  </el-select>
                </div>
                <div class="filter-box">
                  <span class="filter-label">分户计费状态</span>
                  <el-select v-model="filters.billingStatus" placeholder="请选择" size="small"
                    class="expanded-select billing-status-select">
                    <el-option label="已开通" value="activated"></el-option>
                    <el-option label="未开通" value="notActivated"></el-option>
                  </el-select>
                </div>
                <div class="filter-box">
                  <span class="filter-label">光伏类型</span>
                  <el-select v-model="filters.pvType" placeholder="请选择" size="small"
                    class="expanded-select pv-type-select">
                    <el-option label="光混" value="pvHybrid"></el-option>
                    <el-option label="光储" value="pvStorage"></el-option>
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <div v-if="zoneEditMode" class="edit-top-actions">
            <label class="check-all">
              <input class="check-all-checkbox" type="checkbox" />
              全选（0/22）
            </label>

            <div class="edit-mode-actions">
              <button type="button" class="action-btn secondary" @click="refreshData">
                刷新
              </button>
              <button type="button" class="action-btn primary">批量删除</button>
              <button type="button" class="action-btn secondary">
                批量重命名
              </button>
            </div>
          </div>

          <div v-else class="action-row">
            <div class="action-spacer"></div>
            <div class="actions">
              <button v-if="activeMachineTab === 'indoor' && viewMode === 'card'" type="button"
                class="action-btn secondary" @click.stop="openSortDialog">
                排序配置
              </button>
              <button type="button" class="action-btn secondary" @click="resetFilters">
                重置筛选
              </button>
              <button type="button" class="action-btn secondary" @click="refreshData">
                刷新
              </button>
              <button v-if="activeMachineTab === 'outdoor'" type="button" placeholder="请选择" class="action-btn primary"
                @click="openBatchDelete">
                批量删除
              </button>
              <button type="button" class="action-btn primary" @click="openBatchControl">
                批量控制
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
                    <img src="https://static-btri.midea.com/mfs/2676/1723456813979.png" alt="indoor-icon" />
                  </div>
                  <input :value="item.name" class="rename-input" />
                  <input type="checkbox" class="rename-checkbox" />
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
                    <div class="card-extra">
                      <img
                        src="https://static-btri.midea.com/fe-apps/daily/btri-dcc/image/mdv-device-card/noSignal.svg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="viewMode === 'card'" class="card-grid">
            <div v-for="item in currentCards" :key="item.id" class="device-card" :class="{
              active: selectedDevice && selectedDevice.id === item.id,
            }" @click="openDeviceDetail(item)">
              <div class="card-title-row">
                <div class="card-title-wrap">
                  <span class="card-icon">
                    <img v-if="activeMachineTab === 'outdoor'"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA4CAYAAAC2TwutAAAAAXNSR0IArs4c6QAAGztJREFUaEPdemmUXdV15nfOHd9Ub655kmpQlebJZgoY7NgOdjskaUtgBtvdvRrWSlbHIGObbnc6rCyDJdvYxG0ngdXLNo4xAYzNHCdGkRBoAASSJZDEIAnNIzWoXr13p3NO9z73vlIJO72yOt1/+mlJpXrvvnvPd/be3/723ofh/9MXS3CxOzdsMN7b3TCGBocwdupo8n4/WjInmtfg3LjNehZkjZXthZQSpuV5HvO5x1IApFTK9xnjPP5L93Wc5L0UY5wxJpVSsqEUfUa/N6+LLCkdpZRP7zHGCq4L23EkkEIq5TIGj/k+mJSedBxHer6XrCkF+qzRUMp2lJyeVsqKTp1ZsGBBoC+448FdRWWnRx3Tz3OfGzAAKaRh2AAX3JAmGBPS4Mxk2YzbMtxd6MmnzYLnhWbEpKFCxYJIStPkzGDcYEoazOAKkIoJcGZyA1Ka4DwSSgoNTHFOT+IQTMAIpJSKKXDT4twyDcY5Dx3TlLZtmlIIg4NxX6qAKRUJgHEoBgUmAB5GCIWSURhE0Zy8/NbczuIhDey+xzZ9kpnOn7mGmqcgOVNgiulNZZwBBuP0D1NSsmzK5fMHu6zutjJTQkEqCSEVIilhcP0s0L/nX/QIBTAGU3+mbwjGGDgAw2CAUvBCAdsyYNEDAYjkFvRx80XvSSgoqT0EStHz6dkKYRAhCAVCIT7S3174J/21+3++6TrLsv/CMeSQSpZGC+CcFqC3FZxzfRPXsjC3rx1drUUNSi+UXgwwGUMgBGSyKHLI+NMECNMuCJ6Ao0Uz2nulIISAY5mEEaGkzZKQErBNA5zHQCIh9b0lfUabJRNgQiEIY2BRFH5kpL89BvaTp7d+TjJ2J1NRP1MAJ8ODwTA4TNOAaZhke5CFTINhoK8DHdUYmDaOvguDyRnCSEA230q2WtC9yG5kNdosfTnT9zIZICT9ldpi2lpCQagYmGVyvRkEJiQrzbIU7YK2WBNYIBCJWcB++vdbblGK/TcpRCfdhPyPrMUNAybnMOmnYehdot/n9FTRVS3ph4jE7fRGELDEYrR48qqaYNhwjKHVZZgIgdECECjoa+fmANdkoKgLlYRjcg1YCglBi5bQ4GlNioApxMAQA6L/N4GFYYhAA4vOW+zvfrnlC2HE/oxJUSZQ5P/kRgaBMk0NyjANvdPklnN62tFZLei4ar5+Axh9H8DZkOGvdnHUQqCvBSi6ALHHygrDSBFwjNgaQgC2pbcjAREvnCxGiyFgxBrkIhqUBh6DjCKJIIoQvh/Yw89u/kqo2FeVEDmKJUKgLcZ47I6Jxeh9etCc7nZ0VgqIyBWb+aJpsUjoONFhlAB78l1aMEPKAKYivU78fj/QlaL/M0Sa3iRM7YrngZKr200r6jjUsM67I3kMU5Chgh9FiCjGZlvs4Wde+PNI8v8ilbDJ/YitKGLJlTQnEzge+z8BG+glixUvAHZBjMUkqO8zHXHsG5dgoYfTHkPKNtGSNjG/yJG14l2hGNMgrNgryA1FFDOuYxra2SP6RxGomBk1cUBpRqaYJIv9JrCnN90Vgt+hhODcNDUgYgv6SaxF1jMNYkWmHzTY34H2akHv3CyT6etEFDNXwg/anafqdbz59lG4jolKKY9qKQfTsuPojJFo17JsE4xASSCSQt/ftEy9QfSeImAUZwlp6Q1I2DOIQoQBsemsGHvoqY13RzD+M33LMExKWZT+9DN1zNEfg/xcwXUsDPd3ob1S0Itpro0upmuFiF2liYwCPxQRzo5NaZd2UzayjgNOLpZcJpQgM8A2TUh6KAGj90QCNs6E2hW1vWZZjlIAPZNckazMWPjhwe6ODTHdP77hDsmN/6qEymiPS6ykc06TTLTvK7iuheE53WivFCmhxGujndObEgOLg3oGst4oiiXaLLr2vKXJnbRXQUSRJiiKce30SXr0QwEvJDeL4mvJ/UKFUEjKWQgjiSxZmrzKsk8aPPyj0f7urfrr33/w6auEcu5WUePi8WkPU4GAbZso5TKwOYkeIOc6cE0DmYyD4f5utJXyCJSAoGxPyTOIdFxRbMZrit2LXJmUiAZFlk+IJflVbwBXDLIpdwymlQ65MF3z7Cv7sOfgcfhhnJQJIIkAPwzhez5kw8cnLluAjnIBTqF6r2sG3/7QosEj+v7ffezX3dKf/GY0fea6rfsO4tV3z4K7KQy0FhAFHmqhwiUjfRjtKKKQy2J4oBulfE4HNzEnBQFFApGMVhsUnJToNb3GeUhLKB2zTY0Ufy8xubYqfV9LpkghVBRjwF1/txEvvr4fUDFbR8S6FH+KIwg8IPDxx79/KZYM9SJyi1/K29EDy4c6zuinfO+x1/qYrH+D+edWv/D6AWx48xiyhTzaUxZOjJ+Dsl1c84ERLGzLwTINLF04iN6O1nj3jZjW6am08IDcM8lvsxXjjG/FtpyJL03gMsZo2AaYZNDaRSitdtb9bDO273kXYRTqsKg1IhgqRKAMBF4dTET4wqc/hKHuDvgse0fGYD+8bEn7aQ3sW4+91pchYOG51dv2Hcbmd46jXC7BkRH2nx5HNp/Hp1YMY7SS0RZZvngeejqrsbY9z4uxntTK40JIs5kz8dJZ3yLGU9qqOo9pJleQQoFzhbUPP49tew6h5oVwLI56EIFTTDMLUeADoYc1n74C8/s74RvpO/Jl/GB5xyyLmcr7BgunVh8+PY6DEzWknJR2w8NjNTiug0uHe9GVs/XOLl8yjJ6OClRCnTrvaQnFIaTQ5DH7NeN9F7yreWQGCLkoeQPVLloqSaoTgG888jy27DmERhDqZF3zJQx6hsF1XCOoYc2qqzDU04HQzN5RrM4C9p2HtvanLLWOLPbyvoN47fBZOOkM5lRy2gKk0T4wrx+tbqz0ly6eh952AtZkgjg3WIwjEJGm6xlt/D4wTRPHRo03QLMkZwndE0XG+Yli9JuPbsTW3e/Aj4SOwWmPLBZBMpMEL5jXwH/6t1disKcVgV38SmuW/3Amxr7zi639LcA66U+ufu7VvVi/5104mTx6iymcHTsH37Dwh5csxpLOvI6jJQuG0NfZGsfKBa5oaIvNUlrvh5X8Put7ugxRYAZgGaa2GIli0o/knt98eD1e3LUfHql/ThaLwKVApAwIFSKaPoc1qz6CkTld4G7xKy1V/PC8Kz6zuc/22TfgT67e8sZ+bNx3GC25AjKGxIHTxJBZXHPRQqzsLmnGW76QXJFijOj8fM6hz0iZ/3MhNhtlrCDid3QOBGASeWiDSV0icYNh7U/XY9Ou/QgkqR6OGqWVKII0DJ3Dwsmz+MIfXYFlIwMwU6Uvt1Xkj4ZmYuyZ1/r4dG2dEUxde/TsJPaP1ZBKOYiCAAdOTSAyLCzurmBeNYtCLoMVC4fR2VGexWxxjcVNBkH5pumHsYdd4JZNDzxv7SS5Uz2nJVUMjPQf1W7rHlqP53/9DiJFrspR8wQMGSBiJpSIEJwbx62rPoxlowNQVsuFwP7HM6/1Ka+xTnmT17517BTeHZ8Gt120taQhIgFPAV2FLNpzLkotWYwM9qKrtayTblLJa7Np5aG1YrPUbCKczZ2zYitxZYonSuRaBCsWF5kaGLDu4Y3YuGMvhNapBCyCIUNEoDaKQDg9ga9cfzUWz+tHYGS/nC7KH824IgGzRLQunB67dsOON7DxjSNAKo3RzhJYFGJKMCya04l5bUV0lPMYTYDFZUCzgI4LzRjYeZOdT8gXhluTPCghUzzRXRzT1AmN3JDUjM0ZvvmzF/CPr+6FCkLtqnU/BCN5ZRpazYfTY/jqTZ/CitEBNHjqQmCUoLOOWovG2HXPvfI6frnzLaRzBXTmbBw/M4YaTCzsacOi7jIWDfXiokXz0Nlail0saWyQCzGSX1JoRtMfki4kQaV/NnnjfZST5C26xqQ2gC6XtAiDzQ186+cv4tmX30QU+rANjnqoYAkfoWlrsLI+hi/f8AmsXDCEgLtfcgvygfMWe+y1PtuO1kpv8rodbx3C9oMnkclmofwG9h4+jtBMY7CtRUuqJcP9uHzZfFQrcc9DN1aSbpVuzOi9jwuypmokKyT9Ka0mYp0Yl0UzCZskVay59KZQdU4dq2/9fDOe2/6mzqlUHXhRACMMIUwLwg/AvCnceu3HsXhkDkIz96WciwslVcaI1ip/4rq3jpzAwbPnkEpn4BrAmXN1+P8rn2Sg0OIYWDTch99ZPh+t5XxcomupkLik7pfEIDSwJDM3F6wJNHlPC/3EjymPkfAl8iE3JFCk3kk/fufnL+C57XsReA0YzIAnIhiRj4g7EJEP5k3jC9d+HPMH+2AYxS/l8r8BLFgrvYnrXty5F6/sPwErk8VoVxUWU2gIIGVx2JDaFS9bPh9t1aLuT9DDqZtgcEPnIjkTY7FlEnExY5mmS55XJ3FfkJqZjmVp99VNm0joDtm3f7YJz72yG1P1EIbJ4GlX9BBwB0oGMOpTuO2638OCgR6Y6crtuQx+PJOg73vyjV5HTa31p8c+s37bTqzf9Q6cbAH9lQzOvjeOiYhjqLOE4bYSls2bg4uXjaKttayr3WbjhyxkcVIecSE4i1aa3bm4bPktKZtYkPrGtmPp4izSWlFqiXXPIxvwD6/swXQjJg8/kDCiaQiDukIBTG8SN37sEqxcOA92ofv2Sm4WsAeefKM3CsbWht7kZ3a8eQDPv34QqUwWjgrx9pFTiJyUBjW/q4ylowO4dNko2qn9lrhWzB/UPjB0+02r+9jvEtZs9hJj37sAnO4rSp2/HDtumFLsUq+QyOK7P3se67fvxlTDh2GauuNrhtMITBeIAlhhHf/hDz6K+UN9cHLV2/Ntxo9nyIMsFtVOrhXe5GfOTkxhrBEhnUnpQm7fkdN4b9pDweEYaCtg4WA/Vi4aRlu1NGOtZkzRDkekCsiSszrEzc+bgGK8M21ire7J+rZN6r7ZHCXy4PjLxzbiV9t24pxHIthGgyrtoAFhZyD9Brg3hT9Z9TEsGx2Enavc3l7Bj2eUxwNPbu/1apPrfG/yulf3vI1dh87AyeYwr7sVhYwNoTjaSjlUc2lk0y76qP3WnpQtSfFIi7VoR6NoRio1AWh31VgSCyYWjrExbTFyX2pxa4lFZT/1FMlij2/CM5t3YdqPtDLxAgEeTENYachGDaxRw5+u/hhWLhiE01L5YmuZ/e0MsPue3N7LGrW1QWP8Mxtf2oVNew6COVkMd5QQBnVMeApLh3qxuL+KtkoJQ/29aG8tx6yXsCARSAyMqtuk45FUzjMWSuJL90ASrifQuvMrqXdvaTVDBET9e+rbf++JzXh66y7U6gEsy0AjlDDDBoST0oxoeFO4+ZoPYeWiUaRb2r5YKcsLgcE793XRmLz+n7bt0uTRki+iI2fh6Jlx1JWJeV0VLOytYv7cfl2PtVfLSRjFXWNdT1lmXLonykPjjnt5F8QVXUs9DdoUynWUC6ndRl0q2hLKi0T5pBW/99RW/P2mV3VlTu1wXzAov4aQ24DvAdMT+HfXfARXXLwEplv4YsVhfzvUbA3c+8j2Xjuc/DrC2vWHTp7GWyfGwQwDE++dxc79R6HsNAYqeYyS8hiZi4uWjqJaLelFNd0sroCbwEj7JX2OpH1HxtItjuR9ym16RkDAFLWoaYwUuyIBIxKiGPvu01vw+IZXIUWoPcSn3B8GiCwHyveBc2dxyx9chasuXgGVzq/JBuwny5cnFfS9D2zvtdnk10U0cf3ut97F4bEplItlFLMOphohxj0f8OtocS0sHJyDi5aNoFqJSxg9O4snlLrhSeRBbN+0YjNRa8s1r9UzAAJGeTBW834gtMV1K0/38qn+MvDfn30Zj27cjsD3YCgBDxZMEsGWCxb4YJOnccs1l+PKi1fCzBTXpC8E9qteg4mvR96561/Y8QZe2ncYVqoFw11lOIZOMGixDX3j0bn9+ODSEbS3VTT7NbUdWchxrLj/RyyXjIto8bRYPb8KAriOoxNvs0Wn512Kmk2BBhs3UsmKlLAN3P+PO/Do8zsgggYsknDcgo0IoeJaoGPiFP7wqhX48GUfRKHYtaaSYT8574r3/arXTEV3e1NjN2zYvhub9xxCKldCV8HG5NQU6nAxp5pFXyWLhUNz8YElo2gli9FkMnFH6sgSq0WCRHCsN5qRRUzZqHvaMvlcFinXiSeZoBorbpLGbbt40kLWoiGeZTJ875mX8cwLryKkIbSIIAwTXFApFQ8MMX4Mn736cly0bDGqbd23VdPGgxcAU6Z3twqmbnjj4DFs23cI3HRgRB4OnRoDT+cwt5zBYEcJi4bnYMXiUVR0izuprVRcixk00NAzNaa7upSwabHaWROm1KRhULzFCyNL6+4xlJZlRPu6Mo4iXZ/91RNb8PgLO1CneBLUdnNg8xBhc/D73hH8+39zOS5dvgjFau9t1TS7EJgfTtztNyZueG9qGiEzkc9mcGbiHHYeOIGxKQ8lV2Gko4SFI0NYMn8YHW0VOI6pCcOyLFh6oMb08C3ue8QCudlD1C5JNlIxqehOrx59xcCooKXuM+0VMStZ3jIM3PfUFjy+eSempkmKS3g0joJEwExw04B15jA+d/UluGT5MhTaOm5Lp+0HZ7Tivfc92RvISAN76dd7sevgKeTLFSye24mOcgsk43AtA/m0i3w2he7OdrS3VnT5TBNO3aamLpNNMRZqViMgzWGGBmMkAw76vyadOM70hEYITfeWTSKYfqdjAAIp28LfPPEintq6C40w0iK8EShkTImQGrT0d/wEVn30YqxYtgiFSs9teWY/OMOKa+97shciuCuoT964dcduvLTvCEzqUpWy8P0GIm5jxegcLOhpRUsuje6uLrS1FrXrNNVDTB42QiIPTSpN/RhXxQROW8xMajMCp+OT68mKthiNlvTciyxI8zILP3hyA/5h227U/UA/a7IR6nKqoSg1KPCx47jh6ktw+cqVqHR03VZN2+dd8Z4fPN7jNfy7RWPqxm2/3ostew6ipVhByVY4cXYCwspgTmtGJ+l5A/1YNH9Y071ePDN1r5HM5tgOhAjjMkQnZoVaraG7TdlMRqt1XYPq4wLxSQSdt6hYjVQsgmnCKSOtRkiJ3P/EJjz+4k7dKHVdE+caAikm4ZO9ohBs/Bg+/8nfwRUXrUSpvfNW17V/OuOKX/v+4z0qrN+toqkbxydrOH7ORxgKHDl6FHsPnYSVphImhbntBSwYGsSyxfNQLZX0Iog0miLXJVck5pKk9IF6w9eWaHi+ZjvCMe0F+hQCVaet5RJa8tmZMxvkirQdeiYdCh3Df/2LTfjFtt1oeBFc18FUvYGMQedxCFgAc/wUPveJS3HpB1ai0t5+q5t2ZwG756GeCNHdoTd54+tvHcSJSQ/dHe2oFNIYr/k4OVHTMqaadTE6PBcrFs1HuVSOLZXM0GhFlMdowE3ORBFAMy9KtkeOntBxRAsnxnTctLZOvpBF1k3pkweU++j72oIRnRqIteL9T2/BU1t3g04FpCwT9cDX5EEKBEEA78wRrPrdS3DFpRejo6f/1kx2FrCv3vNQj8XEXUF9/KaXdu3DjgMnYboZXaaQus+15GExCa8+jeG5/Vi2eD7KlSIdGwKFWdwCYHBsm0aliCI6O0QTUIHJyZp2v4x2RVNfT3UVfYfEMBEQuR1dowvNxGLEiinLwl8/vRWPbdwGEQRQPK7XHMdBKptGxjDQlgJ+d9kgRgbmoCXffmvOdH86Qx5r7vlBT1qqu7xzYzdt270Puw+eRSZfQDVtYGxyCoGZQm8pjc5iBqPDc7B0/ggq5bgeo+E7WY3W6NqOVhh04IFIIWaWWIXQqZ1kMphMOM/XZARMs6pj63ynjzElMfbEy/uwiQpfi6OUcaNcypkoteSOF9PO2da8u9Q27fVvv7VveVd7tb+vf3BNJp95aCbG/vir3+/Jp6y7HDO66eDxM9j+9hFIGrSFdRyn2XGqBT0FBwOtLRgeHMDi+YMoFiuxeiBwmhy5pnuaN+sRaJzWkvZcolD0wZhm06BZaHJN9dSwNw0rlpPxGEkKoaYbQXS8HoVnHM6HImX9xYnjJ19sSGPszOlD+UuWLXgsmytu2PPG7o92tLf2d1R71xRz5kMzyoOAZRzjaylbfJaG64EAPD/AuyfOYOf+45hsBGjLcAx3FDAyOIDReUOokKTSiiM+WUDAHDeme8XiGIv5fXbJEs+9SCWTFWkMxZhqULMZUuQYnZPT8oqF9SD6y6la/ZeB749N1uqdo3N77+Gm/SMZBcJ0rT6ujF7X4R82OBPHT56diqQ6ls6U/3zpUOGF9vb2aZ1cbv7Te3vLramvuba6SZf1ydiUc1M2QkEtOF6fmkIxY+kmDhFLuVyeOUSmG5zJcQZ9akAPFGLxS3VVFIZKU7oeqAGGZcJk5gHDdtYzpc426o0uyzGvtkyjSjKMMsVU3XtZCtFIuU7JNHlLNpd1pZAnGccZJu1DkZIHuG29Oz1ZP5V2+Yk33zkz2VvteO/KK/vp2GP8oFXf/nZqbiP/qYyD/8i5+iBTaImDOjolBB61M9mJtGl8UqhoVIbCLZcLqFSrWvrEZ2VkyJkRpl17zG+ErO7VbeY421zD3B1CHaxPhSeDoHZrNuNebhmmTS5rWpZncMNLpR3bpQQFEu+SBMUYk/yU4uwYY+ZBCbaLR9jvFMyjxyb42NjJmj/Smol2735Tfv7zV4bENQQkKc5nfsw0jG6++T4r1cdLLvhy04g+bXH1UaaEy4T6muzI3I/pVC8LGre7Jj6by2VFGIl3wiBALpP/m9aezlfbyp2hlY4mn33m+WvL+dRVjBsPRILXcylnxE2587JZ5/daMpk2w9KnfKYV4xOAcdjg/AAz2QHG7XfCWnhIuPzIJDBe31cLu7vni6NHHxWrVq0iRlK/DcD7ATV/f3+bjz3yyCP8uT3jTpFjADz4uGuboxk3vR+wNnth8Ili0f2Tns6u2vhk/ZdTU5MdQsofZ5x83UrxQcc0h92U/cF8S2bQYIxOTXncNCdN0z6mlHrbNJx9hlIHPFMeFanCqWDi4LkiOsNk96PVjz6qHl29Wh9T+de+flv/Ut/zzjvv5C+9VLIGF6GazeFi27YvU2BXtVcrCwYG+ng2l468WoNLqBrnZt02jdPK4Ic5Nw4w7r4tgnC/Mq3D09Ph2RYuPM7nRbT71VWr5JXEm7/Fff61YGZ//58FNnORUuzmW24xUVyRLpj+vI45HYv7O3q7UylLKsc6wEx5KJdOHx+faIzVT7wXdncPCts+Fa1YsUIfpPl/DeBf6or/u01jN998s7lixaesnh4SeyUUCl1hAoIscP6M3//Nrf8/vNf/BISEivylJQCIAAAAAElFTkSuQmCC"
                      alt="outdoor-icon" />
                    <img v-else src="https://static-btri.midea.com/mfs/2676/1723456813979.png" alt="indoor-icon" />
                  </span>
                  <span class="card-title">{{ item.name }}</span>
                </div>
                <div class="card-check">
                  <input v-if="showBatchControl" type="checkbox" :checked="isDeviceSelected(item.id)"
                    @click.stop="toggleDeviceSelect(item.id)" />
                  <i v-if="selectedDevice && selectedDevice.id === item.id" class="el-icon-check"></i>
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
                    <img
                      src="https://static-btri.midea.com/fe-apps/daily/btri-dcc/image/mdv-device-card/noSignal.svg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="table-shell">
            <table class="device-table">
              <thead>
                <tr>
                  <th>
                    {{
                      activeMachineTab === "indoor"
                        ? "室内机编号"
                        : "室外机编号"
                    }}
                  </th>
                  <th>设备名称</th>
                  <th>运行状态</th>
                  <th>
                    {{
                      activeMachineTab === "indoor" ? "设备地址" : "所属系统"
                    }}
                  </th>
                  <th>{{ activeMachineTab === "indoor" ? "系统" : "机型" }}</th>
                  <th>
                    {{ activeMachineTab === "indoor" ? "附属舰" : "静音模式" }}
                  </th>
                  <th>
                    {{
                      activeMachineTab === "indoor"
                        ? "内机型号"
                        : "模式优先设置"
                    }}
                  </th>
                  <th v-if="activeMachineTab === 'indoor'">模式</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pagedTableRows" :key="row.id">
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
              <el-pagination
                background
                layout="total, prev, pager, next"
                :current-page.sync="currentPage"
                :page-size="pageSize"
                :total="currentTableRows.length"
              />
            </div>
          </div>
        </main>
      </div>

      <div v-if="
        showImportDialog ||
        showGuideDialog ||
        showSmartNamingDialog ||
        showSortDialog
      " class="modal-mask" @click="closeAllDialogs">
        <div v-if="showImportDialog" class="modal-card import-modal" @click.stop>
          <div class="modal-header">
            <span>导入</span>
            <button type="button" class="close-btn" @click="showImportDialog = false">
              ×
            </button>
          </div>
          <div class="modal-content">
            <p>
              请按照模版要求导入数据，若已创建请忽略
              <a href="javascript:void(0)">批量导入分区模版.xlsx</a>
            </p>
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
            <button type="button" class="close-btn" @click="showGuideDialog = false">
              ×
            </button>
          </div>
          <div class="modal-content guide-content">
            <div class="guide-section">
              <div class="guide-title">自动分区：</div>
              <p>点击导入按钮，本地导入分区数据即可分区。</p>
              <p>
                若本地无分区数据，可点击蓝色链接下载模版
                <a href="javascript:void(0)">批量导入分区模版.xlsx</a>
              </p>
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
              <p>
                右侧分区列表下的设备，可以通过长按拖动的形式，更改设备所属的分区。
              </p>
            </div>
          </div>
        </div>

        <div v-if="showSmartNamingDialog" class="modal-card confirm-modal" @click.stop>
          <div class="modal-header">
            <span>提示</span>
            <button type="button" class="close-btn" @click="showSmartNamingDialog = false">
              ×
            </button>
          </div>
          <div class="modal-content">
            <p>是否将未命名的设备按分区名称进行智能命名？</p>
            <p class="sub-tip">
              例如位于“2栋”-“3层”-“大厅”的内机将被自动依次命名为“2栋-3层-大厅1”、“2栋-3层-大厅2”
            </p>
            <div class="confirm-actions">
              <button type="button" class="ghost-btn" @click="showSmartNamingDialog = false">
                取消
              </button>
              <button type="button" class="solid-btn" @click="confirmSmartNaming">
                确定
              </button>
            </div>
          </div>
        </div>

        <div v-if="showSortDialog" class="modal-card sort-modal" @click.stop>
          <div class="modal-header">
            <span>排序配置</span>
            <button type="button" class="close-btn" @click="showSortDialog = false">
              ×
            </button>
          </div>
          <div class="modal-content">
            <div class="sort-condition-list">
              <div v-for="(item, index) in sortConditions" :key="index" class="sort-condition-item">
                <el-select v-model="item.field" size="small" class="sort-field-select"
                  @change="onSortFieldChange(index)" placeholder="">
                  <el-option v-for="opt in getAvailableSortFields(index)" :key="opt.value" :label="opt.label"
                    :value="opt.value">
                  </el-option>
                </el-select>
                <span class="sort-desc">{{ getSortDesc(item.field) }}</span>
                <span class="sort-direction" @click="toggleSortDirection(index)">
                  <i :class="item.direction === 'asc'
                    ? 'el-icon-caret-top'
                    : 'el-icon-caret-bottom'
                    "></i>
                </span>
                <i class="el-icon-delete sort-delete" @click="removeSortCondition(index)"></i>
              </div>
            </div>
            <button type="button" class="add-sort-btn" @click="addSortCondition"
              :disabled="sortConditions.length >= sortFieldOptions.length">
              添加排序条件
            </button>
            <div class="sort-actions">
              <button type="button" class="ghost-btn" @click="showSortDialog = false">
                取消
              </button>
              <button type="button" class="solid-btn" @click="confirmSort">
                确定
              </button>
            </div>
          </div>
        </div>
      </div>

      <el-drawer :visible="showDeviceDetail" :direction="'rtl'" :size="'500px'" @close="closeDeviceDetail"
        custom-class="device-detail-drawer">
        <div v-if="selectedDevice">
          <div class="drawer-header">
            <div class="header-left">
              <img :src="activeMachineTab === 'indoor'
                ? 'https://static-btri.midea.com/mfs/2676/1723456813979.png'
                : 'data:image/png;base64,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'
                " :alt="activeMachineTab === 'indoor' ? 'indoor-icon' : 'outdoor-icon'
                  " />
              <span class="device-name">{{
                editingName ? editNameValue : selectedDevice.name
              }}</span>
            </div>
            <button v-if="!editingName" type="button" class="edit-name-btn" @click="openEditName">
              编辑名称
            </button>
          </div>

          <div v-if="!editingName" class="detail-tabs">
            <div v-for="tab in detailTabs" :key="tab.key" :class="[
              'detail-tab',
              { 'tab-active': activeDetailTab === tab.key },
            ]" @click="activeDetailTab = tab.key">
              {{ tab.label }}
            </div>
          </div>

          <div v-if="!editingName" class="detail-content">
            <template v-if="activeDetailTab === 'basic'">
              <template v-if="activeMachineTab === 'indoor'">
                <div class="detail-row">
                  <span class="detail-label">所属分区</span>
                  <span class="detail-value">{{
                    selectedDevice.zone || "未分区"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">所属室外机名称</span>
                  <span class="detail-value">{{
                    selectedDevice.outdoorName || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">所属室外机条码</span>
                  <span class="detail-value">{{
                    selectedDevice.outdoorBarcode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">网关条码</span>
                  <span class="detail-value">{{
                    selectedDevice.gatewayBarcode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">室内机条码</span>
                  <span class="detail-value">{{
                    selectedDevice.indoorBarcode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">室内机编号</span>
                  <span class="detail-value">{{
                    selectedDevice.indoorCode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">室内机地址码</span>
                  <span class="detail-value">{{
                    selectedDevice.addressCode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">室内机机型</span>
                  <span class="detail-value">{{
                    selectedDevice.model || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">室内机类型</span>
                  <span class="detail-value">{{
                    selectedDevice.type || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">线控器组号</span>
                  <span class="detail-value">{{
                    selectedDevice.controllerGroup || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">注册时间</span>
                  <span class="detail-value">{{
                    selectedDevice.registerTime || "-"
                  }}</span>
                </div>
              </template>
              <template v-else>
                <div class="detail-row">
                  <span class="detail-label">室外机条码</span>
                  <span class="detail-value">{{
                    selectedDevice.outdoorBarcode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">网关条码</span>
                  <span class="detail-value">{{
                    selectedDevice.gatewayBarcode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">室外机编号</span>
                  <span class="detail-value">{{
                    selectedDevice.outdoorCode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">室外机地址码</span>
                  <span class="detail-value">{{
                    selectedDevice.addressCode || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">设置内机台数</span>
                  <span class="detail-value">{{
                    selectedDevice.setIndoorCount || "--"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">在线内机台数</span>
                  <span class="detail-value">{{
                    selectedDevice.onlineIndoorCount || "0"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">内机开机台数</span>
                  <span class="detail-value">{{
                    selectedDevice.workingIndoorCount || "0"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">注册时间</span>
                  <span class="detail-value">{{
                    selectedDevice.registerTime || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">网络地址</span>
                  <span class="detail-value">{{
                    selectedDevice.networkAddress || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">电表接入状态</span>
                  <span class="detail-value">{{
                    selectedDevice.meterStatus || "已接入电表"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">电表归属类型</span>
                  <span class="detail-value">{{
                    selectedDevice.meterType || "第三方电表"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">交流电表读数(kWh)</span>
                  <span class="detail-value">{{
                    selectedDevice.acMeterReading || "-"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">光伏类型</span>
                  <span class="detail-value">{{
                    selectedDevice.pvType || "无"
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">直流电表读数(kWh)</span>
                  <span class="detail-value">{{
                    selectedDevice.dcMeterReading || "-"
                  }}</span>
                </div>
              </template>
            </template>

            <template v-if="
              activeDetailTab === 'related' && activeMachineTab === 'outdoor'
            ">
              <div class="related-header">
                <span class="related-title">室外机名称: {{ selectedDevice.name }}</span>
              </div>
              <div class="related-section">
                <div class="section-header" @click="toggleRelatedSection">
                  <i :class="[
                    'el-icon',
                    relatedSectionExpanded
                      ? 'el-icon-arrow-down'
                      : 'el-icon-arrow-right',
                  ]"></i>
                  <span>未分区({{ relatedIndoors.length }}台设备)</span>
                </div>
                <div v-if="relatedSectionExpanded" class="related-list">
                  <div v-for="indoor in relatedIndoors" :key="indoor.id" class="related-item">
                    <span class="item-name">{{ indoor.name }}</span>
                    <span class="item-temp">{{ indoor.temperature || "--" }}°C</span>
                    <span :class="[
                      'item-status',
                      indoor.status === 'online' ? 'online' : 'offline',
                    ]">
                      {{ indoor.status === "online" ? "离" : "在线" }}线
                    </span>
                    <span class="item-detail">{{ indoor.detail || "--" }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-else class="edit-name-content">
            <input v-model="editNameValue" class="name-input" placeholder="请输入设备名称" />
            <div class="input-actions">
              <span class="char-count">{{ editNameValue.length }}/12</span>
              <button type="button" class="cancel-btn" @click="cancelEditName">
                取消
              </button>
              <button type="button" class="confirm-btn" @click="confirmEditName">
                确认
              </button>
            </div>
            <div class="smart-naming">
              <div class="smart-title">快捷命名</div>
              <div v-for="(group, key) in smartNamingOptions" :key="key" class="smart-group">
                <span class="group-label">{{ key }}</span>
                <div class="group-buttons">
                  <button v-for="option in group" :key="option" type="button" class="smart-btn"
                    @click="selectSmartName(option)">
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-drawer>

      <el-drawer :visible="showBatchControl" :direction="'rtl'" :size="'500px'" @close="closeBatchControl"
        custom-class="batch-control-drawer">
        <div class="batch-control-header">
          <span class="batch-title">批量控制</span>
          <i class="el-icon-close" @click="closeBatchControl"></i>
        </div>

        <div class="batch-tabs">
          <div v-for="tab in batchTabs" :key="tab.key" :class="[
            'batch-tab',
            { 'batch-tab-active': activeBatchTab === tab.key },
          ]" @click="activeBatchTab = tab.key">
            {{ tab.label }}
          </div>
        </div>

        <div class="batch-content">
          <template v-if="activeBatchTab === 'normal'">
            <div class="control-section">
              <div class="section-title">设备开关</div>
              <div class="control-buttons">
                <button :class="[
                  'control-btn',
                  { active: batchControlData.power === 'off' },
                ]" @click="batchControlData.power = 'off'">
                  关机
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.power === 'on' },
                ]" @click="batchControlData.power = 'on'">
                  开机
                </button>
              </div>
            </div>

            <div class="control-section">
              <div class="section-title">
                设定模式 <span class="tip">(不支持全热交换器)</span>
              </div>
              <div class="control-buttons">
                <button :class="[
                  'control-btn',
                  { active: batchControlData.mode === 'none' },
                ]" @click="batchControlData.mode = 'none'">
                  不设定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.mode === 'fan' },
                ]" @click="batchControlData.mode = 'fan'">
                  送风
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.mode === 'cool' },
                ]" @click="batchControlData.mode = 'cool'">
                  制冷
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.mode === 'heat' },
                ]" @click="batchControlData.mode = 'heat'">
                  制热
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.mode === 'dehumidify' },
                ]" @click="batchControlData.mode = 'dehumidify'">
                  除湿
                </button>
              </div>
            </div>

            <div class="control-section">
              <div class="section-title">设定温度</div>
              <div class="temp-control">
                <span class="temp-label">16°C</span>
                <el-slider v-model="batchControlData.temperature" :min="16" :max="30" :step="0.5" class="temp-slider" />
                <span class="temp-value">{{ batchControlData.temperature }}°C</span>
              </div>
            </div>

            <div class="control-section">
              <div class="section-title">设定风档</div>
              <div class="wind-control">
                <button :class="[
                  'wind-btn',
                  { active: batchControlData.windMode === 'auto' },
                ]" @click="batchControlData.windMode = 'auto'">
                  自动
                </button>
                <el-slider v-model="batchControlData.windLevel" :min="1" :max="7" :step="1" class="wind-slider" />
                <span class="wind-value">{{ batchControlData.windLevel }}档</span>
              </div>
            </div>
          </template>

          <template v-if="activeBatchTab === 'lock'">
            <div class="control-section">
              <div class="section-title">只响应开机</div>
              <div class="control-buttons">
                <button :class="[
                  'control-btn',
                  { active: batchControlData.onlyOn === 'none' },
                ]" @click="batchControlData.onlyOn = 'none'">
                  不设定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.onlyOn === 'unlocked' },
                ]" @click="batchControlData.onlyOn = 'unlocked'">
                  未锁定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.onlyOn === 'locked' },
                ]" @click="batchControlData.onlyOn = 'locked'">
                  锁定
                </button>
              </div>
            </div>

            <div class="control-section">
              <div class="section-title">只响应关机</div>
              <div class="control-buttons">
                <button :class="[
                  'control-btn',
                  { active: batchControlData.onlyOff === 'none' },
                ]" @click="batchControlData.onlyOff = 'none'">
                  不设定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.onlyOff === 'unlocked' },
                ]" @click="batchControlData.onlyOff = 'unlocked'">
                  未锁定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.onlyOff === 'locked' },
                ]" @click="batchControlData.onlyOff = 'locked'">
                  锁定
                </button>
              </div>
            </div>

            <div class="control-section">
              <div class="section-title">
                模式锁定
                <span class="tip">(部分内机不支持锁定送风功能，不会影响送风模式锁定控制)</span>
              </div>
              <div class="control-buttons">
                <button :class="[
                  'control-btn',
                  { active: batchControlData.modeLock === 'none' },
                ]" @click="batchControlData.modeLock = 'none'">
                  不设定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.modeLock === 'unlocked' },
                ]" @click="batchControlData.modeLock = 'unlocked'">
                  未锁定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.modeLock === 'cool' },
                ]" @click="batchControlData.modeLock = 'cool'">
                  锁定制冷
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.modeLock === 'heat' },
                ]" @click="batchControlData.modeLock = 'heat'">
                  锁定制热
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.modeLock === 'fan' },
                ]" @click="batchControlData.modeLock = 'fan'">
                  锁定送风
                </button>
              </div>
            </div>

            <div class="control-section">
              <div class="section-title">风挡锁定</div>
              <div class="control-buttons">
                <button :class="[
                  'control-btn',
                  { active: batchControlData.windLock === 'none' },
                ]" @click="batchControlData.windLock = 'none'">
                  不设定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.windLock === 'unlocked' },
                ]" @click="batchControlData.windLock = 'unlocked'">
                  未锁定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.windLock === 'locked' },
                ]" @click="batchControlData.windLock = 'locked'">
                  锁定
                </button>
              </div>
            </div>

            <div class="control-section">
              <div class="section-title">禁用线控器</div>
              <div class="control-buttons">
                <button :class="[
                  'control-btn',
                  { active: batchControlData.disableController === 'none' },
                ]" @click="batchControlData.disableController = 'none'">
                  不设定
                </button>
                <button :class="[
                  'control-btn',
                  {
                    active: batchControlData.disableController === 'unlocked',
                  },
                ]" @click="batchControlData.disableController = 'unlocked'">
                  未锁定
                </button>
                <button :class="[
                  'control-btn',
                  { active: batchControlData.disableController === 'locked' },
                ]" @click="batchControlData.disableController = 'locked'">
                  锁定
                </button>
              </div>
            </div>
          </template>
        </div>

        <div class="batch-footer">
          <button type="button" class="batch-btn cancel" @click="closeBatchControl">
            取消
          </button>
          <button type="button" class="batch-btn confirm" @click="confirmBatchControl">
            指令下发
          </button>
        </div>
      </el-drawer>

      <el-dialog :visible="showBatchDelete" :title="'批量删除'" :width="'600px'" @close="closeBatchDelete"
        custom-class="batch-delete-dialog">
        <div class="batch-content">
          <div class="control-section">
            <div class="section-title">
              <input type="checkbox" :checked="selectedDevices.length === currentCards.length"
                @click="toggleAllDevices" />
              全选（{{ selectedDevices.length }}/{{ currentCards.length }}）
            </div>
          </div>

          <div class="delete-device-list">
            <div v-for="item in currentCards" :key="item.id" class="delete-device-item">
              <input type="checkbox" :checked="isDeviceSelected(item.id)" @click="toggleDeviceSelect(item.id)" />
              <div class="delete-device-info">
                <span class="delete-device-name">{{ item.name }}</span>
                <span class="delete-device-detail">交流电表：{{ item.acPower || "-" }}</span>
                <span class="delete-device-detail">直流电表：{{ item.dcPower || "-" }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <button type="button" class="batch-btn cancel" @click="closeBatchDelete">
            取消
          </button>
          <button type="button" class="batch-btn confirm" @click="confirmBatchDelete">
            删除
          </button>
        </template>
      </el-dialog>

      <el-dialog :visible="showCreateZoneDialog" :title="'新建分区'" :width="'400px'" @close="closeCreateZoneDialog"
        custom-class="create-zone-dialog">
        <div class="create-zone-options">
          <div class="zone-option" :class="{ selected: selectedZoneType === 'peer' }" @click="selectZoneType('peer')">
            <span class="option-icon">◇</span>
            <span class="option-label">同级分区</span>
          </div>
          <div class="zone-option" :class="{ selected: selectedZoneType === 'child' }" @click="selectZoneType('child')">
            <span class="option-icon">◆</span>
            <span class="option-label">子级分区</span>
          </div>
        </div>

        <template #footer>
          <button type="button" class="batch-btn cancel" @click="closeCreateZoneDialog">
            取消
          </button>
          <button type="button" class="batch-btn confirm" @click="confirmCreateZone">
            确定
          </button>
        </template>
      </el-dialog>
    </template>
    <quick-control-panel v-else-if="activeTopTab === 'control'" />
    <control-logs-panel v-else />
  </div>
</template>

<script>
import QuickControlPanel from "./components/QuickControlPanel";
import ControlLogsPanel from "./components/ControlLogsPanel";

export default {
  name: "EquipmentManagement",
  components: {
    QuickControlPanel,
    ControlLogsPanel,
  },
  data() {
    return {
      activeTopTab: "management",
      activeMachineTab: "indoor",
      viewMode: "card",
      currentPage: 1,
      pageSize: 2,
      expandedFilters: false,
      sidebarCollapsed: false,
      zoneEditMode: false,
      showMoreMenu: false,
      nodeMenuId: "",
      currentSearchField: "设备名称",
      showSearchDropdown: false,
      suggestions: [],
      showSuggestions: false,
      showImportDialog: false,
      showGuideDialog: false,
      showSmartNamingDialog: false,
      showSortDialog: false,
      showDeviceDetail: false,
      selectedDevice: null,
      activeDetailTab: "basic",
      relatedSectionExpanded: true,
      relatedIndoors: [],
      showBatchControl: false,
      showBatchDelete: false,
      showCreateZoneDialog: false,
      selectedZoneType: "",
      currentZoneGroupId: "",
      outdoorZoneEditingId: "",
      outdoorZoneEditValue: "",
      activeBatchTab: "normal",
      batchTabs: [
        { key: "normal", label: "常规控制" },
        { key: "lock", label: "锁定控制" },
      ],
      batchControlData: {
        power: "",
        mode: "none",
        temperature: 26,
        windMode: "auto",
        windLevel: 1,
        onlyOn: "none",
        onlyOff: "none",
        modeLock: "none",
        windLock: "none",
        disableController: "none",
      },
      selectedDevices: [],
      editingName: false,
      editNameValue: "",
      smartNamingOptions: {
        生产区: ["厂区", "配电室"],
        生产区维护: ["厂区", "保洁室"],
        物业维护: ["保安室", "保洁室"],
        娱乐区: ["羽毛球场", "乒乓球场", "泳池"],
        休息区: ["饭堂", "休息室", "宿舍", "房间"],
        教学区: ["课室"],
        办公区: ["办公室", "会议室"],
        停车区: ["停车场"],
      },
      sortConditions: [],
      sortFieldOptions: [
        {
          value: "status",
          label: "设备状态",
          desc: "按运行>故障>关机>离线排序",
        },
        {
          value: "name",
          label: "设备名称",
          desc: "名称从左到右，中文(拼音)>英文>数字",
        },
      ],
      selectedZone: "group-unassigned",
      selectedEditZone: "",
      system: [],
      indoorBarcodeOptions: [
        "0000CC311178CCM262C254100625902D",
        "0000CC311178CCM262C2541006270K1H",
      ],
      outdoorBarcodeOptions: [
        "0000CC311178CCM262C254100625903E",
        "0000CC311178CCM262C2541006270K2J",
        "0000CC311178CCM262C2541006270K3L",
      ],
      topTabs: [
        { key: "management", label: "设备管理" },
        { key: "control", label: "快捷控制" },
        { key: "logs", label: "控制日志" },
      ],
      machineTabs: [
        { key: "indoor", label: "室内机" },
        { key: "outdoor", label: "室外机" },
      ],
      filters: {
        keyword: "",
        system: [],
        lockStatus: "",
        contractStatus: "",
        indoorModel: "",
        silentMode: "",
        outdoorMuteMode: "",
        outdoorContractStatus: "",
        outdoorDeviceModel: "",
        modePriority: "",
        billingStatus: "",
        pvType: "",
        runningStatus: [],
      },
      systemOptions: [
        { value: 2, label: "VRF-00627-02" },
        { value: 1, label: "VRF-00625-01" },
      ],
      lockStatusOptions: [
        { value: "none", label: "无锁定" },
        { value: "only-on", label: "只响应开机" },
        { value: "only-off", label: "只响应关机" },
        { value: "cool-lower", label: "制冷温度下限" },
        { value: "cool-mode-lock", label: "制冷模式锁定" },
        { value: "heat-upper", label: "制热温度上限" },
        { value: "heat-mode-lock", label: "制热模式锁定" },
        { value: "fan-lock", label: "风挡锁定" },
      ],
      contractStatusOptions: [
        { value: "active", label: "合约中" },
        { value: "trial", label: "试用中" },
        { value: "disabled", label: "未启用" },
        { value: "expired", label: "已过期" },
      ],
      indoorModelOptions: [
        { value: "normal", label: "普通内机" },
        { value: "heat-exchange", label: "全热交换机" },
        { value: "fresh-air", label: "新风机" },
      ],
      silentModeOptions: [
        { value: "on", label: "静音" },
        { value: "off", label: "静音关闭" },
      ],
      outdoorModelOptions: [
        { value: "large-vrf", label: "大多联" },
        { value: "small-vrf", label: "小多联" },
        { value: "other", label: "其他" },
      ],
      modePriorityOptions: [
        { value: "cool-first", label: "制冷优先" },
        { value: "heat-first", label: "制热优先" },
        { value: "energy-first", label: "能需优先" },
        { value: "first-on-first", label: "先开优先" },
        { value: "only-heat", label: "只制热" },
        { value: "only-cool", label: "只制冷" },
        { value: "change-over", label: "ChangeOver" },
        { value: "more-on-first", label: "多开优先" },
      ],
      billingStatusOptions: [
        { value: "enabled", label: "已开通" },
        { value: "disabled", label: "未开通" },
      ],
      pvTypeOptions: [
        { value: "pv-hybrid", label: "光混" },
        { value: "pv-storage", label: "光储" },
      ],
      indoorZones: [
        {
          id: "group-unassigned",
          name: "未分区",
          expanded: true,
          items: [
            { id: "idu-11", label: "1号系统11" },
            { id: "idu-12", label: "1号系统12" },
            { id: "idu-15", label: "1号系统15" },
            { id: "idu-22", label: "1号系统22" },
            { id: "idu-39", label: "1号系统39" },
            { id: "idu-40", label: "1号系统40" },
            { id: "idu-010", label: "IDU-00625-0-10 零食角..." },
            { id: "idu-011", label: "IDU-00625-0-11爱丁堡" },
            { id: "idu-012", label: "IDU-00625-0-12 慕尼黑" },
            { id: "idu-013", label: "IDU-00625-0-13 慕尼黑..." },
            { id: "idu-004", label: "IDU-00625-0-4 旧金山..." },
            { id: "idu-005", label: "IDU-00625-0-5 温哥华" },
            { id: "idu-006", label: "IDU-00625-0-6 健身房" },
            { id: "idu-009", label: "IDU-00625-0-9 零食角" },
            { id: "idu-141", label: "IDU-00627-2-14华芯" },
            { id: "idu-152", label: "IDU-00627-2-15 林宏 Ti..." },
            { id: "idu-162", label: "IDU-00627-2-16 赣哥 朱钰" },
          ],
        },
      ],
      outdoorZones: [
        {
          id: "vrf-1",
          name: "VRF-00625-01",
          expanded: true,
          items: [
            { id: "odu-129-a", label: "ODU-00625-1-129" },
            { id: "odu-130-a", label: "ODU-00625-1-130" },
          ],
        },
        {
          id: "vrf-2",
          name: "VRF-00627-02",
          expanded: true,
          items: [
            { id: "odu-129-b", label: "ODU-00627-2-129" },
            { id: "odu-130-b", label: "ODU-00627-2-130" },
          ],
        },
      ],
      editableZoneGroups: [],
      props: { multiple: true },
      indoorOptions: [
        {
          value: 1,
          label: "运行",
          children: [
            {
              value: 2,
              label: "制冷",
            },
            {
              value: 3,
              label: "制热",
            },
            {
              value: 4,
              label: "送风",
            },
            {
              value: 5,
              label: "除湿",
            },
            {
              value: 6,
              label: "免费制冷",
            },
            {
              value: 7,
              label: "热交换",
            },
            {
              value: 8,
              label: "旁通",
            },
            {
              value: 9,
              label: "自动",
            },
          ],
        },
        {
          value: 10,
          label: "关机",
        },
        {
          value: 11,
          label: "故障",
          children: [
            {
              value: 12,
              label: "制冷",
            },
            {
              value: 13,
              label: "制热",
            },
            {
              value: 14,
              label: "送风",
            },
            {
              value: 15,
              label: "除湿",
            },
            {
              value: 16,
              label: "免费制冷",
            },
            {
              value: 17,
              label: "热交换",
            },
            {
              value: 18,
              label: "旁通",
            },
            {
              value: 19,
              label: "自动",
            },
          ],
        },
        {
          value: 20,
          label: "离线",
        },
      ],
      runningOptions: [
        { value: "running", label: "运行" },
        { value: "off", label: "关机" },
        { value: "offline", label: "离线" },
        { value: "fault", label: "故障" },
      ],
      indoorCards: [
        {
          id: "c1",
          name: "IDU-00627-2-20 Recoo-首尔",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
        {
          id: "c2",
          name: "1号系统15",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
        {
          id: "c3",
          name: "IDU-00627-2-16 赣哥 朱钰",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
        {
          id: "c4",
          name: "IDU-00627-2-21财务隔壁",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
        {
          id: "c5",
          name: "1号系统39",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
        {
          id: "c6",
          name: "1号系统40",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
        {
          id: "c7",
          name: "IDU-00627-2-22 档案室-赵姐",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
        {
          id: "c8",
          name: "IDU-00627-2-14华芯",
          metricA: "-°C / 负 -°C",
          metricB: "-% / 负 -%",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "",
        },
      ],
      outdoorCards: [
        {
          id: "o1",
          name: "ODU-00627-2-129",
          metricA: "- 摄氏度",
          metricB: "",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "内机台数: 11",
          acPower: "147236.70kWh",
          dcPower: "-",
        },
        {
          id: "o2",
          name: "ODU-00627-2-130",
          metricA: "- 摄氏度",
          metricB: "",
          metricC: "",
          contract: "合约中",
          status: "离线",
          extra: "内机台数: 11",
          acPower: "147236.70kWh",
          dcPower: "-",
        },
      ],
      indoorEditCards: [
        {
          id: "e1",
          name: "IDU-00627-2-20 Recoo-首尔",
          currentTemp: "20°C",
          targetTemp: "29°C",
          contract: "合约中",
          status: "离线",
        },
        {
          id: "e2",
          name: "IDU-00627-2-21财务隔壁",
          currentTemp: "26°C",
          targetTemp: "29°C",
          contract: "合约中",
          status: "离线",
        },
        {
          id: "e3",
          name: "IDU-00627-2-1机房",
          currentTemp: "17°C",
          targetTemp: "28°C",
          contract: "合约中",
          status: "离线",
        },
        {
          id: "e4",
          name: "IDU-00625-0-9 零食角",
          currentTemp: "27°C",
          targetTemp: "27°C",
          contract: "合约中",
          status: "离线",
        },
        {
          id: "e5",
          name: "IDU-00625-0-10 零食角隔壁",
          currentTemp: "27°C",
          targetTemp: "28°C",
          contract: "合约中",
          status: "离线",
        },
        {
          id: "e6",
          name: "IDU-00625-0-12 慕尼黑",
          currentTemp: "28°C",
          targetTemp: "28°C",
          contract: "合约中",
          status: "离线",
        },
        {
          id: "e7",
          name: "IDU-00627-2-14华芯",
          currentTemp: "--°C",
          targetTemp: "28°C",
          contract: "合约中",
          status: "离线",
        },
        {
          id: "e8",
          name: "IDU-00627-2-15 林宏 Tim Jack",
          currentTemp: "22°C",
          targetTemp: "28°C",
          contract: "合约中",
          status: "离线",
        },
      ],
      indoorTableRows: [
        {
          id: "t1",
          code: "IDU-00627-2-20",
          name: "IDU-00627-2-20 Recoo-首尔",
          status: "离线",
          address: "20",
          system: "0000CC311178CCM...",
          attachment: "v4/v4+内机",
          model: "--",
          mode: "制冷",
        },
        {
          id: "t2",
          code: "IDU-00627-2-19",
          name: "1号系统15",
          status: "离线",
          address: "19",
          system: "0000CC311178CCM...",
          attachment: "v4/v4+内机",
          model: "--",
          mode: "制热",
        },
      ],
      outdoorTableRows: [
        {
          id: "ot1",
          code: "ODU-00625-1-129",
          name: "ODU-00625-1-129",
          status: "离线",
          address: "0000CC311178CCM...",
          system: "大多联",
          attachment: "--",
          model: "自动优先",
        },
        {
          id: "ot2",
          code: "ODU-00625-1-130",
          name: "ODU-00625-1-130",
          status: "离线",
          address: "0000CC311178CCM...",
          system: "大多联",
          attachment: "--",
          model: "自动优先",
        },
        {
          id: "ot3",
          code: "ODU-00627-2-129",
          name: "ODU-00627-2-129",
          status: "离线",
          address: "0000CC311178CCM...",
          system: "大多联",
          attachment: "--",
          model: "自动优先",
        },
        {
          id: "ot4",
          code: "ODU-00627-2-130",
          name: "ODU-00627-2-130",
          status: "离线",
          address: "0000CC311178CCM...",
          system: "大多联",
          attachment: "--",
          model: "自动优先",
        },
      ],
    };
  },
  computed: {
    zoneTreeData() {
      const groups = this.editableZoneGroups;
      const buildTree = (parentId) => {
        return groups
          .filter((g) => g.parentId === parentId)
          .map((g) => ({
            id: g.id,
            label: `${g.name} (${g.count})`,
            name: g.name,
            count: g.count,
            level: g.level,
            parentId: g.parentId,
            children: buildTree(g.id),
          }));
      };
      return buildTree(null);
    },
    sortedEditableZoneGroups() {
      const result = [];
      const groups = this.editableZoneGroups;
      const findChildren = (parentId) => {
        return groups.filter((g) => g.parentId === parentId);
      };
      const traverse = (parentId) => {
        const children = findChildren(parentId);
        children.forEach((child) => {
          result.push(child);
          traverse(child.id);
        });
      };
      traverse(null);
      return result;
    },
    currentZoneGroups() {
      return this.activeMachineTab === "indoor"
        ? this.indoorZones
        : this.outdoorZones;
    },
    zoneTreeProps() {
      return { children: "children", label: "label" };
    },
    currentZoneTreeData() {
      return this.currentZoneGroups.map((group) => ({
        id: group.id,
        type: "group",
        label: `${group.name}（${group.items.length}）`,
        raw: group,
        children: group.items.map((item) => ({
          id: item.id,
          type: "item",
          label: item.label,
          raw: item,
          parentId: group.id,
          parent: group,
        })),
      }));
    },
    defaultExpandedZoneKeys() {
      return this.currentZoneGroups
        .filter((group) => group.expanded)
        .map((group) => group.id);
    },
    currentCards() {
      return this.activeMachineTab === "indoor"
        ? this.filteredIndoorCards
        : this.filteredOutdoorCards;
    },
    currentTableRows() {
      return this.activeMachineTab === "indoor"
        ? this.filteredIndoorTableRows
        : this.filteredOutdoorTableRows;
    },
    pagedTableRows() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.currentTableRows.slice(start, start + this.pageSize);
    },
    currentZoneCount() {
      return this.currentZoneGroups.reduce(
        (sum, group) => sum + group.items.length,
        0
      );
    },
    filteredIndoorCards() {
      if (!this.filters.keyword) return this.indoorCards;
      const keyword = this.filters.keyword.toLowerCase();
      return this.indoorCards.filter((card) =>
        card.name.toLowerCase().includes(keyword)
      );
    },
    filteredOutdoorCards() {
      if (!this.filters.keyword) return this.outdoorCards;
      const keyword = this.filters.keyword.toLowerCase();
      return this.outdoorCards.filter((card) =>
        card.name.toLowerCase().includes(keyword)
      );
    },
    filteredIndoorTableRows() {
      if (!this.filters.keyword) return this.indoorTableRows;
      const keyword = this.filters.keyword.toLowerCase();
      return this.indoorTableRows.filter((row) =>
        row.name.toLowerCase().includes(keyword)
      );
    },
    filteredOutdoorTableRows() {
      if (!this.filters.keyword) return this.outdoorTableRows;
      const keyword = this.filters.keyword.toLowerCase();
      return this.outdoorTableRows.filter((row) =>
        row.name.toLowerCase().includes(keyword)
      );
    },
    searchFieldOptions() {
      if (this.activeMachineTab === "indoor") {
        return [
          { value: "name", label: "设备名称" },
          { value: "indoorBarcode", label: "室内机条码" },
          { value: "indoorCode", label: "室内机编号" },
          { value: "outdoorBarcode", label: "室外机条码" },
        ];
      } else {
        return [
          { value: "name", label: "设备名称" },
          { value: "outdoorBarcode", label: "室外机条码" },
          { value: "outdoorCode", label: "室外机编码" },
          { value: "indoorCount", label: "内机台数" },
        ];
      }
    },
    detailTabs() {
      if (this.activeMachineTab === "outdoor") {
        return [
          { key: "basic", label: "基本信息" },
          { key: "related", label: "关联内机" },
        ];
      }
      return [{ key: "basic", label: "基本信息" }];
    },
  },
  watch: {
    "filters.keyword"() {
      this.resetPagination();
    },
    currentTableRows(rows) {
      const totalPages = Math.max(1, Math.ceil(rows.length / this.pageSize));
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
    },
  },
  methods: {
    handleTopTabChange(tabKey) {
      this.activeTopTab = tabKey;
      this.closeAllDialogs();
      this.closeBatchControl();
      this.closeBatchDelete();
      this.closeCreateZoneDialog();
      this.showMoreMenu = false;
      this.nodeMenuId = "";
    },
    openDeviceDetail(device) {
      this.showSortDialog = false;
      this.selectedDevice = device;
      this.activeDetailTab = "basic";
      this.showDeviceDetail = true;
      if (this.activeMachineTab === "outdoor") {
        this.relatedIndoors = this.getRelatedIndoors(device);
      }
    },
    getRelatedIndoors(outdoor) {
      return this.indoorCards.filter(
        (card) => card.outdoorName === outdoor.name
      );
    },
    toggleRelatedSection() {
      this.relatedSectionExpanded = !this.relatedSectionExpanded;
    },
    openBatchControl() {
      this.showBatchControl = true;
      this.resetBatchControlData();
    },
    closeBatchControl() {
      this.showBatchControl = false;
    },
    resetBatchControlData() {
      this.batchControlData = {
        power: "",
        mode: "none",
        temperature: 26,
        windMode: "auto",
        windLevel: 1,
        onlyOn: "none",
        onlyOff: "none",
        modeLock: "none",
        windLock: "none",
        disableController: "none",
      };
    },
    confirmBatchControl() {
      this.$message.success("指令下发成功");
      this.closeBatchControl();
    },
    openBatchDelete() {
      this.showBatchDelete = true;
    },
    closeBatchDelete() {
      this.showBatchDelete = false;
    },
    confirmBatchDelete() {
      this.$message.success("批量删除成功");
      this.closeBatchDelete();
      this.selectedDevices = [];
    },
    toggleAllDevices() {
      if (this.selectedDevices.length === this.currentCards.length) {
        this.selectedDevices = [];
      } else {
        this.selectedDevices = this.currentCards.map((card) => card.id);
      }
    },
    isGroupSelected(group) {
      return group.items.every((item) =>
        this.selectedDevices.includes(item.id)
      );
    },
    toggleGroupSelect(group) {
      const allSelected = this.isGroupSelected(group);
      group.items.forEach((item) => {
        const index = this.selectedDevices.indexOf(item.id);
        if (allSelected) {
          if (index > -1) {
            this.selectedDevices.splice(index, 1);
          }
        } else {
          if (index === -1) {
            this.selectedDevices.push(item.id);
          }
        }
      });
    },
    isZoneItemSelected(group, item) {
      return this.selectedDevices.includes(item.id);
    },
    toggleZoneItemSelect(group, item) {
      const index = this.selectedDevices.indexOf(item.id);
      if (index > -1) {
        this.selectedDevices.splice(index, 1);
      } else {
        this.selectedDevices.push(item.id);
      }
    },
    handleCurrentZoneNodeClick(data) {
      this.selectZone(data.id);
    },
    handleCurrentZoneNodeExpand(data) {
      if (data.type === "group" && data.raw) {
        data.raw.expanded = true;
      }
    },
    handleCurrentZoneNodeCollapse(data) {
      if (data.type === "group" && data.raw) {
        data.raw.expanded = false;
      }
    },
    isCurrentZoneNodeSelected(data) {
      if (data.type === "group") {
        return this.isGroupSelected(data.raw);
      }
      return this.isZoneItemSelected(data.parent, data.raw);
    },
    toggleCurrentZoneNodeSelect(data) {
      if (data.type === "group") {
        this.toggleGroupSelect(data.raw);
        return;
      }
      this.toggleZoneItemSelect(data.parent, data.raw);
    },
    editOutdoorZoneNode(data) {
      if (!data || !["group", "item"].includes(data.type) || !data.raw) return;
      this.outdoorZoneEditingId = data.id;
      this.outdoorZoneEditValue =
        data.type === "group" ? data.raw.name || "" : data.raw.label || "";
      this.$nextTick(() => {
        const inputRef = this.$refs.outdoorZoneEditInput;
        const input = Array.isArray(inputRef) ? inputRef[0] : inputRef;
        if (input) {
          input.focus();
        }
      });
    },
    isEditingOutdoorZoneNode(data) {
      return (
        this.activeMachineTab === "outdoor" &&
        data &&
        ["group", "item"].includes(data.type) &&
        this.outdoorZoneEditingId === data.id
      );
    },
    saveOutdoorZoneNodeEdit(data) {
      if (!this.isEditingOutdoorZoneNode(data) || !data.raw) return;
      const nextName = this.outdoorZoneEditValue.trim();
      if (!nextName) {
        this.$message.warning("名称不能为空");
        this.$nextTick(() => {
          const inputRef = this.$refs.outdoorZoneEditInput;
          const input = Array.isArray(inputRef) ? inputRef[0] : inputRef;
          if (input) input.focus();
        });
        return;
      }
      const oldName = data.type === "group" ? data.raw.name : data.raw.label;
      if (data.type === "group") {
        data.raw.name = nextName;
      } else {
        data.raw.label = nextName;
        const matchedCard = this.outdoorCards.find(
          (card) => card.name === oldName
        );
        const matchedRow = this.outdoorTableRows.find(
          (row) => row.name === oldName
        );
        if (matchedCard) matchedCard.name = nextName;
        if (matchedRow) matchedRow.name = nextName;
      }
      this.outdoorZoneEditingId = "";
      this.outdoorZoneEditValue = "";
      if (nextName !== oldName) this.$message.success("编辑成功");
    },
    cancelOutdoorZoneNodeEdit() {
      this.outdoorZoneEditingId = "";
      this.outdoorZoneEditValue = "";
    },
    isDeviceSelected(deviceId) {
      return this.selectedDevices.includes(deviceId);
    },
    toggleDeviceSelect(deviceId) {
      const index = this.selectedDevices.indexOf(deviceId);
      if (index > -1) {
        this.selectedDevices.splice(index, 1);
      } else {
        this.selectedDevices.push(deviceId);
      }
    },
    closeDeviceDetail() {
      this.showDeviceDetail = false;
      this.selectedDevice = null;
      this.editingName = false;
    },
    resetPagination() {
      this.currentPage = 1;
    },
    resetFilters() {
      this.filters.keyword = "";
      this.filters.system = [];
      this.filters.runningStatus = [];
      this.filters.lockStatus = "";
      this.filters.contractStatus = "";
      this.filters.indoorModel = "";
      this.filters.silentMode = "";
      this.filters.outdoorMuteMode = "";
      this.filters.outdoorContractStatus = "";
      this.filters.outdoorDeviceModel = "";
      this.filters.modePriority = "";
      this.filters.billingStatus = "";
      this.filters.pvType = "";
      this.system = [];
      this.expandedFilters = false;
      this.resetPagination();
    },
    refreshData() {
      this.$message.info("正在刷新数据...");
      setTimeout(() => {
        this.indoorCards = [
          {
            id: "c1",
            name: "IDU-00627-2-20 Recoo-首尔",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
          {
            id: "c2",
            name: "1号系统15",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
          {
            id: "c3",
            name: "IDU-00627-2-16 赣哥 朱钰",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
          {
            id: "c4",
            name: "IDU-00627-2-21财务隔壁",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
          {
            id: "c5",
            name: "1号系统39",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
          {
            id: "c6",
            name: "1号系统40",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
          {
            id: "c7",
            name: "IDU-00627-2-22 档案室-赵姐",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
          {
            id: "c8",
            name: "IDU-00627-2-14华芯",
            metricA: "-°C / 负 -°C",
            metricB: "-% / 负 -%",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "",
          },
        ];
        this.outdoorCards = [
          {
            id: "o1",
            name: "ODU-00627-2-129",
            metricA: "- 摄氏度",
            metricB: "",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "内机台数: 11",
            acPower: "147236.70kWh",
            dcPower: "-",
          },
          {
            id: "o2",
            name: "ODU-00627-2-130",
            metricA: "- 摄氏度",
            metricB: "",
            metricC: "",
            contract: "合约中",
            status: "离线",
            extra: "内机台数: 11",
            acPower: "147236.70kWh",
            dcPower: "-",
          },
        ];
        this.indoorEditCards = [
          {
            id: "e1",
            name: "IDU-00627-2-20 Recoo-首尔",
            currentTemp: "20°C",
            targetTemp: "29°C",
            contract: "合约中",
            status: "离线",
          },
          {
            id: "e2",
            name: "IDU-00627-2-21财务隔壁",
            currentTemp: "26°C",
            targetTemp: "29°C",
            contract: "合约中",
            status: "离线",
          },
          {
            id: "e3",
            name: "IDU-00627-2-1机房",
            currentTemp: "17°C",
            targetTemp: "28°C",
            contract: "合约中",
            status: "离线",
          },
          {
            id: "e4",
            name: "IDU-00625-0-9 零食角",
            currentTemp: "27°C",
            targetTemp: "27°C",
            contract: "合约中",
            status: "离线",
          },
          {
            id: "e5",
            name: "IDU-00625-0-10 零食角隔壁",
            currentTemp: "27°C",
            targetTemp: "28°C",
            contract: "合约中",
            status: "离线",
          },
          {
            id: "e6",
            name: "IDU-00625-0-12 慕尼黑",
            currentTemp: "28°C",
            targetTemp: "28°C",
            contract: "合约中",
            status: "离线",
          },
          {
            id: "e7",
            name: "IDU-00627-2-14华芯",
            currentTemp: "--°C",
            targetTemp: "28°C",
            contract: "合约中",
            status: "离线",
          },
          {
            id: "e8",
            name: "IDU-00627-2-15 林宏 Tim Jack",
            currentTemp: "22°C",
            targetTemp: "28°C",
            contract: "合约中",
            status: "离线",
          },
        ];
        this.indoorTableRows = [
          {
            id: "t1",
            code: "IDU-00627-2-20",
            name: "IDU-00627-2-20 Recoo-首尔",
            status: "离线",
            address: "20",
            system: "0000CC311178CCM...",
            attachment: "v4/v4+内机",
            model: "--",
            mode: "制冷",
          },
          {
            id: "t2",
            code: "IDU-00627-2-19",
            name: "1号系统15",
            status: "离线",
            address: "19",
            system: "0000CC311178CCM...",
            attachment: "v4/v4+内机",
            model: "--",
            mode: "制热",
          },
        ];
        this.outdoorTableRows = [
          {
            id: "ot1",
            code: "ODU-00625-1-129",
            name: "ODU-00625-1-129",
            status: "离线",
            address: "0000CC311178CCM...",
            system: "大多联",
            attachment: "--",
            model: "自动优先",
          },
          {
            id: "ot2",
            code: "ODU-00625-1-130",
            name: "ODU-00625-1-130",
            status: "离线",
            address: "0000CC311178CCM...",
            system: "大多联",
            attachment: "--",
            model: "自动优先",
          },
          {
            id: "ot3",
            code: "ODU-00627-2-129",
            name: "ODU-00627-2-129",
            status: "离线",
            address: "0000CC311178CCM...",
            system: "大多联",
            attachment: "--",
            model: "自动优先",
          },
          {
            id: "ot4",
            code: "ODU-00627-2-130",
            name: "ODU-00627-2-130",
            status: "离线",
            address: "0000CC311178CCM...",
            system: "大多联",
            attachment: "--",
            model: "自动优先",
          },
        ];
        this.resetPagination();
        this.$message.success("数据刷新成功");
      }, 500);
    },
    openEditName() {
      this.editingName = true;
      this.editNameValue = this.selectedDevice.name;
    },
    cancelEditName() {
      this.editingName = false;
      this.editNameValue = "";
    },
    confirmEditName() {
      if (this.editNameValue.trim()) {
        this.selectedDevice.name = this.editNameValue.trim();
      }
      this.editingName = false;
      this.editNameValue = "";
    },
    selectSmartName(name) {
      this.editNameValue = name;
    },
    openSortDialog() {
      this.showSortDialog = true;
      this.showDeviceDetail = false;
    },
    addSortCondition() {
      this.sortConditions.push({ field: "", direction: "asc" });
    },
    removeSortCondition(index) {
      this.sortConditions.splice(index, 1);
    },
    toggleSortDirection(index) {
      this.sortConditions[index].direction =
        this.sortConditions[index].direction === "asc" ? "desc" : "asc";
    },
    getAvailableSortFields(currentIndex) {
      const usedFields = this.sortConditions
        .filter((_, i) => i !== currentIndex)
        .map((item) => item.field)
        .filter(Boolean);
      return this.sortFieldOptions.filter(
        (opt) => !usedFields.includes(opt.value)
      );
    },
    getSortDesc(field) {
      const found = this.sortFieldOptions.find((opt) => opt.value === field);
      return found ? found.desc : "";
    },
    onSortFieldChange(index) { },
    confirmSort() {
      this.showSortDialog = false;
    },
    switchMachineTab(tab) {
      this.activeMachineTab = tab;
      this.expandedFilters = false;
      this.resetPagination();
      if (tab === "indoor") {
        this.viewMode = "card";
        this.system = [];
        this.filters.lockStatus = "";
        this.filters.contractStatus = "";
        this.filters.indoorModel = "";
      } else if (tab === "outdoor") {
        this.viewMode = "card";
        this.system = [];
        this.filters.silentMode = "";
        this.filters.outdoorContractStatus = "";
        this.filters.outdoorModel = "";
        this.filters.modePriority = "";
        this.filters.billingStatus = "";
        this.filters.pvType = "";
        this.filters.runningStatus = [];
      }
      this.currentSearchField = "设备名称";
      this.zoneEditMode = false;
      this.showMoreMenu = false;
      this.nodeMenuId = "";
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      if (this.sidebarCollapsed) {
        this.contentShifted = true;
      } else {
        this.contentShifted = false;
      }
    },
    selectZone(id) {
      this.selectedZone = id;
    },
    handleCascaderChange(value) {
      if (!value || value.length === 0 || !value[0] || value[0].length === 0) {
        this.indoorOptions.forEach((item) => {
          this.$set(item, "disabled", false);
        });
        return;
      }
      const selectedFirstValue = value[0][0];
      this.indoorOptions.forEach((item) => {
        if (item.value !== selectedFirstValue) {
          this.$set(item, "disabled", true);
        } else {
          this.$set(item, "disabled", false);
        }
      });
    },
    selectSearchField(item) {
      this.currentSearchField = item.label;
      this.showSearchDropdown = false;
      this.filters.keyword = "";
      this.showSuggestions = false;
    },
    handleSearchInput() {
      if (this.filters.keyword.length > 0) {
        this.showSuggestions = true;
        this.suggestions = this.getMockSuggestions();
      } else {
        this.showSuggestions = false;
      }
    },
    handleSearch() {
      this.showSuggestions = false;
      if (this.filters.keyword.length > 0) {
        this.suggestions = this.getMockSuggestions();
      }
    },
    selectSuggestion(item) {
      this.filters.keyword = item;
      this.showSuggestions = false;
    },
    getMockSuggestions() {
      const keyword = this.filters.keyword.toLowerCase();

      if (this.currentSearchField === "设备名称") {
        return this.indoorCards
          .filter((card) => card.name.toLowerCase().includes(keyword))
          .map((card) => card.name);
      }

      const mockData = {
        室内机条码: [
          "0000CC311178CCM262C254100625902D",
          "0000CC311178CCM262C2541006270K1D",
        ],
        室内机编号: ["IDU-001", "IDU-002", "IDU-003", "IDU-004", "IDU-005"],
        室外机条码: ["OUT-001-BAR", "OUT-002-BAR", "OUT-003-BAR"],
        室外机编码: ["OUT-001", "OUT-002", "OUT-003"],
        内机台数: ["1", "2", "3", "4", "5"],
      };
      return mockData[this.currentSearchField] || [];
    },
    enterZoneEditMode() {
      this.zoneEditMode = true;
      this.showMoreMenu = false;
      this.nodeMenuId = "";
      this.editableZoneGroups = [];
      this.selectedEditZone = "";
    },
    exitZoneEditMode() {
      this.zoneEditMode = false;
      this.showMoreMenu = false;
      this.nodeMenuId = "";
    },
    toggleMoreMenu() {
      this.showMoreMenu = !this.showMoreMenu;
      this.nodeMenuId = "";
    },
    handleZoneNodeClick(data) {
      this.selectedEditZone = data.id;
    },
    toggleNodeMenu(id) {
      this.currentZoneGroupId = id;
      this.selectedZoneType = "";
      this.showCreateZoneDialog = true;
    },
    createTopLevelZone() {
      const nextIndex = this.editableZoneGroups.length + 1;
      const newZone = {
        id: `zone-${Date.now()}`,
        name: nextIndex === 1 ? "新节点8h1n" : `新建一级分区${nextIndex}`,
        count: 0,
        parentId: null,
        level: 0,
      };
      this.editableZoneGroups.push(newZone);
      this.selectedEditZone = newZone.id;
    },
    closeCreateZoneDialog() {
      this.showCreateZoneDialog = false;
      this.selectedZoneType = "";
      this.currentZoneGroupId = "";
    },
    selectZoneType(type) {
      this.selectedZoneType = type;
    },
    confirmCreateZone() {
      if (!this.selectedZoneType) {
        this.$message.warning("请选择分区类型");
        return;
      }
      if (this.selectedZoneType === "peer") {
        this.createPeerZone(this.currentZoneGroupId);
      } else if (this.selectedZoneType === "child") {
        this.createChildZone(this.currentZoneGroupId);
      }
      this.closeCreateZoneDialog();
      this.$message.success("分区创建成功");
    },
    createPeerZone(groupId) {
      const current = this.editableZoneGroups.find(
        (item) => item.id === groupId
      );
      if (!current) return;
      this.editableZoneGroups.push({
        id: `zone-${Date.now()}`,
        name: `${current.name}-同级`,
        count: 0,
        parentId: current.parentId,
        level: current.level,
      });
      this.nodeMenuId = "";
    },
    createChildZone(groupId) {
      const current = this.editableZoneGroups.find(
        (item) => item.id === groupId
      );
      if (!current) return;
      this.editableZoneGroups.push({
        id: `zone-${Date.now()}`,
        name: `${current.name}-子级`,
        count: 0,
        parentId: current.id,
        level: current.level + 1,
      });
      this.nodeMenuId = "";
    },
    openImportDialog() {
      this.showImportDialog = true;
      this.showGuideDialog = false;
      this.showSmartNamingDialog = false;
      this.showMoreMenu = false;
    },
    openGuideDialog() {
      this.showGuideDialog = true;
      this.showImportDialog = false;
      this.showSmartNamingDialog = false;
      this.showMoreMenu = false;
    },
    openSmartNamingDialog() {
      this.showSmartNamingDialog = true;
      this.showImportDialog = false;
      this.showGuideDialog = false;
      this.showMoreMenu = false;
    },
    closeAllDialogs() {
      this.showImportDialog = false;
      this.showGuideDialog = false;
      this.showSmartNamingDialog = false;
      this.showSortDialog = false;
      this.showDeviceDetail = false;
    },
    confirmSmartNaming() {
      this.showSmartNamingDialog = false;
    },
  },
};
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
  position: relative;
}

.sidebar {
  position: relative;
  width: 278px;
  border-right: 1px solid #edf0f5;
  background: #fff;
  padding: 0 0 0 20px;
  transition: width 0.3s ease;
  flex-shrink: 0;
  z-index: 10;
  overflow: visible;
}

.sidebar.editing {
  width: 280px;
}

.sidebar.collapsed {
  width: 30px;
  padding: 0;
  overflow: hidden;
}

.sidebar.collapsed .machine-switch,
.sidebar.collapsed .zone-header,
.sidebar.collapsed .zone-summary,
.sidebar.collapsed .zone-tree,
.sidebar.collapsed .zone-panel,
.sidebar.collapsed .zone-edit-header,
.sidebar.collapsed .zone-edit-tree,
.sidebar.collapsed .empty-zone-tip,
.sidebar.collapsed .create-zone-btn,
.sidebar.collapsed .edit-zone-btn {
  display: none;
}

.main-panel {
  flex: 1;
}

.machine-switch {
  display: flex;
  justify-content: space-between;
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
    content: "";
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
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  left: 260px;
  top: 100px;
}

.zone-tree,
.zone-edit-tree {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 12px;
}

::v-deep .el-tree-node__content {
  height: 34px;
}

.zone-tree-node {
  flex: 1;
  min-width: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 4px;
  box-sizing: border-box;
}

.zone-tree-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.zone-tree-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zone-tree-edit-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 26px;
  padding: 0 8px;
  border: 1px solid #0f62fe;
  border-radius: 4px;
  outline: none;
  background: #fff;
  color: #14253f;
  font-size: 14px;
  box-sizing: border-box;
}

.zone-tree-edit-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #8b98aa;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.zone-tree-edit-btn:hover {
  background: #e8f3ff;
  color: #0f62fe;
}

.zone-tree-confirm-btn {
  flex-shrink: 0;
  height: 24px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  background: #0f62fe;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

.zone-tree-confirm-btn:hover {
 background: #004fd6;
}

.zone-tree-node.item.active {
  color: #1962ff;
  background-color: #e8f3ff;
}

.zone-edit-tree .el-tree-node__content {
  height: 40px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.editable-zone-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid #edf0f5;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 13px;
  color: #6e7f9d;
}

.filter-select {
  width: 180px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  font-size: 13px;
  color: #1e2f4d;
  background: #fff;
  cursor: pointer;
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

.zone-tree-node.group {
  color: #2b3448 !important;
  font-weight: 600 !important;
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
  width: 140px;
  height: 40px;
  margin: 18px 0 0 60px;
  border: 0;
  border-radius: 4px;
  background: #2d63ff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
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
  min-height: 68px;
  justify-content: space-between;
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
  width: 100%;
}

.filter-row {
  display: grid;
  grid-template-columns: 1.45fr 1fr 1fr auto;
  gap: 14px;
  align-items: center;
}

.search-combo,
.fake-select {
  height: 32px;
  border: 1px solid #9fb5dc;
  border-radius: 4px;
  background: #fff;
}

.search-combo {
  display: grid;
  grid-template-columns: 160px 1fr 36px;
  position: relative;
}

.combo-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  color: #17253f;
  font-size: 14px;
  cursor: pointer;
}

.combo-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 160px;
  background: #fff;
  border: 1px solid #e8ecf0;
  border-top: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.dropdown-item {
  padding: 8px 12px;
  color: #17253f;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #f5f7fa;
  }
}

.suggestion-list {
  position: absolute;
  top: 100%;
  left: 160px;
  right: 36px;
  background: #fff;
  border: 1px solid #e8ecf0;
  border-top: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 8px 14px;
  color: #17253f;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #f5f7fa;
  }
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

.search-combo ::v-deep .el-select {
  height: 32px;
}

.search-combo ::v-deep .el-select .el-input {
  height: 32px;
}

.search-combo ::v-deep .el-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 15px !important;
  border: none !important;
  background: transparent !important;
}

.search-combo ::v-deep .el-select .el-input .el-select__caret {
  height: 32px !important;
  line-height: 32px !important;
}

.search-combo ::v-deep .el-select .el-input__suffix {
  height: 32px !important;
}

.search-combo ::v-deep .el-select .el-input__suffix-inner {
  height: 32px !important;
}

.search-combo ::v-deep .el-select .el-input__icon {
  line-height: 32px !important;
  height: 32px !important;
}

.search-combo ::v-deep .indoor-barcode-select {
  width: 385.72px !important;
  height: 32px !important;
}

.search-combo ::v-deep .indoor-barcode-select .el-input {
  height: 32px !important;
}

.search-combo ::v-deep .indoor-barcode-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.search-combo ::v-deep .outdoor-barcode-select {
  width: 385.72px !important;
  height: 32px !important;
}

.search-combo ::v-deep .outdoor-barcode-select .el-input {
  height: 32px !important;
}

.search-combo ::v-deep .outdoor-barcode-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box ::v-deep .system-select {
  width: 359px !important;
  height: 32px !important;
}

.filter-box ::v-deep .system-select .el-input {
  height: 32px !important;
}

.filter-box ::v-deep .system-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box ::v-deep .status-cascader {
  width: 291px !important;
  height: 32px !important;
}

.filter-box ::v-deep .status-cascader .el-input {
  height: 32px !important;
}

.filter-box ::v-deep .status-cascader .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box ::v-deep .status-select {
  width: 291px !important;
  height: 32px !important;
}

.filter-box ::v-deep .status-select .el-input {
  height: 32px !important;
}

.filter-box ::v-deep .status-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box ::v-deep .el-cascader__search-input {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.outdoor-filter-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.outdoor-filter-rows .filter-row {
  display: grid;
  grid-template-columns: 1.45fr 1fr 1fr auto;
  gap: 14px;
  margin-left: 0;
  height: auto;
  width: 100%;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.filter-item .filter-label {
  flex-shrink: 0;
  text-align: left;
  font-size: 14px;
  color: rgba(20, 37, 63, 0.85);
  width: 80px;
}

.filter-item .expanded-select {
  height: 32px !important;
}

.filter-item .expanded-select.mute-mode-select {
  width: 548px !important;
}

.filter-item .expanded-select.contract-status-select {
  width: 359px !important;
}

.filter-item .expanded-select.device-model-select {
  width: 200px !important;
}

.filter-item .expanded-select.mode-priority-select {
  width: 200px !important;
}

.filter-item .expanded-select.billing-status-select {
  width: 200px !important;
}

.filter-item .expanded-select.pv-type-select {
  width: 200px !important;
}

.filter-item .expanded-select .el-input {
  height: 32px !important;
}

.filter-item .expanded-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.outdoor-collapse-btn {
  justify-self: end;
  margin-left: 10px;
  white-space: nowrap;
}

.filter-box ::v-deep .expanded-select {
  height: 32px !important;
}

.filter-box ::v-deep .expanded-select .el-input {
  height: 32px !important;
}

.filter-box ::v-deep .expanded-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box ::v-deep .outdoor-row-select {
  width: 280px !important;
  height: 32px !important;
}

.filter-box ::v-deep .outdoor-row-select .el-input {
  height: 32px !important;
}

.filter-box ::v-deep .outdoor-row-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box ::v-deep .lock-status-select {
  width: 548px !important;
}

.filter-box ::v-deep .contract-status-select {
  width: 300px !important;
}

.filter-box ::v-deep .indoor-model-select {
  width: 291px !important;
}

.filter-box ::v-deep .silent-mode-select {
  width: 300px !important;
}

.filter-box ::v-deep .outdoor-model-select {
  width: 300px !important;
}

.filter-box ::v-deep .mode-priority-select {
  width: 300px !important;
}

.filter-box ::v-deep .billing-status-select {
  width: 331px !important;
}

.filter-box ::v-deep .pv-type-select {
  width: 291px !important;
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

  .check-all-checkbox {
    width: 24px;
    height: 24px;
  }
}

.actions,
.edit-mode-actions {
  display: flex;
  gap: 10px;
  transform: translateX(-200px);
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
  gap: 20px;
  margin-top: 10px;
}

.edit-transfer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  padding-top: 10px;
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

.edit-card-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

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
  padding: 12px 9px 10px;
  cursor: pointer;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.device-card.active {
  border-color: #2d63ff;
  background: #f0f5ff;
}

.card-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2d63ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
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
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-icon img {
  width: 28px;
  height: 28px;
}

.card-title-wrap img {
  height: 28px;
  width: 28px;
}

.card-title {
  color: #7f94bb;
  font-size: 15px;
}

.rename-input {
  width: 220px;
  font-size: 12px;
  height: 30px;
  border: 1px solid #dce4f1;
  border-radius: 4px;
  padding: 0 10px;
  margin: 0 10px;
}

.rename-checkbox {
  width: 26px;
  height: 30px;
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

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
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

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 0 0;
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

.sort-modal {
  width: 520px;
}

.sort-condition-list {
  margin-bottom: 20px;
}

.sort-condition-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.sort-field-select {
  width: 140px;
}

.sort-desc {
  flex: 1;
  font-size: 14px;
  color: rgba(20, 37, 63, 0.65);
}

.sort-direction {
  cursor: pointer;
  color: #2468f2;
  font-size: 16px;
  width: 24px;
  text-align: center;
  i{
    font-size: 16px;
  width: 24px;
  }
}

.sort-delete {
  cursor: pointer;
  color: rgba(20, 37, 63, 0.45);
  font-size: 16px;
}

.sort-delete:hover {
  color: #f56c6c;
}

.add-sort-btn {
  width: 100%;
  height: 36px;
  background: #2468f2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
}

.add-sort-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.sort-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  content: "";
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

@media (max-width: 100%) {

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

  .deviceImg___r8YND ant-btri-tooltip-box {
    width: 28px;
    height: 28px;
  }

  .el-select .el-input.is-focus .el-input__inner {
    border-color: #409eff;
    width: 385.72px;
    height: 32px;
  }
}

.device-detail-modal {
  width: 480px;
}

.detail-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #edf0f5;
}

.detail-tab {
  font-size: 14px;
  color: rgba(20, 37, 63, 0.65);
  padding: 12px 0;
  margin-right: 30px;
  cursor: pointer;
}

.detail-tab.tab-active {
  color: #2468f2;
  border-bottom: 2px solid #2468f2;
}

.detail-tab {
  font-size: 14px;
  color: #6e7f9d;
  cursor: pointer;
  position: relative;
}

.detail-tab.active {
  color: #14253f;
  font-weight: 600;
}

.detail-tab.active::after {
  content: "";
  position: absolute;
  bottom: -17px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2d63ff;
}

.detail-info {
  background: #fafbfc;
  border-radius: 4px;
  padding: 16px;
}

.info-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px dashed #e8eaed;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 120px;
  font-size: 14px;
  color: #6e7f9d;
  flex-shrink: 0;
}

.info-value {
  font-size: 14px;
  color: #14253f;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #edf0f5;
}

/* 设备详情抽屉样式 */
.device-detail-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #edf0f5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left img {
  width: 40px;
  height: 40px;
}

.device-name {
  font-size: 16px;
  font-weight: 600;
  color: #14253f;
}

.edit-name-btn {
  font-size: 14px;
  color: #2468f2;
  background: transparent;
  border: none;
  cursor: pointer;
}

.detail-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #edf0f5;
}

.tab-active {
  font-size: 14px;
  color: #2468f2;
  padding: 12px 0;
  border-bottom: 2px solid #2468f2;
}

.detail-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f6f9;
}

.detail-label {
  font-size: 14px;
  color: rgba(20, 37, 63, 0.65);
}

.detail-value {
  font-size: 14px;
  color: #14253f;
  text-align: right;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-name-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.name-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #d9dde5;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.char-count {
  font-size: 12px;
  color: rgba(20, 37, 63, 0.45);
}

.cancel-btn {
  font-size: 14px;
  color: rgba(20, 37, 63, 0.65);
  background: transparent;
  border: none;
  cursor: pointer;
}

.confirm-btn {
  font-size: 14px;
  color: #2468f2;
  background: transparent;
  border: none;
  cursor: pointer;
}

.smart-naming {
  margin-top: 20px;
}

.smart-title {
  font-size: 14px;
  font-weight: 500;
  color: #14253f;
  margin-bottom: 12px;
}

.smart-group {
  margin-bottom: 12px;
}

.group-label {
  font-size: 12px;
  color: rgba(20, 37, 63, 0.45);
  margin-bottom: 8px;
  display: block;
}

.group-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.smart-btn {
  font-size: 12px;
  color: #14253f;
  background: #f5f6f9;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.smart-btn:hover {
  background: #e4e9f2;
}

.related-header {
  padding: 16px 0;
  border-bottom: 1px solid #f5f6f9;
  margin-bottom: 16px;
}

.related-title {
  font-size: 14px;
  font-weight: 500;
  color: #14253f;
}

.related-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #14253f;
  padding: 10px 0;
  cursor: pointer;
}

.related-list {
  padding-left: 24px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f6f9;
}

.item-name {
  font-size: 13px;
  color: #14253f;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-temp {
  font-size: 13px;
  color: #14253f;
  margin: 0 12px;
}

.item-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.item-status.online {
  color: #00c48c;
  background: rgba(0, 196, 140, 0.1);
}

.item-status.offline {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.item-detail {
  font-size: 12px;
  color: rgba(20, 37, 63, 0.45);
  margin-left: 12px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #edf0f5;
}

/* 覆盖 el-drawer 默认样式 */
::v-deep .el-drawer__body {
  padding: 0;
  overflow: hidden;
}

/* 批量控制抽屉样式 */
.batch-control-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.batch-control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #edf0f5;
}

.batch-title {
  font-size: 16px;
  font-weight: 600;
  color: #14253f;
}

.batch-control-header .el-icon-close {
  font-size: 16px;
  color: rgba(20, 37, 63, 0.45);
  cursor: pointer;
}

.batch-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #edf0f5;
}

.batch-tab {
  font-size: 14px;
  color: rgba(20, 37, 63, 0.65);
  padding: 12px 0;
  margin-right: 30px;
  cursor: pointer;
}

.batch-tab-active {
  color: #2468f2;
  border-bottom: 2px solid #2468f2;
}

.batch-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.control-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #14253f;
  margin-bottom: 12px;
}

.section-title .tip {
  font-size: 12px;
  font-weight: normal;
  color: rgba(20, 37, 63, 0.45);
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.control-btn {
  font-size: 13px;
  color: #14253f;
  background: #fff;
  border: 1px solid #d9dde5;
  border-radius: 4px;
  padding: 6px 16px;
  cursor: pointer;
}

.control-btn.active {
  color: #2468f2;
  background: rgba(36, 104, 242, 0.1);
  border-color: #2468f2;
}

.temp-control,
.wind-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.temp-label,
.temp-value,
.wind-value {
  font-size: 13px;
  color: #14253f;
  min-width: 50px;
}

.temp-slider {
  flex: 1;
}

.wind-slider {
  flex: 1;
}

.wind-btn {
  font-size: 13px;
  color: #14253f;
  background: #fff;
  border: 1px solid #d9dde5;
  border-radius: 4px;
  padding: 6px 16px;
  cursor: pointer;
}

.wind-btn.active {
  color: #2468f2;
  background: rgba(36, 104, 242, 0.1);
  border-color: #2468f2;
}

.batch-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #edf0f5;
}

.batch-btn {
  font-size: 14px;
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
}

.batch-btn.cancel {
  color: rgba(20, 37, 63, 0.65);
  background: #fff;
  border: 1px solid #d9dde5;
}

.batch-btn.confirm {
  color: #fff;
  background: #2468f2;
  border: none;
}

.create-zone-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0;
}

.zone-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e4e9f2;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2d63ff;
    background: #f0f5ff;
  }

  &.selected {
    border-color: #2d63ff;
    background: #f0f5ff;
  }
}

.option-icon {
  font-size: 20px;
  color: #2d63ff;
}

.option-label {
  font-size: 14px;
  color: #1e2f4d;
}

.delete-device-list {
  margin-top: 10px;
}

.delete-device-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #edf0f5;
}

.delete-device-item:last-child {
  border-bottom: none;
}

.delete-device-info {
  flex: 1;
}

.delete-device-name {
  display: block;
  font-size: 14px;
  color: #14253f;
  margin-bottom: 4px;
}

.delete-device-detail {
  display: block;
  font-size: 12px;
  color: rgba(20, 37, 63, 0.65);
  margin-bottom: 2px;
}

/* 页面视觉优化：仅调整样式，不修改页面内容与交互逻辑 */
.device-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fb;
  color: #14253f;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

.top-tabs {
  height: 54px;
  padding-left: 0;
  background: #f7f7f8;
  border-bottom: 1px solid #e5e8ef;
}

.top-tab {
  min-width: 132px;
  height: 54px;
  border-right: 1px solid #e5e8ef;
  background: transparent;
  color: #273855;
  font-size: 16px;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: #0f62fe;
  }

  &.active {
    background: #fff;
    color: #14253f;
    font-weight: 600;
  }
}

.content-shell {
  min-height: calc(100vh - 138px);
  background: #fff;
}

.sidebar {
  width: 338px;
  padding: 0 12px 24px 20px;
  border-right: 1px solid #e1e6ef;
  background: #fff;
}

.sidebar.editing {
  width: 338px;
}

.sidebar.collapsed {
  width: 36px;
}

.content-shell.sidebar-collapsed .collapse-btn {
  left: 20px;
}

.main-panel {
  min-width: 0;
  padding: 0 20px 28px 24px;
  background: #fff;
}

.machine-switch {
  height: 68px;
  justify-content: flex-start;
  gap: 40px;
  padding: 0 0 0 0;
  border-bottom: 0;
}

.machine-tab {
  height: 68px;
  padding: 0;
  color: #14253f;
  font-size: 14px;
  line-height: 68px;

  &.active {
    color: #0f62fe;
    font-weight: 700;
  }

  &.active::after {
    bottom: 0;
    height: 3px;
    border-radius: 3px;
    background: #0f62fe;
  }
}

.zone-panel,
.zone-edit-header {
  border-top: 0;
}

.zone-header,
.zone-edit-header {
  padding: 26px 0 18px;
  color: #14253f;
  font-size: 14px;
  font-weight: 700;
}

.zone-summary {
  padding: 24px 8px 16px 0;
  border-top: 1px solid #edf0f5;
  color: #14253f;
  font-size: 14px;
  font-weight: 700;
}

.zone-tree,
.zone-edit-tree {
  max-height: calc(100vh - 390px);
  padding-right: 0;
}

.zone-group-title {
  height: 40px;
  padding: 0 16px;
  margin-right: 0;
  border-radius: 4px;
  color: #14253f;
  font-size: 14px;
  font-weight: 700;
}

.zone-group-title.active {
  background: #e8f3ff;
  color: #14253f;
}

.zone-group-main {
  min-width: 0;
  gap: 12px;
}

.caret {
  color: #8b98aa;
  font-size: 14px;
}

.zone-items {
  padding-left: 28px;
}

.zone-item {
  min-height: 34px;
  padding: 8px 8px;
  border-radius: 4px;
  color: #51627d;
  font-size: 14px;
}

.zone-item:hover,
.zone-item.active {
  background: #eef6ff;
  color: #0f62fe;
}

.edit-zone-btn,
.create-zone-btn {
  display: block;
  width: 116px;
  height: 40px;
  margin: 28px auto 0;
  border-radius: 4px;
  background: #e8f3ff;
  color: #0f62fe;
  font-size: 16px;
}

.create-zone-btn {
  width: 150px;
  background: #0f62fe;
  color: #fff;
}

.collapse-btn {
  left: 322px;
  top: 168px;
  width: 26px;
  height: 42px;
  border-radius: 0 18px 18px 0;
  background: #fff;
  border: 1px solid #e1e6ef;
  border-left: 0;
  color: #557099;
  font-size: 22px;
  box-shadow: 0 2px 8px rgba(20, 37, 63, 0.08);
}

.toolbar-view-switch {
  gap: 14px;
}

.view-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  color: #8da0bf;
  font-size: 24px;

  &.active {
    color: #0f62fe;
  }
}

.filter-panel {
  gap: 24px;
}

.filter-row {
  grid-template-columns:
    minmax(420px, 1.55fr) minmax(300px, 1fr) minmax(300px, 1fr) auto;
  gap: 22px 20px;
  align-items: center;
}

.expanded-row {
  grid-template-columns:
    minmax(420px, 1.55fr) minmax(300px, 1fr) minmax(300px, 1fr) auto;
}

.filter-box {
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
}

.filter-label {
  flex-shrink: 0;
  color: #14253f;
  font-size: 16px;
  white-space: nowrap;
}

.search-combo,
.fake-select {
  height: 32px;
  border-color: #a8b7d6;
  border-radius: 4px;
}

.search-combo {
  grid-template-columns: 136px minmax(0, 1fr) 44px;
  min-width: 0;
}

.combo-select {
  padding: 0 16px;
  color: #14253f;
  font-size: 16px;
}

.combo-input {
  width: 100%;
  min-width: 0;
  height: 30px;
  border-left: 1px solid #a8b7d6;
  padding: 0 16px;
  color: #14253f;
  font-size: 16px;
  box-sizing: border-box;
}

.combo-input::placeholder {
  color: #7d8798;
}

.search-icon {
  height: 30px;
  color: #8a8f99;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.combo-dropdown,
.suggestion-list {
  border-color: #e3e8f2;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 8px 20px rgba(20, 37, 63, 0.12);
}

.combo-dropdown {
  width: 136px;
}

.suggestion-list {
  left: 136px;
  right: 44px;
}

.dropdown-item,
.suggestion-item {
  padding: 10px 14px;
  font-size: 14px;
}

.expand-link {
  min-width: 72px;
  height: 46px;
  color: #0f62fe;
  font-size: 16px;
  white-space: nowrap;
}

.filter-box ::v-deep .el-select,
.filter-box ::v-deep .el-cascader,
.search-combo ::v-deep .el-select,
.filter-box ::v-deep .system-select,
.filter-box ::v-deep .status-cascader,
.filter-box ::v-deep .status-select,
.filter-box ::v-deep .expanded-select,
.filter-box ::v-deep .lock-status-select,
.filter-box ::v-deep .contract-status-select,
.filter-box ::v-deep .indoor-model-select,
.filter-box ::v-deep .mute-mode-select,
.filter-box ::v-deep .device-model-select,
.filter-box ::v-deep .mode-priority-select,
.filter-box ::v-deep .billing-status-select,
.filter-box ::v-deep .pv-type-select,
.search-combo ::v-deep .indoor-barcode-select,
.search-combo ::v-deep .outdoor-barcode-select {
  width: 100% !important;
  height: 32px !important;
}

.filter-box ::v-deep .el-input,
.filter-box ::v-deep .el-input__inner,
.filter-box ::v-deep .el-cascader .el-input,
.filter-box ::v-deep .el-cascader .el-input__inner,
.search-combo ::v-deep .el-select .el-input,
.search-combo ::v-deep .el-select .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}

.filter-box ::v-deep .el-input__inner,
.filter-box ::v-deep .el-cascader .el-input__inner {
  border-color: #a8b7d6 !important;
  color: #14253f;
  font-size: 16px;
}

.filter-box ::v-deep .el-input__inner::placeholder,
.filter-box ::v-deep .el-cascader .el-input__inner::placeholder {
  color: #7d8798;
}

.filter-box ::v-deep .el-input__suffix,
.filter-box ::v-deep .el-input__icon,
.search-combo ::v-deep .el-input__suffix,
.search-combo ::v-deep .el-input__icon {
  height: 32px !important;
  line-height: 32px !important;
}

.search-combo ::v-deep .el-select .el-input__inner {
  border: 0 !important;
  background: transparent !important;
}

.outdoor-filter-rows {
  gap: 22px;
}

.outdoor-filter-rows .filter-row {
  grid-template-columns:
    minmax(420px, 1.55fr) minmax(300px, 1fr) minmax(300px, 1fr) auto;
  gap: 22px 20px;
}

.action-row,
.edit-top-actions {
  margin: 24px 0 20px;
}

.actions,
.edit-mode-actions {
  gap: 10px;
  transform: none;
}

.action-btn {
  min-width: 88px;
  height: 40px;
  padding: 0 18px;
  border-radius: 4px;
  font-size: 16px;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

  &.secondary {
    background: #e8f3ff;
    color: #0f62fe;
  }

  &.secondary:hover {
    background: #dcecff;
  }

  &.primary {
    background: #0f62fe;
    color: #fff;
    box-shadow: 0 2px 6px rgba(15, 98, 254, 0.18);
  }

  &.primary:hover {
    background: #0052e0;
  }
}

.table-shell {
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #fff;
}

.device-table {
  min-width: 1120px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

.device-table th,
.device-table td {
  height: 68px;
  padding: 0 24px;
  border-bottom: 1px solid #edf0f5;
  color: #c6ccd6;
  font-size: 14px;
  font-weight: 400;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-table th {
  height: 62px;
  background: #f7f7f8;
  color: #3e4a5f;
  font-size: 14px;
  font-weight: 500;
}

.device-table tbody tr {
  transition: background 0.2s ease;
}

.device-table tbody tr:hover,
.device-table tbody tr:nth-child(3) {
  background: #f2f4f8;
}

.status-dot {
  width: 12px;
  height: 12px;
  margin-right: 8px;
  background: #d7dce4;
  vertical-align: middle;
}

.operate-links a {
  margin-right: 14px;
  color: #0f62fe;
  font-size: 14px;
}

.card-grid,
.edit-card-grid {
  gap: 16px;
}

.device-card {
  min-height: 132px;
  padding: 12px 9px 10px;
  border-color: #e5eaf3;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(20, 37, 63, 0.04);
  transition: border 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.device-card:hover {
  border-color: #b9cef5;
  box-shadow: 0 8px 20px rgba(20, 37, 63, 0.08);
  transform: translateY(-1px);
}

.device-card.active {
  border-color: #0f62fe;
  background: #f3f7ff;
}

.card-title {
  color: #52647f;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body {
  background: #f7f9fc;
}

.card-tags,
.card-extra,
.card-metrics,
.outdoor-power {
  color: #7f8fa8;
}

.modal-card,
::v-deep .el-dialog,
::v-deep .el-drawer {
  border-radius: 8px;
}

::v-deep .el-drawer__body {
  background: #fff;
}

@media (max-width: 1600px) {

  .filter-row,
  .expanded-row,
  .outdoor-filter-rows .filter-row {
    grid-template-columns:
      minmax(360px, 1.2fr) minmax(260px, 1fr) minmax(260px, 1fr) auto;
  }

  .sidebar,
  .sidebar.editing {
    width: 300px;
  }

  .collapse-btn {
    left: 284px;
  }
}

@media (max-width: 1280px) {
  .content-shell {
    flex-direction: column;
  }

  .sidebar,
  .sidebar.editing {
    width: 100%;
    padding-right: 20px;
    border-right: 0;
    border-bottom: 1px solid #edf0f5;
  }

  .collapse-btn {
    display: none;
  }

  .main-panel {
    padding: 0 16px 24px;
  }

  .filter-row,
  .expanded-row,
  .outdoor-filter-rows .filter-row {
    grid-template-columns: 1fr;
  }

  .actions,
  .edit-mode-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>