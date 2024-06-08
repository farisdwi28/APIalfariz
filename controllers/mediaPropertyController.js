const fs = require("fs");
const { validateUser } = require("../utils/validateUser");
const { validateAuthorization } = require("../utils/Authorization");
const { queryPromise } = require("../utils/promise");

exports.uploadMedia = async (req, res) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).send("Unauthorized: Missing authorization header");
        }

        const token = authorizationHeader.split(" ")[1];
        const authorizedUser = validateAuthorization(authorizationHeader);
        const user = validateUser(token);

        if (!authorizedUser || !user) {
            return res.status(401).send("Unauthorized: Invalid or missing token");
        }

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).send("No files uploaded");
        }

        const fileData = files.map(file => fs.readFileSync(file.path));
        const userData = await queryPromise("SELECT * FROM user WHERE id = ?", [user.id]);
        const data = userData[0];
        if (!data || data.role !== "admin") {
            return res.status(401).send("Unauthorized: Only admins can upload media");
        }
        for(const fileBuffer of fileData) {
            try {
                await queryPromise("INSERT INTO property_medias (media, property_id) values (?, ?)", [fileBuffer, req.params.id]);
            } catch (err) {
                console.error("Database query failed: ", err);
                return res.status(500).send({ error: "Database query failed" });
            }
        }
        files.forEach(file => fs.unlinkSync(file.path));

        res.status(200).send({ message: "Files uploaded successfully" });
    } catch (error) {
        console.error("Error handling upload: ", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};
