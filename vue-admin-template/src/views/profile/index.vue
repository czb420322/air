<template>
  <div class="profile-container">
    <!-- 左侧导航 -->
    <div class="left-sidebar">
      <div 
        v-for="item in menus" 
        :key="item.id"
        class="sidebar-item"
        :class="{ active: activeMenu === item.id }"
        @click="handleMenuClick(item)">
        <iconify-icon :icon="item.icon" class="menu-icon"></iconify-icon>
        <span class="menu-text">{{ item.name }}</span>
        <iconify-icon v-if="item.children" :icon="expandedMenu === item.id ? '@mbt20240226:ibuilding:chevron-down' : '@mbt20240226:ibuilding:chevron-right'" class="expand-icon"></iconify-icon>
      </div>
      <div v-if="expandedMenu === 'company'" class="sub-sidebar">
        <div 
          v-for="subItem in companySubMenus" 
          :key="subItem.id"
          class="sub-sidebar-item"
          :class="{ active: activeMenu === subItem.id }"
          @click="activeMenu = subItem.id">
          <span class="sub-menu-text">{{ subItem.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- 右侧内容 -->
    <div class="right-content">
      <!-- 基本设置 -->
      <div v-if="activeMenu === 'basic'" class="content-section">
        <div class="section-header">
          <el-divider content-position="left">
            <span class="section-title">基本设置</span>
          </el-divider>
        </div>
        
        <div class="form-container">
          <el-form :model="form" label-width="80px">
            <el-form-item label="姓名" label-position="left">
              <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
            </el-form-item>
            
      
            
            <el-form-item label="绑定账号" label-position="left">
              <span class="form-value">{{ form.bindAccount }}</span>
            </el-form-item>
            
            <el-form-item label="注册时间" label-position="left">
              <span class="form-value">{{ form.registerTime }}</span>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="updateInfo">更新信息</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <!-- 安全设置 -->
      <div v-if="activeMenu === 'security'" class="content-section">
        <div class="section-header">
          <el-divider content-position="left">
            <span class="section-title">安全设置</span>
          </el-divider>
        </div>
        
        <div class="form-container">
          <el-form :model="securityForm" label-width="120px">
            <el-form-item label="修改密码" label-position="left">
              <el-button type="text" @click="openPasswordModal">点击修改密码</el-button>
            </el-form-item>
            
            <el-form-item label="绑定手机" label-position="left">
              <span class="form-value">{{ securityForm.phone }}</span>
              <el-button type="text" @click="openPhoneModal">更换绑定</el-button>
            </el-form-item>
            
            </el-form>
        </div>
      </div>
      
      <!-- 我的公司 -->
      <div v-if="activeMenu === 'myCompany'" class="content-section">
        <div class="section-header">
          <el-divider content-position="left">
            <span class="section-title">公司管理 / 我的公司</span>
          </el-divider>
        </div>
        
        <div class="company-header">
          <el-button type="primary" @click="showJoinModal = true">加入新公司</el-button>
        </div>
        
        <div class="company-table">
          <el-table :data="companyList" border>
            <el-table-column prop="name" label="公司名称" width="350"></el-table-column>
            <el-table-column prop="manager" label="主管理员" width="280"></el-table-column>
            <el-table-column prop="joinTime" label="加入时间" width="200"></el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button type="text" @click="showExitConfirmModal(scope.row.id)">退出公司</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-info">
            第1-4条/共{{ companyList.length }}条
          </div>
        </div>
      </div>
      

    
    <!-- 修改绑定手机弹窗 -->
    <el-dialog title="修改绑定手机" :visible.sync="showPhoneModal" width="450px" @close="closePhoneModal">
      <el-form :model="phoneForm" label-width="100px">
        <el-form-item label="手机号码" label-position="left" required>
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPhone">保存</el-button>
      </div>
    </el-dialog>
    
    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" :visible.sync="showPasswordModal" width="450px" @close="closePasswordModal">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码" label-position="left" required>
          <el-input type="password" v-model="passwordForm.oldPassword" placeholder="请输入原密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" label-position="left" required>
          <el-input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" label-position="left" required>
          <el-input type="password" v-model="passwordForm.confirmPassword" placeholder="请确认新密码"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitPassword">保存</el-button>
      </div>
    </el-dialog>
    <!-- 退出公司-->
    <el-dialog title="确定退出该公司吗？" :visible.sync="showExitConfirm" width="300px" append-to-body>
        <div class="dialog-footer">
          <el-button @click="showExitConfirm = false">取消</el-button>
          <el-button type="primary" @click="confirmExit">确定</el-button>
        </div>  
    </el-dialog>
    
    <!-- 申请加入公司 -->
    <el-dialog title="申请加入公司" :visible.sync="showJoinModal" width="600px" append-to-body>
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px;">
          <label style="display: inline-block; width: 80px; text-align: right; margin-right: 12px;">* 公司名称</label>
          <el-input v-model="joinForm.company" placeholder="请输入公司名称" style="width: 450px;"></el-input>
        </div>
        <div>
          <label style="display: inline-block; width: 80px; text-align: right; margin-right: 12px; vertical-align: top;">* 申请原因</label>
          <el-input  type="textarea" v-model="joinForm.reason" placeholder="请输入申请加入公司原因，字数大于5" rows="4" style="width: 450px;"></el-input>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showJoinModal = false">取消</el-button>
        <el-button type="primary" @click="submitJoin">确定</el-button>
      </div>
    </el-dialog>
  </div>
  </div>
  
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      activeMenu: 'basic',
      expandedMenu: 'company',
      menus: [
        { id: 'basic', name: '基本设置', icon: '@mbt20240226:ibuilding:user' },
        { id: 'security', name: '安全设置', icon: '@mbt20240226:ibuilding:lock' },
        { id: 'company', name: '公司管理', icon: '@mbt20240226:ibuilding:building', children: true }
      ],
      companySubMenus: [
        { id: 'myCompany', name: '我的公司' },
 
      ],
      companyList: [
        { id: 1, name: '大悦城', manager: '管忠高', joinTime: '2024-04-27 19:07:37' },
        { id: 2, name: '大悦城产业园', manager: '管忠高', joinTime: '2024-04-27 11:25:26' },
        { id: 3, name: '良渚数字产业园', manager: '管忠高', joinTime: '2024-08-11 17:25:26' },
        { id: 4, name: '良渚数字大厦', manager: '良渚', joinTime: '2024-12-06 21:19:11' },
        { id: 5, name: '杭州新远东机电设备有限公司', manager: '陈雷', joinTime: '2025-02-07 14:05:45' }
      ],
      form: {
        name: 'admin',
        bindAccount: '',
        registerTime: '2024-02-22 14:21:34'
      },
      securityForm: {
        phone: '138****8888'
      },
      companyForm: {
        name: '良渚数字大厦',
        address: '浙江省杭州市余杭区良渚街道',
        phone: '0571-88888888'
      },
      showPhoneModal: false,
      phoneForm: {
        phone: '',
        code: ''
      },
      showPasswordModal: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showExitConfirm: false,
      exitCompanyId: null,
      showJoinModal: false,
      joinForm: {
        company: '',
        reason: ''
      }
    }
  },
  methods: {
    updateInfo() {
      this.$message.success('信息更新成功')
    },
    handleMenuClick(item) {
      if (item.children) {
        this.expandedMenu = this.expandedMenu === item.id ? '' : item.id
      } else {
        this.activeMenu = item.id
      }
    },
    joinCompany() {
      this.$message.success('加入新公司功能')
    },
    submitJoin() {
      if (!this.joinForm.company || !this.joinForm.reason) {
        this.$message.error('请填写完整信息')
        return
      }
      if (this.joinForm.reason.length <= 5) {
        this.$message.error('申请原因字数需大于5')
        return
      }
      this.showJoinModal = false
      this.joinForm.company = ''
      this.joinForm.reason = ''
      this.$message.success('申请提交成功')
    },
    exitCompany(companyId) {
      this.$message.confirm('确定要退出该公司吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.companyList = this.companyList.filter(item => item.id !== companyId)
        this.$message.success('退出成功')
      }).catch(() => {
        this.$message.info('已取消退出')
      })
    },
    showExitConfirmModal(companyId) {
      this.exitCompanyId = companyId
      this.showExitConfirm = true
    },
    confirmExit() {
      this.companyList = this.companyList.filter(item => item.id !== this.exitCompanyId)
      this.showExitConfirm = false
      this.$message.success('退出成功')
    },
    openPhoneModal() {
      this.showPhoneModal = true
    },
    openPasswordModal() {
      this.showPasswordModal = true
    },
    closePasswordModal() {
      this.showPasswordModal = false
      this.passwordForm.oldPassword = ''
      this.passwordForm.newPassword = ''
      this.passwordForm.confirmPassword = ''
    },
    closePhoneModal() {
      this.showPhoneModal = false
      this.phoneForm.phone = ''
    },
    submitPhone() {
      if (!this.phoneForm.phone) {
        this.$message.error('请输入手机号码')
        return
      }
      this.$message.success('绑定成功')
      this.securityForm.phone = this.phoneForm.phone
      this.closePhoneModal()
    },
    submitPassword() {
      if (!this.passwordForm.newPassword) {
        this.$message.error('请输入新密码')
        return
      }
      if (!this.passwordForm.confirmPassword) {
        this.$message.error('请确认新密码')
        return
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.$message.error('两次输入密码不一致')
        return
      }
      this.$message.success('密码修改成功')
      this.closePasswordModal()
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f7fa;
}

.left-sidebar {
  width: 180px;
  background: #fff;
  padding: 16px 0;
  border-right: 1px solid #e8e8e8;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  
  &:hover {
    background: #f5f7fa;
    color: #1890ff;
  }
  
  &.active {
    background: #e6f7ff;
    color: #1890ff;
    border-left: 3px solid #1890ff;
  }
}

.menu-icon {
  font-size: 18px;
  margin-right: 10px;
}

.menu-text {
  font-size: 14px;
  flex: 1;
  text-align: left;
}

.expand-icon {
  font-size: 12px;
  color: #999;
}

.sub-sidebar {
  background: #fafafa;
  padding-left: 20px;
}

.sub-sidebar-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  
  &:hover {
    background: #f0f0f0;
    color: #1890ff;
  }
  
  &.active {
    color: #1890ff;
    font-weight: 500;
  }
}

.sub-menu-text {
  font-size: 13px;
}

.right-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.form-container {
  padding: 0 20px;
}

.form-value {
  color: #666;
  font-size: 14px;
}

.el-form-item {
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: inline-block;
  width: 100px;
  text-align: right;
  margin-right: 12px;
  font-weight: 500;
  color: #333;
}

.el-form-item__label {
  font-weight: 500;
  color: #333;
}

.el-button {
  margin-right: 12px;
}

.company-header {
  margin-bottom: 16px;
}

.company-table {
  margin-top: 16px;
}

.pagination-info {
  text-align: center;
  padding: 12px;
  color: #999;
  font-size: 13px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
  color: #999;
}

.company-table :deep(.el-table .cell) {
  padding-left: 53px;
}
</style>
