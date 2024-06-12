<template>
  <div class="search-comics-container">
    <h2>Поиск комиксов</h2>
    <input v-model="searchQuery" @input="fetchComics" placeholder="Введите название комикса" />

    <div class="genre-filter">
      <label v-for="genre in genres" :key="genre.id">
        <input type="checkbox" :value="genre.genre" v-model="selectedGenres" @change="fetchComics" />
        {{ genre.genre }}
      </label>
    </div>

    <div v-if="comics.length === 0">
      <p>Комиксы не найдены.</p>
    </div>
    <div class="comics-container" v-else>
      <div v-for="(row, index) in comicsInRows" :key="index" class="comics-row">
        <div v-for="comic in row" :key="comic.id" class="comic" @click="goToComicDetails(comic.id)">
          <img :src="getCoverUrl(comic.way_to_images)" alt="Обложка комикса" class="comic-cover">
          <p class="comic-title">{{ comic.name_comics }}</p>
          <p class="comic-description">{{ comic.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      comics: [],
      genres: [],
      selectedGenres: []
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
    this.fetchGenres();
    this.fetchComics();
  },
  methods: {
    async fetchComics() {
      try {
        const genreQuery = this.selectedGenres.join(',');
        const response = await fetch(`http://localhost:3000/api/comics/search?name=${encodeURIComponent(this.searchQuery)}&genres=${encodeURIComponent(genreQuery)}`);
        if (!response.ok) {
          throw new Error('Ошибка при поиске комиксов');
        }
        const comics = await response.json();
        this.comics = comics;
      } catch (error) {
        console.error('Ошибка при поиске комиксов:', error);
      }
    },
    async fetchGenres() {
      try {
        const response = await fetch('http://localhost:3000/api/genres');
        if (!response.ok) {
          throw new Error('Ошибка при получении жанров');
        }
        const genres = await response.json();
        this.genres = genres;
      } catch (error) {
        console.error('Ошибка при получении жанров:', error);
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
.search-comics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.genre-filter {
  margin: 10px 0;
}

.genre-filter label {
  margin-right: 10px;
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

.comic-description {
  font-size: 14px;
}
</style>