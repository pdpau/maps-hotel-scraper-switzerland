const fs = require("fs");

const { scrapeGoogleMaps } = require("./scrapers/maps_hotels_scraper");
const { scrapeEmails } = require("./scrapers/email_hotels_scraper");

const { sleep } = require("./scrapers/aux_functions");


async function main() {
    const search = process.argv[2];

    /* --- Scrape all data from each hotel in Google Maps --- */
    await scrapeGoogleMaps(search);

    await sleep(1000);
    const hotels_path = `../data/raw/${search}.json`;
    await sleep(1000);

    /* --- Scrape the email from the hotel website --- */
    if (fs.existsSync(hotels_path)) {
        await scrapeEmails(search);
    } else {
        console.error("No hotels found");
    }
}

main().catch((error) => {
    console.error("Error in the main function: ", error.message);
});
