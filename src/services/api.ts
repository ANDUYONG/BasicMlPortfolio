// 🚨 중요: 아래의 YOUR_NGROK_PUBLIC_URL을 ml_server.ipynb 실행 시 출력된 실제 Ngrok URL로 변경해야 합니다.
const API_BASE_URL = 'https://oceanographical-wayward-mark.ngrok-free.dev/api'; 

// =========================================================================
// 1. 공통 타입 정의
// =========================================================================

// API 통신을 위한 공통 인터페이스
interface ApiResponse<T> {
  data: T;
}

// =========================================================================
// 2. TitanicView.vue 관련 타입 정의 및 API 함수
//   - Pclass, Sex, Age, SibSp, Parch, Fare를 사용하여 생존 예측 (joblib.load)
// =========================================================================

export interface TitanicRequest {
  embarked: 'S' | 'C' | 'Q'; // 승선항 (Southampton, Cherbourg, Queenstown)
  pclass: number; // 객실 등급 (1, 2, 3)
  sex: 'male' | 'female'; // 성별
  age: number; // 나이
  sibsp: number; // 동승한 형제/배우자 수
  parch: number; // 동승한 부모/자녀 수
  fare: number; // 지불한 요금
}

export interface TitanicResponse {
  survived: 0 | 1; // 0: 사망, 1: 생존
  probability: number; // 생존 확률 (0.0 ~ 1.0)
}

/**
 * Titanic 생존 예측 API 호출
 * @param data 예측에 필요한 승객 정보
 * @returns 생존 예측 결과 (survived, probability)
 */
export async function predictTitanic(data: TitanicRequest): Promise<TitanicResponse> {
  // 1. sex 인코딩 (male: 0, female: 1)
  const sex_encoded = data.sex === 'female' ? 1 : 0;
  
  // 2. embarked OHE (임시값 설정)
  // 프론트엔드 입력 폼에는 embarked 필드가 없으므로, 기본값(예: S)을 가정하고 OHE 처리합니다.
  // ⚠️ 프론트엔드 폼에 embarked 선택 필드를 추가하는 것이 가장 정확합니다. 
  // 여기서는 임시로 'Southampton (S)'로 가정합니다 (embarked_S = 1, embarked_Q = 0).
  const embarked_Q = data.embarked === 'Q' ? 1 : 0;
  const embarked_S = data.embarked === 'S' ? 1 : 0;
  
  // 3. 특징 공학 (FamilySize, IsAlone)
  const familySize = data.sibsp + data.parch + 1;
  const isAlone = familySize === 1 ? 1 : 0;
  
  // 4. 8개의 피처 배열 구성 (백엔드 모델이 기대하는 순서에 맞춰 구성)
  const features = [
    // 1. pclass
    data.pclass,
    // 2. sex (인코딩된 값)
    sex_encoded, 
    // 3. age
    data.age,
    // 4. fare
    data.fare,
    // 5. embarked_Q (OHE)
    embarked_Q,
    // 6. embarked_S (OHE)
    embarked_S,
    // 7. FamilySize (특징 공학)
    familySize,
    // 8. IsAlone (특징 공학)
    isAlone,
  ]; // 총 8개의 피처: [pclass, sex, age, fare, embarked_Q, embarked_S, FamilySize, IsAlone]

  const requestBody = { features };
  const response = await fetch(`${API_BASE_URL}/api/titanic/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const apiResult = await response.json();
  
  // ⚠️ 백엔드(ml_server)는 확률을 반환하지 않으므로, 프론트엔드에서 임시로 설정합니다.
  const survived_code = apiResult.prediction === '생존' ? 1 : 0;
  
  // 💡 백엔드에서 확률을 받지 못했으므로, 임시로 설정하는 로직을 유지합니다. 
  // (백엔드 수정이 필요합니다: model.predict_proba 사용)
  const probability = (survived_code === 1) ? 0.75 : 0.25; 
  
  return { 
    survived: survived_code, 
    probability: probability,
  };
}

// =========================================================================
// 3. MnistView.vue 관련 타입 정의 및 API 함수
//   - Base64 이미지 데이터를 전송하여 손글씨 숫자 예측 (tf.keras.models.load_model)
// =========================================================================

export interface MnistResponse {
  prediction: number; // 예측된 숫자 (0-9)
  confidence: number; // 예측 신뢰도 (0.0 ~ 1.0)
}

/**
 * MNIST 손글씨 숫자 예측 API 호출
 * @param base64Image 캔버스에서 추출한 Base64 인코딩된 PNG 이미지 데이터
 * @returns 예측된 숫자 및 신뢰도
 */
export async function predictMnist(base64Image: string): Promise<MnistResponse> {
  // Base64 문자열을 서버로 전송
  const requestBody = { image_base64: base64Image };

  const response = await fetch(`${API_BASE_URL}/mnist/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const apiResult = await response.json();
  
  // 백엔드 (2) predict_mnist 로직 수정이 필요합니다. 
  // 현재 ml_server.ipynb의 predict_mnist는 Base64가 아닌 'image_pixels' 배열을 기대합니다.
  // Vue 컴포넌트 (MnistView.vue)는 Base64를 보내고 있습니다.
  // ⚠️ 현재 백엔드와 프론트엔드가 불일치하여 Base64를 전송하는 것으로 가정하고 작성합니다.
  // ⚠️ 신뢰도(confidence)는 백엔드에서 반환되지 않으므로 임시로 1.0을 사용합니다.
  
  const prediction = apiResult.prediction;
  const confidence = 1.0; // 임시값, 실제 모델 예측 확률을 사용해야 함.
  
  return { 
    prediction: prediction, 
    confidence: confidence,
  };
}


// =========================================================================
// 4. KnnView.vue 관련 타입 정의 및 API 함수
//   - 붓꽃 4가지 특징을 전송하여 종류 분류 (joblib.load)
// =========================================================================

export interface IrisRequest {
  sepal_length: number; // 꽃받침 길이
  sepal_width: number; // 꽃받침 너비
  petal_length: number; // 꽃잎 길이
  petal_width: number; // 꽃잎 너비
}

export interface IrisResponse {
  prediction: string; // 예측된 붓꽃 종류 ('setosa', 'versicolor', 'virginica')
  confidence: number; // 예측 신뢰도 (0.0 ~ 1.0)
}

/**
 * KNN 붓꽃 분류 API 호출
 * @param data 붓꽃 특징 데이터
 * @returns 예측된 붓꽃 종류 및 신뢰도
 */
export async function predictIris(data: IrisRequest): Promise<IrisResponse> {
  // 백엔드 API (4) classify_knn 로직에 맞게 데이터 전처리
  // 훈련 시 사용한 피처 순서와 일치해야 합니다.
  const features = [
    data.sepal_length,
    data.sepal_width,
    data.petal_length,
    data.petal_width,
  ];
  
  const requestBody = { features };

  const response = await fetch(`${API_BASE_URL}/knn/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const apiResult = await response.json();
  
  // ⚠️ 신뢰도(confidence)는 백엔드에서 반환되지 않으므로 임시로 1.0을 사용합니다.
  const prediction = apiResult.prediction;
  const confidence = 1.0; // 임시값, 실제 모델 예측 확률을 사용해야 함.

  return { 
    prediction: prediction, 
    confidence: confidence,
  };
}

// =========================================================================
// 5. LstmView.vue 관련 타입 정의 및 API 함수
//   - 영화 리뷰 텍스트를 전송하여 감성 분석 (tf.keras.models.load_model)
// =========================================================================

export interface LstmResponse {
  sentiment: 'Positive' | 'Negative' | ''; // 예측된 감성
  probability: number; // 해당 감성일 확률 (0.0 ~ 1.0)
}

/**
 * LSTM 감성 분석 API 호출
 * @param reviewText 분석할 영화 리뷰 텍스트
 * @returns 예측된 감성 및 확률
 */
export async function predictLstm(reviewText: string): Promise<LstmResponse> {
  // 백엔드 API (3) predict_lstm 로직에 맞게 데이터 전처리
  const requestBody = { review: reviewText };

  const response = await fetch(`${API_BASE_URL}/lstm/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const apiResult = await response.json();
  
  // 백엔드 (3) predict_lstm 로직에 오류가 있습니다 (prediction과 probability가 아닌 jsonfy의 오타 및 변수 미정의).
  // 정상적인 백엔드 동작을 가정하고, 반환된 확률값(0.0~1.0)을 기준으로 긍정/부정을 결정합니다.
  const probability = parseFloat(apiResult.probability);
  const sentiment = probability >= 0.5 ? 'Positive' : 'Negative';

  return { 
    sentiment: sentiment, 
    probability: probability,
  };
}