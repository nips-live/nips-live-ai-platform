<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <h1>Create account</h1>
      <p class="subtitle">Register as a NIPS.live user</p>

      <label>Name</label>
      <input v-model="name" type="text" autocomplete="name" placeholder="Your name" />

      <label>Email</label>
      <input v-model="email" type="email" autocomplete="email" required placeholder="you@nips.live" />

      <label>Password</label>
      <input v-model="password" type="password" autocomplete="new-password" required minlength="8" placeholder="Minimum 8 characters" />

      <button :disabled="loading" type="submit">{{ loading ? 'Creating…' : 'Register' }}</button>

      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="activationUrl" class="dev-link"><a :href="activationUrl">Activate account</a></p>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="links"><router-link to="/auth/login">Already have an account? Login</router-link></p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { authOperator } from '@/operators';

export default defineComponent({
  name: 'AuthRegister',
  data() {
    return { name: '', email: '', password: '', loading: false, error: '', message: '', activationUrl: '' };
  },
  methods: {
    async submit() {
      this.loading = true;
      this.error = '';
      this.message = '';
      this.activationUrl = '';
      try {
        const { data } = await authOperator.register({ name: this.name || undefined, email: this.email, password: this.password });
        if (data.requiresActivation) {
          this.message = data.message || 'Account created. Check your email to activate it.';
          this.activationUrl = data.activationUrl || '';
          return;
        }
        this.$store.commit('setToken', { access: data.token, expiration: 7 * 24 * 60 * 60 });
        this.$store.commit('setUser', data.user);
        await this.$router.push('/');
      } catch (error: any) {
        this.error = error?.response?.data?.error || 'Registration failed';
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>

<style scoped>
.auth-page { min-height: 100%; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top, rgba(20,241,149,.13), transparent 35%), #050510; color: #fff; }
.auth-card { width: min(440px, 100%); display: grid; gap: 12px; padding: 28px; border: 1px solid rgba(255,255,255,.12); border-radius: 22px; background: rgba(255,255,255,.06); box-shadow: 0 24px 80px rgba(0,0,0,.35); }
h1 { margin: 0; font-size: 30px; }.subtitle { margin: -4px 0 8px; color: rgba(255,255,255,.68); } label { font-size: 13px; color: rgba(255,255,255,.78); }
input { padding: 13px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,.14); background: rgba(0,0,0,.28); color: #fff; outline: none; }
button { margin-top: 8px; padding: 13px 16px; border: 0; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #14f195); color: #fff; font-weight: 800; cursor: pointer; }
.error { color: #fca5a5; }.message { color: #86efac; }.dev-link { word-break: break-all; }.links { text-align: center; } a { color: #8be9d6; }
</style>
