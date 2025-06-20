import { ChartIcon } from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/pricingTasks',
    component: Layout,
    redirect: '/pricingTasks/largeSalesPlan',
    name: 'pricingTasks',
    meta: {
      title: '采价任务管理',
      icon: ChartIcon,
      menuId: 8
    },
    children: [
      {
        path: 'largeSalesPlan',
        name: 'largeSalesPlan',
        component: () => import('@/pages/pricingTasks/largeSalesPlan/index.vue'),
        meta: { title: '大额出售计划', menuId: 9 },
      },
      {
        path: 'largeSalesPlan/detail/:id',
        name: 'largeSalesPlanDetail',
        component: () => import('@/pages/pricingTasks/largeSalesPlan/detail.vue'),
        meta: {
          title: '大额出售计划详情',
          menuId: 9,
          parent: 'largeSalesPlan',
          hidden: true
        },
        props: true,
      },
      {
        path: 'marketPriceReporting',
        name: 'marketPriceReporting',
        component: () => import('@/pages/pricingTasks/marketPriceReporting/index.vue'),
        meta: { title: '采价数据审核', menuId: 10 },
      },
      {
        path: 'marketPriceReporting/detail/:id',
        name: 'marketPriceReportingDetail',
        component: () => import('@/pages/pricingTasks/marketPriceReporting/detail.vue'),
        meta: {
          title: '采价数据详情',
          menuId: 10,
          parent: 'marketPriceReporting',
          hidden: true
        },
        props: true,
      },
      {
        path: 'taskAssignment',
        name: 'taskAssignment',
        component: () => import('@/pages/pricingTasks/taskAssignment/index.vue'),
        meta: { title: '任务下派', menuId: 11 },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        // component: Layout,
        meta: {
          title: '统计分析',
          menuId: 12
        },
      },
      {
        path: 'taskPlan',
        name: 'taskPlan',
        component: () => import('@/pages/pricingTasks/taskPlan/index.vue'),
        meta: { title: '任务计划', menuId: 13 },
      },
      {
        path: 'taskPlanDetail/detail/:id',
        name: 'taskPlanDetail',
        component: () => import('@/pages/pricingTasks/taskPlan/components/TaskPlanDetail.vue'),
        meta: {
          title: '采价任务详情',
          menuId: 13,
          parent: 'taskPlanDetail',
          hidden: true
        },
        props: true,
      },
      // {
      //   path: 'priceLocationReportPlan',
      //   name: 'priceLocationReportPlan',
      //   component: () => import('@/pages/pricingTasks/priceLocationReportPlan/index.vue'),
      //   meta: { title: '采价点上报计划', menuId: 14 },
      // },
      // {
      //   path: 'priceLocationReportPlanDetail/detail/:id',
      //   name: 'priceLocationReportPlanDetail',
      //   component: () => import('@/pages/pricingTasks/priceLocationReportPlan/components/PriceLocationReportPlanDetail.vue'),
      //   meta: {
      //     title: '采价点上报计划详情',
      //     menuId: 14,
      //     parent: 'priceLocationReportPlanDetail',
      //     hidden: true
      //   },
      //   props: true,
      // },
    ],
  },
];