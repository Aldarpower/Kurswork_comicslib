<template>
  <div>
    <div class="form-container" v-if="!loggedIn">
      <h2 v-if="!registerMode">Вход</h2>
      <h2 v-else>Регистрация</h2>
      <form @submit.prevent="handleSubmit" class="form">
        <div v-if="!registerMode">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Пароль:</label>
            <input type="password" id="password" v-model="password" required>
          </div>
        </div>
        <div v-else>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Пароль:</label>
            <input type="password" id="password" v-model="password" required>
          </div>
          <div class="form-group">
            <label for="name">Никнейм:</label>
            <input type="text" id="name" v-model="name" required>
          </div>
          <div class="form-group">
            <label for="description">Описание:</label>
            <input type="text" id="description" v-model="description" required>
          </div>
        </div>
        <button type="submit" v-if="!registerMode">Войти</button>
        <button type="submit" v-else>Зарегистрироваться</button>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="!registerMode">Нет аккаунта? <a href="#" @click="toggleRegisterMode">Зарегистрироваться</a></p>
        <p v-else>Уже есть аккаунт? <a href="#" @click="toggleRegisterMode">Войти</a></p>
      </form>
    </div>
    <div v-else>
      <p>Вы успешно вошли в систему!</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      name: '',
      description: '',
      error: '',
      token: '',
      registerMode: false
    };
  },
  computed: {
    loggedIn() {
      return !!this.token;
    }
  },
  mounted() {
    this.checkAuth();
  },
  methods: {
    async checkAuth() {
      const token = this.getCookie('tokenUserlibComics');
      if (token) {
        // Проверка токена на сервере
        try {
          const response = await fetch('http://localhost:3000/api/protected', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            // Токен действителен, установка состояния вошедшего пользователя
            this.token = token;
            this.$emit('login-success');
          } else {
            // Токен недействителен, очистка куки и установка состояния вышедшего пользователя
            document.cookie = 'tokenUserlibComics=; max-age=0; path=/';
            this.token = '';
          }
        } catch (error) {
          console.error('Ошибка при проверке токена:', error);
        }
      }
    },
    async handleSubmit() {
      if (this.registerMode) {
        await this.register();
      } else {
        await this.login();
      }
    },
    async login() {
      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Что-то пошло не так');
        }
        this.token = data.token;
        document.cookie = `tokenUserlibComics=${data.token}; max-age=3600; path=/`;
        this.error = ''; // Clear any previous errors
        this.$emit('login-success');
      } catch (error) {
        this.error = error.message;
      }
    },
    async register() {
      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            name: this.name,
            description: this.description
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Что-то пошло не так');
        }
        // Очистка полей после успешной регистрации
        this.email = '';
        this.password = '';
        this.name = '';
        this.description = '';
        // Уведомление пользователя о успешной регистрации
        this.error = 'Вы успешно зарегистрированы. Войдите, используя свои учетные данные.';
      } catch (error) {
        this.error = error.message;
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
.form-container {
  max-width: 400px;
  margin: 0 auto;
}

.form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 94%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
