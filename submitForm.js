// submitForm.js

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Function to save submission data to JSON file
function saveSubmissionData(data) {
    fs.readFile('submissions.json', 'utf8', (err, fileData) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist, create an empty array
                fileData = '[]';
            } else {
                console.error("Failed to read submissions data:", err);
                return;
            }
        }

        let submissions = JSON.parse(fileData);
        submissions.push(data);

        fs.writeFile('submissions.json', JSON.stringify(submissions, null, 2), err => {
            if (err) {
                console.error("Failed to save submission data:", err);
            }
        });
    });
}

// Define a route for form submission
app.post('/api/submitForm', (req, res) => {
    // Extract form data from request body
    const {
        full_name,
        date_of_birth,
        gender,
        phone_number,
        email,
        residential_address,
        nic_no,
        qual,
        work,
        // ... other fields ...
    } = req.body;

    // Process the form data (you can save it to a database or perform any other actions here)
    // ... your logic to handle the form data ...

    // Save submission data to JSON file
    saveSubmissionData(req.body);

    // Send a response
    res.status(200).json({ message: 'Form submitted successfully' });
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
