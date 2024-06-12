<template>
    <div class="modal-overlay" @click="$emit('close')">
      <div class="edit-comic-modal" @click.stop>
        <h2>Редактировать комикс</h2>
        
        <div id="my-dropzone" class="dropzone"></div> <!-- Dropzone контейнер -->
        
        <button @click="$emit('close')">Отмена</button>
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
      }
    },
    mounted() {
      const self = this; // Сохраняем ссылку на контекст Vue компонента
  
      // Инициализация Dropzone
      Dropzone.autoDiscover = false;
      new Dropzone('#my-dropzone', {
        url: 'http://localhost:3000/api/save-image',
        paramName: 'image',
        maxFilesize: 5,
        acceptedFiles: 'image/*',
        init: function() {
          this.on('sending', function(file, xhr, formData) {
            // Используем сохраненную ссылку на контекст Vue компонента для доступа к его данным
            formData.append('wayToSave', self.comic.way_to_images);
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
    methods: {
      saveChanges() {
        // В этом случае, нет необходимости в этом методе, так как загрузка выполняется Dropzone
      },
      closeEditModal() {
        // Эмитируем событие для закрытия модального окна редактирования
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
  
  .edit-comic-modal {
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
  </style>
  