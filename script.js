/* ==================== MOBILE MENU ==================== */

const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
});


/* ==================== MOBILE MENU LINKS ==================== */

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
    });
});


/* ==================== FAVORITE BUTTONS ==================== */

const favoriteButtons = document.querySelectorAll(".favorite-button");

favoriteButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.classList.toggle("active");

        if (button.classList.contains("active")) {
            button.textContent = "♥";
        } else {
            button.textContent = "♡";
        }

    });

});


/* =========================
   DATABASE PROPERTY SYSTEM
========================= */

let publicProperties = [];


/* LOAD PROPERTIES FROM DATABASE */

async function loadPublicProperties() {

    const propertyGrid =
        document.getElementById("propertyGrid");

    if (!propertyGrid) return;

    try {

        const response =
            await fetch("/api/properties");

        if (!response.ok) {
            throw new Error("Failed to load properties.");
        }

        const result =
            await response.json();

        /* API returns:
           {
               success: true,
               properties: [...]
           }
        */

        const properties =
            Array.isArray(result)
                ? result
                : result.properties || [];


        /* ONLY FEATURED PROPERTIES */

        publicProperties =
            properties.filter(property =>
                Number(property.featured) === 1
            );


        renderPublicProperties();

    } catch (error) {

        console.error(
            "Public property loading error:",
            error
        );

    }

}


/* LOAD DATABASE PROPERTIES */

loadPublicProperties();


/* =========================
   RENDER FEATURED PROPERTIES
========================= */

let showAllProperties = false;

function renderPublicProperties() {

    const propertyGrid =
        document.getElementById("propertyGrid");

    const viewAllButton =
        document.querySelector(".view-all");

    if (!propertyGrid) return;


    /* CLEAR OLD PROPERTY CARDS */

    propertyGrid.innerHTML = "";


    /* NO FEATURED PROPERTIES */

    if (publicProperties.length === 0) {

        propertyGrid.innerHTML = `
            <p class="no-search-results">
                No featured properties available at the moment.
            </p>
        `;

        if (viewAllButton) {
            viewAllButton.style.display = "none";
        }

        return;
    }


    /* =========================
       SHOW FIRST 3 / ALL
    ========================= */

    const propertiesToShow =
        showAllProperties
            ? publicProperties
            : publicProperties.slice(0, 3);


    /* =========================
       CREATE PROPERTY CARDS
    ========================= */

    propertiesToShow.forEach(property => {

        const card =
            document.createElement("article");

        card.className = "property-card";


        card.innerHTML = `
            <div class="property-image">

                <img
                    src="${property.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"}"
                    alt="${escapePropertyText(property.name)}"
                    loading="lazy"
                >

                <span class="property-tag">
                    FEATURED
                </span>

                <button
                    class="favorite-button"
                    type="button"
                    aria-label="Add property to favorites"
                >
                    ♡
                </button>

            </div>


            <div class="property-info">

                <span class="property-location">
                    ${escapePropertyText(property.location)}
                </span>

                <h3>
                    ${escapePropertyText(property.name)}
                </h3>

                <div class="property-price">
                    ${escapePropertyText(property.price)}
                </div>


                <div class="property-details">

                    <span>
                        <strong>
                            ${Number(property.bedrooms) || 0}
                        </strong>
                        Beds
                    </span>

                    <span>
                        <strong>
                            ${Number(property.bathrooms) || 0}
                        </strong>
                        Baths
                    </span>

                </div>


                <button
                    class="view-details"
                    type="button"
                    data-property-id="${Number(property.id)}"
                >
                    View Details
                </button>

            </div>
        `;


        propertyGrid.appendChild(card);


        /* MAKE CARD VISIBLE */

        requestAnimationFrame(() => {
            card.classList.add("visible");
        });


        /* =========================
           FAVORITE BUTTON
        ========================= */

        const favoriteButton =
            card.querySelector(".favorite-button");

        if (favoriteButton) {

            favoriteButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    favoriteButton.classList.toggle("active");

                    favoriteButton.textContent =
                        favoriteButton.classList.contains("active")
                            ? "♥"
                            : "♡";

                }
            );

        }


        /* =========================
           VIEW DETAILS
        ========================= */

        const viewButton =
            card.querySelector(".view-details");

        if (viewButton) {

            viewButton.addEventListener(
                "click",
                () => {

                    openDatabasePropertyModal(property);

                }
            );

        }


        /* =========================
           IMAGE QUICK VIEW
        ========================= */

        const propertyImage =
            card.querySelector(".property-image");

        if (propertyImage) {

            propertyImage.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.closest(
                            ".favorite-button"
                        )
                    ) {
                        return;
                    }

                    openDatabasePropertyModal(property);

                }
            );

        }

    });


    /* =========================
       VIEW ALL BUTTON
    ========================= */

    if (viewAllButton) {

        if (publicProperties.length > 3) {

            viewAllButton.style.display = "inline-flex";

            viewAllButton.textContent =
                showAllProperties
                    ? "Show Less ↑"
                    : "View All Properties →";

        } else {

            viewAllButton.style.display = "none";

        }

    }

}

/* =========================
   CREATE PROPERTY CARD
========================= */

function createPublicPropertyCard(property) {

    const card = document.createElement("article");

    card.className = "property-card";

    card.innerHTML = `
        <div class="property-image">

            <img
                src="${property.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"}"
                alt="${escapePropertyText(property.name)}"
                loading="lazy"
            >

            <span class="property-tag">
                ${escapePropertyText(
                    property.property_type || "Property"
                )}
            </span>

            <button
                class="favorite-button"
                type="button"
                aria-label="Add property to favorites"
            >
                ♡
            </button>

        </div>

        <div class="property-info">

            <span class="property-location">
                ${escapePropertyText(property.location)}
            </span>

            <h3>
                ${escapePropertyText(property.name)}
            </h3>

            <div class="property-price">
                ${escapePropertyText(property.price)}
            </div>

            <div class="property-details">

                <span>
                    <strong>
                        ${Number(property.bedrooms) || 0}
                    </strong>
                    Beds
                </span>

                <span>
                    <strong>
                        ${Number(property.bathrooms) || 0}
                    </strong>
                    Baths
                </span>

            </div>

            <button
                class="view-details"
                type="button"
                data-property-id="${Number(property.id)}"
            >
                View Details
            </button>

        </div>
    `;


    /* =========================
       FAVORITE BUTTON
    ========================= */

    const favoriteButton =
        card.querySelector(".favorite-button");

    if (favoriteButton) {

        favoriteButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                favoriteButton.classList.toggle("active");

                favoriteButton.textContent =
                    favoriteButton.classList.contains("active")
                        ? "♥"
                        : "♡";
            }
        );
    }


    /* =========================
       VIEW DETAILS
    ========================= */

    const viewButton =
        card.querySelector(".view-details");

    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () => {

                openDatabasePropertyModal(property);

            }
        );
    }


    /* =========================
       IMAGE QUICK VIEW
    ========================= */

    const propertyImage =
        card.querySelector(".property-image");

    if (propertyImage) {

        propertyImage.addEventListener(
            "click",
            (event) => {

                if (
                    event.target.closest(
                        ".favorite-button"
                    )
                ) {
                    return;
                }

                openDatabasePropertyModal(property);

            }
        );
    }


    return card;
}



/* =========================
   VIEW ALL PROPERTIES BUTTON
========================= */

const viewAllPropertiesButton =
    document.querySelector(".view-all");

if (viewAllPropertiesButton) {

    viewAllPropertiesButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            showAllProperties =
                !showAllProperties;

            renderPublicProperties();

        }
    );

}




setTimeout(() => {
    document
        .querySelectorAll("#propertyGrid .property-card")
        .forEach(card => {
            card.classList.add("visible");
        });
}, 50);


/* SAFE PROPERTY TEXT */

function escapePropertyText(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* DATABASE PROPERTY MODAL */

function openDatabasePropertyModal(property) {
    const modal = document.getElementById("propertyModal");

    if (!modal) return;

    const modalImage = document.getElementById("modalPropertyImage");
    const modalTitle = document.getElementById("modalPropertyTitle");
    const modalLocation = document.getElementById("modalPropertyLocation");
    const modalPrice = document.getElementById("modalPropertyPrice");
    const modalBeds = document.getElementById("modalBeds");
    const modalBaths = document.getElementById("modalBaths");
    const modalSqft = document.getElementById("modalSqft");
    const modalDescription = document.getElementById("modalDescription");

    if (modalImage) {
        modalImage.src = property.image || "https://via.placeholder.com/800x500?text=Property";
        modalImage.alt = property.name || "Property";
    }

    if (modalTitle) {
        modalTitle.textContent = property.name || "Property";
    }

    if (modalLocation) {
        modalLocation.textContent = property.location || "Location unavailable";
    }

    if (modalPrice) {
        modalPrice.textContent = property.price || "Price unavailable";
    }

    if (modalBeds) {
        modalBeds.textContent = Number(property.bedrooms) || 0;
    }

    if (modalBaths) {
        modalBaths.textContent = Number(property.bathrooms) || 0;
    }

    if (modalSqft) {
        const sqft = Number(property.sqft) || 0;
        modalSqft.textContent = sqft
            ? `${sqft.toLocaleString()} sq ft`
            : "—";
    }

    if (modalDescription) {
        modalDescription.textContent =
            property.description ||
            "No description is available for this property.";
    }

    modal.classList.add("active");
    document.body.classList.add("modal-open");
}


// =========================================
// DATABASE PROPERTY SEARCH
// =========================================

const searchButton = document.querySelector(".search-button");
const searchFields = document.querySelectorAll(".search-field select");

if (searchButton && searchFields.length === 3) {

    searchButton.addEventListener("click", () => {

        const selectedLocation = searchFields[0].value.trim();
        const selectedType = searchFields[1].value.trim();
        const selectedPrice = searchFields[2].value.trim();

        // Start with ALL database properties
        let results = [...publicProperties];

        // -----------------------------
        // LOCATION FILTER
        // -----------------------------
        if (selectedLocation && selectedLocation !== "Select location") {

            const location = selectedLocation.toLowerCase();

            results = results.filter(property => {

                const propertyLocation =
                    String(property.location || "").toLowerCase();

                return propertyLocation.includes(location);
            });
        }

        // -----------------------------
        // PROPERTY TYPE FILTER
        // -----------------------------
        if (selectedType && selectedType !== "Any property") {

            results = results.filter(property => {

                const propertyType =
                    String(property.property_type || "").toLowerCase();

                return propertyType === selectedType.toLowerCase();
            });
        }

        // -----------------------------
        // PRICE FILTER
        // -----------------------------
        if (selectedPrice) {
    results = results.filter(property => {
        const price = parseUsdPrice(property.price);

        if (price === null) return false;

        if (selectedPrice === "100000-300000") {
            return price >= 100000 && price <= 300000;
        }

        if (selectedPrice === "300000-500000") {
            return price >= 300000 && price <= 500000;
        }

        if (selectedPrice === "500000-1000000") {
            return price >= 500000 && price <= 1000000;
        }

        if (selectedPrice === "1000000-plus") {
            return price > 1000000;
        }

        return true;
    });
}

        // -----------------------------
        // SHOW SEARCH RESULTS
        // -----------------------------

        showSearchResults(results);
    });
}


// =========================================
// PRICE PARSER
// =========================================

function parseUsdPrice(priceText) {
    if (!priceText) return null;

    const text = String(priceText)
        .toLowerCase()
        .replace(/,/g, "")
        .replace(/\$/g, "")
        .trim();

    const match = text.match(/^([\d.]+)\s*(k|m|million)?/);

    if (!match) return null;

    let price = parseFloat(match[1]);

    if (!Number.isFinite(price)) {
        return null;
    }

    const unit = match[2];

    if (unit === "k") {
        price *= 1000;
    }

    if (unit === "m" || unit === "million") {
        price *= 1000000;
    }

    return price;
}
// =========================================
// SHOW SEARCH RESULTS
// =========================================

function showSearchResults(results) {

    const propertyGrid =
        document.getElementById("propertyGrid");

    if (!propertyGrid) {
        return;
    }

    // No results
    if (results.length === 0) {

        propertyGrid.innerHTML = `
            <div class="no-properties-found">
                <div class="no-properties-icon">⌕</div>

                <h3>No Properties Found</h3>

                <p>
                    No property matches your selected search criteria.
                </p>

                <button
                    type="button"
                    class="clear-search-btn"
                    id="clearSearchBtn"
                >
                    Clear Search
                </button>
            </div>
        `;

        const clearButton =
            document.getElementById("clearSearchBtn");

        if (clearButton) {
            clearButton.addEventListener(
                "click",
                clearPropertySearch
            );
        }

        return;
    }

    // Hide View All while searching
    const viewAll =
        document.querySelector(".view-all");

    if (viewAll) {
        viewAll.style.display = "none";
    }

    propertyGrid.innerHTML = "";

    results.forEach((property, index) => {

        const card =
            createPublicPropertyCard(property, index);

        if (card) {
            propertyGrid.appendChild(card);

            requestAnimationFrame(() => {
                card.classList.add("visible");
            });
        }
    });
}


// =========================================
// CLEAR SEARCH
// =========================================

function clearPropertySearch() {


    const viewAllPropertiesButton = document.getElementById("viewAllProperties");

if (viewAllPropertiesButton) {
    viewAllPropertiesButton.addEventListener("click", function(event) {
        event.preventDefault();

        showAllProperties = true;

        renderPublicProperties();

        const propertiesSection = document.getElementById("properties");

        if (propertiesSection) {
            propertiesSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

    searchFields.forEach(select => {
        select.selectedIndex = 0;
    });

    showAllProperties = false;

    renderPublicProperties();
}

/* ==================== SCROLL REVEAL ==================== */

function setupScrollReveal() {

    const revealElements = document.querySelectorAll(
        ".property-card, .service-card, .about-content, .about-image"
    );

    const revealOnScroll = () => {

        revealElements.forEach(element => {

            const elementTop =
                element.getBoundingClientRect().top;

            const windowHeight =
                window.innerHeight;

            if (elementTop < windowHeight - 80) {
                element.classList.add("visible");
            }

        });

    };

    window.addEventListener("scroll", revealOnScroll);

    revealOnScroll();
}

setupScrollReveal();

/* ==================== NAVBAR SCROLL ==================== */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});
// FAQ ACCORDION
const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach((question) => {

    question.addEventListener("click", () => {

        const item = question.parentElement;

        document.querySelectorAll(".faq-item").forEach((faq) => {
            if (faq !== item) {
                faq.classList.remove("active");
            }
        });

        item.classList.toggle("active");
    });

});

// =========================
// CONTACT FORM
// =========================

const contactForm = document.querySelector(".contact-form");
const contactMessage = document.getElementById("contactMessage");

if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();
        e.stopImmediatePropagation();

        const nameInput = contactForm.querySelector(
            'input[placeholder="Your Name"]'
        );

        const emailInput = contactForm.querySelector(
            'input[placeholder="Email Address"]'
        );

        const subjectInput = contactForm.querySelector(
            'input[placeholder="Subject"]'
        );

        const messageInput = contactForm.querySelector("textarea");

        const submitButton = contactForm.querySelector(
            'button[type="submit"]'
        );

        if (!nameInput || !emailInput || !messageInput) {
            return;
        }

        if (contactMessage) {
            contactMessage.innerHTML = "";
        }

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: "",
            subject: subjectInput ? subjectInput.value.trim() : "",
            message: messageInput.value.trim()
        };

        if (!formData.name || !formData.email || !formData.message) {
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";
        }

        try {

            const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to send message."
                );
            }

            contactForm.reset();

            contactForm.reset();

if (contactMessage) {
    contactMessage.innerHTML = `
        <div class="form-success-message">
            <strong>Message Sent Successfully</strong>
            <span>
                Thank you for contacting NOVA ESTATES.
                Our team will get back to you shortly.
            </span>
    `;

    setTimeout(() => {
        contactMessage.innerHTML = "";
    }, 5000);
}
        } catch (error) {

            if (contactMessage) {
                contactMessage.innerHTML = `
                    <div class="form-error-message">
                        <strong>Message Could Not Be Sent</strong>
                        <span>Please try again.</span>
                    </div>
                `;
            }

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Send Message";
            }

        }

    }, true);

}



// =========================
// PROPERTY DETAILS MODAL
// =========================

const propertyData = {

    "Modern Hillside Residence": {
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
        location: "Beverly Hills, California",
        price: "$895,000",
        beds: "4",
        baths: "3",
        sqft: "2,850",
        description:
            "A stunning modern residence featuring spacious interiors, premium finishes, beautiful views, and a peaceful private setting."
    },

    "Contemporary Garden Villa": {
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
        location: "Miami, Florida",
        price: "$1,250,000",
        beds: "5",
        baths: "4",
        sqft: "3,420",
        description:
            "A sophisticated garden villa designed for modern living, offering generous spaces, elegant architecture, and a beautiful outdoor environment."
    },

    "Luxury Downtown Apartment": {
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
        location: "Manhattan, New York",
        price: "$4,800 / month",
        beds: "3",
        baths: "2",
        sqft: "1,950",
        description:
            "A premium downtown apartment combining contemporary design, city views, convenient amenities, and an exceptional Manhattan lifestyle."
    }

};


const propertyModal = document.getElementById("propertyModal");
const modalClose = document.getElementById("modalClose");

const modalImage = document.getElementById("modalPropertyImage");
const modalTitle = document.getElementById("modalPropertyTitle");
const modalLocation = document.getElementById("modalPropertyLocation");
const modalPrice = document.getElementById("modalPropertyPrice");
const modalBeds = document.getElementById("modalBeds");
const modalBaths = document.getElementById("modalBaths");
const modalSqft = document.getElementById("modalSqft");
const modalDescription = document.getElementById("modalDescription");


// OPEN MODAL

document.querySelectorAll(".view-details").forEach(button => {

    button.addEventListener("click", () => {

        const propertyName = button.dataset.property;
        const property = propertyData[propertyName];

        if (!property) return;

        modalImage.src = property.image;
        modalTitle.textContent = propertyName;
        modalLocation.textContent = property.location;
        modalPrice.textContent = property.price;
        modalBeds.textContent = property.beds;
        modalBaths.textContent = property.baths;
        modalSqft.textContent = property.sqft;
        modalDescription.textContent = property.description;

        propertyModal.classList.add("active");

        document.body.style.overflow = "hidden";
    });

});


// CLOSE MODAL

function closePropertyModal() {
    propertyModal.classList.remove("active");
    document.body.style.overflow = "";
}

modalClose.addEventListener("click", closePropertyModal);


// CLOSE WHEN CLICKING OUTSIDE

document.querySelector(".property-modal-overlay")
    .addEventListener("click", closePropertyModal);


// ESC KEY

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closePropertyModal();
    }

});

// =========================
// MODAL ACTION BUTTONS
// =========================

const scheduleButton = document.querySelector(".schedule-btn");
const contactAgentButton = document.querySelector(".contact-agent-btn");

const contactSubject =
    document.querySelector('.contact-form input[placeholder="Subject"]');

if (scheduleButton) {

    scheduleButton.addEventListener("click", () => {

        closePropertyModal();

        if (contactSubject) {
            contactSubject.value = "Property Viewing Request";
        }

        const contactSection =
            document.getElementById("contact");

        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

}


if (contactAgentButton) {

    contactAgentButton.addEventListener("click", () => {

        closePropertyModal();

        if (contactSubject) {
            contactSubject.value = "Contact Property Agent";
        }

        const contactSection =
            document.getElementById("contact");

        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

}
// =========================
// PROPERTY IMAGE QUICK VIEW
// =========================

document.querySelectorAll(".property-image").forEach(image => {

    image.addEventListener("click", () => {

        const card = image.closest(".property-card");

        if (!card) return;

        const viewButton = card.querySelector(".view-details");

        if (viewButton) {
            viewButton.click();
        }

    });

});



// ==================== OUR STORY MODAL ====================

const storyButton = document.getElementById("storyButton");
const storyModal = document.getElementById("storyModal");
const storyModalClose = document.getElementById("storyModalClose");
const storyModalOverlay = document.querySelector(".story-modal-overlay");
const storyContactButton = document.getElementById("storyContactButton");

function openStoryModal() {
    if (!storyModal) return;

    storyModal.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeStoryModal() {
    if (!storyModal) return;

    storyModal.classList.remove("active");
    document.body.classList.remove("modal-open");
}

if (storyButton) {
    storyButton.addEventListener("click", openStoryModal);
}

if (storyModalClose) {
    storyModalClose.addEventListener("click", closeStoryModal);
}

if (storyModalOverlay) {
    storyModalOverlay.addEventListener("click", closeStoryModal);
}

if (storyContactButton) {
    storyContactButton.addEventListener("click", () => {
        closeStoryModal();

        const contactSection = document.getElementById("contact");

        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeStoryModal();
    }
});

// ==================== TALK TO AN AGENT ====================

const talkAgentButton = document.getElementById("talkAgentButton");

if (talkAgentButton) {
    talkAgentButton.addEventListener("click", function(event) {
        event.preventDefault();

        const contactSection = document.getElementById("contact");

        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}


// ==================== PROPERTY MODAL ACTIONS ====================

const scheduleViewingButton = document.querySelector(".schedule-btn");

if (scheduleViewingButton) {
    scheduleViewingButton.addEventListener("click", function() {

        const propertyModal = document.getElementById("propertyModal");
        const contactSection = document.getElementById("contact");

        if (propertyModal) {
            propertyModal.classList.remove("active");
        }

        document.body.classList.remove("modal-open");

        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

if (contactAgentButton) {
    contactAgentButton.addEventListener("click", function() {

        const propertyModal = document.getElementById("propertyModal");
        const contactSection = document.getElementById("contact");

        if (propertyModal) {
            propertyModal.classList.remove("active");
        }

        document.body.classList.remove("modal-open");

        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}