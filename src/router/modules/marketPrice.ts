import { ChartAnalyticsIcon } from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/marketPrice',
    component: Layout,
    redirect: '/marketPrice/pricingMarket',
    name: 'marketPrice',
    meta: {
      title: '行情价',
      icon: ChartAnalyticsIcon,
      menuId: 15
    },
    children: [
      {
        path: 'pricingMarket',
        name: 'pricingMarket',
        component: () => import('@/pages/marketPrice/pricingMarket/index.vue'),
        meta: { title: '采价行情', menuId: 16 },
      },
      {
        path: 'pricingMarket/detail/:id',
        name: 'pricingMarketDetail',
        component: () => import('@/pages/marketPrice/pricingMarket/components/PricingMarketDetail.vue'),
        meta: {
          title: '采价行情详情',
          menuId: 16,
          parent: 'pricingMarket',
          hidden: true
        },
        props: true,
      },
      // {
      //   path: 'otherSources',
      //   name: 'otherSources',
      //   component: () => import('@/pages/marketPrice/otherSources/index.vue'),
      //   meta: { title: '其他来源', menuId: 17 },
      // },
      {
        path: 'subscriptionMarket',
        name: 'subscriptionMarket',
        component: () => import('@/pages/marketPrice/subscriptionMarket/index.vue'),
        meta: { title: '订购行情', menuId: 18 },
      },
    ],
  },
];