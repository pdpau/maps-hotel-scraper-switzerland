/* --- Tags of the elements --- */
// Results section: div[aria-label='Resultados de " + query + "']
// Each element in the results section: div[class='Nv2PK THOPZb CpccDe ']
// Name (before clicking): div[class='qBF1Pd fontHeadlineSmall ']
// Type (before clicking): 2nd div[class='W4Efsd']
//
// Address, website, phone and city (after clicking): div[class='Io6YTe fontBodyMedium kR99db ']
// Website: 2nd div[class='Io6YTe fontBodyMedium kR99db ']
// Phone: 3rd div[class='Io6YTe fontBodyMedium kR99db ']
// Address: 1st div[class='Io6YTe fontBodyMedium kR99db ']
// City: 4th div[class='Io6YTe fontBodyMedium kR99db ']
// 
// GoBack button: span[class='google-symbols G47vBd']

const puppeteer = require("puppeteer");
const fs = require("fs");


/* --- Auxiliary functions --- */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function returnJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), (err) => {
        if (err) throw err;
        console.log("Data written to file " + path);
    });
}
function returnCSV(path, data) { // TODO: Review this function
    const csv = data.map((row) => {
        return Object.values(row).join(",");
    }).join("\n");

    fs.writeFileSync(path, csv, (err) => {
        if (err) throw err;
        console.log("Data written to file " + path);
    });
}

async function clickOnElementByText(page, elementType, elementText) {
    return page.evaluate((type, text) => {
        const elem = Array.from(document.querySelectorAll(type)).find((el) => el.textContent === text);
        if (elem) { elem.click(); }
    }, elementType, elementText);
}

async function scrollElement(page, elementToScroll, scrollingSize) {
    return page.evaluate((element, size) => {
        const section = document.querySelector(element);
        if (section) {
            section.scrollBy(0, size);
        }
    }, elementToScroll, scrollingSize);
    /* await sleep(1000); */
}


function cleanData(hotel) {
    // TODO: Clean the data
    return hotel;
}
/* --- End of Auxiliary functions --- */


/* --- Main function --- */
async function scrapeGoogleMaps() {
    // Array to store the hotels
    let hotels = [];

    try {
        /* --- WORKING --- */
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // Go to Google Maps search page and search for the query
        const query = "hotels in lugano";
        const search = "https://www.google.com/maps/search/" + query;
        await page.goto(search);

        /* // Wait for the page to load
        await page.waitForSelector("div.section-layout.section-scrollbox"); */

        // Click on the "Rechazar todo" span element to reject the cookies
        await clickOnElementByText(page, "span", "Rechazar todo"); // ¿Utilitzar locator?

        // Scroll results section to load more results
        const resultsSection = "div[aria-label='Resultados de " + query + "']";
        await page.waitForSelector(resultsSection);
        /* for (let i = 0; i < 40; i++) {
            // await page.locator(resultsSection).scroll({ scrollBy: 10000 });
            await scrollElement(page, resultsSection, 10000);
            await sleep(1000);
        } */


        // --- Scrape the hotels ---
        let elements = await page.$$("div[class='Nv2PK THOPZb CpccDe ']");

        for (let e of elements) {
            // await page.waitForNavigation({ waitUntil: "networkidle2" });

            let hotel = {};

            // --- Get the hotel name ---
            /* let nameElement = await page.$("div[class='qBF1Pd fontHeadlineSmall kiIehc Hi2drd']"); */
            let nameElement = await e.$("div[class='qBF1Pd fontHeadlineSmall ']");
            let name = await nameElement.evaluate((el) => el.textContent);
            hotel.name = name;
            /* console.log(name); */

            // --- Get the type of local ---
            let typeElement = await e.$$("div[class='W4Efsd']");
            let type = await typeElement[1].evaluate((el) => el.textContent);
            hotel.type = type;
            /* console.log(type); */

            // Click into the element to get the hotel details
            await e.click();
            await page.waitForNavigation({ waitUntil: "networkidle2" });

            /* --- WORKING UNTIL HERE --- */

            // Address, website and phone have the same tag (div[class='Io6YTe fontBodyMedium kR99db '])
            let details = await page.$$("div[class='Io6YTe fontBodyMedium kR99db ']");

            // --- Get the hotel website name ---
            let website = await details[1].evaluate((el) => el.textContent);
            hotel.website = website;
            console.log(website);

            // --- Get the hotel phone number ---
            let phone = await details[2].evaluate((el) => el.textContent);
            hotel.phone = phone;
            console.log(phone);

            // --- Get the hotel address ---
            let address = await details[0].evaluate((el) => el.textContent);
            hotel.address = address;
            console.log(address);

            // --- Get the hotel city (from the Plus Code) ---
            let city = await details[3].evaluate((el) => el.textContent);
            hotel.city = city;
            console.log(city);


            // Clean data and push it to the hotels array
            hotel = cleanData(hotel); // TODO: Implement cleanData function
            hotels.push(hotel);

            // Go back to the search results
            // await page.locator("span[class='google-symbols G47vBd']").click();
            await page.goBack();
            await page.waitForNavigation({ waitUntil: "networkidle2" });
        }
        /* console.log(hotels); */
        // --- End of scraping hotels ---

        // Save the data to a JSON and a CSV file
        returnJSON(query + ".json", hotels);
        returnCSV(query + ".csv", hotels);
    } catch (error) {
        console.log("Error scraping Google Maps", error.message);
    }
}

scrapeGoogleMaps();
