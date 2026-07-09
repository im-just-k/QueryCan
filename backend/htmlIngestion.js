const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Waterloo Cheriton School of Computer Science contact directory
const WATERLOO_CS_URL = 'https://uwaterloo.ca/computer-science/contacts';

/**
 * HTML Ingestion Module
 * Fetches the raw HTML markup from the institutional target.
 * @param {string} url - The target website URL
 * @returns {Promise<string>} The raw HTML source string
 */
async function fetchUniversityHTML(url) {
    try {
        console.log(`[Ingestion] Initiating HTTP request to: ${url}`);
        
        const response = await axios.get(url, {
            timeout: 10000, // 10 second timeout threshold
            headers: {
                // Spoof a realistic user agent to avoid institutional firewalls blocking the automation client
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        if (response.status !== 200) {
            throw new Error(`Failed to ingest HTML. Server responded with status: ${response.status}`);
        }

        console.log(`[Ingestion] Successfully downloaded raw HTML resource string (${(response.data.length / 1024).toFixed(2)} KB)`);
        return response.data;

    } catch (error) {
        console.error(`[Ingestion Error] Failed navigating to destination URL:`, error.message);
        throw error;
    }
}

// Runnable driver execution block for testing Task 4 independently
async function runModuleTest() {
    try {
        const rawHTML = await fetchUniversityHTML(WATERLOO_CS_URL);
        
        // Persist file locally to backend/raw_waterloo.html to verify execution
        const outputPath = path.join(__dirname, 'raw_waterloo.html');
        fs.writeFileSync(outputPath, rawHTML, 'utf-8');
        
        console.log(`\n[Success] Task 4 complete. Raw HTML cached at: ${outputPath}`);
        console.log(`Ready for Task 5 (Cheerio Parsing Module).`);
    } catch (err) {
        console.error('[Test Failure] Task 4 isolated runner failed.');
    }
}

// Execute test run if file is executed directly
if (require.main === module) {
    runModuleTest();
}

module.exports = { fetchUniversityHTML };