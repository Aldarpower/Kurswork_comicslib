<template>
  <nav class="navbar">
    <ul class="nav-menu">
      <li v-if="!isSearchActive"><button @click="navigateToSearch">Поиск</button></li>
      <li v-if="!isProfileActive"><button @click="navigateToProfileOrHome">{{ isProfileActive ? 'Главная' : 'Личный кабинет' }}</button></li>
      <li v-if="!isHomeActive"><button @click="navigateToHome">Главная</button></li>
      <li><button @click="logout">Выход</button></li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    currentComponent: {
      type: String,
      required: true
    }
  },
  computed: {
    isProfileActive() {
      return this.currentComponent === 'Profile';
    },
    isSearchActive() {
      return this.currentComponent === 'ComicSearch';
    },
    isHomeActive() {
      return this.currentComponent === 'TopComics';
    }
  },
  methods: {
    navigateToSearch() {
      this.$emit('navigate', 'ComicSearch');
    },
    logout() {
      document.cookie = 'tokenUserlibComics=; max-age=0; path=/';
      this.token = '';
      window.location.reload();
    },
    navigateToProfileOrHome() {
      if (this.isProfileActive) {
        this.$emit('navigate', 'TopComics');
      } else {
        this.$emit('navigate', 'Profile');
      }
    },
    navigateToHome() {
      this.$emit('navigate', 'TopComics');
    }
  }
};
</script>

<style scoped>
.navbar {
  background-color: #333;
  padding: 10px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  display: inline;
  margin-right: 10px;
}

.nav-menu li a,
.nav-menu li button {
  color: white;
  text-decoration: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.nav-menu li a:hover,
.nav-menu li button:hover {
  text-decoration: underline;
}
</style>
