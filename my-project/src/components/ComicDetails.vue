<template>
    <div class="comic-details-container" v-if="comic">
        <h2>{{ comic.name_comics }}</h2>
        <img :src="getCoverUrl(comic.way_to_images)" alt="Обложка комикса" class="comic-cover">
        <p><strong>Автор:</strong> {{ comic.authorName }}</p>
        <p><strong>Дата выпуска:</strong> {{ comic.date }}</p>
        <p><strong>Описание:</strong> {{ comic.description }}</p>
        <p><strong>Жанры:</strong> {{ comic.genres ? comic.genres.join(', ') : 'Нет информации' }}</p>
        <h3>Главы:</h3>
        <div>
            <button v-for="chapter in chapters" :key="chapter" @click="displayChapter(chapter)">
                Глава {{ chapter }}
            </button>
        </div>
        <template v-if="displayedImageURL && Array.isArray(displayedImageURL)">
            <div class="chapter-images-overlay">
                <button @click="closeChapter" class="close-button">Закрыть</button>
                <div class="chapter-images">
                    <img v-for="(image, index) in displayedImageURL" :key="index" :src="image" alt="Глава комикса">
                </div>
            </div>
        </template>
        <h3>Комментарии:</h3>
        <div class="comments-section" v-if="comments.length">
            <div v-for="comment in comments" :key="comment.id" class="comment">
                <p><strong>{{ comment.authorName }}:</strong> {{ comment.comment }}</p>
            </div>
        </div>
        <div v-else>
            <p>Нет комментариев</p>
        </div>
        <h3>Оставить комментарий:</h3>
        <form @submit.prevent="submitComment">
            <textarea v-model="newComment" placeholder="Ваш комментарий" required></textarea>
            <button type="submit">Отправить</button>
        </form>
    </div>
    <div v-else>
        <p>Загрузка...</p>
    </div>
</template>

<script>
export default {
    props: {
        comicId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            comic: null,
            chapters: [],
            displayedImageURL: null,
            comments: [],
            newComment: '' // Новая переменная для хранения текста нового комментария
        };
    },
    mounted() {
        this.fetchComicDetails();
        this.fetchChapters();
        this.fetchComments();
    },
    watch: {
        comicId() {
            this.fetchComicDetails();
            this.fetchChapters();
            this.fetchComments();
        }
    },
    methods: {
        async fetchComicDetails() {
            try {
                const response = await fetch(`http://localhost:3000/api/comics/${this.comicId}`);
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных комикса');
                }
                const comicData = await response.json();
                this.comic = comicData;
            } catch (error) {
                console.error('Ошибка при получении данных комикса:', error);
            }
        },
        async fetchChapters() {
            try {
                const response = await fetch(`http://localhost:3000/api/comics/${this.comicId}/chapters`);
                if (!response.ok) {
                    throw new Error('Ошибка при получении списка глав');
                }
                const chaptersData = await response.json();
                this.chapters = chaptersData;
            } catch (error) {
                console.error('Ошибка при получении списка глав:', error);
            }
        },
        async fetchComments() {
            try {
                const response = await fetch(`http://localhost:3000/api/comics/${this.comicId}/comments`);
                if (!response.ok) {
                    throw new Error('Ошибка при получении комментариев');
                }
                const commentsData = await response.json();
                this.comments = commentsData;
            } catch (error) {
                console.error('Ошибка при получении комментариев:', error);
            }
        },
        async submitComment() {
    try {
        const token = this.getCookie('tokenUserlibComics'); // Получаем токен из куки или хранилища
        if (!token) {
            console.error('Токен не найден');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/comics/${this.comicId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Передаем токен в заголовке запроса
            },
            body: JSON.stringify({
                comment: this.newComment // Отправляем текст нового комментария
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при отправке комментария');
        }

        // Обновляем список комментариев после успешной отправки
        this.fetchComments();

        // Очищаем поле ввода после отправки комментария
        this.newComment = '';

        console.log('Комментарий успешно отправлен');
    } catch (error) {
        console.error('Ошибка при отправке комментария:', error);
    }
},
        getCoverUrl(comicPath) {
            const encodedPath = encodeURIComponent(comicPath);
            return `http://localhost:3000/api/comics/cover/${encodedPath}`;
        },
        async displayChapter(chapter) {
            let imageNumber = 1;
            let images = [];
            let hasNextImage = true;
            while (hasNextImage) {
                try {
                    const path = `${this.comic.way_to_images}/${chapter}/${imageNumber}.jpg`;
                    const imageURL = this.getImageURL(path);
                    const response = await fetch(imageURL);
                    if (!response.ok) {
                        hasNextImage = false;
                    } else {
                        images.push(imageURL);
                        imageNumber++;
                    }
                } catch (error) {
                    console.error('Ошибка при получении изображения:', error);
                    hasNextImage = false;
                }
            }
            if (images.length > 0) {
                this.displayedImageURL = images;
            } else {
                console.error('Изображения для главы не найдены');
            }
        },
        getImageURL(Path) {
            const chapterPath = encodeURIComponent(Path);
            return `http://localhost:3000/api/comics/img/${chapterPath}`;
        },
        closeChapter() {
            this.displayedImageURL = null;
        },
        getCookie(name) {
            const matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }
    }
};
</script>

<style scoped>
.comic-details-container {
    max-width: 1150px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
}

.comic-cover {
    width: 100%;
    max-width: 300px;
    margin-bottom: 20px;
}

p {
    font-size: 16px;
    margin-bottom: 10px;
}

h3 {
    margin-top: 20px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 5px;
}

.chapter-images-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.chapter-images {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
}

.close-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background-color: transparent;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 1001;
}

.comments-section {
    margin-top: 20px;
    background-color: #ffffff;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment {
    border-bottom: 1px solid #e0e0e0;
    padding: 10px 0;
}

.comment:last-child {
    border-bottom: none;
}

/* New styles for the comment form */
form {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
}

textarea {
    resize: none;
    padding: 10px;
    font-size: 16px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    height: 100px;
}

button {
    background-color: #4CAF50;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #45a049;
}
</style>
