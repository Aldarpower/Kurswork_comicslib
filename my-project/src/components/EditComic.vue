<template>
    <div class="modal-overlay" @click="$emit('close')">
      <div class="edit-comic-modal" @click.stop>
        <h2>Редактировать комикс</h2>
        <div class="input-group">
          <label for="comic-name">Название:</label>
          <input type="text" id="comic-name" v-model="name" />
        </div>
        <div class="input-group">
          <label for="comic-description">Описание:</label>
          <textarea id="comic-description" v-model="description"></textarea>
        </div>
        <button @click="saveChanges">Сохранить изменения</button>
        <button @click="$emit('close')">Отмена</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      comic: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        name: this.comic.name_comics,
        description: this.comic.description,
        id: this.comic.id
      };
    },
    methods: {
      saveChanges() {
        if (this.id && this.name && this.description) {
          fetch(`http://localhost:3000/api/comics/edit/${this.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: this.name,
              description: this.description
            })
          })
          .then(response => {
            if (response.ok) {
              // Закрываем модальное окно редактирования после успешного сохранения изменений
              this.closeEditModal();
              return response.json();
            }
            throw new Error('Network response was not ok.');
          })
          .then(data => {
            console.log(data.message);
            // Дополнительные действия, если необходимо
            // Вызываем событие для обновления списка комиксов в родительском компоненте
            this.$emit('updateComics');
          })
          .catch(error => {
            console.error('Ошибка при сохранении изменений:', error);
            // Обработка ошибок
          });
        } else {
          console.error('Отсутствует ID комикса, название или описание');
        }
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
  
  input, textarea {
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
  }
  
  button {
    margin-right: 10px;
  }
  </style>
  