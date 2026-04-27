<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <h1>Reset password</h1>
      <p class="subtitle">Enter your email and we will send a reset link.</p>

      <label>Email</label>
      <input v-model="email" type="email" autocomplete="email" required placeholder="you@nips.live" />

      <button :disabled="loading" type="submit">{{ loading ? 'Sending…' : 'Send reset link' }}</button>

      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="resetUrl" class="dev-link"><a :href="resetUrl">Open reset link</a></p>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="links"><router-link to="/auth/login">Back to login</router-link></p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { authOperator } from '@/operators';
export default defineComponent({
  name: 'AuthForgotPassword',
  data() { return { email: '', loading: false, error: '', message: '', resetUrl: '' }; },
  methods: {
    async submit() {
      this.loading = true; this.error = ''; this.message = ''; this.resetUrl = '';
      try {
        const { data } = await authOperator.requestPasswordReset({ email: this.email });
        this.message = data.message || 'If the account exists, a reset link has been sent.';
        this.resetUrl = data.resetUrl || '';
      } catch (error: any) { this.error = error?.response?.data?.error || 'Could not send reset link'; }
      finally { this.loading = false; }
    }
  }
});
</script>

<style scoped>
.auth-page { min-height: 100%; display: grid; place-items: center; padding: 24px; background: #050510; color: #fff; }.auth-card { width: min(420px, 100%); display: grid; gap: 12px; padding: 28px; border: 1px solid rgba(255,255,255,.12); border-radius: 22px; background: rgba(255,255,255,.06); } h1 { margin:0; }.subtitle{color:rgba(255,255,255,.68)} input{padding:13px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.28);color:#fff} button{padding:13px 16px;border:0;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#14f195);color:#fff;font-weight:800}.error{color:#fca5a5}.message{color:#86efac}.dev-link{word-break:break-all} a{color:#8be9d6}
</style>
