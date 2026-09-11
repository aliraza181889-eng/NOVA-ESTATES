/* =========================================
   ADMIN DASHBOARD
   CONTACTS + PROPERTIES
========================================= */


/* =========================================
   DOM ELEMENTS
========================================= */
const propertySqft = document.getElementById("propertySqft");
const propertyDescription = document.getElementById("propertyDescription");


const contactsContainer =
    document.getElementById("contactsContainer");

const propertiesContainer =
    document.getElementById("propertiesContainer");

const totalContacts =
    document.getElementById("totalContacts");

const todayContacts =
    document.getElementById("todayContacts");

const weekContacts =
    document.getElementById("weekContacts");

const contactSearch =
    document.getElementById("contactSearch");

const contactFilter =
    document.getElementById("contactFilter");

const propertyForm =
    document.getElementById("propertyForm");


/* =========================================
   DATA
========================================= */

let allContacts = [];
let allProperties = [];

let propertiesExpanded = false;

/* =========================================
   LOAD CONTACTS
========================================= */

async function loadContacts() {

    try {

        const response =
            await fetch("/api/admin/contacts");

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to load contacts."
            );

        }

        allContacts =
            Array.isArray(result.contacts)
                ? result.contacts
                : [];

        updateStats();

        filterContacts();

    } catch (error) {

        console.error(
            "Load contacts error:",
            error
        );

        if (contactsContainer) {

            contactsContainer.innerHTML = `
                <p class="empty">
                    Unable to load contact requests.
                </p>
            `;

        }

    }

}


/* =========================================
   LOAD PROPERTIES
========================================= */

async function loadProperties() {

    if (!propertiesContainer) {
        return;
    }

    try {

        const response =
            await fetch("/api/properties");

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to load properties."
            );

        }

        allProperties =
    Array.isArray(result.properties)
        ? result.properties
        : [];

if (propertiesExpanded) {
    showAllAdminProperties();
} else {
    renderProperties();
}

    } catch (error) {

        console.error(
            "Load properties error:",
            error
        );

        propertiesContainer.innerHTML = `
            <p class="empty">
                Unable to load properties.
            </p>
        `;

    }

}


/* =========================================
   RENDER PROPERTIES
========================================= */

function renderProperties() {

    if (!propertiesContainer) {
        return;
    }


    if (!allProperties.length) {

        propertiesContainer.innerHTML = `
            <p class="empty">
                No properties added yet.
            </p>
        `;

        return;

        
    }


    const propertiesToShow = allProperties.slice(0, 3);



    propertiesContainer.innerHTML =
    propertiesToShow.map(property => {



            const image =
                property.image
                    ? `
                        <img
                            src="${escapeHTML(property.image)}"
                            alt="${escapeHTML(property.name || "Property")}"
                            loading="lazy"
                            onerror="this.style.display='none';"
                        >
                    `
                    : `
                        <div class="property-no-image">
                            NO IMAGE
                        </div>
                    `;


            return `
                <div class="property-card">

                    <div class="property-image">
                        ${image}
                    </div>


                    <div class="property-info">

                        <span class="property-location">
                            ${escapeHTML(
                                property.location || "Unknown location"
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                property.name || "Unnamed Property"
                            )}
                        </h3>


                        <strong class="property-price">
                            ${escapeHTML(
                                property.price || "Price not available"
                            )}
                        </strong>


                        <div class="property-details">

                            <span>
                                ${escapeHTML(
                                    property.bedrooms ?? 0
                                )}
                                Bedrooms
                            </span>

                            <span>
                                ${escapeHTML(
                                    property.bathrooms ?? 0
                                )}
                                Bathrooms
                            </span>

                        </div>


                        ${
                            property.featured
                                ? `
                                    <span class="featured-badge">
                                        FEATURED
                                    </span>
                                `
                                : ""
                        }


                        <div class="property-card-actions">

                            <button
                                type="button"
                                class="edit-property-button"
                                onclick="editProperty(${Number(property.id)})"
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                class="delete-property-button"
                                onclick="deleteProperty(${Number(property.id)})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("");


   if (allProperties.length > 3) {

    propertiesContainer.insertAdjacentHTML("afterbegin", `
        <div class="admin-view-all-wrap">
            <button
                type="button"
                class="view-all-properties-button"
                onclick="showAllAdminProperties()"
            >
                View All Properties →
            </button>
        </div>
    `);

}




}

function showAllAdminProperties() {

    propertiesExpanded = true;

    const propertiesToShow = allProperties;

    propertiesContainer.innerHTML = `
        <div class="admin-view-all-wrap">
            <button
                type="button"
                class="view-all-properties-button"
                onclick="showLessAdminProperties()"
            >
                ← Show Less Properties
            </button>
        </div>
    `;

    propertiesContainer.insertAdjacentHTML(
        "beforeend",
        propertiesToShow.map(property => {

            const image =
                property.image
                    ? `
                        <img
                            src="${escapeHTML(property.image)}"
                            alt="${escapeHTML(property.name || "Property")}"
                            loading="lazy"
                            onerror="this.style.display='none';"
                        >
                    `
                    : `
                        <div class="property-no-image">
                            NO IMAGE
                        </div>
                    `;

            return `
                <div class="property-card">

                    <div class="property-image">
                        ${image}
                    </div>

                    <div class="property-info">

                        <span class="property-location">
                            ${escapeHTML(
                                property.location || "Unknown location"
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                property.name || "Unnamed Property"
                            )}
                        </h3>

                        <strong class="property-price">
                            ${escapeHTML(
                                property.price || "Price not available"
                            )}
                        </strong>

                        <div class="property-details">

                            <span>
                                ${escapeHTML(
                                    property.bedrooms ?? 0
                                )}
                                Bedrooms
                            </span>

                            <span>
                                ${escapeHTML(
                                    property.bathrooms ?? 0
                                )}
                                Bathrooms
                            </span>

                        </div>

                        ${
                            property.featured
                                ? `
                                    <span class="featured-badge">
                                        FEATURED
                                    </span>
                                `
                                : ""
                        }

                        <div class="property-card-actions">

                            <button
                                type="button"
                                class="edit-property-button"
                                onclick="editProperty(${Number(property.id)})"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="delete-property-button"
                                onclick="deleteProperty(${Number(property.id)})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("")
    );

}

/* =========================================
   SHOW LESS PROPERTIES
========================================= */

function showLessAdminProperties() {

    propertiesExpanded = false;

    renderProperties();

}

/* =========================================
   EDIT PROPERTY
========================================= */

function editProperty(id) {

    const property =
        allProperties.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!property) {

        alert("Property not found.");

        return;

    }


    const modal =
        document.getElementById(
            "propertyModal"
        );


    const nameInput =
        document.getElementById(
            "propertyName"
        );


    const locationInput =
        document.getElementById(
            "propertyLocation"
        );


    const priceInput =
        document.getElementById(
            "propertyPrice"
        );


    const bedroomsInput =
        document.getElementById(
            "propertyBedrooms"
        );


    const bathroomsInput =
        document.getElementById(
            "propertyBathrooms"
        );


    const imageInput =
        document.getElementById(
            "propertyImage"
        );
    

    const propertyTypeInput =
    document.getElementById(
        "propertyType"
    );

    if (propertySqft) {
    propertySqft.value = property.sqft || "";
}

if (propertyDescription) {
    propertyDescription.value = property.description || "";
}


    const featuredInput =
        document.getElementById(
            "propertyFeatured"
        );


    if (!modal) {
        return;
    }


    if (nameInput) {
        nameInput.value =
            property.name || "";
    }


    if (locationInput) {
        locationInput.value =
            property.location || "";
    }


    if (priceInput) {
        priceInput.value =
            property.price || "";
    }


    if (bedroomsInput) {
        bedroomsInput.value =
            property.bedrooms ?? 0;
    }


    if (bathroomsInput) {
        bathroomsInput.value =
            property.bathrooms ?? 0;
    }


    if (imageInput) {
        imageInput.value =
            property.image || "";
    }

    
    if (propertyTypeInput) {
    propertyTypeInput.value =
        property.property_type || "House";
}


    if (featuredInput) {
        featuredInput.checked =
            Boolean(property.featured);
    }


    propertyForm.dataset.editingId =
        String(property.id);


    const modalTitle =
        modal.querySelector("h2");


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Property";

    }


    const saveButton =
        propertyForm.querySelector(
            ".save-property-button"
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Property";

    }


    modal.classList.add("active");

    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================
   DELETE PROPERTY
========================================= */

async function deleteProperty(id) {

    const property =
        allProperties.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!property) {

        alert("Property not found.");

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${property.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/properties/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to delete property."
            );

        }


        alert(
            "Property deleted successfully."
        );


        await loadProperties();


    } catch (error) {

        console.error(
            "Delete property error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete property."
        );

    }

}



/* =========================================
   ADD / UPDATE PROPERTY
========================================= */


if (propertyForm) {

    propertyForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const editingId =
                propertyForm.dataset.editingId;


            const propertyData = {

                name:
                    document.getElementById(
                        "propertyName"
                    ).value.trim(),

                location:
                    document.getElementById(
                        "propertyLocation"
                    ).value.trim(),

                price:
                    document.getElementById(
                        "propertyPrice"
                    ).value.trim(),

                bedrooms:
                    Number(
                        document.getElementById(
                            "propertyBedrooms"
                        ).value
                    ) || 0,

                bathrooms:
                    Number(
                        document.getElementById(
                            "propertyBathrooms"
                        ).value
                    ) || 0,

                image:
                    document.getElementById(
                        "propertyImage"
                    ).value.trim(),


                property_type:
    document.getElementById(
        "propertyType"
    ).value,




    sqft: Number(document.getElementById("propertySqft").value) || 0,
description: document.getElementById("propertyDescription").value.trim(),



                featured:
                    document.getElementById(
                        "propertyFeatured"
                    ).checked ? 1 : 0

            };


            try {

                const url = editingId
                    ? `/api/properties/${editingId}`
                    : "/api/properties";


                const method = editingId
                    ? "PUT"
                    : "POST";


                const response =
                    await fetch(url, {

                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                propertyData
                            )

                    });


                /*
                 * Read response safely.
                 * This prevents:
                 * Unexpected token '<'
                 */

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";


                let result;


                if (
                    contentType.includes(
                        "application/json"
                    )
                ) {

                    result =
                        await response.json();

                } else {

                    const text =
                        await response.text();

                    console.error(
                        "Server returned non-JSON:",
                        text
                    );

                    throw new Error(
                        "Server returned an invalid response."
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Property could not be saved."
                    );

                }


                /*
                 * Success
                 */

                alert(
                    editingId
                        ? "Property updated successfully."
                        : "Property added successfully."
                );


                /*
                 * Reset form
                 */

                propertyForm.reset();




                if (propertySqft) {
    propertySqft.value = "";
}

if (propertyDescription) {
    propertyDescription.value = "";
}
                /*
                 * Remove edit mode
                 */

                delete propertyForm.dataset.editingId;


                /*
                 * Restore modal title
                 */

                const modalTitle =
                    document.querySelector(
                        "#propertyModal h2"
                    );


                if (modalTitle) {

                    modalTitle.textContent =
                        "Add Property";

                }


                /*
                 * Restore button text
                 */

                const saveButton =
                    propertyForm.querySelector(
                        ".save-property-button"
                    );


                if (saveButton) {

                    saveButton.textContent =
                        "Save Property";

                }


                /*
                 * Close modal
                 */

                closePropertyForm();


                /*
                 * Reload properties
                 */

                await loadProperties();


            } catch (error) {

                console.error(
                    "Property save error:",
                    error
                );


                alert(
                    error.message ||
                    "Something went wrong while saving the property."
                );

            }

        }
    );

}

/* =========================================
   UPDATE DASHBOARD STATS
========================================= */

function updateStats() {

    const contacts =
        Array.isArray(allContacts)
            ? allContacts
            : [];


    if (totalContacts) {

        totalContacts.textContent =
            contacts.length;

    }


    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const day =
        today.getDay();


    const weekStart =
        new Date(today);


    weekStart.setDate(
        today.getDate() -
        (day === 0 ? 6 : day - 1)
    );


    const todayCount =
        contacts.filter(contact => {

            const date =
                new Date(
                    contact.created_at
                );

            return (
                !isNaN(date.getTime()) &&
                date >= today
            );

        }).length;


    const weekCount =
        contacts.filter(contact => {

            const date =
                new Date(
                    contact.created_at
                );

            return (
                !isNaN(date.getTime()) &&
                date >= weekStart
            );

        }).length;


    const newCount =
        contacts.filter(contact =>
            (contact.status || "new") === "new"
        ).length;


    const progressCount =
        contacts.filter(contact =>
            (contact.status || "new") === "in-progress"
        ).length;


    const completedCount =
        contacts.filter(contact =>
            (contact.status || "new") === "completed"
        ).length;


    if (todayContacts) {

        todayContacts.textContent =
            todayCount;

    }


    if (weekContacts) {

        weekContacts.textContent =
            weekCount;

    }


    const newContacts =
        document.getElementById("newContacts");

    const progressContacts =
        document.getElementById("progressContacts");

    const completedContacts =
        document.getElementById("completedContacts");


    if (newContacts) {

        newContacts.textContent =
            newCount;

    }


    if (progressContacts) {

        progressContacts.textContent =
            progressCount;

    }


    if (completedContacts) {

        completedContacts.textContent =
            completedCount;

    }

}


/* =========================================
   FILTER CONTACTS
========================================= */

function filterContacts() {

    const search =
        contactSearch
            ? contactSearch.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        contactFilter
            ? contactFilter.value
            : "all";


    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const day =
        today.getDay();


    const weekStart =
        new Date(today);


    weekStart.setDate(
        today.getDate() -
        (day === 0 ? 6 : day - 1)
    );


    const filtered =
        allContacts.filter(contact => {

            const name =
                String(
                    contact.name || ""
                ).toLowerCase();


            const email =
                String(
                    contact.email || ""
                ).toLowerCase();


            const subject =
                String(
                    contact.subject || ""
                ).toLowerCase();


            const message =
                String(
                    contact.message || ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search) ||
                email.includes(search) ||
                subject.includes(search) ||
                message.includes(search);


            const contactDate =
                new Date(
                    contact.created_at
                );


            let matchesFilter =
                true;


            if (filter === "today") {

                matchesFilter =
                    !isNaN(contactDate.getTime()) &&
                    contactDate >= today;

            }


            if (filter === "week") {

                matchesFilter =
                    !isNaN(contactDate.getTime()) &&
                    contactDate >= weekStart;

            }


            if (
                filter === "new" ||
                filter === "in-progress" ||
                filter === "completed"
            ) {

                matchesFilter =
                    (contact.status || "new") === filter;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    renderContacts(filtered);

}


/* =========================================
   RENDER CONTACTS
========================================= */

function renderContacts(contacts) {

    if (!contactsContainer) {
        return;
    }


    if (!contacts.length) {

        contactsContainer.innerHTML = `
            <p class="empty">
                No matching contact requests found.
            </p>
        `;

        return;

    }


    contactsContainer.innerHTML =
        contacts.map(contact => {

            const date =
                new Date(
                    contact.created_at
                );


            const formattedDate =
                !isNaN(date.getTime())
                    ? date.toLocaleString()
                    : "Unknown date";


            const status =
                contact.status || "new";


            const message =
                String(
                    contact.message || ""
                );


            const preview =
                message.length > 120
                    ? message.substring(0, 120) + "..."
                    : message;


            return `
                <div class="contact-card">


                    <div class="contact-card-top">

                        <div class="contact-name">
                            ${escapeHTML(
                                contact.name || "Unknown"
                            )}
                        </div>


                        <div class="contact-date">
                            ${escapeHTML(
                                formattedDate
                            )}
                        </div>

                    </div>


                    <div class="contact-status-row">

                        <span class="status-label">
                            STATUS
                        </span>


                        <select
                            class="contact-status status-${escapeHTML(status)}"
                            onchange="updateContactStatus(
                                ${Number(contact.id)},
                                this.value
                            )"
                        >

                            <option
                                value="new"
                                ${
                                    status === "new"
                                        ? "selected"
                                        : ""
                                }
                            >
                                New
                            </option>


                            <option
                                value="in-progress"
                                ${
                                    status === "in-progress"
                                        ? "selected"
                                        : ""
                                }
                            >
                                In Progress
                            </option>


                            <option
                                value="completed"
                                ${
                                    status === "completed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Completed
                            </option>

                        </select>

                    </div>


                    <div class="contact-info">


                        <div class="info-item">

                            <span>
                                Email
                            </span>

                            <strong>
                                ${escapeHTML(
                                    contact.email || "—"
                                )}
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Phone
                            </span>

                            <strong>
                                ${escapeHTML(
                                    contact.phone || "—"
                                )}
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Subject
                            </span>

                            <strong>
                                ${escapeHTML(
                                    contact.subject || "—"
                                )}
                            </strong>

                        </div>


                    </div>


                    <div class="contact-message-preview">

                        ${escapeHTML(preview)}

                    </div>


                    <div class="contact-card-actions">


                        <button
                            class="view-contact"
                            onclick="viewContact(
                                ${Number(contact.id)}
                            )"
                        >
                            View Message
                        </button>


                        <button
                            class="delete-contact"
                            onclick="deleteContact(
                                ${Number(contact.id)}
                            )"
                        >
                            Delete
                        </button>


                    </div>


                </div>
            `;

        }).join("");

}


/* =========================================
   UPDATE CONTACT STATUS
========================================= */

async function updateContactStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                `/api/admin/contacts/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status: status
                        })
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to update status."
            );

        }


        const contact =
            allContacts.find(
                item =>
                    Number(item.id) === Number(id)
            );


        if (contact) {

            contact.status =
                status;

        }


        updateStats();

        filterContacts();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update contact status."
        );


        await loadContacts();

    }

}


/* =========================================
   VIEW CONTACT MESSAGE
========================================= */

function viewContact(id) {

    const contact =
        allContacts.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!contact) {
        return;
    }


    const modalName =
        document.getElementById(
            "modalName"
        );


    const modalEmail =
        document.getElementById(
            "modalEmail"
        );


    const modalPhone =
        document.getElementById(
            "modalPhone"
        );


    const modalSubject =
        document.getElementById(
            "modalSubject"
        );


    const modalDate =
        document.getElementById(
            "modalDate"
        );


    const modalMessage =
        document.getElementById(
            "modalMessage"
        );


    const messageModal =
        document.getElementById(
            "messageModal"
        );


    if (!messageModal) {
        return;
    }


    if (modalName) {

        modalName.textContent =
            contact.name || "—";

    }


    if (modalEmail) {

        modalEmail.textContent =
            contact.email || "—";

    }


    if (modalPhone) {

        modalPhone.textContent =
            contact.phone || "—";

    }


    if (modalSubject) {

        modalSubject.textContent =
            contact.subject || "—";

    }


    if (modalDate) {

        const date =
            new Date(
                contact.created_at
            );


        modalDate.textContent =
            !isNaN(date.getTime())
                ? date.toLocaleString()
                : "Unknown date";

    }


    if (modalMessage) {

        modalMessage.textContent =
            contact.message || "—";

    }


    messageModal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================
   CLOSE MESSAGE
========================================= */

function closeMessage() {

    const messageModal =
        document.getElementById(
            "messageModal"
        );


    if (messageModal) {

        messageModal.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================
   DELETE CONTACT
========================================= */

async function deleteContact(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this contact request?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/admin/contacts/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to delete contact."
            );

        }


        allContacts =
            allContacts.filter(
                contact =>
                    Number(contact.id) !==
                    Number(id)
            );


        updateStats();

        filterContacts();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete this contact request."
        );

    }

}

/* =========================================
   OPEN PROPERTY FORM
========================================= */

function openPropertyForm() {

    const modal =
        document.getElementById("propertyModal");

    const form =
        document.getElementById("propertyForm");

    if (!modal || !form) {
        console.error("Property form or modal not found.");
        return;
    }

    /*
       Reset form for ADD mode
    */

    form.reset();

    /*
       Remove edit mode
    */

    delete form.dataset.editingId;

    /*
       Restore modal title
    */

    const modalTitle =
        modal.querySelector("h2");

    if (modalTitle) {
        modalTitle.textContent =
            "Add Property";
    }

    /*
       Restore button text
    */

    const saveButton =
        form.querySelector(
            ".save-property-button"
        );

    if (saveButton) {
        saveButton.textContent =
            "Add Property";
    }

    /*
       Open modal
    */

    modal.classList.add("active");

    document.body.classList.add(
        "modal-open"
    );
}


/* =========================================
   CLOSE PROPERTY FORM
========================================= */

function closePropertyForm() {

    const modal =
        document.getElementById(
            "propertyModal"
        );

    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================
   LOGOUT
========================================= */

async function logoutAdmin() {

    try {

        const response =
            await fetch(
                "/api/admin/logout",
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        if (
            response.ok &&
            result.success
        ) {

            window.location.href =
                "/admin-login.html";

            return;

        }


        throw new Error(
            result.message ||
            "Logout failed."
        );


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        /*
           Even if the server response fails,
           send the admin back to login.
        */

        window.location.href =
            "/admin-login.html";

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   SEARCH EVENT
========================================= */

if (contactSearch) {

    contactSearch.addEventListener(
        "input",
        filterContacts
    );

}


/* =========================================
   FILTER EVENT
========================================= */

if (contactFilter) {

    contactFilter.addEventListener(
        "change",
        filterContacts
    );

}


/* =========================================
   CLOSE MODALS WITH ESC
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        closeMessage();

        closePropertyForm();

    }
);


/* =========================================
   CLOSE MODALS WHEN CLICKING BACKDROP
========================================= */

document.addEventListener(
    "click",
    function (event) {

        const messageModal =
            document.getElementById(
                "messageModal"
            );


        const propertyModal =
            document.getElementById(
                "propertyModal"
            );


        if (
            messageModal &&
            event.target === messageModal
        ) {

            closeMessage();

        }


        if (
            propertyModal &&
            event.target === propertyModal
        ) {

            closePropertyForm();

        }

    }
);


/* =========================================
   INITIAL LOAD
========================================= */

async function initializeAdminDashboard() {

    await Promise.all([
        loadContacts(),
        loadProperties()
    ]);

}


initializeAdminDashboard();


/* =========================================
   AUTO REFRESH
========================================= */

setInterval(
    async function () {

        /*
           Refresh both contacts and properties
           every 10 seconds.
        */

        await Promise.all([
            loadContacts(),
            loadProperties()
        ]);

    },
    10000
);

/* =========================================
   MAKE PROPERTY FUNCTIONS GLOBAL
========================================= */

window.openPropertyForm =
    openPropertyForm;

window.closePropertyForm =
    closePropertyForm;

window.editProperty =
    editProperty;

window.deleteProperty =
    deleteProperty;

window.closeMessage =
    closeMessage;

window.viewContact =
    viewContact;

window.deleteContact =
    deleteContact;

window.updateContactStatus =
    updateContactStatus;

window.logoutAdmin =
    logoutAdmin;

window.showAllAdminProperties =
    showAllAdminProperties;

window.showLessAdminProperties =
    showLessAdminProperties;