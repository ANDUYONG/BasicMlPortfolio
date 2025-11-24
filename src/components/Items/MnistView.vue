<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { predictMnist } from '@/services/api';
import type { MnistResponse } from '@/services/api';


// 캔버스 관련 상태
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
const isDrawing = ref(false);

// 예측 관련 상태
const result = ref<MnistResponse>({ prediction: null as any, confidence: 0 });
const isLoading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 20; // 굵기 설정
      ctx.lineCap = 'round'; // 선 끝 모양
      ctx.strokeStyle = 'white'; // 색상 (배경이 검은색이므로 흰색으로 그려야 합니다)
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, 280, 280); // 배경을 검은색으로 채우기
    }
  }
});

// 그림 그리기 시작
const startDrawing = (event: MouseEvent | TouchEvent) => {
  if (!ctx) return;
  isDrawing.value = true;
  ctx.beginPath();
  const coords = getClientCoords(event);
  ctx.moveTo(coords.x, coords.y);
  event.preventDefault(); // 터치 스크롤 방지
};

// 그림 그리기
const draw = (event: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx) return;
  const coords = getClientCoords(event);
  ctx.lineTo(coords.x, coords.y);
  ctx.stroke();
  event.preventDefault();
};

// 그림 그리기 종료
const stopDrawing = () => {
  isDrawing.value = false;
  if (ctx) {
    ctx.closePath();
  }
};

// 마우스 또는 터치 좌표 가져오기
const getClientCoords = (event: MouseEvent | TouchEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect();
  let clientX, clientY;

  if (event instanceof MouseEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else { // TouchEvent
    const touches = event.touches as TouchList;
    clientX = touches[0]?.clientX;
    clientY = touches[0]?.clientY;
  }
  
  // 캔버스 내 좌표로 변환
  const x = clientX! - rect.left;
  const y = clientY! - rect.top;

  // 비율에 맞게 스케일링 (280x280)
  const scaleX = canvasRef.value!.width / rect.width;
  const scaleY = canvasRef.value!.height / rect.height;

  return { 
    x: x * scaleX, 
    y: y * scaleY 
  };
};


// 캔버스 지우기
const clearCanvas = () => {
  if (ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 280, 280);
    result.value = { prediction: null as any, confidence: 0 };
    error.value = null;
  }
};

// 예측 수행
const predict = async () => {
  if (!canvasRef.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    // 캔버스 이미지를 Base64 문자열로 가져옴
    // Flask 백엔드에서는 이 이미지를 받아 28x28로 리사이징하고 전처리해야 합니다.
    const base64Image = canvasRef.value.toDataURL('image/png');
    
    // API 호출
    const response = await predictMnist(base64Image);
    
    result.value = response;

  } catch (err: any) {
    console.error("MNIST 예측 실패:", err);
    error.value = "서버 또는 모델 호출 중 오류가 발생했습니다.";
    result.value = { prediction: null as any, confidence: 0 };
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">
      ✍️ 손글씨 숫자 인식기 (MNIST)
    </h1>
    <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl flex flex-col md:flex-row gap-8">
      
      <!-- 캔버스 영역 -->
      <div class="md:w-1/2 flex flex-col items-center">
        <h2 class="text-xl font-semibold mb-3 text-gray-700">여기에 숫자를 그려주세요 (0-9)</h2>
        <canvas 
          ref="canvasRef" 
          width="280" 
          height="280" 
          class="border-4 border-indigo-500 rounded-lg bg-black cursor-crosshair shadow-lg"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart="startDrawing"
          @touchmove="draw"
          @touchend="stopDrawing"
        ></canvas>
        <div class="mt-4 flex gap-4">
          <button @click="predict" :disabled="isLoading"
            class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-50">
            {{ isLoading ? '예측 중...' : '예측하기' }}
          </button>
          <button @click="clearCanvas" :disabled="isLoading"
            class="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-md hover:bg-gray-500 transition duration-300 disabled:opacity-50">
            지우기
          </button>
        </div>
      </div>
      
      <!-- 결과 영역 -->
      <div class="md:w-1/2 bg-indigo-50 p-6 rounded-lg shadow-inner flex flex-col justify-center items-center">
        <h2 class="text-2xl font-semibold mb-4 text-indigo-700">예측 결과</h2>
        
        <div v-if="error" class="text-red-600 font-medium">
          ⚠️ 예측 오류: {{ error }}
        </div>

        <div v-else-if="result.prediction !== null">
          <p class="text-6xl font-extrabold text-indigo-900 mb-2">{{ result.prediction }}</p>
          <p class="text-xl text-gray-600">
            확률: <span class="font-bold text-indigo-600">{{ (result.confidence * 100).toFixed(2) }}%</span>
          </p>
          <p class="mt-4 text-center text-sm text-gray-500">
            (이 모델은 28x28 픽셀의 이미지로 변환하여 예측합니다.)
          </p>
        </div>

        <div v-else class="text-center text-gray-500">
          <p class="text-lg">캔버스에 숫자를 그린 후 '예측하기' 버튼을 눌러주세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind CSS 사용으로 최소화 */
</style>