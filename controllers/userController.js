const bcrypt = require("bcryptjs");
const { validateAuthorization } = require("../utils/Authorization");
const { validateUser, generateToken } = require("../utils/validateUser");
const { queryPromise } = require("../utils/promise");

exports.getAllUsers = async (req, res) => {
    const authorizedUser = validateAuthorization(req.headers.authorization);
    if (!authorizedUser) {
        return res.status(401).send("Unauthorized: Invalid or missing token");
    }
    const token = req.headers.authorization.split(" ")[1];
    const user = validateUser(token);
    if (!user) {
        return res.status(401).send("Invalid token");
    }

    try {
        const userQuery = "SELECT * FROM user WHERE id = ?";
        const rows = await queryPromise(userQuery, [user.id]);
        const data = rows[0];
        if (data.role !== "admin") {
            return res.status(401).send("Unauthorized: Only admins can get users");
        }

        const allUsersQuery = "SELECT * FROM user";
        const allUsers = await queryPromise(allUsersQuery);
        res.status(200).json(allUsers);
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.getUserById = async (req, res) => {
    const query = `SELECT * FROM user WHERE id = ?`;
    try {
        const rows = await queryPromise(query, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.Register = async (req, res) => {
    const { first_name, last_name, email, phone, password } = req.body;

    try {
        const existingUserQuery = `SELECT * FROM user WHERE email = ?`;
        const rows = await queryPromise(existingUserQuery, [email]);

        if (rows.length > 0) {
            return res.status(400).send({ error: "Email is already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO user (first_name, last_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, 'user')";
        await queryPromise(query, [first_name, last_name, email, phone, hashedPassword]);
        res.status(201).send({ message: "Registered successfully" });
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.Login = async (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM user WHERE email = ?`;
    try {
        const rows = await queryPromise(query, [email]);
        if (rows.length === 0) {
            return res.status(401).send({ error: "Invalid email or password" });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send({ error: "Invalid email or password" });
        }

        const token = generateToken(user.id);
        res.status(200).send({ token });
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.editProfile = async (req, res) => {
    let { first_name, last_name, phone, password } = req.body;
    const authorizedUser = validateAuthorization(req.headers.authorization);
    if (!authorizedUser) {
        return res.status(401).send("Unauthorized: Invalid or missing token");
    }
    const token = req.headers.authorization.split(" ")[1];
    const user = validateUser(token);
    if (!user) {
        return res.status(401).send("Invalid token");
    }

    try {
        const userQuery = `SELECT * FROM user WHERE id = ?`;
        const rows = await queryPromise(userQuery, [user.id]);
        const data = rows[0];

        const hashedPassword = password ? await bcrypt.hash(password, 10) : data.password;
        first_name = first_name || data.first_name;
        last_name = last_name || data.last_name;
        phone = phone || data.phone;

        const updateQuery = "UPDATE user SET first_name = ?, last_name = ?, phone = ?, password = ? WHERE id = ?";
        await queryPromise(updateQuery, [first_name, last_name, phone, hashedPassword, user.id]);
        res.status(200).send({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.deleteUserById = async (req, res) => {
    const authorizedUser = validateAuthorization(req.headers.authorization);
    if (!authorizedUser) {
        return res.status(401).send("Unauthorized: Invalid or missing token");
    }
    const token = req.headers.authorization.split(" ")[1];
    const user = validateUser(token);
    if (!user) {
        return res.status(401).send("Invalid token");
    }

    try {
        const userQuery = "SELECT * FROM user WHERE id = ?";
        const rows = await queryPromise(userQuery, [user.id]);
        const data = rows[0];

        if (data.role !== "admin") {
            return res.status(401).send("Unauthorized: Only admins can delete users");
        }

        const deleteQuery = "DELETE FROM user WHERE id = ?";
        const result = await queryPromise(deleteQuery, [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: `User with id: ${req.params.id} deleted successfully` });
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};