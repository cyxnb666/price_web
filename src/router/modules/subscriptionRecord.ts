import { ShopIcon } from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
    {
        path: '/subscriptionRecord',
        component: Layout,
        redirect: '/subscriptionRecord/index',
        name: 'subscriptionRecord',
        meta: {
            title: '订购记录',
            icon: ShopIcon,
            menuId: 19
        },
        children: [
            {
                path: 'index',
                name: 'subscriptionRecordIndex',
                component: () => import('@/pages/subscriptionRecord/index.vue'),
                meta: { title: '订购记录', menuId: 20 },
            },
            {
                path: 'detail/:id',
                name: 'subscriptionRecordDetail',
                component: () => import('@/pages/subscriptionRecord/detail.vue'),
                meta: {
                    title: '订购记录详情',
                    menuId: 19,
                    parent: 'subscriptionRecordIndex',
                    hidden: true
                },
                props: true,
            },
        ],
    },
];