import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // @/services/api는 src/services/api를 가리키게 됨
      // '@services/api': path.resolve(__dirname, './src/services/api'), // 만약 특정 폴더에만 별칭을 주고 싶다면 이렇게 설정할 수도 있습니다.
    },
  },
  plugins: [vue()],
})
