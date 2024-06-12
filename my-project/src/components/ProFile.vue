<template>
  <div class="profile-container">
    <h2>Личный кабинет</h2>
    <div class="profile-details">
      <div class="profile-item">
        <strong>Имя:</strong> {{ profile.name }}
      </div>
      <div class="profile-item">
        <strong>Email:</strong> {{ profile.email }}
      </div>
      <div class="profile-item">
        <strong>Description:</strong> {{ profile.description }}
      </div>
    </div>
    <div class="comics-list">
      <h3>Мои комиксы</h3>
      <div v-if="loadingComics">
        <p>Загрузка комиксов...</p>
      </div>
      <div v-if="!loadingComics && comics.length === 0">
        <p>У вас пока нет комиксов.</p>
      </div>
      <div class="comics-container" v-else>
        <div v-for="(row, index) in comicsInRows" :key="index" class="comics-row">
          <div v-for="comic in row" :key="comic.id" class="comic" @click="goToComicDetails(comic.id)">
            <img :src="getCoverUrl(comic.way_to_images)" alt="Обложка комикса" class="comic-cover">
            <button @click.stop="editCover(comic)">Изменить обложку</button>
            <p class="comic-title">Навзание: {{ comic.name_comics }}</p>
            <p class="comic-description">Описание: {{ comic.description }}</p>
            <div class="comic-actions">
              <button @click.stop="editComic(comic)">Редактировать Название и Описание</button>
            </div>
            <!-- Выводим информацию о главах комикса -->
            <div class="comic-chapters">
              <p><strong>Главы:</strong></p>
              <ul>
                <li v-for="(chapter, chapterIndex) in comic.chapters" :key="chapterIndex">
                  <div>{{ chapter }}
                    <button @click.stop="editName(comic, chapter)">Переименовать</button>
                  </div>
                  <div>
                    <button @click.stop="editChapter(comic, chapter)">Редактировать</button>
                    <button @click.stop="deleteChapter(comic, chapter)">Удалить</button> <!-- Добавлена кнопка удаления главы -->
                  </div>
                </li>
              </ul>
              <button @click.stop="addChapter(comic)">Добавить главу</button>
            </div>
            <!-- Конец блока информации о главах -->
          </div>
        </div>
      </div>
    </div>
    <button class="add-comic-button" @click="showCreateComicModal = true">Добавить комикс</button>
    <CreateComicModal v-if="showCreateComicModal" @close="showCreateComicModal = false" @create="createComic"></CreateComicModal>
    <EditComic v-if="showEditModal" :comic="selectedComic" @close="showEditModal = false" @update="updateComics"></EditComic>
    <EditCover v-if="showEditCoverModal" :comic="selectedComic" @close="onEditCoverModalClose" @update="updateComics"></EditCover>
    <EditChapter 
      v-if="showEditChapterModal" 
      :comic="selectedComic" 
      :chapter="selectedChapter" 
      @close="showEditChapterModal = false" 
      @update="updateChapters"
    />
    <EditChapterName 
      v-if="showEditChapterNameModal" 
      :comic="selectedComic" 
      :chapter="selectedChapter" 
      @close="showEditChapterNameModal = false" 
      @update="updateChapters"
    />
  </div>
</template>

<script>
import CreateComicModal from '@/components/CreateComic.vue';
import EditComic from '@/components/EditComic.vue';
import EditCover from '@/components/EditCover.vue';
import EditChapter from './EditChapter.vue';
import EditChapterName from './EditChapterName.vue'; // Импортируем новый компонент

export default {
  components: {
    CreateComicModal,
    EditComic,
    EditCover,
    EditChapter,
    EditChapterName // Регистрируем новый компонент
  },
  data() {
    return {
      profile: {
        userId: '',
        name: '',
        email: '',
        description: ''
      },
      comics: [],
      loadingComics: true,
      showCreateComicModal: false,
      selectedComic: {},
      showEditModal: false,
      showEditCoverModal: false,
      showEditChapterModal: false,
      showEditChapterNameModal: false, // Состояние для управления показом компонента EditChapterName
      selectedChapter: null
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
    this.fetchProfile();
  },
  methods: {
    async deleteChapter(comic, chapter) {
      const folderPath = comic.way_to_images + "/" + chapter;
      const encodedFolderPath = encodeURIComponent(folderPath); // Кодирование пути
      const token = this.getCookie('tokenUserlibComics');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/delete-folder/${encodedFolderPath}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Ошибка при удалении папки');
        }
        this.updateChapters();
        const data = await response.json();
        console.log(data.message);
      } catch (error) {
        console.error('Ошибка при удалении папки:', error.message);
      }
    },
    addChapter(comic) {
      const lastChapterIndex = comic.chapters.length;
      const newChapter = `chapter${lastChapterIndex + 1}`;
      comic.chapters.push(newChapter);
    },
    async updateChapters() {
      await this.fetchProfile();
    },
    editChapter(comic, chapter) {
      this.selectedComic = comic;
      this.selectedChapter = chapter;
      this.showEditChapterModal = true;
    },
    editName(comic, chapter) {
      this.selectedComic = comic;
      this.selectedChapter = chapter;
      this.showEditChapterNameModal = true;
    },
    async viewChapters(comicId) {
      try {
        const token = this.getCookie('tokenUserlibComics');
        if (!token) {
          throw new Error('Токен не найден');
        }

        const response = await fetch(`http://localhost:3000/api/comics/${comicId}/chap`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Ошибка при получении глав комикса');
        }

        const chapters = await response.json();
        console.log('Главы комикса:', chapters);
      } catch (error) {
        console.error('Ошибка при получении глав комикса:', error);
      }
    },
    async updateComics() {
      await this.fetchProfile();
    },
    async createComic() {
      await this.fetchProfile();
    },
    async fetchProfile() {
      try {
        const token = this.getCookie('tokenUserlibComics');
        if (!token) {
          throw new Error('Токен не найден');
        }

        const userIdResponse = await fetch('http://localhost:3000/api/user/id', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!userIdResponse.ok) {
          throw new Error('Ошибка при получении ID пользователя');
        }

        const userIdData = await userIdResponse.json();
        const userId = userIdData.userId;

        const profileResponse = await fetch(`http://localhost:3000/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Ошибка при получении данных профиля');
        }

        const profileData = await profileResponse.json();
        this.profile = profileData;

        await this.fetchUserComics(userId, token);
      } catch (error) {
        console.error('Ошибка при получении данных профиля:', error);
      }
    },
    async fetchUserComics(userId, token) {
      try {
        const comicsResponse = await fetch(`http://localhost:3000/api/user/${userId}/comics`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!comicsResponse.ok) {
          throw new Error('Ошибка при получении комиксов пользователя');
        }

        const comicsData = await comicsResponse.json();

        for (const comic of comicsData) {
          const chaptersResponse = await fetch(`http://localhost:3000/api/comics/${comic.id}/chap`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!chaptersResponse.ok) {
            throw new Error(`Ошибка при получении глав комикса ${comic.id}`);
          }

          const chaptersData = await chaptersResponse.json();
          comic.chapters = chaptersData;
        }

        this.comics = comicsData;
      } catch (error) {
        console.error('Ошибка при получении комиксов пользователя:', error);
      } finally {
        this.loadingComics = false;
      }
    },
    getCoverUrl(comicPath) {
      const encodedPath = encodeURIComponent(comicPath);
      const timestamp = new Date().getTime();
      return `http://localhost:3000/api/comics/cover/${encodedPath}?t=${timestamp}`;
    },
    goToComicDetails(comicId) {
      this.$emit('showComicDetails', comicId);
    },
    editComic(comic) {
      this.selectedComic = comic;
      this.showEditModal = true;
    },
    editCover(comic) {
      this.selectedComic = comic;
      this.showEditCoverModal = true;
    },
    addComic() {
      console.log('Добавление нового комикса');
    },
    deleteComic(comicId) {
      const token = this.getCookie('tokenUserlibComics');
      if (!token) {
        console.error('Ошибка: Токен не найден');
        return;
      }

      if (!confirm('Вы уверены, что хотите удалить этот комикс?')) {
        return;
      }

      fetch(`http://localhost:3000/api/comicsdel/${comicId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка при удалении комикса');
        }
        this.fetchProfile();
        console.log('Комикс успешно удален');
      })
      .catch(error => {
        console.error('Ошибка при удалении комикса:', error);
      });
    },
    onEditCoverModalClose() {
      this.showEditCoverModal = false;
      this.fetchProfile();
    },
    getCookie(name) {
      const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
      return cookieValue ? cookieValue.pop() : '';
    }
  }
};
</script>

<style scoped>
/* Стили для всех кнопок */
button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Стили при наведении на кнопку */
button:hover {
  background-color: #45a049;
}

/* Стили для кнопки "Добавить комикс" */
.add-comic-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Стили при наведении на кнопку "Добавить комикс" */
.add-comic-button:hover {
  background-color: #0056b3;
}
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-details {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.comics-list {
  margin-bottom: 20px;
  width: 1100px;
}

.comics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.comic {
  width: calc(25% - 20px);
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comic:hover {
  background-color: #eaeaea;
}

.comic-cover {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

.comic-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.comic-description {
  font-size: 14px;
  margin-top: 5px;
}

.comic-actions button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.comic-actions button:hover {
  background-color: #45a049;
}
</style>
