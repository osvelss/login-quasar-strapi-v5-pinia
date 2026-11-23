<template>
  <q-page class="flex flex-center" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
    <div
      style="width: 400px; border: 1px solid #d0d0d0; border-radius: 13px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);"
      class="q-ma-xs">
      <q-form @submit="login">
        <q-card flat style="max-width: 400px; border: 1px solid #d0d0d0; border-radius: 13px;" class="q-ma-xs">
          <q-card-section class='text-center'>
            <div class="text-h6">Login</div>
            <div class="text-subtitle1">Please enter your credentials to log in.</div>
          </q-card-section>
          <q-card-section class="q-gutter-md q-pa-md">

            <div>
              <q-input filled v-model="username" label="Username or Email *" hint="Name and surname" lazy-rules
                :rules="[val => (val && val.length > 0) || 'Please type your username or email']" />
            </div>

            <div>
              <q-input filled :type="isPwd ? 'password' : 'text'" v-model="password" label="Your password *" lazy-rules
                :rules="[val => !!val || 'Please type your password']">
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template>
              </q-input>
            </div>

            <div class="text-center">
              <q-btn label="Submit" type="submit" color="primary" class="full-width" rounded />
            </div>
          </q-card-section>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth-store';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const isPwd = ref(true);

const login = async () => {
  try {
    await authStore.login({ identifier: username.value, password: password.value });
    await router.push({ name: 'dashboard' });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Credenciales incorrectas. Verifica tus datos e inténtalo de nuevo.',
      icon: 'warning',
    });
  }
};

const reset = () => {
  username.value = '';
  password.value = '';
};
</script>
