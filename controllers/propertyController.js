const { validateUser } = require("../utils/validateUser");
const { validateAuthorization } = require("../utils/Authorization");
const { queryPromise } = require("../utils/promise");

exports.getAllProperty = async (req, res) => {
    const query = 'SELECT * FROM property';
    try {
        const data = await queryPromise(query);
        for (let row of data) {
            const mediaQuery = 'SELECT * FROM property_medias WHERE property_id = ?';
            const propertymedia = await queryPromise(mediaQuery, row.id);
            row.property_medias = propertymedia;
        }
        console.log({ data });
        res.send(data);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
};

exports.getPropertybyCategory = async (req, res) => {
    const query = `SELECT * FROM property WHERE category = ?`;
    try {
        const rows = await queryPromise(query, [req.params.category]);
        if (rows.length === 0) {
            res.status(404).send({ error: "Property category not found" });
        } else {
            res.status(200).json(rows);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.getPropertybyLocation = async (req, res) => {
    const query = `SELECT * FROM property WHERE location = ?`;
    try {
        const rows = await queryPromise(query, [req.params.location]);
        if (rows.length === 0) {
            res.status(404).send({ error: "Property location not found" });
        } else {
            res.status(200).json(rows);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.addProperty = async (req, res) => {
    const { category, name_property, location, bed, bath, surface_area, description, contact, owner } = req.body;
    const query = "INSERT INTO property (category, name_property, location, bed, bath, surface_area, description, contact, owner) VALUES (?,?,?,?,?,?,?,?,?)";
    try {
        await queryPromise(query, [category, name_property, location, bed, bath, surface_area, description, contact, owner]);
        res.status(201).send({ message: "Add property successfully" });
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.editPropertyById = async (req, res) => {
    let { category, name_property, location, bed, bath, surface_area, description, contact, owner } = req.body;
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
        const row = await queryPromise(userQuery, [user.id]);
        const line = row[0];

        if (line.role !== "admin") {
            return res.status(401).send("Unauthorized: Only admins can edit property");
        }

        const propertyQuery = `SELECT * FROM property`
        const rows = await queryPromise(propertyQuery);
        const data = rows[0];

        category = category || data.category;
        name_property = name_property || data.name_property;
        location = location || data.location;
        bed = bed || data.bed;
        bath = bath || data.bath;
        surface_area = surface_area || data.surface_area;
        description = description || data.description;
        contact = contact || data.contact;
        owner = owner || data.owner;

        const updateQuery = "UPDATE property SET category = ?, name_property = ?, location = ?, bed = ?, bath = ?, surface_area = ?, description = ?, contact = ?, owner = ? WHERE id = ?";
        await queryPromise(updateQuery, [category, name_property, location, bed, bath, surface_area, description, contact, owner, req.params.id]);
        res.status(201).send({ message: "Property updated successfully" });

    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};

exports.deletePropertyById = async (req, res) => {
    const { id } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorized: Missing authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).send("Unauthorized: Invalid token format");
    }

    const authorizedUser = validateAuthorization(authHeader);
    if (!authorizedUser) {
        return res.status(401).send("Unauthorized: Invalid token");
    }

    const user = validateUser(token);
    if (!user) {
        return res.status(401).send("Unauthorized: Token validation failed");
    }

    try {
        const userQuery = "SELECT * FROM user WHERE id = ?";
        const rows = await queryPromise(userQuery, [user.id]);

        if (rows.length === 0) {
            return res.status(404).send("User not found");
        }
        const data = rows[0];
        if (data.role !== "admin") {
            return res.status(403).send("Forbidden: Only admins can delete property");
        }

        const deleteMediaQuery = 'DELETE FROM property_medias WHERE property_id = ?';
        await queryPromise(deleteMediaQuery, [id]);

        const deletePropertyQuery = 'DELETE FROM property WHERE id = ?';
        const result = await queryPromise(deletePropertyQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: "Property not found" });
        }

        res.send({ message: "Property deleted successfully" });
    } catch (err) {
        console.error("Database query failed: ", err);
        res.status(500).send({ error: "Database query failed" });
    }
};


