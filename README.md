# Google Maps Hotel Data Scraper

## Overview

This project automates the process of scraping HOTEL DATA from Google Maps, extracting emails from hotel websites, and cleaning the data before saving it into structured formats like CSV and JSON. With just the city name as input, the entire workflow is executed seamlessly.

## Installation

### Prerequisites

- **Node.js**: Ensure that you have Node.js installed on your system. [Download Node.js](https://nodejs.org/en/download/)
- **Python 3.x**: Ensure that Python 3.x is installed and accessible. [Download Python](https://www.python.org/downloads/)
- **pip**: Python package installer should be available.
- **Pandas**: Python library for data manipulation and analysis.

### Steps

1. **Clone the repository**:

    ```bash
    git clone https://github.com/pdpau/maps-hotel-scraper-switzerland.git
    cd maps-hotel-scraper-switzerland
    ```

2. Install Node.js dependencies:

    ```bash
    npm install
    ```

3. Install Python dependencies:

    ```bash
    pip install pandas
    ```

### Usage
To scrape and clean hotel data for a specific city, run the following command:
    ```
    node main.js "Hotels in [City]"
    ```

Replace "[City]" with the name of the city you want to scrape hotel data for (must be a non compound name). For example, to scrape hotel data for Zurich, run:
    ```
    node main.js "Hotels in Zurich"
    ```

#### How It Works
- Scraping Data:
    - The main.js script initiates the scraping process by extracting hotel information from Google Maps using the maps_hotels_scraper.js script.
    - After a brief pause, it scrapes emails from the respective hotel websites using the email_hotels_scraper.js script.

- Data Cleaning:
    - Once scraping is complete, the script automatically triggers the data_preparation.py script to clean and structure the data. This process includes:
        - Removing hotels without email addresses.
        - Dropping duplicate entries.
        - Reordering and formatting the columns.
    - The cleaned data is then saved as both CSV and JSON files in the data/processed/[City] directory.

#### Output
The cleaned and processed data is saved in the following formats:
- CSV: data/processed/[City]/hotels_[city].csv
- JSON: data/processed/[City]/hotels_[city].json

