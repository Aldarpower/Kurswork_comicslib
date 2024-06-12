<template>
  <div class="main-content">
    <h2>Самые свежие комиксы</h2>
    <div class="comics-container">
      <div v-for="(row, index) in comicsInRows" :key="index" class="comics-row">
        <div v-for="comic in row" :key="comic.id" class="comic" @click="goToComicDetails(comic.id)">
          <img :src="getCoverUrl(comic.way_to_images)" alt="Обложка комикса" class="comic-cover">
          <p class="comic-title">{{ comic.name_comics }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      comics: []
    };
  },
  computed: {
    comicsInRows() {
      const rows = [];
      for (let i = 0; i < this.comics.length; i += 4) {
        rows.push(this.comics.slice(i, i + 4));
      }
      return rows;
    }
  },
  mounted() {
    this.fetchTopComics();
  },
  methods: {
    async fetchTopComics() {
      try {
        const response = await fetch('http://localhost:3000/api/comics/top10');
        const comics = await response.json();
        this.comics = comics;
      } catch (error) {
        console.error('Ошибка при получении комиксов:', error);
      }
    },
    getCoverUrl(comicPath) {
  const encodedPath = encodeURIComponent(comicPath);
  const timestamp = new Date().getTime(); // Временная метка
  return `http://localhost:3000/api/comics/cover/${encodedPath}?t=${timestamp}`;
},
    goToComicDetails(comicId) {
      this.$emit('showComicDetails', comicId);
    }
  }
};
</script>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.comics-container {
  display: flex;
  flex-wrap: wrap;
}

.comics-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 20px;
}

.comic {
  width: calc(20% - 10px);
  text-align: center;
  transition: transform 0.3s ease;
}

.comic:hover {
  transform: scale(1.05);
}

.comic-cover {
  max-width: 100%;
  margin-bottom: 10px;
}

.comic-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}
</style>
