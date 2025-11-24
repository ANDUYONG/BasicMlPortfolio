<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav class="navbar">
      <RouterLink to="/mnist" class="nav-item">✍️ MNIST</RouterLink>
      <RouterLink to="/lstm" class="nav-item">💬 Sentiment</RouterLink>
      <RouterLink to="/titanic" class="nav-item">🚢 Titanic</RouterLink>
      <RouterLink to="/knn" class="nav-item">🌸 KNN</RouterLink>
    </nav>
  </header>

  <main class="content-area">
    <RouterView /> </main>
</template>

<style scoped>
/* 기본적인 스타일링 (생략된 CSS) */
.navbar {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
    background-color: #34495e;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.nav-item {
    margin: 0 1.5rem;
    color: #ffffff;
    text-decoration: none;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}
.nav-item:hover {
    background-color: #41b883;
}
.router-link-active {
    background-color: #41b883;
}
.content-area {
    padding: 2rem;
}
</style>