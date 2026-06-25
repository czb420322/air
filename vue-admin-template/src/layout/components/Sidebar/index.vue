<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <div class="ant-pro-sider-extra" v-if="showLogo">
      <div class="siderExtraArea">
        <div class="siderExtraDivider"></div>
        <div class="siderTenantInfo" @click="handleTenantClick">
          <div class="siderTenantName">
            <span class="siderTenantNameText">{{ selectedProject.company_name }}</span>
            <span class="ant-btri-icon-box iconDownSmall">
              <i :class="['el-icon-arrow-down', { 'rotate': showTenantDropdown }]"></i>
            </span>
          </div>
          <div class="siderTenantCode">{{ selectedProject.code }}</div>
        </div>
      </div>
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    selectedProject() {
      return this.$store.state.settings.selectedProject
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    handleTenantClick() {
      const tenantInfo = document.querySelector('.siderTenantInfo')
      if (tenantInfo) {
        const rect = tenantInfo.getBoundingClientRect()
        this.$emit('open-tenant-selector', {
          top: rect.top,
          left: rect.left,
          height: rect.height
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ant-pro-sider-extra {
  padding: 0 8px;
  
  .siderExtraArea {
    .siderExtraDivider {
      height: 1px;
      background: #c5cad6;
      margin-bottom: 8px;
    }
    
    .siderTenantInfo {
      text-align: center;
      cursor: pointer;
      
      .siderTenantName {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 12px;
        color: #3b82f6;
        font-weight: 500;
        
        .ant-btri-icon-box {
          font-size: 10px;
          color: #3b82f6;
          transition: transform 0.3s;
          
          .rotate {
            transform: rotate(180deg);
          }
        }
        
        .el-icon-arrow-down {
          color: #3b82f6;
        }
      }
      
      .siderTenantCode {
        font-size: 10px;
        color: #9ca3af;
        margin-top: 2px;
      }
    }
  }
}
</style>