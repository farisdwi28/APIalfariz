const fs = require("fs");
const { validateUser } = require("../utils/validateUser");
const { validateAuthorization } = require("../utils/Authorization");
const { queryPromise } = require("../utils/promise");

exports.photoGetAll = async (req, res) => {
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
            return res.status(401).send("Unauthorized: Only admins can get photo");
        }

        const query = "SELECT avatar FROM user";
        const photos = await queryPromise(query);
        res.status(200).json(photos);
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.uploadPhoto = async (req, res) => {
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
        const file = fs.readFileSync(`upload/${req.file.filename}`);
        const query = "UPDATE user SET avatar = ? WHERE id = ?";
        const result = await queryPromise(query, [file, user.id]);
        fs.unlinkSync(`upload/${req.file.filename}`);
        res.status(200).send({ message: "Photo uploaded successfully", result });
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};
