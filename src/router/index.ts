// frontend/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// 💡 각 프로젝트에 대응하는 뷰 컴포넌트를 미리 정의합니다.
import MnistView from '@/components/Items/MnistView.vue'
import LstmView from '@/components/Items/LstmView.vue'
import TitanicView from '@/components/Items/TitanicView.vue'
import KnnView from '@/components/Items/KnnView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/mnist' // 기본 경로를 손글씨 인식 페이지로 리다이렉트
    },
    {
      path: '/mnist',
      name: 'mnist',
      component: MnistView,
      meta: { title: '손글씨 인식기' }
    },
    {
      path: '/lstm',
      name: 'lstm',
      component: LstmView,
      meta: { title: '감성 분석기' }
    },
    {
      path: '/titanic',
      name: 'titanic',
      component: TitanicView,
      meta: { title: '타이타닉 예측' }
    },
    {
      path: '/knn',
      name: 'knn',
      component: KnnView,
      meta: { title: '붓꽃 분류' }
    }
  ]
})

export default router