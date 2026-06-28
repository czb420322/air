<template>
  <div class="ant-pro-sider-logo" id="logo">
    <router-link to="/">
      <div class="siderLogoArea">
        <div class="siderLogoText">
          <div class="siderLogoTitle">i管家</div>
          <div class="siderLogoSubtitle">iEasyComfort</div>
        </div>
      </div>
      <h1></h1>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.ant-pro-sider-logo {
  width: 100%;
  text-align: center;
  background: #d9dde5;
  
  a {
    display: block;
    text-decoration: none;
  }
  
  h1 {
    display: none;
  }
}

.siderLogoArea {
  padding: 12px 8px;
  
  .siderLogoText {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .siderLogoTitle {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2px;
    }
    
    .siderLogoSubtitle {
      font-size: 10px;
      color: #9ca3af;
      font-weight: 500;
    }
  }
}
</style>