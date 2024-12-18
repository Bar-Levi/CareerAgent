const pdfParse = require('pdf-parse');

const scanResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const dataBuffer = req.file.buffer;
        const data = await pdfParse(dataBuffer);
        // Extract data as needed (placeholder)
        const extractedData = {
            text: data.text,
        };
        res.status(200).json({ message: 'Resume scanned successfully!', extractedData });
    } catch (err) {
        res.status(500).json({ message: 'Error processing resume.', error: err.message });
    }
};

module.exports = { scanResume };
