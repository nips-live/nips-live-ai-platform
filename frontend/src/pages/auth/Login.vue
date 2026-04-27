<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <h1>NIPS.live</h1>
      <p class="subtitle">Sign in to your AI platform account</p>

      <label>Email</label>
      <input v-model="email" type="email" autocomplete="email" required placeholder="you@nips.live" />

      <label>Password</label>
      <input v-model="password" type="password" autocomplete="current-password" required placeholder="Your password" />

      <button :disabled="loading" type="submit">{{ loading ? 'Signing in…' : 'Login' }}</button>

      <p v-if="error" class="error">{{ error }}</p>
      <p class="links">
        <router-link to="/auth/register">Create account</router-link>
        <span>·</span>
        <router-link to="/auth/forgot-password">Reset password</router-link>
      </p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { authOperator } from '@/operators';

export default defineComponent({
  name: 'AuthLogin',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: '',
      redirect: this.$route.query.redirect?.toString() || '/'
    };
  },
  methods: {
    async submit() {
      this.loading = true;
      this.error = '';
      try {
        const { data } = await authOperator.login({ email: this.email, password: this.password });
        this.$store.commit('setToken', { access: data.token, expiration: 7 * 24 * 60 * 60 });
        this.$store.commit('setUser', data.user);
        await this.$router.push(this.redirect);
      } catch (error: any) {
        this.error = error?.response?.data?.error || 'Login failed';
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>

<style scoped>
.auth-page { min-height: 100%; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top, rgba(124,58,237,.16), transparent 35%), #050510; color: #fff; }
.auth-card { width: min(420px, 100%); display: grid; gap: 12px; padding: 28px; border: 1px solid rgba(255,255,255,.12); border-radius: 22px; background: rgba(255,255,255,.06); box-shadow: 0 24px 80px rgba(0,0,0,.35); backdrop-filter: blur(18px); }
h1 { margin: 0; font-size: 30px; }
.subtitle { margin: -4px 0 8px; color: rgba(255,255,255,.68); }
label { font-size: 13px; color: rgba(255,255,255,.78); }
input { padding: 13px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,.14); background: rgba(0,0,0,.28); color: #fff; outline: none; }
button { margin-top: 8px; padding: 13px 16px; border: 0; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #14f195); color: #fff; font-weight: 800; cursor: pointer; }
button:disabled { opacity: .65; cursor: wait; }
.error { color: #fca5a5; }
.links { display: flex; justify-content: center; gap: 10px; }
a { color: #8be9d6; }
</style>
