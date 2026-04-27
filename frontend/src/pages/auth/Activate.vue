<template>
  <div class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <h1>Activate account</h1>
      <p class="subtitle">Activate your NIPS.live account using your activation token.</p>

      <label>Activation token</label>
      <input v-model="token" type="text" required placeholder="Token from email link" />

      <button :disabled="loading" type="submit">{{ loading ? 'Activating…' : 'Activate account' }}</button>
      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="links"><router-link to="/auth/login">Back to login</router-link></p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { authOperator } from '@/operators';
export default defineComponent({
  name: 'AuthActivate',
  data() { return { token: this.$route.query.token?.toString() || '', loading: false, error: '', message: '' }; },
  async mounted() { if (this.token) await this.submit(); },
  methods: {
    async submit() {
      this.loading = true; this.error = ''; this.message = '';
      try {
        const { data } = await authOperator.activate({ token: this.token });
        this.message = data.message || 'Account activated.';
        if (data.token) {
          this.$store.commit('setToken', { access: data.token, expiration: 7 * 24 * 60 * 60 });
          this.$store.commit('setUser', data.user);
          setTimeout(() => this.$router.push('/'), 800);
        }
      } catch (error: any) { this.error = error?.response?.data?.error || 'Activation failed'; }
      finally { this.loading = false; }
    }
  }
});
</script>

<style scoped>
.auth-page { min-height: 100%; display: grid; place-items: center; padding: 24px; background: #050510; color: #fff; }.auth-card { width: min(420px, 100%); display: grid; gap: 12px; padding: 28px; border: 1px solid rgba(255,255,255,.12); border-radius: 22px; background: rgba(255,255,255,.06); } h1{margin:0}.subtitle{color:rgba(255,255,255,.68)} input{padding:13px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.28);color:#fff} button{padding:13px 16px;border:0;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#14f195);color:#fff;font-weight:800}.error{color:#fca5a5}.message{color:#86efac} a{color:#8be9d6}
</style>
