const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

const createTables = () => {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )`, (err) => {
            if (err) console.error("Error creating users table", err);
            else insertInitialUsers();
        });

        // Images Table
        db.run(`CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            originalFilename TEXT,
            processedFilename TEXT,
            status TEXT DEFAULT 'uploaded',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);
    });
};

const insertInitialUsers = () => {
    const users = [
        { username: 'admin', password: 'adminpassword', role: 'admin' },
        { username: 'user', password: 'userpassword', role: 'user' }
    ];

    users.forEach(user => {
        db.get("SELECT * FROM users WHERE username = ?", [user.username], (err, row) => {
            if (!row) {
                bcrypt.hash(user.password, 10, (err, hash) => {
                    db.run(
                        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                        [user.username, hash, user.role],
                        (err) => {
                            if (err) console.error("Error inserting user:", err.message);
                            else console.log(`User ${user.username} inserted`);
                        }
                    );
                });
            }
        });
    });
};

module.exports = db;