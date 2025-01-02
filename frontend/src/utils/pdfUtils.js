import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer(); // Convert file to ArrayBuffer
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const text = [];

    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1); // Pages are 1-based in pdf.js
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        text.push(pageText);
    }

    return text.join('\n');
}

