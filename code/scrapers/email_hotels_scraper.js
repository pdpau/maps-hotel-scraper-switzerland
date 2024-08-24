
const puppeteer = require("puppeteer");
const fs = require("fs");

const { sleep, returnJSON, returnCSV, cleanEmail } = require("./aux_functions");


/* --- Email scraping function --- */
async function scrapeEmailFromWebsite(url) {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        /* --- Go to the hotel page --- */
        await page.goto(url, { waitUntil: "load", timeout: 0 });

        /* --- Extract all text from the page --- */
        const pageContent = await page.content();

        /* --- Check if any text matches the email syntax --- */
        const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/g;
        const emails = pageContent.match(emailRegex);

        /* --- Close the browser --- */
        await browser.close();

        return emails ? emails[0] : "NO_EMAIL";
    } catch (error) {
        console.error("Error scraping email web: ", error.message);
    }
}
/* --- End of Email scraping function --- */

/* --- Main function --- */
async function scrapeEmails(query) {
    //const query = "hotels in lugano";
    const city = query.split(" ")[2].charAt(0).toUpperCase() + query.split(" ")[2].slice(1).toLowerCase();

    const hotels_path = "../data/raw/" + city + "/" + query;
    const hotelsArray = JSON.parse(fs.readFileSync(hotels_path + ".json", "utf8"));

    try {
        for (const hotel of hotelsArray) {
            if (hotel.website && hotel.website !== "NO_WEBSITE" && hotel.website !== "") {
                /* --- Get the email from the hotel web --- */
                const email = await scrapeEmailFromWebsite(`http://${hotel.website}`);
                console.log(`${hotel.name}: ${email}`);
                /* --- Add the email to the hotel --- */
                hotel.email = cleanEmail(email);
            }
            await sleep(1000);
        }
        /* --- Save the data to a JSON and a CSV file --- */
        const fileName = hotels_path + " with emails";
        returnJSON(fileName + ".json", hotelsArray);
        returnCSV(fileName + ".csv", hotelsArray);
        console.log("Data saved to JSON and CSV files");
    } catch (error) {
        console.log("Error scraping in the main function: ", error.message);
    }
}
/* --- End of Main function --- */


//scrapeEmails(query);
module.exports = { scrapeEmails };
