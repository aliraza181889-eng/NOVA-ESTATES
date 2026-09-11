require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const cookieSession = require("cookie-session");

const app = express();


/* =========================================
   ADMIN LOGIN
========================================= */

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;


/* =========================================
   DATABASE — NEON POSTGRESQL
========================================= */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

console.log("Neon PostgreSQL connection configured.");

console.log("Database connected successfully.");

/* =========================================
   MIDDLEWARE
========================================= */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cors());


/* =========================================
   SESSION
========================================= */

app.use(
    cookieSession({
        name: "nova_session",

        keys: [
    process.env.SESSION_SECRET
],

        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite: "lax",

        maxAge:
            1000 *
            60 *
            60 *
            8
    })
);


/* =========================================
   NORMAL WEBSITE FILES
========================================= */

app.use(
    express.static(__dirname, {
        index: "index.html"
    })
);


/* =========================================
   TEST ROUTE
========================================= */

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "NOVA ESTATES backend is working!"
    });

});


/* =========================================
   ADMIN LOGIN
========================================= */

app.post("/api/admin/login", (req, res) => {

    const {
        username,
        password
    } = req.body;


    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        req.session.isAdmin = true;


        return res.json({
            success: true,
            message: "Login successful."
        });

    }


    res.status(401).json({
        success: false,
        message: "Invalid username or password."
    });

});


/* =========================================
   ADMIN AUTH MIDDLEWARE
========================================= */

function requireAdmin(req, res, next) {

    if (
        req.session &&
        req.session.isAdmin === true
    ) {

        return next();

    }


    return res.status(401).json({
        success: false,
        message: "Unauthorized."
    });

}


/* =========================================
   PROTECT ADMIN PAGE
========================================= */

app.get("/admin.html", (req, res) => {

    if (
        !req.session ||
        req.session.isAdmin !== true
    ) {

        return res.redirect(
            "/admin-login.html"
        );

    }


    res.sendFile(
        path.join(
            __dirname,
            "admin.html"
        )
    );

});


/* =========================================
   LOGOUT
========================================= */

/* =========================================
   LOGOUT
========================================= */

app.post("/api/admin/logout", (req, res) => {

    req.session = null;

    res.json({
        success: true,
        message: "Logged out successfully."
    });

});
/* =========================================
   CONTACT FORM
========================================= */

app.post("/api/contact", async (req, res) => {

    const {
        name,
        email,
        phone,
        subject,
        message
    } = req.body;

    if (!name || !email || !message) {

        return res.status(400).json({
            success: false,
            message: "Name, email and message are required."
        });

    }

    try {

        const result = await pool.query(
            `
            INSERT INTO contacts
            (
                name,
                email,
                phone,
                subject,
                message,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `,
            [
                name,
                email,
                phone || "",
                subject || "",
                message,
                "new"
            ]
        );

        console.log(
            "New contact saved:",
            result.rows[0].id
        );

        res.json({
            success: true,
            message: "Your message has been saved successfully."
        });

    } catch (error) {

        console.error(
            "Database error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to save your message."
        });

    }

});


app.get("/api/properties", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM properties
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            properties: result.rows
        });

    } catch (error) {

        console.error(
            "Failed to load properties:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load properties."
        });

    }

});

app.post("/api/properties", async (req, res) => {

    const {
        name,
        location,
        price,
        bedrooms,
        bathrooms,
        image,
        property_type,
        sqft,
        description,
        featured
    } = req.body;

    if (!name || !location || !price) {

        return res.status(400).json({
            success: false,
            message: "Name, location and price are required."
        });

    }

    try {

        const result = await pool.query(
            `
            INSERT INTO properties
            (
                name,
                location,
                price,
                bedrooms,
                bathrooms,
                image,
                property_type,
                sqft,
                description,
                featured
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
            `,
            [
                name.trim(),
                location.trim(),
                price.trim(),
                Number(bedrooms) || 0,
                Number(bathrooms) || 0,
                image ? image.trim() : "",
                property_type || "House",
                Number(sqft) || 0,
                description ? description.trim() : "",
                featured ? 1 : 0
            ]
        );

        res.json({
            success: true,
            message: "Property added successfully.",
            propertyId: result.rows[0].id
        });

    } catch (error) {

        console.error(
            "Failed to add property:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to add property."
        });

    }

});

/* =========================================
   UPDATE PROPERTY
========================================= */

app.put("/api/properties/:id", async (req, res) => {

    const id = Number(req.params.id);

    const {
        name,
        location,
        price,
        bedrooms,
        bathrooms,
        image,
        property_type,
        sqft,
        description,
        featured
    } = req.body;

    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid property ID."
        });

    }

    if (!name || !location || !price) {

        return res.status(400).json({
            success: false,
            message: "Name, location and price are required."
        });

    }

    try {

        const result = await pool.query(
            `
            UPDATE properties
            SET
                name = $1,
                location = $2,
                price = $3,
                bedrooms = $4,
                bathrooms = $5,
                image = $6,
                property_type = $7,
                sqft = $8,
                description = $9,
                featured = $10
            WHERE id = $11
            `,
            [
                name.trim(),
                location.trim(),
                price.trim(),
                Number(bedrooms) || 0,
                Number(bathrooms) || 0,
                image ? image.trim() : "",
                property_type || "House",
                Number(sqft) || 0,
                description ? description.trim() : "",
                featured ? 1 : 0,
                id
            ]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Property not found."
            });

        }

        console.log(
            "Property updated:",
            id
        );

        res.json({
            success: true,
            message: "Property updated successfully."
        });

    } catch (error) {

        console.error(
            "Failed to update property:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to update property."
        });

    }

});

/* =========================================
   DELETE PROPERTY
========================================= */

app.delete("/api/properties/:id", async (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid property ID."
        });

    }

    try {

        const result = await pool.query(
            `
            DELETE FROM properties
            WHERE id = $1
            `,
            [id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                success: false,
                message: "Property not found."
            });

        }

        console.log(
            "Property deleted:",
            id
        );

        res.json({
            success: true,
            message: "Property deleted successfully."
        });

    } catch (error) {

        console.error(
            "Failed to delete property:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to delete property."
        });

    }

});
/* =========================================
   GET ADMIN CONTACTS
========================================= */

app.get(
    "/api/admin/contacts",
    async (req, res) => {

        try {

            const result = await pool.query(`
                SELECT *
                FROM contacts
                ORDER BY created_at DESC
            `);

            res.json({
                success: true,
                contacts: result.rows
            });

        } catch (error) {

            console.error(
                "Failed to load contacts:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load contact requests."
            });

        }

    }
);
/* =========================================
   DELETE ADMIN CONTACT
========================================= */

app.delete(
    "/api/admin/contacts/:id",
    async (req, res) => {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid contact ID."
            });

        }

        try {

            const result = await pool.query(
                `
                DELETE FROM contacts
                WHERE id = $1
                `,
                [id]
            );

            if (result.rowCount === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Contact request not found."
                });

            }

            console.log(
                "Contact deleted:",
                id
            );

            res.json({
                success: true,
                message: "Contact deleted successfully."
            });

        } catch (error) {

            console.error(
                "Failed to delete contact:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Unable to delete contact request."
            });

        }

    }
);

app.patch(
    "/api/admin/contacts/:id/status",
    async (req, res) => {

        const id = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "new",
            "in-progress",
            "completed"
        ];

        if (!Number.isInteger(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid contact ID."
            });

        }

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: "Invalid status."
            });

        }

        try {

            const result = await pool.query(
                `
                UPDATE contacts
                SET status = $1
                WHERE id = $2
                `,
                [status, id]
            );

            if (result.rowCount === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Contact request not found."
                });

            }

            res.json({
                success: true,
                message: "Status updated successfully."
            });

        } catch (error) {

            console.error(
                "Failed to update status:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Unable to update status."
            });

        }

    }
);

/* =========================================
   LOCAL SERVER
========================================= */

if (require.main === module) {
    const PORT = 3000;

    app.listen(PORT, () => {
        console.log(`NOVA ESTATES running at http://localhost:${PORT}`);
    });
}


/* =========================================
   EXPORT APP
========================================= */

module.exports = app;