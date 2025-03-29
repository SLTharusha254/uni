const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path'); // Import the path module

const app = express();
const port = process.env.PORT || 3000;

// Create a new instance of the Telegram bot with your bot's API token
const botToken = '7121608421:AAHWYzdHudL_VNweAult8BZk8B4ui7iSdhU'; // Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot(botToken, { polling: false }); // Set polling to false if you're using webhooks

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the favicon.ico file
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// Serve static files from the "css" directory
app.use('/css', express.static(path.join(__dirname, 'css')));

// Serve static files from the "fonts" directory
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));

// Serve static files from the "images" directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve static files from the "js" directory
app.use('/js', express.static(path.join(__dirname, 'js')));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle form submissions
app.post('/submit-form', (req, res) => {
    // Handle form submission
    console.log('Form submitted:', req.body);
    
    // Send form data to your Telegram bot
    const message = `
    New form submission:
    First Name: ${req.body.first_name}
    Last Name: ${req.body.last_name}
    Phone Number: ${req.body.phone_number}
    WhatsApp Number: ${req.body.whatsapp_number}
    Email: ${req.body.email}
    School/Campus: ${req.body.school_campus}
    Unit: ${req.body.select_your_unit}
    District: ${req.body.district}
    `;
    
    bot.sendMessage('1909671536', message) // Replace 'YOUR_TELEGRAM_CHAT_ID' with the actual chat ID
        .then(() => {
            console.log('Form data sent to Telegram bot successfully');
            // Send a response to trigger opening a new tab and closing it
            res.send('<script>window.open("about:blank","_blank").close();</script>');
        })
        .catch((error) => {
            console.error('Error sending form data to Telegram bot:', error.message);
            // Handle error and send response
            res.status(500).send('Error submitting form');
        });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
