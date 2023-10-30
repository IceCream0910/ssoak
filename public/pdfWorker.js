// pdfWorker.js
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js');

self.onmessage = function (e) {
    const { questions, isPdfOnlyStar, isPdfOnlyQuestion } = e.data;

    const doc = new jsPDF("p", "mm", "a4");
    // Your existing PDF generation logic goes here, starting from 'questions.forEach...' until 'doc.save()'.

    // ... [Your existing generatePDF logic excluding the doc.save()]

    const pdfData = doc.output(); // Get the PDF data

    self.postMessage(pdfData); // Send the generated PDF data back to the main thread
};
