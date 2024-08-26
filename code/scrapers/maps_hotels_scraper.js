/* --- Tags of the elements --- */
//
// Results section: div[aria-label='Resultados de " + query + "']
//
// Each element in the results section: div[class='Nv2PK THOPZb CpccDe ']
// Name (before clicking): div[class='qBF1Pd fontHeadlineSmall ']
// Category (before clicking): 2nd div[class='W4Efsd']
// Number of reviews (before clicking): span[class='UY7F9']
//
// Address, website, phone and city (after clicking): div[class='Io6YTe fontBodyMedium kR99db ']
// Website: 2nd div[class='Io6YTe fontBodyMedium kR99db ']
// Phone: 3rd div[class='Io6YTe fontBodyMedium kR99db ']
// Address: 1st div[class='Io6YTe fontBodyMedium kR99db ']
// City: 4th div[class='Io6YTe fontBodyMedium kR99db ']
// 
// Price: span[class='fontTitleLarge Cbys4b']
//
// GoBack button: span[class='google-symbols G47vBd']



const puppeteer = require("puppeteer");

const { sleep, returnJSON, returnCSV, cleanData } = require("./aux_functions");

const readline = require("readline");
const { parse } = require("path");


/* --- Auxiliary async functions --- */
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
    //await sleep(1000);
}
/* --- End of Auxiliary async functions --- */


/* --- Main function --- */
async function scrapeGoogleMaps(query) {
    if (!query) {
        console.log("Please provide a query");
        return;
    };
    const city = query.split(" ")[2].charAt(0).toUpperCase() + query.split(" ")[2].slice(1).toLowerCase();

    /* --- Ask how many hotels the user wants to scrape --- */
    /* const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("How many hotels do you want to scrape? ", (answer) => {
        const num_hotels = parseInt(answer);
        console.log("Scraping " + num_hotels + " hotels in " + city);
        rl.close();
    }); */

    /* --- Array to store the hotels --- */
    let hotels = [];

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        /* --- Go to Google Maps search page and search for the query --- */
        const search = "https://www.google.com/maps/search/" + query;
        await page.goto(search);

        /* --- Click on the "Rechazar todo" span element to reject the cookies --- */
        await clickOnElementByText(page, "span", "Rechazar todo");

        /* --- Wait for the results section to load --- */
        let resultsSectionTag = "div[aria-label='Resultados de " + query + "']";
        await page.waitForSelector(resultsSectionTag);
        let resultsSection = await page.$(resultsSectionTag);

        /* --- Store all hotels in the elements array --- */
        let elements = await resultsSection.$$("div.Nv2PK.THOPZb.CpccDe");

        /* --- Scrape the data from every element (hotel) --- */
        for (let i = 0; i < 45; i++) {
            console.log("-------------------");
            console.log("-------------------");
            console.log("Length: " + elements.length);
            let e = elements[i];

            console.log("Element: " + (i+1));
            console.log("-------------------");

            let hotel = {};

            /* --- Get the hotel name --- */
            let nameElement = await e.$("div.qBF1Pd.fontHeadlineSmall");
            if (!nameElement) {
                // Some elements have this other tag
                nameElement = await e.$("div.qBF1Pd.fontHeadlineSmall.kiIehc.Hi2drd");
            }
            if (nameElement) {
                let name = await nameElement.evaluate((el) => el.textContent);
                hotel.name = name;
                console.log(name);
            }

            /* --- Get the category of the local --- */
            let categoryElement = await e.$$("div.W4Efsd");
            if (categoryElement) {
                let category = await categoryElement[1].evaluate((el) => el.textContent);
                hotel.category = category;
                console.log(category);
            }

            /* --- Get the number of reviews --- */
            let reviewsElement = await e.$("span.UY7F9");
            if (reviewsElement) {
                let reviews = await reviewsElement.evaluate((el) => el.textContent);
                hotel.n_reviews = reviews;
                console.log(reviews);
            }

            /* --- Click into the element to get the hotel details --- */
            if (e) {
                await Promise.all([
                    e.click(),
                    page.waitForNavigation({ waitUntil: "networkidle2" })
                ]);
            } else {
                console.log("Element not found");
            }
            await sleep(4000);

            /* --- Get the address, website, phone and city (all have the same tag) --- */
            let details = await page.$$("div.Io6YTe.fontBodyMedium.kR99db", { waitUntil: "networkidle2" });
            console.log("Details length: " + details.length);
            if (details.length > 0) {
                hotel.address = await details[0].evaluate((el) => el.textContent);
                if (details.length > 1) hotel.website = await details[1].evaluate((el) => el.textContent);
                if (details.length > 2) hotel.phone = await details[2].evaluate((el) => el.textContent);
                if (details.length > 3) hotel.city = await details[3].evaluate((el) => el.textContent);
            } else {
                console.log("Details not found, closing browser");
                await browser.close();
            }
            /* --- Get the price --- */
            let priceElement = await page.$("span.fontTitleLarge.Cbys4b");
            if (priceElement) {
                let price = await priceElement.evaluate((el) => el.textContent);
                hotel.price = price;
            }

            /* --- Clean data and push it to the hotels array --- */
            hotel = cleanData(hotel, "+41"); // Phone prefix for Switzerland
            hotels.push(hotel);

            /* --- Go back to the search results --- */
            await Promise.all([
                page.locator("span.google-symbols.G47vBd").click({ waitUntil: "networkidle2" }),
                //page.goBack({ waitUntil: "networkidle2" }),
                page.waitForSelector(resultsSectionTag)
            ]);
            await sleep(1000);

            /* --- Scroll down and Re-fetch the elements after going back to results section --- */
            await scrollElement(page, resultsSectionTag, 2000);
            elements = await page.$$("div.Nv2PK.THOPZb.CpccDe");
        }

        /* --- Save the data to a JSON and a CSV file --- */
        returnJSON("../data/raw/" + city + "/" + query + ".json", hotels);
        returnCSV("../data/raw/" + city + "/" + query + ".csv", hotels);
        console.log("Data saved to JSON and CSV files");
        //await browser.close();
    } catch (error) {
        console.log("Error scraping Google Maps: ", error.message);
    }
}

//scrapeGoogleMaps("hotels in lugano");
module.exports = { scrapeGoogleMaps };
