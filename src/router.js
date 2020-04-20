import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
    routes:
    [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/VCP-20',
            component: () => import('@/views/VCP20/Layout.vue'),
            meta: { title: "VCP-20" },
            children: [
                {
                    path: '/VCP-20',
                    redirect: '/VCP-20/dashboard'
                },
                {
                    path: '/VCP-20/dashboard',
                    component: () => import('@/views/VCP20/Dashboard.vue')
                },
                {
                    path: '/VCP-20/prod',
                    component: () => import('@/views/VCP20/Prod.vue')
                },
                {
                    path: '/VCP-20/store',
                    component: () => import('@/views/VCP20/Store.vue')
                },
                {
                    path: '/VCP-20/statistic',
                    component: () => import('@/views/VCP20/Statistic.vue')
                },
                {
                    path: '/VCP-20/history',
                    component: () => import('@/views/VCP20/History.vue')
                },
                {
                    path: '/VCP-20/abnormality',
                    component: () => import('@/views/VCP20/Abnormality.vue')
                },
                {
                    path: '/VCP-20/document',
                    component: () => import('@/views/VCP20/Document.vue')
                },
            ]
        },
        {
            path: '/VCP-30', 
            component: () => import('@/views/VCP30/Layout.vue'),
            children: 
            [
                {
                    path: '/VCP-30',
                    redirect: '/VCP-30/dashboard'
                },
                {
                    path: '/VCP-30/dashboard',
                    component: () => import('@/views/VCP30/Dashboard.vue'),
                },
                {
                    path: '/VCP-30/prod',
                    component: () => import('@/views/VCP30/Prod.vue')
                },
                {
                    path: '/VCP-30/PPR',
                    component: () => import('@/views/VCP30/PPR.vue')
                },
                {
                    path: '/VCP-30/store',
                    component: () => import('@/views/VCP30/Store.vue')
                },
                {
                    path: '/VCP-30/mo',
                    component: () => import('@/views/VCP30/MO.vue')
                },
                {
                    path: '/VCP-30/history',
                    component: () => import('@/views/VCP30/History.vue')
                },
                {
                    path: '/VCP-30/abnormality',
                    component: () => import('@/views/VCP30/Abnormality.vue')
                },
                {
                    path: '/VCP-30/potion',
                    component: () => import('@/views/VCP30/Potion.vue')
                },
            ]
        },
        {
            path: '/login',
            component: () => import('@/views/Page/Login.vue')
        },
        {
            path: '/404',
            component: () => import('@/views/Page/404.vue')
        },
        {
            path: '/403',
            component: () => import('@/views/Page/403.vue')
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})

