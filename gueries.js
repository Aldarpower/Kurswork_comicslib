const connection = require('./db');


// Функция для получения пользователя по его адресу электронной почты
function getUserByEmail(email, callback) {
    const query = 'SELECT * FROM User WHERE Email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        if (results.length === 0) {
            // Пользователь не найден
            callback(null, null);
            return;
        }
        const user = results[0];
        callback(null, user);
    });
}
function getTop10NewComics(callback) {
    const query = 'SELECT * FROM comics ORDER BY Date DESC LIMIT 8';
    connection.query(query, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}
function getUserByName(name, callback) {
    const query = 'SELECT * FROM User WHERE name = ?';
    connection.query(query, [name], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        if (results.length === 0) {
            // Пользователь не найден
            callback(null, null);
            return;
        }
        const user = results[0];
        callback(null, user);
    });
}
// Функция для добавления нового пользователя в базу данных
function createUser(email, password, name, description, callback) {
    // Проверка уникальности email и name
    getUserByEmail(email, (err, existingUserByEmail) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (existingUserByEmail) {
            callback({ error: 'Пользователь с таким email уже существует' }, null);
            return;
        }

        getUserByName(name, (err, existingUserByName) => {
            if (err) {
                callback(err, null);
                return;
            }

            if (existingUserByName) {
                callback({ error: 'Пользователь с таким именем уже существует' }, null);
                return;
            }

            // Если email и name уникальны, создаем нового пользователя
            const query = 'INSERT INTO User (name, Description, Date_registration, Email, password) VALUES (?, ?, ?, ?, ?)';
            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const values = [name, description, currentDate, email, password];

            connection.query(query, values, callback);
        });
    });
}
function getUserById(id, callback) {
    const query = 'SELECT * FROM User WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        if (results.length === 0) {
            // Пользователь не найден
            callback(null, null);
            return;
        }
        const user = results[0];
        callback(null, user);
    });
}
// Функция для получения всех комиксов, автором которых является определённый пользователь
function getComicsByUserId(userId, callback) {
    const query = 'SELECT * FROM Comics WHERE Author = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}
// Функция для поиска комиксов по названию и жанрам
function searchComicsByNameAndGenres(name, genres, callback) {
    let query = `
        SELECT c.* FROM Comics c
        JOIN genre_in_comics gc ON c.id = gc.id_comics
        JOIN genre g ON gc.Id_genre = g.id
        WHERE c.Name_comics LIKE ?
    `;
    const searchValue = `%${name}%`;
    const queryParams = [searchValue];

    if (genres && genres.length > 0) {
        query += ' AND g.genre IN (' + genres.map(() => '?').join(', ') + ')';
        queryParams.push(...genres);
    }

    query += ' GROUP BY c.id';

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}
async function getGenres() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM genre';
        connection.query(query, (err, results) => {
            if (err) {
                reject(err); // В случае ошибки отклоняем промис
                return;
            }
            resolve(results); // В случае успеха передаем результаты выполнения запроса
        });
    });
}

// Функция для получения данных о комиксе по его id
async function getComicById(id) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.id, c.name_comics, c.date, c.description, c.way_to_images, u.name AS authorName,
            GROUP_CONCAT(g.genre) AS genres
            FROM Comics c
            JOIN User u ON c.Author = u.id
            LEFT JOIN genre_in_comics gc ON c.id = gc.id_comics
            LEFT JOIN genre g ON gc.Id_genre = g.id
            WHERE c.id = ?
            GROUP BY c.id, c.Name_comics, c.Date, c.Description, c.Way_to_images, u.name
        `;
        connection.query(query, [id], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            if (results.length === 0) {
                resolve(null);
                return;
            }
            const comic = results[0];
            comic.genres = comic.genres ? comic.genres.split(',') : [];
            resolve(comic);
        });
    });
}function getCommentsByComicId(comicId, callback) {
    const query = `
        SELECT c.id, c.comment, u.name AS authorName
        FROM comment c
        JOIN User u ON c.id_user = u.id
        WHERE c.id_comics = ?
        ORDER BY c.id
    `;
    connection.query(query, [comicId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}
// Функция для добавления нового комментария в базу данных
function createComment(comicId, userId, comment, callback) {
    const query = 'INSERT INTO Comment (id_comics, id_user, comment) VALUES (?, ?, ?)';
    const values = [comicId, userId, comment];

    connection.query(query, values, callback);
}
function deleteComic(comicId, callback) {
    // Удаляем все записи из таблицы genre_in_comics, связанные с комиксом
    const deleteGenreInComicsQuery = 'DELETE FROM genre_in_comics WHERE id_comics = ?';
    connection.query(deleteGenreInComicsQuery, [comicId], (err) => {
        if (err) {
            callback(err);
            return;
        }
        // После успешного удаления записей из таблицы genre_in_comics,
        // удаляем сам комикс из таблицы Comics
        const deleteComicQuery = 'DELETE FROM Comics WHERE id = ?';
        connection.query(deleteComicQuery, [comicId], callback);
    });
}
// Функция для создания нового комикса в базе данных
async function createComic(name, description, path_to_comics, author_id) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO Comics (Name_comics, Author, Date, Description, Way_to_images) VALUES (?, ?, ?, ?, ?)';
        const currentDate = new Date().toISOString().slice(0, 10);
        const values = [name, author_id, currentDate, description, path_to_comics];
        
        connection.query(query, values, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}
function deleteCommentsByComicId(comicId, callback) {
    const query = 'DELETE FROM Comment WHERE id_comics = ?';
    connection.query(query, [comicId], callback);
}
// Функция для обновления названия и описания комикса в базе данных
async function updateComicNameAndDescription(comicId, name, description) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE Comics SET Name_comics = ?, Description = ? WHERE id = ?';
        const values = [name, description, comicId];
        
        connection.query(query, values, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}
module.exports = {
    createUser,
    getUserByEmail,
    getTop10NewComics,
    getUserById,
    getComicsByUserId,
    searchComicsByNameAndGenres,
    getGenres,
    getComicById,
    getCommentsByComicId,
    createComment,
    deleteComic,
    createComic,
    deleteCommentsByComicId,
    updateComicNameAndDescription // Экспортируем новую функцию
};
