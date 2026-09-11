const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");
const session = require("express-session");

const app = express();
const PORT = 3000;


/* =========================================
   ADMIN LOGIN
========================================= */

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "NovaAdmin@2026";


/* =========================================
   DATABASE
========================================= */

const db = new Database("nova-estates.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

try {
    db.prepare(`
        ALTER TABLE properties
        ADD COLUMN property_type TEXT DEFAULT 'House'
    `).run();

    console.log("Property type column added.");
} catch (error) {
    // Column already exists — nothing to do.
}

console.log("Database connected successfully.");

db.prepare(`
    CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        price TEXT NOT NULL,
        bedrooms INTEGER DEFAULT 0,
        bathrooms INTEGER DEFAULT 0,
        image TEXT,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

/* =========================================
   PROPERTY TYPE MIGRATION
========================================= */

try {

    db.prepare(`
        ALTER TABLE properties
        ADD COLUMN property_type TEXT DEFAULT 'House'
    `).run();

    console.log("Property type column added.");

} catch (error) {

    // Column already exists — nothing to do.

}


console.log("Properties database ready.");



try {
    db.prepare(`
        ALTER TABLE contacts
        ADD COLUMN status TEXT DEFAULT 'new'
    `).run();

    console.log("Contact status column added.");
} catch (error) {
    // Column already exists — nothing to do.
}

try {
    db.prepare(`
        ALTER TABLE properties
        ADD COLUMN sqft INTEGER DEFAULT 0
    `).run();

    console.log("Square feet column added.");
} catch (error) {
    // Column already exists — nothing to do.
}

try {
    db.prepare(`
        ALTER TABLE properties
        ADD COLUMN description TEXT DEFAULT ''
    `).run();

    console.log("Description column added.");
} catch (error) {
    // Column already exists — nothing to do.
}
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
    session({
        secret: "NOVA_ESTATES_SECRET_2026_CHANGE_LATER",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "lax",

            maxAge:
                1000 *
                60 *
                60 *
                8
        }
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

app.post("/api/admin/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "Logout error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to logout."
            });

        }


        res.clearCookie("connect.sid");


        res.json({
            success: true,
            message: "Logged out successfully."
        });

    });

});


/* =========================================
   CONTACT FORM
========================================= */

app.post("/api/contact", (req, res) => {

    const {
        name,
        email,
        phone,
        subject,
        message
    } = req.body;


    if (
        !name ||
        !email ||
        !message
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Name, email and message are required."
        });

    }


    try {

        const insertContact =
            db.prepare(`
                INSERT INTO contacts
(
    name,
    email,
    phone,
    subject,
    message,
    status
)
VALUES (?, ?, ?, ?, ?, ?)
            `);


        const result =
    insertContact.run(
        name,
        email,
        phone || "",
        subject || "",
        message,
        "new"
    );


        console.log(
            "New contact saved:",
            result.lastInsertRowid
        );


        res.json({
            success: true,
            message:
                "Your message has been saved successfully."
        });


    } catch (error) {

        console.error(
            "Database error:",
            error
        );


        res.status(500).json({
            success: false,
            message:
                "Unable to save your message."
        });

    }

});


app.get("/api/properties", (req, res) => {
    try {
        const properties = db.prepare(`
            SELECT *
            FROM properties
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            properties: properties
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


app.post("/api/properties", (req, res) => {

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

        const result = db.prepare(`
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
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            name,
            location,
            price,
            Number(bedrooms) || 0,
            Number(bathrooms) || 0,
            image || "",
            property_type || "House",
            Number(sqft) || 0,
            description ? description.trim() : "",
            featured ? 1 : 0
        );

        res.json({
            success: true,
            message: "Property added successfully.",
            propertyId: result.lastInsertRowid
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

app.put("/api/properties/:id", (req, res) => {


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

        const result = db.prepare(`
         UPDATE properties
SET
    name = ?,
    location = ?,
    price = ?,
    bedrooms = ?,
    bathrooms = ?,
    image = ?,
    property_type = ?,
    sqft = ?,
    description = ?,
    featured = ?
WHERE id = ?

         `).run(
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
        );


        if (result.changes === 0) {

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

app.delete("/api/properties/:id", (req, res) => {

    const id = Number(req.params.id);


    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid property ID."
        });

    }


    try {

        const result = db.prepare(`
            DELETE FROM properties
            WHERE id = ?
        `).run(id);


        if (result.changes === 0) {

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
    (req, res) => {

        try {

            const contacts =
                db.prepare(`
                    SELECT *
                    FROM contacts
                    ORDER BY created_at DESC
                `).all();


            res.json({
                success: true,
                contacts: contacts
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
    (req, res) => {

        const id =
            Number(req.params.id);


        if (!Number.isInteger(id)) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid contact ID."
            });

        }


        try {

            const result =
                db.prepare(`
                    DELETE FROM contacts
                    WHERE id = ?
                `).run(id);


            if (
                result.changes === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Contact request not found."
                });

            }


            console.log(
                "Contact deleted:",
                id
            );


            res.json({
                success: true,
                message:
                    "Contact deleted successfully."
            });


        } catch (error) {

            console.error(
                "Failed to delete contact:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Unable to delete contact request."
            });

        }

    }
);



app.patch(
    "/api/admin/contacts/:id/status",
    (req, res) => {

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

            const result = db.prepare(`
                UPDATE contacts
                SET status = ?
                WHERE id = ?
            `).run(status, id);

            if (result.changes === 0) {
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
   START SERVER
========================================= */

app.listen(PORT, () => {

    console.log(
        `NOVA ESTATES server running at http://localhost:${PORT}`
    );

});