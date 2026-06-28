<template>
  <div class="account-page">
    <div class="page-header">
      <h2>账号权限</h2>
      <p>
        角色是对权限的打包，角色中添加的人员自动获得当前项目下该角色设置的功能权限。
        一个用户也可以被设置为多个角色，此时，该用户将拥有多个角色的权限合集。
      </p>
    </div>

    <div class="account-layout">
      <aside class="role-panel">
        <div class="role-title">角色列表</div>

        <div class="role-list">
          <button
            v-for="role in roles"
            :key="role.id"
            type="button"
            :class="['role-item', { active: selectedRoleId === role.id }]"
            @click="selectRole(role.id)"
          >
            {{ role.name }}
          </button>
        </div>

        <button type="button" class="add-role-btn" @click="openRoleDialog">
          <i class="el-icon-circle-plus" />
          <span>新增角色</span>
        </button>
      </aside>

      <section v-if="currentRole" class="content-panel">
        <div class="role-heading">{{ currentRole.name }}</div>

        <el-tabs v-model="activeTab" class="account-tabs">
          <el-tab-pane label="人员列表" name="members">
            <div class="toolbar">
              <el-input
                v-model.trim="memberSearch"
                class="search-input"
                size="small"
                clearable
                placeholder="请输入姓名"
              >
                <i slot="prefix" class="el-input__icon el-icon-search" />
              </el-input>

              <el-button size="small" type="primary" icon="el-icon-circle-plus" @click="openAddMemberDialog">
                添加人员
              </el-button>
              <el-button size="small" class="ghost-btn" @click="openCreateAccountDialog">
                创建账号
              </el-button>
            </div>

            <el-table
              :data="pagedMembers"
              border
              :header-cell-style="tableHeaderStyle"
              empty-text="当前角色暂无人员"
            >
              <el-table-column label="序号" width="80" align="center">
                <template slot-scope="scope">
                  {{ getMemberIndex(scope.$index) }}
                </template>
              </el-table-column>

              <el-table-column prop="name" label="姓名" min-width="120" />

              <el-table-column label="手机号" min-width="160">
                <template slot-scope="{ row }">
                  {{ maskPhone(row.phone) }}
                </template>
              </el-table-column>

              <el-table-column label="关联设备" min-width="260">
                <template slot-scope="{ row }">
                  <div class="device-cell">
                    <span v-if="row.deviceSummary">{{ row.deviceSummary }}</span>
                    <span v-else class="muted-text">未设置</span>

                    <el-dropdown v-if="row.deviceNames.length" trigger="click">
                      <span class="device-link">
                        查看
                        <i class="el-icon-arrow-down el-icon--right" />
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          v-for="deviceName in row.deviceNames"
                          :key="deviceName"
                          disabled
                        >
                          {{ deviceName }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="功能授权" width="160">
                <template slot-scope="{ row }">
                  <div class="authorize-cell">
                    <span>{{ row.authorized ? '已授权' : '未授权' }}</span>
                    <el-switch
                      :value="row.authorized"
                      active-color="#2d63ff"
                      @change="handleAuthorizeChange(row, $event)"
                    />
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="操作" min-width="180">
                <template slot-scope="{ row }">
                  <el-button type="text" @click="openDeviceDialog(row)">编辑关联设备</el-button>
                  <el-button type="text" @click="removeMember(row)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <span>{{ memberRangeText }}</span>
              <el-pagination
                background
                layout="prev, pager, next, sizes"
                :page-sizes="[10, 20, 50]"
                :current-page="memberPagination.page"
                :page-size="memberPagination.pageSize"
                :total="filteredMembers.length"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane label="功能权限" name="permissions">
            <el-table
              :data="permissionTree"
              row-key="id"
              border
              default-expand-all
              :tree-props="{ children: 'children' }"
              :header-cell-style="tableHeaderStyle"
            >
              <el-table-column width="80" align="center">
                <template slot="header">
                  <el-checkbox
                    :value="allPermissionsSelected"
                    :indeterminate="permissionHeaderIndeterminate"
                    @change="toggleAllPermissions"
                  />
                </template>
                <template slot-scope="{ row }">
                  <el-checkbox
                    :value="isPermissionChecked(row.id)"
                    :indeterminate="isPermissionIndeterminate(row)"
                    @change="togglePermission(row, $event)"
                  />
                </template>
              </el-table-column>

              <el-table-column prop="label" label="应用权限" min-width="420" />

              <el-table-column label="类型" width="140" align="center">
                <template slot-scope="{ row }">
                  <el-tag size="mini" effect="plain">{{ row.typeLabel }}</el-tag>
                </template>
              </el-table-column>
            </el-table>

            <div class="permission-actions">
              <el-button type="primary" @click="savePermissions">保存</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </section>
    </div>

    <el-dialog
      title="创建角色"
      :visible.sync="dialogs.role"
      width="520px"
      append-to-body
    >
      <el-form ref="roleForm" :model="roleForm" :rules="roleRules" label-position="top">
        <el-form-item label="角色名称" prop="name" required>
          <el-input v-model.trim="roleForm.name" maxlength="20" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model.trim="roleForm.description"
            maxlength="80"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogs.role = false">取消</el-button>
        <el-button type="primary" @click="createRole">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="添加人员"
      :visible.sync="dialogs.member"
      width="520px"
      append-to-body
    >
      <el-form ref="memberForm" :model="memberForm" :rules="memberRules" label-position="top">
        <el-form-item label="选择账号" prop="accountIds" required>
          <el-select
            v-model="memberForm.accountIds"
            style="width: 100%;"
            multiple
            collapse-tags
            filterable
            placeholder="请选择账号"
          >
            <el-option
              v-for="account in availableAccounts"
              :key="account.id"
              :label="account.name + '（' + maskPhone(account.phone) + '）'"
              :value="account.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogs.member = false">取消</el-button>
        <el-button type="primary" @click="addMembersToRole">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="创建账号"
      :visible.sync="dialogs.account"
      width="560px"
      append-to-body
    >
      <el-form ref="accountForm" :model="accountForm" :rules="accountRules" label-position="top">
        <el-form-item label="姓名" prop="name" required>
          <el-input v-model.trim="accountForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone" required>
          <el-input v-model.trim="accountForm.phone" maxlength="11" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model.trim="accountForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="部门" prop="department">
          <el-select v-model="accountForm.department" style="width: 100%;" placeholder="请选择部门">
            <el-option
              v-for="department in departmentOptions"
              :key="department"
              :label="department"
              :value="department"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="roleId" required>
          <el-select v-model="accountForm.roleId" style="width: 100%;" placeholder="请选择角色">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="dialogs.account = false">取消</el-button>
        <el-button type="primary" @click="createAccount">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="编辑分区/设备权限"
      :visible.sync="dialogs.device"
      width="560px"
      append-to-body
    >
      <div class="device-dialog-tools">
        <span class="selected-count">已选（{{ checkedDeviceCount }}/{{ totalDeviceCount }}）</span>
        <el-checkbox
          :value="allDevicesSelected"
          :indeterminate="deviceHeaderIndeterminate"
          @change="toggleAllDevices"
        >
          全选
        </el-checkbox>
        <el-checkbox v-model="deviceDialog.includeOutdoor">包含所连的室外机</el-checkbox>
      </div>

      <div class="device-tree-wrapper">
        <el-tree
          ref="deviceTree"
          :data="deviceTree"
          node-key="id"
          show-checkbox
          :props="{ children: 'children', label: 'label' }"
          @check="handleDeviceTreeCheck"
        >
          <span slot-scope="{ data }" class="tree-node">
            <span>{{ data.label }}</span>
            <span v-if="data.children && data.children.length">（{{ data.children.length }}）</span>
          </span>
        </el-tree>
      </div>

      <span slot="footer">
        <el-button @click="dialogs.device = false">取消</el-button>
        <el-button type="primary" @click="confirmDeviceSelection">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const PERMISSION_TREE = [
  { id: 'dashboard', label: '数据驾驶舱', typeLabel: '菜单' },
  {
    id: 'device-management',
    label: '设备管理',
    typeLabel: '菜单',
    children: [
      { id: 'device-list', label: '设备列表', typeLabel: '功能' },
      { id: 'device-control', label: '快捷控制', typeLabel: '功能' },
      { id: 'device-zone-edit', label: '编辑分区', typeLabel: '功能' }
    ]
  },
  { id: 'schedule-management', label: '日程管理', typeLabel: '菜单' },
  { id: 'fault-management', label: '故障管理', typeLabel: '菜单' },
  { id: 'service-center', label: '服务中心', typeLabel: '菜单' },
  { id: 'message-center', label: '消息中心', typeLabel: '菜单' },
  { id: 'energy-management', label: '能耗管理', typeLabel: '菜单' },
  { id: 'billing-management', label: '分户计费', typeLabel: '菜单' },
  {
    id: 'config-center',
    label: '配置中心',
    typeLabel: '菜单',
    children: [
      { id: 'system-setting', label: '系统设置', typeLabel: '功能' },
      { id: 'email-setting', label: '电价配置', typeLabel: '功能' }
    ]
  },
  { id: 'operation-logs', label: '操作日志', typeLabel: '菜单' },
  { id: 'help-center', label: '帮助中心', typeLabel: '菜单' }
]

const DEVICE_AREAS = [
  '一层大厅东',
  '一层大厅西',
  '二层办公区 A',
  '二层办公区 B',
  '二层会议室',
  '三层财务室',
  '三层档案室',
  '三层茶水间',
  '四层大会议室',
  '四层小会议室',
  '四层走廊',
  '五层总经理室',
  '五层秘书室',
  '五层接待区',
  '六层研发区 A',
  '六层研发区 B',
  '六层机房',
  '七层培训室',
  '七层路演厅',
  '八层休息区',
  '八层展厅',
  '顶层设备间'
]

function createDeviceTree() {
  return [
    {
      id: 'zone-unassigned',
      label: '未分区',
      children: DEVICE_AREAS.map((name, index) => {
        const order = String(index + 1).padStart(2, '0')
        return {
          id: `device-${order}`,
          label: `IDU-00625-0-${order} ${name}`
        }
      })
    }
  ]
}

function collectTreeIds(nodes) {
  return nodes.reduce((ids, node) => {
    ids.push(node.id)
    if (node.children && node.children.length) {
      ids.push.apply(ids, collectTreeIds(node.children))
    }
    return ids
  }, [])
}

function collectLeafNodes(nodes) {
  return nodes.reduce((items, node) => {
    if (node.children && node.children.length) {
      items.push.apply(items, collectLeafNodes(node.children))
    } else {
      items.push(node)
    }
    return items
  }, [])
}

function createRole(id, name, description, memberSettings, permissionIds) {
  return {
    id,
    name,
    description,
    memberSettings,
    permissionIds: permissionIds.slice()
  }
}

const DEVICE_TREE = createDeviceTree()
const ALL_PERMISSION_IDS = collectTreeIds(PERMISSION_TREE)
const ALL_DEVICE_LEAF_NODES = collectLeafNodes(DEVICE_TREE)
const ALL_DEVICE_LEAF_IDS = ALL_DEVICE_LEAF_NODES.map(item => item.id)
const DEVICE_LABEL_MAP = ALL_DEVICE_LEAF_NODES.reduce((map, item) => {
  map[item.id] = item.label
  return map
}, {})

export default {
  name: 'AccountPermission',
  data() {
    return {
      activeTab: 'members',
      selectedRoleId: 'role-longlong',
      memberSearch: '',
      permissionTree: PERMISSION_TREE,
      deviceTree: DEVICE_TREE,
      departmentOptions: ['运营部', '客服部', '技术部', '财务部'],
      memberPagination: {
        page: 1,
        pageSize: 20
      },
      dialogs: {
        role: false,
        member: false,
        account: false,
        device: false
      },
      roleForm: {
        name: '',
        description: ''
      },
      memberForm: {
        accountIds: []
      },
      accountForm: {
        name: '',
        phone: '',
        email: '',
        department: '',
        roleId: 'role-longlong'
      },
      deviceDialog: {
        memberId: '',
        checkedLeafIds: [],
        includeOutdoor: false
      },
      roleRules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      },
      memberRules: {
        accountIds: [{ required: true, message: '请选择账号', trigger: 'change' }]
      },
      accountRules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
        roleId: [{ required: true, message: '请选择角色', trigger: 'change' }]
      },
      accounts: [
        {
          id: 'user-01',
          name: '龙龙',
          phone: '15912344166',
          email: '',
          department: '运营部'
        },
        {
          id: 'user-02',
          name: '张敏',
          phone: '13823456789',
          email: 'zhangmin@example.com',
          department: '客服部'
        },
        {
          id: 'user-03',
          name: '刘洋',
          phone: '13788886666',
          email: 'liuyang@example.com',
          department: '技术部'
        }
      ],
      roles: [
        createRole(
          'role-admin',
          '管家主管理员',
          '负责项目下账号与菜单授权管理',
          {
            'user-02': {
              authorized: true,
              includeOutdoor: true,
              deviceIds: ['device-01', 'device-02', 'device-03']
            }
          },
          ALL_PERMISSION_IDS
        ),
        createRole(
          'role-longlong',
          '龙龙',
          '当前项目下的设备与账号授权角色',
          {
            'user-01': {
              authorized: true,
              includeOutdoor: false,
              deviceIds: ['device-01', 'device-02']
            }
          },
          ALL_PERMISSION_IDS
        )
      ]
    }
  },
  computed: {
    currentRole() {
      return this.roles.find(role => role.id === this.selectedRoleId) || null
    },
    accountMap() {
      return this.accounts.reduce((map, account) => {
        map[account.id] = account
        return map
      }, {})
    },
    currentRoleMembers() {
      if (!this.currentRole) {
        return []
      }

      return Object.keys(this.currentRole.memberSettings).map(accountId => {
        const account = this.accountMap[accountId]
        const setting = this.currentRole.memberSettings[accountId]

        if (!account || !setting) {
          return null
        }

        const deviceNames = this.getDeviceNames(setting.deviceIds)

        return {
          id: account.id,
          name: account.name,
          phone: account.phone,
          email: account.email,
          department: account.department,
          authorized: setting.authorized !== false,
          includeOutdoor: !!setting.includeOutdoor,
          deviceNames,
          deviceSummary: this.getDeviceSummary(deviceNames, setting.includeOutdoor)
        }
      }).filter(Boolean)
    },
    filteredMembers() {
      const keyword = this.memberSearch.toLowerCase()

      if (!keyword) {
        return this.currentRoleMembers
      }

      return this.currentRoleMembers.filter(member => {
        return member.name.toLowerCase().includes(keyword)
      })
    },
    pagedMembers() {
      const start = (this.memberPagination.page - 1) * this.memberPagination.pageSize
      const end = start + this.memberPagination.pageSize
      return this.filteredMembers.slice(start, end)
    },
    memberRangeText() {
      const total = this.filteredMembers.length

      if (!total) {
        return '第 0-0 条/总共 0 条'
      }

      const start = (this.memberPagination.page - 1) * this.memberPagination.pageSize + 1
      const end = Math.min(this.memberPagination.page * this.memberPagination.pageSize, total)
      return `第 ${start}-${end} 条/总共 ${total} 条`
    },
    availableAccounts() {
      if (!this.currentRole) {
        return []
      }

      const selectedIds = new Set(Object.keys(this.currentRole.memberSettings))
      return this.accounts.filter(account => !selectedIds.has(account.id))
    },
    allPermissionsSelected() {
      if (!this.currentRole) {
        return false
      }

      const selectedIds = new Set(this.currentRole.permissionIds)
      return ALL_PERMISSION_IDS.every(id => selectedIds.has(id))
    },
    permissionHeaderIndeterminate() {
      if (!this.currentRole) {
        return false
      }

      const count = this.currentRole.permissionIds.length
      return count > 0 && count < ALL_PERMISSION_IDS.length
    },
    totalDeviceCount() {
      return ALL_DEVICE_LEAF_IDS.length
    },
    checkedDeviceCount() {
      return this.deviceDialog.checkedLeafIds.length
    },
    allDevicesSelected() {
      return this.checkedDeviceCount > 0 && this.checkedDeviceCount === this.totalDeviceCount
    },
    deviceHeaderIndeterminate() {
      return this.checkedDeviceCount > 0 && this.checkedDeviceCount < this.totalDeviceCount
    }
  },
  watch: {
    selectedRoleId() {
      this.memberPagination.page = 1
    },
    memberSearch() {
      this.memberPagination.page = 1
    }
  },
  methods: {
    tableHeaderStyle() {
      return {
        background: '#f7f8fa',
        color: '#5b6475',
        fontWeight: 500
      }
    },
    selectRole(roleId) {
      this.selectedRoleId = roleId
    },
    maskPhone(phone) {
      if (!phone || phone.length < 7) {
        return phone || '--'
      }

      return `${phone.slice(0, 3)}****${phone.slice(-4)}`
    },
    getMemberIndex(index) {
      return (this.memberPagination.page - 1) * this.memberPagination.pageSize + index + 1
    },
    getDeviceNames(deviceIds) {
      return (deviceIds || []).map(id => DEVICE_LABEL_MAP[id]).filter(Boolean)
    },
    getDeviceSummary(deviceNames, includeOutdoor) {
      if (!deviceNames.length) {
        return ''
      }

      const base = deviceNames.length === 1
        ? deviceNames[0]
        : `${deviceNames[0]} 等 ${deviceNames.length} 项`

      return includeOutdoor ? `${base}（含室外机）` : base
    },
    handlePageChange(page) {
      this.memberPagination.page = page
    },
    handleSizeChange(size) {
      this.memberPagination.page = 1
      this.memberPagination.pageSize = size
    },
    openRoleDialog() {
      this.roleForm = {
        name: '',
        description: ''
      }
      this.dialogs.role = true

      this.$nextTick(() => {
        if (this.$refs.roleForm) {
          this.$refs.roleForm.clearValidate()
        }
      })
    },
    createRole() {
      this.$refs.roleForm.validate(valid => {
        if (!valid) {
          return
        }

        const duplicateRole = this.roles.some(role => role.name === this.roleForm.name)

        if (duplicateRole) {
          this.$message.error('角色名称已存在')
          return
        }

        const roleId = `role-${Date.now()}`
        this.roles.push(
          createRole(roleId, this.roleForm.name, this.roleForm.description, {}, [])
        )
        this.selectedRoleId = roleId
        this.dialogs.role = false
        this.activeTab = 'permissions'
        this.$message.success('角色创建成功')
      })
    },
    openAddMemberDialog() {
      if (!this.availableAccounts.length) {
        this.$message.info('暂无可添加的账号，请先创建账号')
        return
      }

      this.memberForm = {
        accountIds: []
      }
      this.dialogs.member = true

      this.$nextTick(() => {
        if (this.$refs.memberForm) {
          this.$refs.memberForm.clearValidate()
        }
      })
    },
    addMembersToRole() {
      this.$refs.memberForm.validate(valid => {
        if (!valid || !this.currentRole) {
          return
        }

        this.memberForm.accountIds.forEach(accountId => {
          this.$set(this.currentRole.memberSettings, accountId, {
            authorized: true,
            includeOutdoor: false,
            deviceIds: []
          })
        })

        this.dialogs.member = false
        this.$message.success('人员已添加到当前角色')
      })
    },
    openCreateAccountDialog() {
      this.accountForm = {
        name: '',
        phone: '',
        email: '',
        department: '',
        roleId: this.selectedRoleId
      }
      this.dialogs.account = true

      this.$nextTick(() => {
        if (this.$refs.accountForm) {
          this.$refs.accountForm.clearValidate()
        }
      })
    },
    createAccount() {
      this.$refs.accountForm.validate(valid => {
        if (!valid) {
          return
        }

        const duplicatePhone = this.accounts.some(account => account.phone === this.accountForm.phone)
        if (duplicatePhone) {
          this.$message.error('该手机号已创建账号')
          return
        }

        const role = this.roles.find(item => item.id === this.accountForm.roleId)
        const accountId = `user-${Date.now()}`

        this.accounts.push({
          id: accountId,
          name: this.accountForm.name,
          phone: this.accountForm.phone,
          email: this.accountForm.email,
          department: this.accountForm.department
        })

        if (role) {
          this.$set(role.memberSettings, accountId, {
            authorized: true,
            includeOutdoor: false,
            deviceIds: []
          })
          this.selectedRoleId = role.id
        }

        this.dialogs.account = false
        this.$message.success('账号创建成功')
      })
    },
    handleAuthorizeChange(row, value) {
      if (!this.currentRole || !this.currentRole.memberSettings[row.id]) {
        return
      }

      this.$set(this.currentRole.memberSettings, row.id, {
        ...this.currentRole.memberSettings[row.id],
        authorized: value
      })
    },
    openDeviceDialog(row) {
      if (!this.currentRole) {
        return
      }

      const setting = this.currentRole.memberSettings[row.id]

      this.deviceDialog = {
        memberId: row.id,
        checkedLeafIds: setting && setting.deviceIds ? setting.deviceIds.slice() : [],
        includeOutdoor: !!(setting && setting.includeOutdoor)
      }
      this.dialogs.device = true

      this.$nextTick(() => {
        if (this.$refs.deviceTree) {
          this.$refs.deviceTree.setCheckedKeys(this.deviceDialog.checkedLeafIds)
          this.syncCheckedDevices()
        }
      })
    },
    syncCheckedDevices() {
      if (!this.$refs.deviceTree) {
        return
      }

      this.deviceDialog.checkedLeafIds = this.$refs.deviceTree.getCheckedKeys(true)
    },
    handleDeviceTreeCheck() {
      this.syncCheckedDevices()
    },
    toggleAllDevices(checked) {
      if (!this.$refs.deviceTree) {
        return
      }

      this.$refs.deviceTree.setCheckedKeys(checked ? ALL_DEVICE_LEAF_IDS : [])
      this.syncCheckedDevices()
    },
    confirmDeviceSelection() {
      if (!this.currentRole || !this.deviceDialog.memberId) {
        return
      }

      const previousSetting = this.currentRole.memberSettings[this.deviceDialog.memberId] || {}

      this.$set(this.currentRole.memberSettings, this.deviceDialog.memberId, {
        authorized: previousSetting.authorized !== false,
        includeOutdoor: this.deviceDialog.includeOutdoor,
        deviceIds: this.deviceDialog.checkedLeafIds.slice()
      })

      this.dialogs.device = false
      this.$message.success('关联设备已更新')
    },
    removeMember(row) {
      if (!this.currentRole) {
        return
      }

      this.$confirm('移除后，该账号将不再拥有当前角色的权限，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$delete(this.currentRole.memberSettings, row.id)
        this.$message.success('已移除当前成员')
      }).catch(() => {})
    },
    isPermissionChecked(id) {
      return !!(this.currentRole && this.currentRole.permissionIds.includes(id))
    },
    collectPermissionIds(node) {
      const ids = [node.id]

      if (node.children && node.children.length) {
        node.children.forEach(child => {
          ids.push.apply(ids, this.collectPermissionIds(child))
        })
      }

      return ids
    },
    normalizePermissionSelection(selectionSet, nodes) {
      nodes.forEach(node => {
        if (node.children && node.children.length) {
          this.normalizePermissionSelection(selectionSet, node.children)
          const allChildrenSelected = node.children.every(child => selectionSet.has(child.id))

          if (allChildrenSelected) {
            selectionSet.add(node.id)
          } else {
            selectionSet.delete(node.id)
          }
        }
      })
    },
    isPermissionIndeterminate(row) {
      if (!row.children || !row.children.length) {
        return false
      }

      const descendantIds = this.collectPermissionIds(row).slice(1)
      const selectedCount = descendantIds.filter(id => this.isPermissionChecked(id)).length

      return selectedCount > 0 && selectedCount < descendantIds.length
    },
    togglePermission(row, checked) {
      if (!this.currentRole) {
        return
      }

      const selectionSet = new Set(this.currentRole.permissionIds)
      const nodeIds = this.collectPermissionIds(row)

      nodeIds.forEach(id => {
        if (checked) {
          selectionSet.add(id)
        } else {
          selectionSet.delete(id)
        }
      })

      this.normalizePermissionSelection(selectionSet, this.permissionTree)
      this.$set(this.currentRole, 'permissionIds', Array.from(selectionSet))
    },
    toggleAllPermissions(checked) {
      if (!this.currentRole) {
        return
      }

      this.$set(this.currentRole, 'permissionIds', checked ? ALL_PERMISSION_IDS.slice() : [])
    },
    savePermissions() {
      this.$message.success('功能权限已保存')
    }
  }
}
</script>

<style lang="scss" scoped>
.account-page {
  min-height: calc(100vh - 84px);
  padding: 24px;
  background: #fff;
}

.page-header {
  margin-bottom: 20px;

  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #1f2329;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.8;
    color: #7b8496;
  }
}

.account-layout {
  display: flex;
  min-height: 720px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.role-panel {
  display: flex;
  flex-direction: column;
  width: 270px;
  padding: 24px 18px 20px;
  border-right: 1px solid #ebeef5;
  background: #fff;
}

.role-title {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
}

.role-list {
  flex: 1;
  overflow-y: auto;
}

.role-item {
  display: block;
  width: 100%;
  margin-bottom: 8px;
  padding: 12px 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #303133;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: #f5f8ff;
  }

  &.active {
    background: #ecf3ff;
    color: #2d63ff;
    font-weight: 600;
  }
}

.add-role-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 16px;
  border: 0;
  border-radius: 8px;
  background: #ecf3ff;
  color: #2d63ff;
  font-size: 14px;
  cursor: pointer;
}

.content-panel {
  flex: 1;
  min-width: 0;
  padding: 24px;
}

.role-heading {
  margin-bottom: 12px;
  font-size: 22px;
  font-weight: 600;
  color: #1f2329;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  width: 180px;
}

.ghost-btn {
  border-color: #b9d3ff;
  color: #2d63ff;
}

.device-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-link {
  color: #2d63ff;
  cursor: pointer;
}

.authorize-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.muted-text {
  color: #b0b8c5;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 13px;
  color: #7b8496;
}

.permission-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.device-dialog-tools {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.selected-count {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.device-tree-wrapper {
  max-height: 340px;
  padding: 12px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.tree-node {
  display: inline-flex;
  align-items: center;
  color: #303133;
}

::v-deep .account-tabs .el-tabs__content {
  overflow: visible;
}

::v-deep .el-dialog__body {
  padding-top: 20px;
}

::v-deep .el-table .cell {
  word-break: break-word;
}
</style>
