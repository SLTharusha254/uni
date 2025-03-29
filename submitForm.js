// submitForm.js

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define a route for form submission
app.post('/api/submitForm', (req, res) => {
  // Extract form data from request body
  const { firstName, lastName, phoneNumber, whatsappNumber, email, schoolCampus, unit, district } = req.body;

  // Process the form data (you can save it to a database or perform any other actions here)

  // Send a response
  res.status(200).json({ message: 'Form submitted successfully' });
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
