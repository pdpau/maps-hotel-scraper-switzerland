const fs = require("fs");

/* --- Auxiliary functions --- */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function returnJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), (err) => {
        if (err) throw err;
        console.log("Data written to file " + path);
    });
}
function returnCSV(path, data) {
    /* Check if data is not empty */
    if (data.length === 0) {
        console.error("Data is empty");
        return;
    }

    /* Extract headers from the first element */
    const headers = Object.keys(data[0]);

    /* Map the data to CSV format */
    const csv = data.map((row) => {
        return headers.map((header) => {
            let value = row[header] || "";
            // Escape double quotes
            value = value.toString().replace(/"/g, '""');
            // If value contains a comma, quote it
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
                value = `"${value}"`;
            }
            return value;
        }).join(",");
    }).join("\n");

    /* Add the headers */
    const csvWithHeaders = headers.join(",") + "\n" + csv;

    /* Write the CSV file */
    fs.writeFileSync(path, csvWithHeaders, (err) => {
        if (err) throw err;
        console.log("Data written to file " + path);
    });
}

function cleanData(hotel, phonePrefix) {
    let cleanName = hotel.name ? hotel.name.trim() : "";
    let cleanCategory = hotel.category ? hotel.category.trim() : "";
    let cleanNReviews = hotel.n_reviews ? hotel.n_reviews.trim() : "";
    let cleanAddress = hotel.address ? hotel.address.trim() : "";
    let cleanWebsite = hotel.website ? hotel.website.trim() : "";
    let cleanPhone = hotel.phone ? hotel.phone.trim() : "";
    let cleanCity = hotel.city ? hotel.city.trim() : "";
    let cleanPrice = hotel.price ? hotel.price.trim() : "";

    /* --- Exchange data stored in the wrong place --- */
    // Address
    let addressPattern = /\s\d{4}\s/;
    if (!addressPattern.test(cleanAddress)) {
        let aux = cleanAddress;
        if (addressPattern.test(cleanWebsite)) {
            cleanAddress = cleanWebsite;
            cleanWebsite = aux;
        } else if (addressPattern.test(cleanPhone)) {
            cleanAddress = cleanPhone;
            cleanPhone = aux;
        } else if (addressPattern.test(cleanCity)) {
            cleanAddress = cleanCity;
            cleanCity = aux;
        } else {
            cleanAddress = "NO_ADDRESS";
        };
    };
    // Website
    if (!cleanWebsite.includes(".com") && !cleanWebsite.includes(".ch") && !cleanWebsite.includes(".net") && !cleanWebsite.includes(".org") && !cleanWebsite.includes(".es")) {
        let aux = cleanWebsite;
        if (cleanAddress.includes(".com") || cleanAddress.includes(".ch") || cleanAddress.includes(".net") || cleanAddress.includes(".org") || cleanAddress.includes(".es")) {
            cleanWebsite = cleanAddress;
            cleanAddress = aux;
        } else if (cleanCity.includes(".com") || cleanCity.includes(".ch") || cleanCity.includes(".net") || cleanCity.includes(".org") || cleanCity.includes(".es")) {
            cleanWebsite = cleanCity;
            cleanCity = aux;
        } else if (cleanPhone.includes(".com") || cleanPhone.includes(".ch") || cleanPhone.includes(".net") || cleanPhone.includes(".org") || cleanPhone.includes(".es")) {
            cleanWebsite = cleanPhone;
            cleanPhone = aux;
        } else {
            cleanWebsite = "NO_WEBSITE";
        };
    };
    // Phone
    if (!cleanPhone.startsWith(phonePrefix)) {
        let aux = cleanPhone;
        if (cleanAddress.startsWith(phonePrefix)) {
            cleanPhone = cleanAddress;
            cleanAddress = aux;
        } else if (cleanWebsite.startsWith(phonePrefix)) {
            cleanPhone = cleanWebsite;
            cleanWebsite = aux;
        } else if (cleanCity.startsWith(phonePrefix)) {
            cleanPhone = cleanCity;
            cleanCity = aux;
        } else {
            cleanPhone = "NO_PHONE";
        };
    };
    // City
    let cityPattern = /^[A-Za-z0-9]{4}\+[A-Za-z0-9]{2}/;
    if (!cityPattern.test(cleanCity)) {
        let aux = cleanCity;
        if (cityPattern.test(cleanAddress)) {
            cleanCity = cleanAddress;
            cleanAddress = aux;
        } else if (cityPattern.test(cleanWebsite)) {
            cleanCity = cleanWebsite;
            cleanWebsite = aux;
        } else if (cityPattern.test(cleanPhone)) {
            cleanCity = cleanPhone;
            cleanPhone = aux;
        } else {
            cleanCity = "NO_CITY"; // Could also get it from the address if the address is not empty
        };
    };
    /* --- End of Exchange data stored in the wrong place --- */


    /* --- Cleaning strings --- */
    // Clean Name (No need to change)
    // Clean Category (Removing repeated "Hotel" word)
    cleanCategory = cleanCategory.replace(/(Hotel.*?)(Hotel)/, '$1');
    // Clean n_reviews (Clean the "(" at the start and the end ")" )
    if (cleanNReviews && cleanNReviews !== "") {
        cleanNReviews = cleanNReviews.replace("(", "").replace(")", "").replace(".", "").replace(",", "")
    }
    // Clean Address (No need to change)
    // Clean Website (No need to change)
    // Clean Phone (No need to change)
    // Clean City (Eliminate google maps Plus Code from the city)
    if (cleanCity && cleanCity !== "") {
        let parts = cleanCity.split(" ");
        if (parts.length > 1) {
            cleanCity = parts.slice(1).join(" ").trim();
        } else {
            cleanCity = cleanCity.trim();
        }
    }
    // Clean Price (Clean the space between the price and the currency)
    if (cleanPrice && cleanPrice !== "") {
        let parts = cleanPrice.split(" "); // Don't change this space, it's a special character
        if (parts.length > 1) {
            cleanPrice = parts[0].trim() + parts[1].trim();
        } else {
            cleanPrice = cleanPrice.trim();
        }
    }
    /* --- End of Cleaning strings --- */

    return {
        name: cleanName,
        category: cleanCategory,
        n_reviews: cleanNReviews,
        address: cleanAddress,
        website: cleanWebsite,
        phone: cleanPhone,
        city: cleanCity,
        price: cleanPrice
    };
}

function cleanEmail(email) {
    let cleanEmail = email ? email.trim() : "";

    if (cleanEmail.includes(".com") || cleanEmail.includes(".ch")) {
        return cleanEmail;
    } else {
        return "NO_EMAIL";
    }
}

module.exports = {
    sleep,
    returnJSON,
    returnCSV,
    cleanData,
    cleanEmail
};