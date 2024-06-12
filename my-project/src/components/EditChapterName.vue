<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="edit-chapter-name-modal" @click.stop>
      <h2>Редактировать Название Главы</h2>
      <strong>Введите новое название главы:</strong>
      <div class="input-group">
        <label for="chapterName">Название главы:</label>
        <input type="text" id="chapterName" v-model="newChapterName" />
      </div>
      
      <!-- Кнопка "Сохранить" -->
      <button @click="saveChanges">Сохранить</button>
      <button @click="$emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    comic: {
      type: Object,
      required: true
    },
    chapter: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      newChapterName: this.chapter
    };
  },
  methods: {
    async saveChanges() {
      const folderPath = this.comic.way_to_images + "/" + this.chapter;
      const newFolderName = this.newChapterName;

      try {
        const response = await fetch('http://localhost:3000/api/rename-folder', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ folderPath, newFolderName })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при переименовании папки');
        }

        // Если папка успешно переименована, можно выполнить дополнительные действия, например, обновить данные на клиенте
        this.$emit('update');
        this.$emit('close');
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-chapter-name-modal {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.input-group {
  margin-bottom: 10px;
}

input[type="text"] {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

button {
  margin-right: 10px;
}
</style>
