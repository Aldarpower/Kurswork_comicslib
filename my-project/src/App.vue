<template>
  <div id="app">
    <router-view />
    <font-awesome-icon icon="coffee" />
    <Auth v-if="!loggedIn" @login-success="handleLoginSuccess" />
    <MainPage v-else />
  </div>
</template>

<script>
import Auth from './components/UserAuth.vue';
import MainPage from './components/MainPage.vue';

export default {
  name: 'App',
  components: {
    Auth,
    MainPage
  },
  data() {
    return {
      loggedIn: false
    };
  },
  methods: {
    handleLoginSuccess() {
      this.loggedIn = true;
    }
  }
};
</script>

<style>
/* Ваши глобальные стили */
</style>
