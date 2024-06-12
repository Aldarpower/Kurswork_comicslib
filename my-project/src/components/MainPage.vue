<template>
  <div>
    <NavBar :currentComponent="currentComponent" @navigate="navigate" />
    <component :is="currentComponent" :comicId="currentComicId" @showComicDetails="showComicDetails" />
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import TopComics from './TopComics.vue';
import Profile from './ProFile.vue';
import ComicSearch from './ComicSearch.vue';
import ComicDetails from './ComicDetails.vue';

export default {
  components: {
    NavBar,
    TopComics,
    Profile,
    ComicSearch,
    ComicDetails
  },
  data() {
    return {
      currentComponent: 'TopComics',
      currentComicId: null
    };
  },
  methods: {
    navigate(component) {
      this.currentComponent = component;
      this.currentComicId = null;
    },
    showComicDetails(comicId) {
      this.currentComicId = comicId;
      this.currentComponent = 'ComicDetails';
    }
  }
};
</script>

<style>
/* Ваши стили здесь */
</style>
