<script setup lang="ts">
import { ref } from 'vue';
import { predictIris } from '@/services/api';
import type { IrisRequest, IrisResponse } from '@/services/api';

// 입력 폼 데이터의 초기값 (Versicolor 범위의 중간값)
const formData = ref<IrisRequest>({
  sepal_length: 5.8,
  sepal_width: 2.7,
  petal_length: 4.5,
  petal_width: 1.5,
});

// 예측 결과 상태
const result = ref<IrisResponse>({ prediction: '', confidence: 0 });
const isLoading = ref(false);
const error = ref<string | null>(null);


const predictClassification = async () => {
  isLoading.value = true;
  error.value = null;
  result.value = { prediction: '', confidence: 0 };

  try {
    const response = await predictIris(formData.value);
    result.value = response;
  } catch (err: any) {
    console.error("Iris 분류 실패:", err);
    error.value = "서버 또는 모델 호출 중 오류가 발생했습니다. 입력 값을 확인해 주세요.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">
      🌸 붓꽃 종류 분류기 (KNN)
    </h1>
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      
      <!-- 입력 폼 -->
      <form @submit.prevent="predictClassification" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- 꽃받침 길이 (Sepal Length) -->
        <div class="input-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">꽃받침 길이 (Sepal Length, cm)</label>
          <input type="number" v-model.number="formData.sepal_length" required min="1" max="10" step="0.1"
            class="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500">
        </div>
        
        <!-- 꽃받침 너비 (Sepal Width) -->
        <div class="input-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">꽃받침 너비 (Sepal Width, cm)</label>
          <input type="number" v-model.number="formData.sepal_width" required min="1" max="5" step="0.1"
            class="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500">
        </div>
        
        <!-- 꽃잎 길이 (Petal Length) -->
        <div class="input-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">꽃잎 길이 (Petal Length, cm)</label>
          <input type="number" v-model.number="formData.petal_length" required min="0.1" max="8" step="0.1"
            class="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500">
        </div>
        
        <!-- 꽃잎 너비 (Petal Width) -->
        <div class="input-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">꽃잎 너비 (Petal Width, cm)</label>
          <input type="number" v-model.number="formData.petal_width" required min="0.1" max="3" step="0.1"
            class="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500">
        </div>
        
        <!-- 제출 버튼 -->
        <div class="md:col-span-2 mt-4">
          <button type="submit" :disabled="isLoading"
            class="w-full px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50">
            {{ isLoading ? '분류 중...' : '붓꽃 분류하기' }}
          </button>
        </div>
      </form>

      <!-- 결과 영역 -->
      <div v-if="result.prediction" class="mt-8 bg-green-50 p-6 rounded-lg shadow-inner text-center">
        <h2 class="text-2xl font-semibold mb-3 text-green-800">예측 결과</h2>
        
        <div v-if="error" class="text-red-600 font-medium">
          ⚠️ 예측 오류: {{ error }}
        </div>
        
        <div v-else>
          <p class="text-lg text-gray-600 mb-2">
            예측된 붓꽃의 종류는
          </p>
          <p class="text-6xl font-extrabold text-green-700">
            {{ result.prediction }}
          </p>
          <p class="text-xl font-bold mt-3 text-gray-700">
            신뢰도: <span class="text-green-600">{{ (result.confidence * 100).toFixed(1) }}%</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS 사용으로 최소화 */
</style>