<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="edit-chapter-modal" @click.stop>
      <h2>Редактировать Главу</h2>
      <strong>Загрузите новые изображения вашей главы, назвав их в порядке, в котором вы хотите их отображать</strong> 
      <p><strong>Название главы:</strong> {{ chapter }}</p>
      
      <!-- Окно для перетаскивания изображений -->
      <div id="chapter-dropzone" class="dropzone">
        <input type="file" id="fileInput" style="display: none;" multiple>
        <label for="fileInput">Перетащите изображения сюда или щелкните для выбора файлов</label>
      </div>
      
      <!-- Кнопка "Сохранить" -->
      <button @click="saveChanges">Сохранить</button>
      <button @click="$emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script>
import Dropzone from 'dropzone';

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
      dropzoneInstance: null
    };
  },
  mounted() {
    this.initializeDropzone();
  },
  methods: {
    initializeDropzone() {
      const self = this;
      this.dropzoneInstance = new Dropzone('#chapter-dropzone', {
        url: 'http://localhost:3000/api/save-images',
        paramName: 'images',
        maxFilesize: 50,
        acceptedFiles: 'image/*',
        autoProcessQueue: false, // Отключаем автоматическую загрузку файлов
        init: function() {
          this.on('sending', function(file, xhr, formData) {
            var way = self.comic.way_to_images + "/" + self.chapter;
            formData.append('wayToSave', way);
          });
          this.on('success', function(file, response) {
            console.log(response);
            self.closeEditModal();
            self.$emit('updateComics');
          });
          this.on('error', function(file, errorMessage) {
            console.error(errorMessage);
          });
        }
      });
    },
    saveChanges() {
      // Проверяем, есть ли файлы для загрузки
      if (this.dropzoneInstance.files.length > 0) {
        // Запускаем процесс загрузки
        this.dropzoneInstance.processQueue();
      } else {
        console.warn('Нет файлов для загрузки.');
      }
    },
    closeEditModal() {
      // Закрытие модального окна
      this.$emit('update');
      this.$emit('close');
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

.edit-chapter-modal {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.input-group {
  margin-bottom: 10px;
}

input[type="file"] {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

button {
  margin-right: 10px;
}
/* Стили для Dropzone */
.dropzone {
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  margin-bottom: 10px;
}

.dropzone label {
  cursor: pointer;
}
</style>
