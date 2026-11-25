<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth-store';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

// Si el backend vuelve mientras la pestaña sigue abierta, reintentamos el
// refresco silencioso. El cooldown de init() evita repetir la petición.
const retryInit = async () => {
  if (auth.isAuthenticated) return;

  await auth.init();

  // Si estábamos en login y la sesión se recuperó, entramos al dashboard.
  if (auth.isAuthenticated && route.meta.isGuest) {
    await router.push({ name: 'dashboard' });
  }
};

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible') void retryInit();
};

onMounted(() => {
  window.addEventListener('online', retryInit);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onUnmounted(() => {
  window.removeEventListener('online', retryInit);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>
