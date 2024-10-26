import { h, resolveComponent } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
// import {isAuthenticated} from '@/store/modules/auth'

import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/',
    name: 'home',
    component: DefaultLayout,
    redirect: '/contracts',
    meta:{
        requiresAuth: true
      },
    children: [
        {
            path: '/contracts',
            name: 'Contracts',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () =>
              import(/* webpackChunkName: "dashboard" */ '@/views/Contracts.vue'),
              meta:{
                requiresAuth: true
              }
          },
          {
            path: '/organization-contracts',
            name: 'OrganizationContracts',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () =>
              import(/* webpackChunkName: "dashboard" */ '@/views/OrganizationContracts.vue'),
              meta:{
                requiresAuth: true
              }
          },
    //   {
    //     path: '/dashboard',
    //     name: 'Dashboard',
    //     // route level code-splitting
    //     // this generates a separate chunk (about.[hash].js) for this route
    //     // which is lazy-loaded when the route is visited.
    //     component: () =>
    //       import(/* webpackChunkName: "dashboard" */ '@/views/Contracts.vue'),
    //       meta:{
    //         requiresAuth: true
    //       }
    //   },
      {
        path: '/fonds',
        name: 'Fonds',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/views/Fonds.vue'),
          meta:{
            requiresAuth: true
          }
      },
      {
        path: '/protocols',
        name: 'Protocols',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/views/protocols/Protocols.vue'),
          meta:{
            requiresAuth: true
          }
      },
      {
        path: '/protocols/detail/:id',
        name: 'ProtocolInfo',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/views/protocols/ProtocolInfo.vue'),
          meta:{
            requiresAuth: true
          },
          props: route => ({ id: route.params.id })
      },
      {
        path: '/distribution/:id',
        name: 'Distribution',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/views/Distribution.vue'),
          meta:{
            requiresAuth: true
          }
      },
      {
        path: '/distributions',
        name: 'Distributions',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/views/Distributions.vue'),
          meta:{
            requiresAuth: true
          }
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/pages/Login'),
  },
  {
    path: '/pages',
    redirect: '/pages/404',
    name: 'Pages',
    component: {
      render() {
        return h(resolveComponent('router-view'))
      },
    },
    children: [
      {
        path: '/404',
        name: 'Page404',
        component: () => import('@/views/pages/Page404'),
      },
      {
        path: '/500',
        name: 'Page500',
        component: () => import('@/views/pages/Page500'),
      },
    //   {
    //     path: '/login',
    //     name: 'Login',
    //     component: () => import('@/views/pages/Login'),
    //   },
      {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/pages/Register'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

// const isLoggedIn = localStorage.getItem('accessToken')

router.beforeEach((to,from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    // Check if the route requires authentication
    if (requiresAuth) {
      const isLoggedIn = localStorage.getItem('accessToken')
        // console.log(isLoggedIn)
      if (isLoggedIn) {
        // User is logged in, proceed to the route
        next()
        // return next('/')
      } else {
        // User is not logged in, redirect to login page
        next({ name: 'Login' })
      }
    } else {
      // Route doesn't require authentication, proceed

      next()
    }
  })
  

export default router
