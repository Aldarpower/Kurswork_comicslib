<template>
    <div class="create-comic-modal">
      <div class="modal">
        
        <div class="modal-content">
            <span class="close" @click="close">&times;</span>
          <h3>Добавить комикс</h3>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="comic-name">Название комикса:</label>
              <input type="text" id="comic-name" v-model="newComic.name" required>
            </div>
            <div class="form-group">
              <label for="comic-description">Описание комикса:</label>
              <textarea id="comic-description" v-model="newComic.description" required></textarea>
            </div>
            <button type="submit">Добавить</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
    data() {
      return {
        newComic: {
          name: '',
          description: ''
        }
      };
    },
    methods: {
      // Метод для закрытия модального окна
      close() {
        this.$emit('close');
      },
      // Метод для отправки формы создания комикса
      async submitForm() {
    if (!this.newComic.name || !this.newComic.description) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    // Получение токена пользователя из куки
    const token = this.getCookie('tokenUserlibComics');
    
    // Получение ID пользователя по токену
    try {
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

        // Создание объекта для отправки на сервер
        const requestBody = {
            name: this.newComic.name,
            description: this.newComic.description,
            author_id: userId
        };

        // Отправка запроса на создание комикса
        const createComicResponse = await fetch('http://localhost:3000/api/comics/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!createComicResponse.ok) {
            throw new Error('Ошибка при создании комикса');
        }
        this.$emit('create');
        // Очистка полей формы
        this.newComic = {
            name: '',
            description: ''
        };

        // Закрытие модального окна
        this.close();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при создании комикса');
    }
},

      getCookie(name) {
      const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    toggleRegisterMode() {
      this.registerMode = !this.registerMode;
      this.error = ''; // Clear any previous errors
    }
    }
  };
  </script>
  
  <style scoped>
  .create-comic-modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  }
  
  .modal {
    background-color: white;
    padding: 20px;
    width: 300px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }
  
  .modal-content {
    max-width: 400px;
  }
  
  .close {
    
    top: 0;
    right: 0;
    cursor: pointer;
    font-size: 30px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input[type="text"],
  textarea {
    width: 90%;
    padding: 8px;
    font-size: 16px;
  }
  
  button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  </style>
  