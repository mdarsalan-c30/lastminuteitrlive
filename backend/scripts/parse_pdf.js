const fs = require('fs');
const https = require('https');
const path = require('path');
const pdf = require('pdf-parse');

const url = 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf';
const outDir = 'C:\\Users\\MD ARSALAN\\.gemini\\antigravity\\brain\\26a3d0c5-2ba2-41b4-bf36-a1003d5f2057';
const pdfDest = path.join(outDir, 'dpdp_rules.pdf');
const txtDest = path.join(outDir, 'dpdp_rules_text.txt');

console.log("Downloading PDF...");
const file = fs.createWriteStream(pdfDest);
https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
        file.close(() => {
            console.log("Download complete. Parsing PDF...");
            let dataBuffer = fs.readFileSync(pdfDest);
            pdf(dataBuffer).then(function(data) {
                fs.writeFileSync(txtDest, data.text);
                console.log("Success! PDF parsed and written to dpdp_rules_text.txt");
            }).catch(err => {
                console.error("Error parsing pdf:", err);
                process.exit(1);
            });
        });
    });
}).on('error', function(err) {
    fs.unlinkSync(pdfDest);
    console.error("Error downloading file:", err);
    process.exit(1);
});
