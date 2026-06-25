<template>
  <div>
    <div v-show="visible" class="tenant-overlay" @click="handleClose">
      <div class="tenant-selector" :style="dropdownStyle" @click.stop>
        <div class="ant-popover-inner" role="tooltip" style="background: transparent; box-shadow: none;">
          <div class="ant-popover-inner-content">
            <div class="userMenu___2qXUK">
            <div class="ant-dropdown-trigger menuItem___3TFYx large___4cUGY projectSelector___1gfNn" @click="toggleExpand">
              <div class="searchInputWrapper___2ZRcc">
                <form class="ant-form ant-form-horizontal ant-btri-form" style="width: 100%;">
                  <div class="ant-form-item" style="margin-bottom: 0px;">
                    <div class="ant-row ant-form-item-row">
                      <div class="ant-col ant-form-item-control">
                        <div class="ant-form-item-control-input">
                          <div class="ant-form-item-control-input-content">
                            <span class="ant-input-affix-wrapper ant-btri-input-box ant-btri-input-undefined ant-btri-input ant-btri-input-pureIcon ant-btri-input-left searchInput___1C_HH">
                              <span class="ant-input-prefix">
                                <span role="img" aria-label="搜索" class="anticon anticon-search">
                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="search" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                                    <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
                                  </svg>
                                </span>
                              </span>
                              <input autocomplete="off" class="ant-input" placeholder="项目关键字搜索..." id="searchName" type="text" v-model="searchKeyword">
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div class="projectInfo___35Dzo">
                <div class="content___2-QXi">
                  <div class="ant-typography ant-typography-ellipsis ant-typography-single-line ant-typography-ellipsis-single-line title___2BFBw" direction="ltr" style="margin-bottom: 0px; display: flex; align-items: center; justify-content: space-between;">
                    <font dir="auto" style="vertical-align: inherit;">
                      <font dir="auto" style="vertical-align: inherit;">{{ selectedProject.company_name }}</font>
                    </font>
                    <div class="rightContent___3AkNH">
                      <div class="ant-btri-icon-box icon___1z14N">
                        <div class="i-icon" :class="{ expanded: isExpanded }">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M557.226667 301.226667l229.546666 229.546666A64 64 0 0 1 741.461333 640H282.453333a64 64 0 0 1-45.226666-109.226667l229.461333-229.546666a64 64 0 0 1 90.538667 0z"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="ant-typography ant-typography-ellipsis ant-typography-single-line ant-typography-ellipsis-single-line subtitle___GC2YJ" direction="ltr" style="margin-bottom: 0px;">
                    <font dir="auto" style="vertical-align: inherit;">
                      <font dir="auto" style="vertical-align: inherit;">{{ selectedProject.code }}</font>
                    </font>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-show="isExpanded" class="projectSelectContainer___i_4b8">
              <div class="ant-btri-menu-box projectSelectMenu___3owUx ant-btri-menu-light">
                <ul class="ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light" dir="ltr" role="menu" tabindex="0" data-menu-list="true" style="width: 100%;">
                  <li 
                    v-for="project in projects" 
                    :key="project.id"
                    class="ant-dropdown-menu-item ant-dropdown-menu-item-active ant-dropdown-menu-item-only-child ant-btri-menu-item" 
                    :class="{ 'ant-dropdown-menu-item-selected': project.id === selectedProject.id }"
                    role="menuitem" 
                    tabindex="-1"
                    @click="selectProject(project)">
                    <span class="ant-dropdown-menu-title-content">
                      <div class="projectName___1_eHh">
                        <div class="type___dnSFw">{{ project.name }}</div>
                        <div class="projectCode___2yL9Z">{{ project.company_name }}</div>
                      </div>
                    </span>
                  </li>
                </ul>
              </div>
              <div class="selectCount___1AJyO">您的账号下，共有<b>{{ projects.length }}</b>个项目</div>
            </div>
            
            <div class="otherMenu___1z3aQ">
            <div class="ant-dropdown-trigger menuItem___3TFYx medium___W1ohJ companySelector___1bF8C" @click="toggleCompanyExpand">
              <div class="content___2-QXi">
                <span class="title___2BFBw">
                  <font dir="auto" style="vertical-align: inherit;">
                    <font dir="auto" style="vertical-align: inherit;">{{ selectedCompany.name }}</font>
                  </font>
                </span>
              </div>
              <div class="rightContent___3AkNH">
                <div class="ant-btri-icon-box icon___1z14N">
                  <div class="i-icon" :class="{ expanded: isCompanyExpanded }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M557.226667 301.226667l229.546666 229.546666A64 64 0 0 1 741.461333 640H282.453333a64 64 0 0 1-45.226666-109.226667l229.461333-229.546666a64 64 0 0 1 90.538667 0z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-show="isCompanyExpanded" class="companyList___3xJ7t">
              <div class="companySearchWrapper___2zR0X">
                <span class="ant-input-affix-wrapper ant-btri-input-box ant-btri-input-undefined ant-btri-input ant-btri-input-pureIcon ant-btri-input-left">
                  <span class="ant-input-prefix">
                    <span role="img" aria-label="搜索" class="anticon anticon-search">
                      <svg viewBox="64 64 896 896" focusable="false" data-icon="search" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                        <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
                      </svg>
                    </span>
                  </span>
                  <input autocomplete="off" class="ant-input" placeholder="搜索公司..." type="text" v-model="companySearchKeyword">
                </span>
              </div>
              <ul class="companyItems___2qP9s">
                <li 
                  v-for="company in filteredCompanies" 
                  :key="company.id"
                  class="companyItem___1oD7J"
                  :class="{ active: company.id === selectedCompany.id }"
                  @click="selectCompany(company)">
                  <span :class="['statusTag___1eLdH', company.status]">
                    {{ company.status === 'verified' ? '已认证' : '未认证' }}
                  </span>
                  <span class="companyName___2Z0fX">{{ company.name }}</span>
                </li>
              </ul>
            </div>
            
            <div v-show="!isCompanyExpanded" class="ant-dropdown-trigger menuItem___3TFYx medium___W1ohJ" @click="toggleLanguageExpand">
              <div class="content___2-QXi">
                <span class="title___2BFBw">
                  <font dir="auto" style="vertical-align: inherit;">
                    <font dir="auto" style="vertical-align: inherit;">语言</font>
                  </font>
                </span>
              </div>
              <div class="rightContent___3AkNH">
                <span class="value___3Nfz3">
                  <font dir="auto" style="vertical-align: inherit;">
                    <font dir="auto" style="vertical-align: inherit;">{{ selectedLanguage.name }}</font>
                  </font>
                </span>
                <div class="ant-btri-icon-box icon___1z14N">
                  <div class="i-icon" :class="{ expanded: isLanguageExpanded }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M557.226667 301.226667l229.546666 229.546666A64 64 0 0 1 741.461333 640H282.453333a64 64 0 0 1-45.226666-109.226667l229.461333-229.546666a64 64 0 0 1 90.538667 0z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-show="isLanguageExpanded" class="languageList___1xOq7">
              <ul class="languageItems___3cP6V">
                <li 
                  v-for="lang in languages" 
                  :key="lang.id"
                  class="languageItem___2zK0E"
                  :class="{ active: lang.id === selectedLanguage.id }"
                  @click="selectLanguage(lang)">
                  <span class="langCode___1mJ8x">{{ lang.id }}</span>
                  <span class="langName___2lW9D">{{ lang.name }}</span>
                </li>
              </ul>
            </div>
            
            <div v-show="!isCompanyExpanded && !isLanguageExpanded" class="ant-dropdown-trigger menuItem___3TFYx medium___W1ohJ" @click="toggleThemeExpand">
              <div class="content___2-QXi">
                <span class="title___2BFBw">
                  <font dir="auto" style="vertical-align: inherit;">
                    <font dir="auto" style="vertical-align: inherit;">主题</font>
                  </font>
                </span>
              </div>
              <div class="rightContent___3AkNH">
                <span class="value___3Nfz3">
                  <font dir="auto" style="vertical-align: inherit;">
                    <font dir="auto" style="vertical-align: inherit;">{{ selectedTheme.name }}</font>
                  </font>
                </span>
                <div class="ant-btri-icon-box icon___1z14N">
                  <div class="i-icon" :class="{ expanded: isThemeExpanded }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M557.226667 301.226667l229.546666 229.546666A64 64 0 0 1 741.461333 640H282.453333a64 64 0 0 1-45.226666-109.226667l229.461333-229.546666a64 64 0 0 1 90.538667 0z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-show="isThemeExpanded" class="themeList___1v5H8">
              <ul class="themeItems___2kL8Q">
                <li 
                  v-for="theme in themes" 
                  :key="theme.id"
                  class="themeItem___2xM7K"
                  :class="{ active: theme.id === selectedTheme.id, dark: theme.id === 'dark' }"
                  @click="selectTheme(theme)">
                  <span class="themeName___3Z9N8">{{ theme.name }}</span>
                </li>
              </ul>
            </div>
            
            <div v-show="!isCompanyExpanded && !isLanguageExpanded && !isThemeExpanded" class="ant-dropdown-trigger menuItem___3TFYx" @click="toggleUserExpand">
              <div class="avatar___afyqn">
                <font dir="auto" style="vertical-align: inherit;">
                  <font dir="auto" style="vertical-align: inherit;">管</font>
                </font>
              </div>
              <div class="content___2-QXi">
                <span class="title___2BFBw">
                  <font dir="auto" style="vertical-align: inherit;">
                    <font dir="auto" style="vertical-align: inherit;">管忠高</font>
                  </font>
                </span>
              </div>
              <div class="rightContent___3AkNH">
                <div class="ant-btri-icon-box icon___1z14N">
                  <div class="i-icon" :class="{ expanded: isUserExpanded }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M557.226667 301.226667l229.546666 229.546666A64 64 0 0 1 741.461333 640H282.453333a64 64 0 0 1-45.226666-109.226667l229.461333-229.546666a64 64 0 0 1 90.538667 0z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 用户菜单列表放在用户信息下方 -->
            <div v-show="isUserExpanded" class="userMenuList___1L7jJ">
              <ul class="userMenuItems___3Z8cO">
                <li 
                  v-for="item in userMenuItems" 
                  :key="item.id"
                  class="userMenuItem___2R8sP"
                  @click="handleUserMenuItem(item)">
                  <span class="userMenuIcon___1aY7B">
                    <svg v-if="item.icon === 'settings'" viewBox="64 64 896 896" focusable="false" data-icon="setting" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 009.3-35.2l-.9-2.6a443.74 443.74 0 00-79.7-137.9l-1.8-2.1a32.12 32.12 0 00-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 00-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 00-25.8 25.7l-15.8 85.4a351.86 351.86 0 00-99 57.4l-81.9-29.1a32 32 0 00-35.1 9.5l-1.8 2.1a446.02 446.02 0 00-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1 0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 00-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0035.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0025.8 25.7l2.7.5a449.4 449.4 0 00159 0l2.7-.5a32.05 32.05 0 0025.8-25.7l15.7-85a350 350 0 0099.7-57.6l81.3 28.9a32 32 0 0035.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1 74.7 63.9a370.03 370.03 0 01-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3-17.9 97a377.5 377.5 0 01-85 0l-17.9-97.2-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5 0-15.3 1.2-30.6 3.7-45.5l6.5-40-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2 31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3 17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97 38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8 92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 01512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 01400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 01624 502c0 29.9-11.7 58-32.8 79.2z"></path></svg>
                    <svg v-else-if="item.icon === 'arrow'" viewBox="64 64 896 896" focusable="false" data-icon="send" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 00-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z"></path></svg>
                    <svg v-else-if="item.icon === 'logout'" viewBox="64 64 896 896" focusable="false" data-icon="logout" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 01-112.7 75.9A352.8 352.8 0 01512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 01-112.7-75.9 353.28 353.28 0 01-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82 271.7 82.6 79.6 277.1 82 516.4 84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7 3.4-5.3-.4-12.3-6.7-12.3zm88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 000-12.6z"></path></svg>
                  </span>
                  <span class="userMenuText___1aY7B">{{ item.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- AI助手悬浮按钮 - 可拖动 -->
    <div 
      class="aiAssistantButton___7gH2k"
      :style="{ top: aiButtonPosition.top + 'px', left: aiButtonPosition.left + 'px' }"
      @mousedown="startDragAiButton"
      @click="aiDrawerVisible = true">
      <img src="https://static-btri.midea.com/mfs/1004/1780623294980.gif" alt="AI助手">
      <div class="aiAssistantLabel___9LmN3">AI助手</div>
    </div>

    <!-- AI助手抽屉 -->
    <el-drawer
      :visible.sync="aiDrawerVisible"
      direction="rtl"
      size="520.39px"
      :show-close="false"
      :modal="false"
      :append-to-body="false">
      <!-- 自定义头部 -->
      <div slot="title" class="ant-drawer-header">
        <div class="ant-drawer-header-title">
          <div class="ant-btri-drawer-title">
            <font dir="auto" style="vertical-align: inherit;">
              <font dir="auto" style="vertical-align: inherit;">小美数字助手</font>
            </font>
          </div>
          <div class="ant-btri-drawer-closeIcon" @click="aiDrawerVisible = false">
            <div class="ant-btri-icon-box">
              <div class="i-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M367.488 307.626667l4.010667 3.541333L512 451.626667l140.501333-140.458667a42.666667 42.666667 0 0 1 63.872 56.32l-3.541333 4.010667L572.373333 512l140.458667 140.501333a42.666667 42.666667 0 0 1-56.32 63.872l-4.010667-3.541333L512 572.373333l-140.501333 140.458667a42.666667 42.666667 0 0 1-63.872-56.32l3.541333-4.010667L451.626667 512 311.168 371.498667a42.666667 42.666667 0 0 1 56.32-63.872z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="aiDrawerContent___7Kj8m" style="height: 927px;">
        
        <!-- 对话区域 -->
        <div class="chatArea___7LmN3">
          <div class="aiMessage___7Kj8m">
            <img width="32px" height="32px" src="data:image/png;base64,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" alt="AI图标" class="aiAvatar___7Kj8m">
            <div class="messageContent___7Kj8m">
              <p>你好，我是智能AI助手，有什么可以帮你的吗？</p>
            </div>
          </div>
          
          <!-- 用户消息 -->
          <div v-for="(msg, index) in aiMessages" :key="index" :class="['messageItem___7Kj8m', msg.type]">
        
            <div v-if="msg.type === 'user'" class="userMessage___7Kj8m">
              <div class="messageContent___7Kj8m">
                <p>{{ msg.content }}</p>
              </div>
              <span class="messageIcon___7Kj8m">
                <img width="32px" height="32px" src="data:image/png;base64,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"> </img>
                </span>
            </div>
            <div v-else class="aiMessage___7Kj8m">
              <img width="32px" height="32px" src="data:image/png;base64,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" alt="AI图标" class="aiAvatar___7Kj8m">
              <div class="messageContent___7Kj8m">
                <p>{{ msg.content }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="aiChatInputWrapper___3UsiB">
          <div class="quickPhraseList___3UT8f">
            <div class="ant-btri-tag quickPhraseTag___2UzAu" @click="sendQuickMessage('创建日程')">
              <span class="ant-tag ant-btri-tag-box ant-btri-tag-raduis ant-btri-tag--middle ant-btri-tag--default ant-btri-tag--no-border">
                <span class="">创建日程</span>
              </span>
            </div>
            <div class="ant-btri-tag quickPhraseTag___2UzAu" @click="sendQuickMessage('我要控制设备')">
              <span class="ant-tag ant-btri-tag-box ant-btri-tag-raduis ant-btri-tag--middle ant-btri-tag--default ant-btri-tag--no-border">
                <span class="">我要控制设备</span>
              </span>
            </div>
          </div>
          <div class="aiChatInput___c6NOD">
            <span class="ant-input-affix-wrapper ant-btri-input-box ant-btri-input-undefined ant-btri-input-lg ant-btri-input-pureIcon ant-btri-input-left ant-input-affix-wrapper-lg">
              <input v-model="aiInputMessage" placeholder="请输入内容" class="ant-input ant-input-lg" type="text" @keyup.enter="sendAiMessage">
              <span class="ant-input-suffix">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <div class="ant-btri-icon-box" style="cursor: pointer; font-size: 20px;" @click="sendAiMessage">
                    <div class="i-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" style="margin-left: 60px;" viewBox="0 0 1024 1024"><path fill="currentColor" d="M911.146667 88.021333l1.877333 0.853334a42.368 42.368 0 0 1 13.141333 8.96l0.682667 0.682666c0.768 0.810667 1.450667 1.621333 2.133333 2.432l-2.816-3.114666a43.093333 43.093333 0 0 1 8.746667 12.544l0.298667 0.768a41.386667 41.386667 0 0 1 1.365333 30.122666l-0.298667 0.853334-283.733333 810.666666c-12.8 36.437333-63.573333 38.528-79.274667 3.2l-155.477333-349.824-349.781333-155.434666c-33.621333-14.933333-33.365333-61.738667-1.749334-77.226667l4.992-2.048 810.666667-283.733333 1.28-0.426667a42.581333 42.581333 0 0 1 0.896-0.298667l-2.176 0.725334c2.048-0.725333 4.138667-1.28 6.186667-1.706667 0.213333 0 0.426667 0 0.682666-0.085333a41.258667 41.258667 0 0 1 22.357334 2.133333z m-117.205334 202.325334l-292.949333 292.949333 106.538667 239.701333 186.410666-532.650666zM733.653333 229.973333L200.96 416.426667l239.701333 106.496 292.992-292.992z"></path></svg>
                  </div>
                  </div>
                </div>
              </span>
            </span>
            <div class="ant-btri-icon-box" style="cursor: pointer; font-size: 20px;" @click="aiMessages = []">
              <div class="i-icon">
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M613.930667 85.333333a42.666667 42.666667 0 0 1 37.546666 22.485334L708.224 213.333333H896a42.666667 42.666667 0 0 1 4.992 85.034667L896 298.666667h-42.666667v597.333333a42.666667 42.666667 0 0 1-37.674666 42.368L810.666667 938.666667H213.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V298.666667H128a42.666667 42.666667 0 0 1-4.992-85.034667L128 213.333333h188.032l58.026667-105.813333a42.666667 42.666667 0 0 1 32.298666-21.888L411.477333 85.333333zM768 298.666667H256v554.666666h512V298.666667z m-341.333333 128a42.666667 42.666667 0 0 1 42.368 37.674666L469.333333 469.333333v234.666667a42.666667 42.666667 0 0 1-85.034666 4.992L384 704V469.333333a42.666667 42.666667 0 0 1 42.666667-42.666666z m170.666666 0a42.666667 42.666667 0 0 1 42.368 37.674666L640 469.333333v234.666667a42.666667 42.666667 0 0 1-85.034667 4.992L554.666667 704V469.333333a42.666667 42.666667 0 0 1 42.666666-42.666666z m-8.96-256h-151.637333l-23.381333 42.666666h197.973333l-22.954667-42.666666z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'TenantSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ top: 0, left: 0, height: 0 })
    }
  },
  data() {
    return {
      searchKeyword: '',
      isExpanded: false,
      projects: [
        { id: 1, name: '大型多联机',company_name: '良渚数字文化', code: 'XM202408211122' },
        { id: 2, name: '大型多联机',company_name: '大悦城', code: 'XM202408211123' }
      ],
      isCompanyExpanded: false,
      companySearchKeyword: '',
      companies: [
        { id: 1, name: '大悦城', status: 'unverified' },
        { id: 2, name: '良渚数字产业园', status: 'unverified' },
        { id: 3, name: '良渚数字大厦', status: 'verified' }
      ],
      selectedCompany: { id: 3, name: '良渚数字大厦', status: 'verified' },
      isLanguageExpanded: false,
      languages: [
        { id: 'cn', name: '简体中文' },
        { id: 'us', name: '英文' }
      ],
      selectedLanguage: { id: 'cn', name: '简体中文' },
      isThemeExpanded: false,
      themes: [
        { id: 'light', name: '亮色' },
        { id: 'dark', name: '暗色' }
      ],
      selectedTheme: { id: 'light', name: '亮色' },
      isUserExpanded: false,
      userMenuItems: [
        { id: 'profile', name: '个人中心', icon: 'settings' },
        // { id: 'workspace', name: '回工作台', icon: 'arrow' },
        { id: 'logout', name: '退出登录', icon: 'logout' }
      ],
      aiButtonPosition: { top: 720, left: 30 },
      isDraggingAiButton: false,
      dragStartPos: { x: 0, y: 0 },
      aiDrawerVisible: false,
      aiInputMessage: '',
      aiMessages: []
    }
  },
  computed: {
    selectedProject() {
      return this.$store.state.settings.selectedProject
    },
    dropdownStyle() {
      return {
        top: `${this.position.top + this.position.height + 8}px`,
        left: `${this.position.left}px`
      }
    },
    filteredCompanies() {
      if (!this.companySearchKeyword) {
        return this.companies
      }
      const keyword = this.companySearchKeyword.toLowerCase()
      return this.companies.filter(company => 
        company.name.toLowerCase().includes(keyword)
      )
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    },
    selectProject(project) {
      this.selectedProject = project
      this.$store.dispatch('settings/setProject', project)
      this.isExpanded = false
    },
    toggleCompanyExpand() {
      this.isCompanyExpanded = !this.isCompanyExpanded
      this.isExpanded = false
    },
    selectCompany(company) {
      this.selectedCompany = company
      this.isCompanyExpanded = false
    },
    toggleLanguageExpand() {
      this.isLanguageExpanded = !this.isLanguageExpanded
      this.isCompanyExpanded = false
    },
    selectLanguage(language) {
      this.selectedLanguage = language
      this.isLanguageExpanded = false
    },
    toggleThemeExpand() {
      this.isThemeExpanded = !this.isThemeExpanded
      this.isCompanyExpanded = false
      this.isLanguageExpanded = false
    },
    selectTheme(theme) {
      this.selectedTheme = theme
      this.isThemeExpanded = false
      this.$store.dispatch('settings/setTheme', theme.id)
    },
    toggleUserExpand() {
      this.isUserExpanded = !this.isUserExpanded
      this.isCompanyExpanded = false
      this.isLanguageExpanded = false
      this.isThemeExpanded = false
    },
    handleUserMenuItem(item) {
      this.isUserExpanded = false
      if (item.id === 'logout') {
        this.$store.dispatch('user/logout').then(() => {
          this.$router.push('/login')
        })
      } else if (item.id === 'workspace') {
        this.$router.push('/workspace')
      } else if (item.id === 'profile') {
        this.$router.push('/profile/index')
      }
    },
    startDragAiButton(e) {
      this.isDraggingAiButton = true
      this.dragStartPos = {
        x: e.clientX - this.aiButtonPosition.left,
        y: e.clientY - this.aiButtonPosition.top
      }
      document.addEventListener('mousemove', this.dragAiButton)
      document.addEventListener('mouseup', this.stopDragAiButton)
    },
    dragAiButton(e) {
      if (this.isDraggingAiButton) {
        this.aiButtonPosition = {
          top: e.clientY - this.dragStartPos.y,
          left: e.clientX - this.dragStartPos.x
        }
      }
    },
    stopDragAiButton() {
      this.isDraggingAiButton = false
      document.removeEventListener('mousemove', this.dragAiButton)
      document.removeEventListener('mouseup', this.stopDragAiButton)
    },
    sendAiMessage() {
      if (this.aiInputMessage.trim()) {
        this.aiMessages.push({
          type: 'user',
          content: this.aiInputMessage
        })
        // 模拟AI回复
        setTimeout(() => {
          this.aiMessages.push({
            type: 'ai',
            content: '收到您的问题：' + this.aiInputMessage + '，正在处理中...'
          })
        }, 500)
        this.aiInputMessage = ''
      }
    },
    sendQuickMessage(msg) {
      this.aiInputMessage = msg
      this.sendAiMessage()
    }
  },
  mounted() {
    // 初始化AI按钮位置
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.dragAiButton)
    document.removeEventListener('mouseup', this.stopDragAiButton)
  }
}
</script>

<style lang="scss" scoped>
.tenant-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: transparent;
}

.tenant-selector {
  position: fixed;
  width: 296px;
  max-height: 450px;
  background: #d9dde5;
  border-radius: 8px;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  overflow: visible;
  border: 1px solid #c5cad6;
  z-index: 10000;
}

.userMenu___2qXUK {
  padding: 8px;
}

.menuItem___3TFYx {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid transparent;

  &[data-v-04468f6e] {
    padding: 21px 12px;
  }

  &:hover {
    background: #f5f5f5;
    border-color: #000;
  }

  &:active,
  &:focus {
    outline: none;
    border-color: #000;
  }

  &.large___4cUGY.projectSelector___1gfNn[data-v-04468f6e] {
    width: 278px;
    height: 96px;
    flex-direction: column;
    align-items: stretch;
    padding: 8px 12px;
    gap: 10px;
    background: #f3f7ff;
    border-radius: 8px;
  }

  &.medium___W1ohJ[data-v-04468f6e] {
    width: 278px;
    justify-content: space-between;
  }
}

.searchInputWrapper___2ZRcc {
  width: 100%;
}

.searchInput___1C_HH {
  width: 194px;
  height: 22px;
  padding: 4px 12px;
  color: rgba(13, 13, 13, 0.75);
  font-size: 14px;
  line-height: 1.5715;
  background-color: #ffffff;
  border: 1px solid #8e9ab4;
  border-radius: 4px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.projectInfo___35Dzo {
  width: 100%;
}

.content___2-QXi {
  flex: 1;
}

.title___2BFBw {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.subtitle___GC2YJ {
  font-size: 12px;
  color: #3b82f6;
}

.rightContent___3AkNH {
  display: flex;
  align-items: center;
  gap: 8px;
}

.i-icon {
  transition: transform 0.2s ease;
  
  &.expanded {
    transform: rotate(180deg);
  }
}

.projectSelectContainer___i_4b8 {
  background: #fff;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}

.projectSelectMenu___3owUx {
  padding: 4px 0;
}

.ant-dropdown-menu {
  border: none;
  box-shadow: none;
  padding: 0;
  margin: 0;
}

.ant-dropdown-menu-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.ant-dropdown-menu-item-selected {
    background: #f3f7ff;
    border-left: 3px solid #3b82f6;
  }
}

.projectName___1_eHh {
  display: flex;
  gap: 12px;
}

.type___dnSFw {
  font-size: 14px;
  color: #333;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 4px;
}

.projectCode___2yL9Z {
  font-size: 14px;
  color: #3b82f6;
}

.selectCount___1AJyO {
  padding: 8px 12px;
  font-size: 12px;
  color: #999;
  text-align: center;
  background: #f9f9f9;
  border-top: 1px solid #e8e8e8;
  
  b {
    color: #333;
    font-weight: 500;
  }
}

.companySelector___1bF8C {
  background: #fff;
  border-radius: 4px;
}

.companyList___3xJ7t {
  background: #fff;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  width: 100%;
}

.companySearchWrapper___2zR0X {
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
}

.companyItems___2qP9s {
  list-style: none;
  padding: 0;
  margin: 0;
}

.companyItem___1oD7J {
  padding: 17px 12px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  
  &:hover {
    background: #fff;
  }
  
  &.active {
    background: #fff;
  }
}

.statusTag___1eLdH {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  
  &.unverified {
    background: #fff2f0;
    color: #ff4d4f;
  }
  
  &.verified {
    background: #f6ffed;
    color: #52c41a;
  }
}

.companyName___2Z0fX {
  font-size: 14px;
  color: #333;
}

.languageList___1xOq7 {
  background: #fff;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  width: 100%;
}

.languageItems___3cP6V {
  list-style: none;
  padding: 0;
  margin: 0;
}

.languageItem___2zK0E {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.active {
    background: #f3f7ff;
  }
}

.langCode___1mJ8x {
  font-size: 14px;
  color: #999;
}

.langName___2lW9D {
  font-size: 14px;
  color: #333;
}

.themeList___1v5H8 {
  background: #fff;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  width: 100%;
}

.themeItems___2kL8Q {
  list-style: none;
  padding: 0;
  margin: 0;
}

.themeItem___2xM7K {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.active {
    background: #f3f7ff;
  }
  
  &.dark {
    background: #fff;
    border: 1px solid #e8e8e8;
    
    .themeName___3Z9N8 {
      color: #333;
    }
    
    &:hover {
      background: #f5f5f5;
    }
    
    &.active {
      background: #f3f7ff;
    }
  }
}

.themeName___3Z9N8 {
  font-size: 14px;
  color: #333;
}

.userMenuList___1L7jJ {
  background: #fff;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  width: 100%;
  display: block;
  position: relative;
  z-index: 100;
  margin-top: 4px;
}

.userMenuItems___3Z8cO {
  list-style: none;
  padding: 0;
  margin: 0;
}

.userMenuItem___2R8sP {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background: #f5f5f5;
  }
}

.userMenuIcon___1aY7B {
  font-size: 14px;
  color: #999;
}

.userMenuText___1aY7B {
  font-size: 14px;
  color: #333;
}

.otherMenu___1z3aQ {
  margin-top: 4px;
}

.value___3Nfz3 {
  font-size: 13px;
  color: #999;
}

.icon___1z14N {
  color: #999;
  font-size: 12px;
}

.avatar___afyqn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.ant-input-affix-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  min-width: 0;
  padding: 4px 12px;
  color: rgba(13, 13, 13, 0.75);
  font-size: 14px;
  line-height: 1.5715;
  background-color: #ffffff;
  background-image: none;
  border: 1px solid #8e9ab4;
  border-radius: 4px;
  transition: all 0.3s;
  display: inline-flex;
}

.ant-input {
  width: 362.39px;
  height: 25.14px;
  border: none;
  outline: none;
  background: transparent;
}

.light .userMenu___2qXUK .menuItem___3TFYx.projectSelector___1gfNn {
  flex-direction: column;
  margin-left: 16px;
  align-items: stretch;
  padding: 8px 12px;
  grid-gap: 10px;
  gap: 10px;
  background: #f3f7ff;
  border-radius: 8px;
}

.aiAssistantButton___7gH2k {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: move;
  
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .aiAssistantLabel___9LmN3 {
    margin-top: 4px;
    font-size: 12px;
    color: #333;
    background: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
}

.aiDrawerContent___7Kj8m {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.ant-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.ant-drawer-header-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ant-btri-drawer-title {
  font-weight: bold;
  color: #333;
}

.ant-btri-drawer-extra {
  display: flex;
  align-items: center;
}

.ant-btri-drawer-closeIcon {
  cursor: pointer;
  padding: 4px;
  &:hover {
    opacity: 0.7;
  }
}

.chatArea___7LmN3 {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  
  .aiMessage___7Kj8m {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    
    .aiAvatar___7Kj8m {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .messageContent___7Kj8m {
      background: #f0f5ff;
      padding: 12px 16px;
      border-radius: 0 12px 12px 12px;
      max-width: 70%;
      
      p {
        margin: 0;
        font-size: 14px;
        color: #333;
  
      }
    }
  }
  
  .userMessage___7Kj8m {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
    
    .messageContent___7Kj8m {
      display: flex;
      align-items: center;
      background: #fff;
      padding: 12px 16px;
      border-radius: 12px 0 12px 12px;
      max-width: 70%;
      border: none;
      
      .messageIcon___7Kj8m {
        width: 32px;
        height: 32px;
        margin-left: 8px;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        svg {
          width: 100%;
          height: 100%;
          fill: #1890ff;
        }
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: #333;
        line-height: 1.5;
        word-break: break-word;
      }
    }
  }
}

.quickButtons___8LmN3 {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
  width: 150px;
  height: 24px;
  
  button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    color: #666;
    
    &:hover {
      background: #e8e8e8;
    }
  }
  
  .scheduleBtn___7Kj8m {
    width: 56px;
    height: 18px;
    background: #f5f5f5;
  }
  
  .deviceBtn___7Kj8m {
    width: 84px;
    height: 18px;
    background: #f5f5f5;
  }
}
.messageIcon___7Kj8m img{
  border-radius: 50%;
}
// 输入区域容器
.aiChatInputWrapper___3UsiB {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 158px 16px;
  border-top: 1px solid #e8e8e8;
  background: #fff;
}

// 快捷按钮列表
.quickPhraseList___3UT8f {
  display: flex;
  gap: 8px;
  
  .quickPhraseTag___2UzAu {
    cursor: pointer;
    
    .ant-tag {
      padding: 4px 12px;
      font-size: 12px;
      background: #f5f5f5;
      border: none;
      border-radius: 4px;
      
      &:hover {
        background: #e8e8e8;
      }
    }
  }
}

// 输入框区域
.aiChatInput___c6NOD {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .ant-input-affix-wrapper {
    flex: 1;
    border-radius: 4px;
    border: 1px solid #d9d9d9;
    
    &:focus,
    &:focus-within {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  
  .ant-input {
    border: none;
    box-shadow: none;
  }
  
  .ant-btri-icon-box {
    color: #999;
    cursor: pointer;
    
    &:hover {
      color: #1890ff;
    }
  }
}

.inputArea___7LmN3 {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
  gap: 8px;
  
  input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    
    &:focus {
      border-color: #1890ff;
    }
    
    &::placeholder {
      color: #bbb;
    }
  }
  
  button {
    padding: 8px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #f0f0f0;
    }
  }
  
  .sendButton___7Kj8m:hover {
    background: #e6f7ff;
  }
}
</style>