require('dotenv').config();
const { ingestUniversity } = require('./ingestionEngine');

async function generateSQL() {
    try {
        const scrapedFaculty = await ingestUniversity('uwaterloo');
        if (scrapedFaculty.length === 0) return;

        console.log('\n--- COPY THE SQL BELOW THIS LINE ---_');
        console.log(`INSERT INTO faculty (university_id, first_name, last_name, email, department) VALUES`);
        
        const valueRows = scrapedFaculty.map((prof, index) => {
            const isLast = index === scrapedFaculty.length - 1;
            const escapedLastName = prof.last_name.replace(/'/g, "''");
            const escapedFirstName = prof.first_name.replace(/'/g, "''");
            return `    ((SELECT id FROM universities WHERE name = 'University of Waterloo'), '${escapedFirstName}', '${escapedLastName}', '${prof.email}', '${prof.department}')${isLast ? ';' : ','}`;
        });

        console.log(valueRows.join('\n'));
        console.log('--- END OF SQL ---');
    } catch (e) {
        console.error(e);
    }
}
generateSQL();