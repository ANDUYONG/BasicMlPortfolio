<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">
      🚢 타이타닉 생존 예측 시뮬레이터
    </h1>
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      
      <!-- 입력 폼 -->
      <form @submit.prevent="predictSurvival" class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div class="form-group">
            <label for="embarked">승선항 (Embarked)</label>
            <select id="embarked" v-model="embarked">
                <option value="S">S - Southampton (사우스햄튼)</option>
                <option value="C">C - Cherbourg (셰르부르)</option>
                <option value="Q">Q - Queenstown (퀸즈타운)</option>
            </select>
        </div>
        
        <!-- 객실 등급 (Pclass) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">객실 등급 (Pclass)</label>
          <select v-model.number="formData.pclass" required
            class="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
            <option :value="1">1 (1등실)</option>
            <option :value="2">2 (2등실)</option>
            <option :value="3">3 (3등실)</option>
          </select>
        </div>
        
        <!-- 성별 (Sex) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">성별 (Sex)</label>
          <select v-model="formData.sex" required
            class="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
            <option value="male">남성 (Male)</option>
            <option value="female">여성 (Female)</option>
          </select>
        </div>
        
        <!-- 나이 (Age) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">나이 (Age)</label>
          <input type="number" v-model.number="formData.age" required min="1" max="100"
            class="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
        </div>
        
        <!-- 동승한 형제/배우자 수 (SibSp) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">동승한 형제/배우자 수 (SibSp)</label>
          <input type="number" v-model.number="formData.sibsp" required min="0" max="10"
            class="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
        </div>

        <!-- 동승한 부모/자녀 수 (Parch) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">동승한 부모/자녀 수 (Parch)</label>
          <input type="number" v-model.number="formData.parch" required min="0" max="10"
            class="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
        </div>
        
        <!-- 요금 (Fare) - 실제 모델이 사용했다면 추가 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">지불한 요금 ($) (Fare)</label>
          <input type="number" v-model.number="formData.fare" required min="0" step="0.01"
            class="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
        </div>
        
        <!-- 제출 버튼 -->
        <div class="md:col-span-2 mt-4">
          <button type="submit" :disabled="isLoading"
            class="w-full px-8 py-3 bg-yellow-600 text-white font-bold rounded-lg shadow-md hover:bg-yellow-700 transition duration-300 disabled:opacity-50">
            {{ isLoading ? '예측 중...' : '생존 확률 예측하기' }}
          </button>
        </div>
      </form>

      <!-- 결과 영역 -->
      <div v-if="result.survived !== null" class="mt-8 bg-yellow-50 p-6 rounded-lg shadow-inner text-center">
        <h2 class="text-2xl font-semibold mb-3 text-yellow-800">예측 결과</h2>
        
        <div v-if="error" class="text-red-600 font-medium">
          ⚠️ 예측 오류: {{ error }}
        </div>
        
        <div v-else>
          <p class="text-lg text-gray-600 mb-2">
            이 승객의 **생존 예측 확률**은
          </p>
          <p class="text-6xl font-extrabold" :class="survivalColorClass">
            {{ (result.probability * 100).toFixed(1) }}%
          </p>
          <p class="text-2xl font-bold mt-3" :class="survivalColorClass">
            {{ result.survived === 1 ? '🎉 생존으로 예측됩니다.' : '😞 사망으로 예측됩니다.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { predictTitanic } from '@/services/api';
import type { TitanicRequest, TitanicResponse } from '@/services/api';

// 입력 폼 데이터의 초기값
const formData = ref<TitanicRequest>({
  embarked: 'S',
  pclass: 3,
  sex: 'male',
  age: 30,
  sibsp: 0,
  parch: 0,
  fare: 30.00,
});

// 예측 결과 상태
const result = ref<TitanicResponse>({ survived: null as any, probability: 0 });
const isLoading = ref(false);
const error = ref<string | null>(null);

// 결과에 따른 동적 CSS 클래스 계산
const survivalColorClass = computed(() => {
  if (result.value.survived === 1) {
    return 'text-green-600';
  } else if (result.value.survived === 0) {
    return 'text-red-600';
  }
  return 'text-gray-500';
});

const predictSurvival = async () => {
  isLoading.value = true;
  error.value = null;
  result.value = { survived: null as any, probability: 0 };

  try {
    // API 호출 시, ref.value를 전송
    const response = await predictTitanic(formData.value);
    result.value = response;
  } catch (err: any) {
    console.error("Titanic 예측 실패:", err);
    error.value = "서버 또는 모델 호출 중 오류가 발생했습니다. 모든 필드를 확인해 주세요.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Tailwind CSS 사용으로 최소화 */
</style>