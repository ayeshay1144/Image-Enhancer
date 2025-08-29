const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username], (err, user) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: "Server error" });
            if (isMatch) {
                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                res.json({ token });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        });
    });
};