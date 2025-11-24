<script setup lang="ts">
import { ref, computed } from 'vue';
import { predictLstm } from '@/services/api';
import type { LstmResponse } from '@/services/api';

const reviewText = ref('');
const result = ref<LstmResponse>({ sentiment: '' as any, probability: 0 });
const isLoading = ref(false);
const error = ref<string | null>(null);

// 결과에 따른 동적 CSS 클래스 계산
const isPositive = computed(() => result.value.sentiment === 'Positive');

const sentimentColorClass = computed(() => 
  isPositive.value ? 'text-green-600' : 'text-red-600'
);

const sentimentBgClass = computed(() => 
  isPositive.value ? 'bg-green-500' : 'bg-red-500'
);

const sentimentBorderClass = computed(() => 
  isPositive.value ? 'border-green-500' : 'border-red-500'
);

const analyzeSentiment = async () => {
  if (!reviewText.value.trim()) return;

  isLoading.value = true;
  error.value = null;
  result.value = { sentiment: '' as any, probability: 0 };

  try {
    const response = await predictLstm(reviewText.value);
    result.value = response;
  } catch (err: any) {
    console.error("LSTM 예측 실패:", err);
    error.value = "서버 또는 모델 호출 중 오류가 발생했습니다.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">
      💬 영화 리뷰 감성 분석기 (LSTM)
    </h1>
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      
      <!-- 입력 폼 -->
      <div class="mb-8">
        <label for="reviewText" class="block text-lg font-semibold mb-2 text-gray-700">
          분석할 영화 리뷰 텍스트를 입력하세요:
        </label>
        <textarea id="reviewText" v-model="reviewText" rows="5"
          class="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
          placeholder="예: 이 영화는 스토리도 좋고 배우들 연기도 완벽했어요. 최고입니다!"></textarea>
        
        <button @click="analyzeSentiment" :disabled="isLoading || !reviewText.trim()"
          class="mt-4 px-8 py-3 w-full bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50">
          {{ isLoading ? '분석 중...' : '감성 분석하기' }}
        </button>
      </div>
      
      <!-- 결과 영역 -->
      <div class="bg-blue-50 p-6 rounded-lg shadow-inner">
        <h2 class="text-2xl font-semibold mb-4 text-blue-700 text-center">분석 결과</h2>
        
        <div v-if="error" class="text-red-600 font-medium text-center">
          ⚠️ 예측 오류: {{ error }}
        </div>

        <div v-else-if="result.sentiment">
          <p class="text-lg text-gray-600 mb-4 text-center">
            입력하신 리뷰는 **<span :class="sentimentColorClass">{{ result.sentiment }}</span>**으로 예측되었습니다.
          </p>

          <!-- 시각화 막대 -->
          <div class="w-full h-10 rounded-full overflow-hidden shadow-lg border-2" :class="sentimentBorderClass">
            <div 
              :style="{ width: `${result.probability * 100}%` }" 
              :class="sentimentBgClass"
              class="h-full flex items-center justify-end pr-3 transition-all duration-500 ease-in-out">
              <span class="text-white font-bold">{{ (result.probability * 100).toFixed(1) }}%</span>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-500 text-center">
            {{ result.sentiment }} 예측 신뢰도
          </p>
        </div>

        <div v-else class="text-center text-gray-500">
          <p class="text-lg">분석을 위해 텍스트를 입력하고 버튼을 눌러주세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS 사용으로 최소화 */
</style>