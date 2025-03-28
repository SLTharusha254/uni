const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const xlsx = require('xlsx'); // You'll need to install this: npm install xlsx

const app = express();
const port = process.env.PORT || 3000;

const botToken = '7731574077:AAFJNB4Gz6-tKp3mGvqVHIK2Gp7Gv4OZF98'; // Replace with your actual bot token
const bot = new TelegramBot(botToken, { polling: false });

const myChatId = '1909671536'; // Replace with your actual chat ID

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

app.post('/submit-form', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), (req, res) => {
    console.log('Form submitted:', req.body);

    const message = `
    *New form submission:*

    *Full Name:* ${req.body.full_name}
    *Date of Birth:* ${req.body.date_of_birth}
    *Gender:* ${req.body.gender}
    *Phone Number:* ${req.body.phone_number}
    *Email:* ${req.body.email}
    *Residential Address:* ${req.body.residential_address}
    *NIC:* ${req.body.nic_no}
    *Educational and Professional Qualifications:* ${req.body.qual}
    
    `;

    bot.sendMessage(myChatId, message, { parse_mode: 'Markdown' })
        .then(() => {
            console.log('Form data sent to Telegram bot successfully');

            // Send photo if uploaded
            if (req.files['photo']) {
                bot.sendPhoto(myChatId, req.files['photo'][0].buffer);
            }

            // Send resume if uploaded
            if (req.files['resume']) {
                bot.sendDocument(myChatId, req.files['resume'][0].buffer, {
                    filename: req.files['resume'][0].originalname,
                    contentType: req.files['resume'][0].mimetype
                });
            }

            // Save submission data to JSON file
            saveSubmissionData(req.body);

            res.status(200).json({ message: 'Form submitted successfully' });
        })
        .catch((error) => {
            console.error('Error sending form data to Telegram bot:', error.message);
            res.status(500).send('Error submitting form');
        });
});

bot.on('message', (msg) => {
    if (msg.chat.id === myChatId) {
        if (msg.text === '/all') {
            console.log("Received message:", msg.text); 
            // Read submission data from file
            fs.readFile('submitForm.json', 'utf8', (err, data) => {
                if (err) {
                    console.error("Failed to read submissions data:", err);
                    bot.sendMessage(myChatId, "Error exporting submissions.");
                    return;
                }

                // Convert data to Excel
                const submissions = JSON.parse(data);
                const worksheet = xlsx.utils.json_to_sheet(submissions);
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet, "Submissions");
                const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

                // Send the exported file
                bot.sendDocument(myChatId, excelBuffer, {
                    filename: 'submissions.xlsx',
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
            });
        } else {
            bot.sendMessage(myChatId, "Don't panic! I'll send you new form submissions when someone submits.");
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
