<template>
  <div id="app" :class="{ dark: isDark }">
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters([
      'theme'
    ]),
    isDark() {
      return this.theme === 'dark'
    }
  },
  mounted() {
    if (this.isDark) {
      document.body.classList.add('dark')
    }
  },
  watch: {
    isDark(val) {
      if (val) {
        document.body.classList.add('dark')
      } else {
        document.body.classList.remove('dark')
      }
    }
  }
}
</script>
