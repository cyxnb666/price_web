import { LocationIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/priceLocation',
    component: Layout,
    redirect: '/priceLocation/mange',
    name: 'priceLocation',
    meta: {
      title: '采价点管理',
      icon: LocationIcon,
      menuId:6
    },
    children: [
      {
        path: 'mange',
        name: 'priceLocationMange',
        component: () => import('@/pages/priceLocation/mange/index.vue'),
        meta: { title: '采价点维护', menuId:7 },
      },
      {
        path: 'priceLocationTemp',
        name: 'priceLocationMangeTemp',
        component: () => import('@/pages/priceLocation/mange/indexTemp.vue'),
        meta: { title: '临时采价点', menuId:21 },
      },
    ],
  },
];
