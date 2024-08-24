const fs = require("fs");

const { exec } = require("child_process");

const { scrapeGoogleMaps } = require("./scrapers/maps_hotels_scraper");
const { scrapeEmails } = require("./scrapers/email_hotels_scraper");

const { sleep } = require("./scrapers/aux_functions");


async function main() {
    const search = process.argv[2];
    if (!search) {
        console.error("Please provide a search query");
        return;
    }
    const city = search.split(" ")[2].charAt(0).toUpperCase() + search.split(" ")[2].slice(1).toLowerCase();

    /* --- Scrape all data from each hotel in Google Maps --- */
    await scrapeGoogleMaps(search);

    await sleep(1000);
    const hotels_path = `../data/raw/${city}/${search}.json`;
    await sleep(1000);

    /* --- Scrape the email from the hotel website --- */
    if (fs.existsSync(hotels_path)) {
        await scrapeEmails(search);
    } else {
        console.error("No hotels found");
    }

    /* --- Execute the python file to clean the data --- */
    const py_file = "./data_preparation.py";
    exec(`python ${py_file} ${city}`, (error, stdout, stderr) => { /* python3 not working */
        if (error) {
            console.error(`Error executing the python file: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error executing the python file: ${stderr}`);
            return;
        }
        console.log(`Python file executed successfully: ${stdout}`);
    });

}

main().catch((error) => {
    console.error("Error in the main function: ", error.message);
});
