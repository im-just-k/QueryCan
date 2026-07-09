const cheerio = require('cheerio');

/**
 * Robust structural parser strategy for UWaterloo CS Directory
 * @param {string} htmlRaw 
 * @returns {Array<Object>} Clean faculty data
 */
function parse(htmlRaw) {
    const $ = cheerio.load(htmlRaw);
    const profiles = [];

    // Waterloo directory wraps individual person profiles within block containers or paragraph text blocks
    $('div, p, tr').each((_, el) => {
        const textBlock = $(el).text();
        const emailLink = $(el).find('a[href^="mailto:"]').first();
        
        let email = emailLink.attr('href') ? emailLink.attr('href').replace('mailto:', '').trim() : '';
        
        // If it lacks a valid institutional email structure, skip the row
        if (!email || !email.includes('@uwaterloo.ca')) return;

        // Extract the name lines immediately preceding or anchoring the element context
        let fullName = '';
        
        // Strategy A: Check if a strong/bold header element exists in this specific card block
        const strongText = $(el).find('strong, h1, h2, h3, h4, .field-name-title').first().text().trim();
        if (strongText && strongText.length > 2 && strongText.length < 50) {
            fullName = strongText;
        } else {
            // Strategy B: Split lines and attempt to capture the primary anchor label line
            const lines = textBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length > 0) {
                fullName = lines[0];
            }
        }

        // Strip academic titles to normalize first/last name calculations
        fullName = fullName.replace(/^(Prof\.|Dr\.|Professor|Associate Professor|Assistant Professor)\s+/i, '');
        
        // Clean out dangling metadata text if it bled into the string name line
        if (fullName.includes(',') || fullName.includes('-') || fullName.length > 40) return;

        const nameParts = fullName.split(' ').filter(part => part.length > 0);
        if (nameParts.length < 2) return;

        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        profiles.push({
            first_name: firstName,
            last_name: lastName,
            email: email.toLowerCase(),
            department: 'Computer Science'
        });
    });

    // Clean out duplicate entries captured by nesting tags
    return Array.from(new Map(profiles.map(p => [p.email, p])).values());
}

module.exports = { parse };