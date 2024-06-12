const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./gueries'); // Подключаем модуль для работы с базой данных





const app = express();
const port = 3000;
const secretKey = '7hJz65CjGYb4o&d9vWPLuMzRw3x5FqXs'; // Замените на свой секретный ключ

app.use(bodyParser.json());
app.use(cors());

// Маршрут для регистрации нового пользователя
app.post('/api/register', (req, res) => {
    const { email, password, name, description } = req.body;

    // Валидация данных
    if (!email || !password || !name || !description) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    // Проверка, существует ли уже пользователь с таким email
    db.getUserByEmail(email, (err, results) => {
        if (err) {
            console.error('Ошибка при проверке существования пользователя:', err);
            return res.status(500).json({ error: 'Пользователь с такой почтой уже зарегестрирован' });
        }

        // Проверка, есть ли результаты запроса и что результаты не пустые
        else if (results && results.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Добавление нового пользователя в базу данных
        db.createUser(email, password, name, description, (err, result) => {
            if (err) {
                console.error('Ошибка при создании нового пользователя:', err);
                return res.status(500).json({ error: 'Пользователь с таким именем или почтой уже зарегестрирован' });
            }
            res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
        });
    });
});


// Маршрут для аутентификации пользователя и выдачи токена
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.getUserByEmail(email, (err, user) => {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }
        if (!user || user.password !== password) {
            res.status(401).json({ error: 'Неправильные учетные данные' });
            return;
        }

        // Создаем JWT токен с информацией о пользователе
        const token = jwt.sign({ userId: user.id, email: user.email }, secretKey);

        res.json({ token });
    });
});

// Пример маршрута, который требует аутентификации
app.get('/api/protected', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, (err, authData) => {
        if (err) {
            res.status(403).json({ error: 'Неверный токен' });
        } else {
            res.json({ message: 'Защищенный маршрут', authData });
        }
    });
});
// Маршрут для получения топ 10 новых комиксов
app.get('/api/comics/top10', (req, res) => {
    db.getTop10NewComics((err, comics) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении комиксов' });
        }
        res.json(comics);
    });
});
app.get('/api/comics/cover/:path', (req, res) => {
    const comicPath = req.params.path;
    const coverPath = `${comicPath}/cover.jpg`;
    res.sendFile(coverPath, { root: __dirname });
});
// Middleware для проверки токена аутентификации
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(403).json({ error: 'Токен не предоставлен' });
    }
}


// Маршрут для получения идентификатора пользователя по токену
app.get('/api/user/id', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, (err, authData) => {
        if (err) {
            res.status(403).json({ error: 'Неверный токен' });
        } else {
            res.json({ userId: authData.userId });
        }
    });
});
// Маршрут для получения данных пользователя по его ID
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;

    db.getUserById(userId, (err, user) => {
        if (err) {
            res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
        } else {
            if (!user) {
                res.status(404).json({ error: 'Пользователь не найден' });
            } else {
                // Отправляем данные пользователя в ответе
                res.json(user);
            }
        }
    });
});
// Маршрут для получения всех комиксов, автором которых является определённый пользователь
app.get('/api/user/:id/comics', (req, res) => {
    const userId = req.params.id;

    db.getComicsByUserId(userId, (err, comics) => {
        if (err) {
            res.status(500).json({ error: 'Ошибка при получении комиксов пользователя' });
        } else {
            res.json(comics);
        }
    });
});
// Маршрут для поиска комиксов по названию и жанрам
app.get('/api/comics/search', (req, res) => {
    const { name, genres } = req.query;
    const genreArray = genres ? genres.split(',') : [];

    db.searchComicsByNameAndGenres(name, genreArray, (err, comics) => {
        if (err) {
            console.error('Ошибка при поиске комиксов:', err);
            return res.status(500).json({ error: 'Ошибка при поиске комиксов' });
        }
        res.json(comics);
    });
});
// Маршрут для получения списка жанров
app.get('/api/genres', async (req, res) => {
    try {
        const genres = await db.getGenres(); // Вызываем функцию для получения жанров
        res.json(genres); // Отправляем список жанров в формате JSON
    } catch (error) {
        console.error('Ошибка при получении жанров:', error);
        res.status(500).json({ error: 'Ошибка при получении жанров' });
    }
});
// Маршрут для получения данных о комиксе по его id
app.get('/api/comics/:id', async (req, res) => {
    const comicId = req.params.id;
    try {
        const comic = await db.getComicById(comicId);
        res.json(comic);
    } catch (error) {
        console.error('Ошибка при получении данных комикса:', error);
        res.status(500).json({ error: 'Ошибка при получении данных комикса' });
    }
});
const fs = require('fs');
const path = require('path');

// Маршрут для получения списка глав комикса
app.get('/api/comics/:id/chapters', async (req, res) => {
    const comicId = req.params.id;
    try {
        const comic = await db.getComicById(comicId);
        if (!comic) {
            return res.status(404).json({ error: 'Комикс не найден' });
        }

        const comicPath = path.join(__dirname, comic.way_to_images);
        const chapters = fs.readdirSync(comicPath)
            .filter(file => fs.statSync(path.join(comicPath, file)).isDirectory())
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        res.json(chapters);
    } catch (err) {
        console.error('Ошибка при получении глав комикса:', err);
        res.status(500).json({ error: 'Ошибка при получении глав комикса' });
    }
});
// Маршрут для получения списка глав комикса
app.get('/api/comics/:id/chap', async (req, res) => {
    const comicId = req.params.id;
    try {
        const comic = await db.getComicById(comicId);
        if (!comic) {
            return res.status(404).json({ error: 'Комикс не найден' });
        }

        const comicPath = path.join(__dirname, comic.way_to_images);
        const chapters = fs.readdirSync(comicPath)
            .filter(file => fs.statSync(path.join(comicPath, file)).isDirectory())
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        res.json(chapters);
    } catch (err) {
        console.error('Ошибка при получении глав комикса:', err);
        res.status(500).json({ error: 'Ошибка при получении глав комикса' });
    }
});
app.get('/api/comics/:id/comments', (req, res) => {
    const comicId = req.params.id;

    db.getCommentsByComicId(comicId, (err, comments) => {
        if (err) {
            console.error('Ошибка при получении комментариев комикса:', err);
            return res.status(500).json({ error: 'Ошибка при получении комментариев комикса' });
        }
        res.json(comments);
    });
});

// Маршрут для добавления комментария
app.post('/api/comics/:id/comments', verifyToken, (req, res) => {
    const comicId = req.params.id;
    const { comment } = req.body;

    // Получаем userId из токена
    jwt.verify(req.token, secretKey, (err, authData) => {
        if (err) {
            res.status(403).json({ error: 'Неверный токен' });
        } else {
            const userId = authData.userId;

            // Выполняем запрос на добавление комментария
            db.createComment(comicId, userId, comment, (err, result) => {
                if (err) {
                    console.error('Ошибка при добавлении комментария:', err);
                    res.status(500).json({ error: 'Ошибка при добавлении комментария' });
                } else {
                    res.status(201).json({ message: 'Комментарий успешно добавлен' });
                }
            });
        }
    });
});
app.get('/api/comics/img/:path', (req, res) => {
    const comicPath = req.params.path;
    res.sendFile(comicPath, { root: __dirname });
});
app.delete('/api/comicsdel/:id', (req, res) => {
    const comicId = req.params.id;
    // Удаляем все комментарии, связанные с этим комиксом
    db.deleteCommentsByComicId(comicId, (err, result) => {
        if (err) {
            console.error('Ошибка при удалении комментариев:', err);
            return res.status(500).json({ error: 'Ошибка при удалении комментариев' });
        }
        // После успешного удаления комментариев, удаляем сам комикс
        db.deleteComic(comicId, (err, result) => {
            if (err) {
                console.error('Ошибка при удалении комикса:', err);
                res.status(500).json({ error: 'Ошибка при удалении комикса' });
            } else {
                // Проверяем, был ли удален комикс
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Комикс не найден' });
                } else {
                    res.json({ message: 'Комикс успешно удален' });
                }
            }
        });
    });
});




// Маршрут для создания комикса
app.post('/api/comics/create', async (req, res) => {
    const { name, description, author_id } = req.body;
    var path_to_comics = "library/" + name;
    // Валидация данных
    if (!name || !description || !path_to_comics || !author_id) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    // Создание папки для комикса
    const comicsFolderPath = path.join(__dirname, path_to_comics);
    try {
        fs.mkdirSync(comicsFolderPath, { recursive: true });
    } catch (err) {
        console.error('Ошибка при создании папки для комикса:', err);
        return res.status(500).json({ error: 'Ошибка при создании папки для комикса' });
    }

    // Копирование изображения cover.jpg в папку комикса
    const sourceImagePath = path.join(__dirname, 'cover', 'cover.jpg');
    const targetImagePath = path.join(comicsFolderPath, 'cover.jpg');
    try {
        fs.copyFileSync(sourceImagePath, targetImagePath);
    } catch (err) {
        console.error('Ошибка при копировании изображения:', err);
        return res.status(500).json({ error: 'Ошибка при копировании изображения' });
    }

    // Добавление комикса в базу данных
    try {
        await db.createComic(name, description, path_to_comics, author_id);
        res.status(201).json({ message: 'Комикс успешно создан' });
    } catch (err) {
        console.error('Ошибка при создании комикса в базе данных:', err);
        res.status(500).json({ error: 'Ошибка при создании комикса в базе данных' });
    }
});
// Маршрут для редактирования комикса
app.put('/api/comics/edit/:id', async (req, res) => {
    const comicId = req.params.id;
    const { name, description } = req.body;

    try {
        // Вызываем функцию для обновления названия и описания комикса в базе данных
        await db.updateComicNameAndDescription(comicId, name, description);
        res.status(200).json({ message: 'Комикс успешно отредактирован' });
    } catch (error) {
        console.error('Ошибка при редактировании комикса:', error);
        res.status(500).json({ error: 'Ошибка при редактировании комикса' });
    }
});



const fileUpload = require('express-fileupload');
// Парсинг JSON
app.use(bodyParser.json());

// Подключение middleware для загрузки файлов
app.use(fileUpload());

// Маршрут для сохранения изображения
app.post('/api/save-image', (req, res) => {
  if (!req.files || !req.body.wayToSave) {
    return res.status(400).send('Ошибка: Не загружены изображение или не указан путь для сохранения.');
  }

  const imageFile = req.files.image;
  const wayToSave = req.body.wayToSave;

  // Генерация пути для сохранения изображения
  const imagePath = path.join(__dirname,  wayToSave, "cover.jpg");

  // Сохранение изображения
  imageFile.mv(imagePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('Изображение успешно сохранено.');
  });
});
// Маршрут для сохранения изображений
app.post('/api/save-images', (req, res) => {
    if (!req.files || !req.body.wayToSave) {
      return res.status(400).send('Ошибка: Не загружены изображения или не указан путь для сохранения.');
    }
  
    const wayToSave = req.body.wayToSave;
  
    // Убедитесь, что req.files.images является массивом
    const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
  
    // Генерация путей для сохранения изображений и сохранение каждого изображения
    const savePromises = imageFiles.map((imageFile) => {
      const imagePath = path.join(__dirname, wayToSave, imageFile.name);
      
      return new Promise((resolve, reject) => {
        // Создание директорий, если они не существуют
        fs.mkdir(path.dirname(imagePath), { recursive: true }, (err) => {
          if (err) {
            return reject(err);
          }
          imageFile.mv(imagePath, (err) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
      });
    });
  
    // Ожидание завершения сохранения всех изображений
    Promise.all(savePromises)
      .then(() => {
        res.send('Все изображения успешно сохранены.');
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });
// Маршрут для удаления папки по заданному пути
app.delete('/api/delete-folder/:folderPath', (req, res) => {
    const folderPath = decodeURIComponent(req.params.folderPath); // Декодирование пути
    const absoluteFolderPath = path.join(__dirname, folderPath); // Преобразование в абсолютный путь

    // Проверяем, существует ли указанная папка
    fs.access(absoluteFolderPath, fs.constants.F_OK, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Если папка не существует, возвращаем ошибку 404
                return res.status(404).json({ error: 'Папка не найдена' });
            } else {
                // Если произошла другая ошибка, возвращаем ошибку сервера
                console.error('Ошибка при проверке существования папки:', err);
                return res.status(500).json({ error: 'Ошибка сервера при удалении папки' });
            }
        }

        // Если папка существует, удаляем её
        fs.rmdir(absoluteFolderPath, { recursive: true }, (err) => {
            if (err) {
                // Если произошла ошибка при удалении папки, возвращаем ошибку сервера
                console.error('Ошибка при удалении папки:', err);
                return res.status(500).json({ error: 'Ошибка сервера при удалении папки' });
            }
            // Если папка успешно удалена, возвращаем сообщение об успехе
            res.json({ message: 'Папка успешно удалена' });
        });
    });
});



// Маршрут для переименования папки
app.put('/api/rename-folder', (req, res) => {
    const folderPath = req.body.folderPath;
    const newFolderName = req.body.newFolderName;

    // Проверяем, что путь к папке и новое название не пустые
    if (!folderPath || !newFolderName) {
        return res.status(400).json({ error: 'Необходимо указать путь к папке и новое название' });
    }

    // Генерируем абсолютный путь к папке
    const absoluteFolderPath = path.join(__dirname, folderPath);

    // Проверяем существует ли папка
    fs.access(absoluteFolderPath, fs.constants.F_OK, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Если папка не существует, возвращаем ошибку 404
                return res.status(404).json({ error: 'Папка не найдена' });
            } else {
                // Если произошла другая ошибка, возвращаем ошибку сервера
                console.error('Ошибка при проверке существования папки:', err);
                return res.status(500).json({ error: 'Ошибка сервера при переименовании папки' });
            }
        }

        // Генерируем новый путь для папки
        const newFolderPath = path.join(__dirname, path.dirname(folderPath), newFolderName);

        // Переименовываем папку
        fs.rename(absoluteFolderPath, newFolderPath, (err) => {
            if (err) {
                // Если произошла ошибка при переименовании папки, возвращаем ошибку сервера
                console.error('Ошибка при переименовании папки:', err);
                return res.status(500).json({ error: 'Ошибка сервера при переименовании папки' });
            }
            // Если папка успешно переименована, возвращаем сообщение об успехе
            res.json({ message: 'Папка успешно переименована' });
        });
    });
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
