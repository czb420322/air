import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '数据驾驶舱', icon: 'dashboard' }
    }]
  },

  {
    path: '/equipment',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Equipment',
        component: () => import('@/views/equipment/index'),
        meta: { title: '设备管理', icon: 'el-icon-s-tools' }
      }
    ]
  },

  {
    path: '/schedule',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Schedule',
        component: () => import('@/views/schedule/index'),
        meta: { title: '日程管理', icon: 'el-icon-calendar' }
      }
    ]
  },

  {
    path: '/fault',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Fault',
        component: () => import('@/views/table/index'),
        meta: { title: '故障管理', icon: 'el-icon-warning' }
      }
    ]
  },

  {
    path: '/energy',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Energy',
        component: () => import('@/views/table/index'),
        meta: { title: '能耗管理', icon: 'el-icon-trending-up' }
      }
    ]
  },

  {
    path: '/billing',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Billing',
        component: () => import('@/views/table/index'),
        meta: { title: '分户计费', icon: 'el-icon-wallet' }
      }
    ]
  },

  {
    path: '/config',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Config',
        component: () => import('@/views/table/index'),
        meta: { title: '配置中心', icon: 'el-icon-setting' }
      }
    ]
  },

  {
    path: '/logs',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Logs',
        component: () => import('@/views/table/index'),
        meta: { title: '操作日志', icon: 'el-icon-document' }
      }
    ]
  },

  {
    path: '/account',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Account',
        component: () => import('@/views/table/index'),
        meta: { title: '账号权限', icon: 'el-icon-user' }
      }
    ]
  },

  {
    path: '/system',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'System',
        component: () => import('@/views/system/index'),
        meta: { title: '系统设置', icon: 'el-icon-s-tools' }
      }
    ]
  },

  {
    path: '/profile',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Profile',
        component: () => import('@/views/profile/index'),
        meta: { title: '个人中心', icon: 'el-icon-user' }
      }
    ],
    hidden: true
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
