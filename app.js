const mysql = require("mysql");
const moment = require('moment');
const express = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded({ extended: true });
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const path = require("path");
const multer = require('multer');
const fs = require('fs');
const nodemailer = require("nodemailer");
const axios = require('axios');



const sessionStore = new MySQLStore({
  host: "localhost",
  user: "root",
  password: "",
  database: "user_login"
});

const app = express();
app.use("/asserts", express.static(path.join(__dirname, "asserts")));

app.set("view engine", "ejs");


app.set("views", path.join(__dirname, "views"));


app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    store: sessionStore,
    saveUninitialized: false
  })
);

app.use(function(req, res, next) {
  res.locals.username = req.session.user ? req.session.user.username : null;
  next();
});

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "user_login"
});



// connect to the database
connection.connect(function (error) {
  if (error) throw error;
  else console.log("connected to the database successfully!");
});

// when login is success
app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    store: sessionStore,
    saveUninitialized: false
  })
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});



app.post("/", encoder, function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  if (req.body.role === 'student'){
  connection.query("select * from user_login where user_rollnumber = ? and user_password = ?",[username, password],function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error logging in");
      } else if (results.length === 0) {
        res.status(401).send("Invalid username or password");
      } else {
        
        const user = results[0];
        req.session.user = user;
        const username = user.username; // retrieve the username field
        const user_id = user.user_rollnumber;
          // Redirect to welcome.js
          res.render("welcome.ejs", { username,user_id });
      }
    }
  );
  }
  else if (req.body.role === 'faculty') {
    connection.query("select * from faculty_login where Id = ? and password = ?", [username, password], function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error logging in");
      } else if (results.length === 0) {
        res.status(401).send("Invalid username or password");
      } else {
        const user = results[0];
        req.session.user = user;
        const username = user.name; // retrieve the username field
        const user_id = user.Id;
        const course_id = user.course_id;

        res.render("faculty.ejs", { username, user_id, course_id });
      }
    });
  }
});









app.get("/welcome", function (req, res) {
  if (req.session.user) {
    const user_id = req.session.user.user_rollnumber; // Retrieve the user_id from the session
    res.render("welcome.ejs", { user_id: user_id });
  } else {
    res.redirect("/");
  }
});
app.get("/faculty", function (req, res) {
  if (req.session.user) {
    const user_id = req.session.user.Id; // Retrieve the user_id from the session
    res.render("faculty.ejs", { user_id: user_id });
  } else {
    res.redirect("/");
  }
});


// when login is success

app.get('/Onduty/onduty.html', function (req, res) {
  if (!req.session.user) {
    res.redirect("/");
    return;
  }
  //res.sendFile(path.join(__dirname, "Onduty/onduty.html"));
});

app.get('/bot/bot.html', function (req, res) {
  if (!req.session.user) {
    res.redirect("/");
    return;
  }
  //res.sendFile(path.join(__dirname, "Onduty/onduty.html"));
});



app.get('/api/all-subjects', function (req, res) {
  const query = 'SELECT * FROM subjects';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ error: 'An error occurred while fetching subjects.' });
    } else {
      res.status(200).json(results);
    }
  });
})
  
// API endpoint to retrieve the button status from the database
// API endpoint to retrieve the button status from the database
app.get('/api/time-slots', (req, res) => {
  const course_id = req.query.course_id;
  const query = `SELECT * FROM time_table WHERE course_id = "${course_id}"`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching time slots:', error);
      res.status(500).json({ error: 'An error occurred while fetching time slots.' });
    } else {
      res.status(200).json(results);
    }
  });
});



app.get('/api/attendance', (req, res) => {
  const course_id = req.query.course_id;
  const student_id = req.query.student_id;
  const day = req.query.day;
  const present_time = req.query.present_time;
  const slot = req.query.slot;

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  axios
    .get('https://api.ipify.org/?format=json')
    .then(async response => {
      const ipAddress = response.data.ip;
      await delay(1000); // Wait for 1 second (1000 milliseconds)
      
      if (ipAddress === '152.58.213.58') {
        const query = `INSERT INTO attendance (user_rollnumber, course_id, date, time, slot) VALUES ("${student_id}", "${course_id}", "${day}", "${present_time}", "${slot}")`;
        connection.query(query, (error, results) => {
          if (error) {
            console.error('Error inserting attendance record:', error);
            res.status(500).json({ error: 'An error occurred while inserting the attendance record.' });
          } else {
            console.log('Attendance record inserted successfully:', results);
            res.status(200).json(results);
          }
        });
      } else {
        res.status(403).json({ error: 'Access denied. IP address not authorized.' });
      }
    })
    .catch(error => {
      console.log('Failed to retrieve IP address.', error);
      res.status(500).json({ error: 'Failed to retrieve IP address.' });
    });
});

// Continue with your code here...


app.get('/facultyod', async (req, res) => {
  try {
    const course_id = req.query.course_id;
    const odQuery = `SELECT * FROM od where subject='${course_id}';`;
    const odResults = await queryDatabase(odQuery);

    const name = odResults[0].name;
    const rollnum = odResults[0].rollnum;
    const slot = odResults[0].slot;
    const date = odResults[0].date;
    const imagePath = odResults[0].image_Path;

    let html = '';
    html += `<td>${rollnum}</td><td>${name}</td><td>${slot}</td><td>${date}</td>
      <td style="width:300px;">
        <div class="cont">
          <button type="button" onclick="show()" id="btnID">
            View Form
          </button>
          <button type="button" class="green-button" onclick="approveFunction()">
            <i class="fas fa-check"></i>
          </button>
          <button type="button" class="red-button" onclick="rejectFunction()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </td>`;

    res.send({ html, imagePath,name,rollnum,slot,date });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





app.get('/viewattendance', async (req, res) => {
  try {
    const username = req.query.username;

    const rollNumberQuery = `SELECT user_rollnumber FROM user_login WHERE username = '${username}';`;
    const rollNumberResults = await queryDatabase(rollNumberQuery);

    if (rollNumberResults.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const rollNumber = rollNumberResults[0].user_rollnumber;

    const attendanceQuery = `
      SELECT course_id, COUNT(DISTINCT slot) AS total_slots
      FROM attendance
      WHERE user_rollnumber = '${rollNumber}'
      GROUP BY course_id;
    `;
        const attendanceResults = await queryDatabase(attendanceQuery);

    let html = '';
    for (const row of attendanceResults) {
      const courseId = row.course_id;
      const totalSlots = row.total_slots;
      const totalClasses = await getTotalClassesForCourse(courseId);
      const attendancePercentage = (totalSlots / totalClasses) * 100;

      html += `<div class="sub">
                 <div class="box">
                   <div class="circle">
                     <div class="progress-pie-color" data-value="${attendancePercentage}"></div>
                   </div>
                   <button class="subjects-btn">${courseId}</button>
                 </div>
               </div>`;
    }

    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

function queryDatabase(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function getTotalClassesForCourse(courseId) {
  const query = `SELECT SUM(total_classes) as total_sum
    FROM (
      SELECT COUNT(DISTINCT(course_id)) as total_classes
      FROM attendance
      WHERE course_id = "${courseId}"
      GROUP BY date, slot
    ) subquery_alias;`;

  const results = await queryDatabase(query);

  if (results.length === 0) {
    return 0;
  }

  return results[0].total_sum;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname); // Generate a unique filename for the uploaded file
  }
});

// Create the multer middleware
const upload = multer({ storage: storage });

// Handle the form submission
app.post('/submit-form', upload.single('image_uploads'), function(req, res) {
  // Retrieve form data and uploaded image details
  var uname=req.body.uname; 
  var rollnum=req.body.rollnum;
  var subject=req.body.subject;
  var course=req.body.course;
  var slot=req.body.slot;
  var date=req.body.date;// Assuming the form fields are 'name', 'rollnum', etc.

  const imageFile = req.file; // Assuming the file input field is named 'image_uploads'
  

  // Access the image file details
  const imagePath = imageFile.path;
  // Execute the SQL query[username, password],function (error, results, fields)
  connection.query('INSERT INTO od (name, rollnum, subject, course, slot, date, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)', [uname, rollnum, subject, course, slot, date, imagePath], function(err, result,fields) {
    if (err) {
      console.error('Error inserting form data into MySQL:', err);
      res.status(500).send('An error occurred while submitting the form');
    } else {
      console.log('Form data inserted into MySQL');
      res.send('Form submitted successfully');
    }
  });

  // Perform further processing and saving to the database

  // Send a response to the client
});

  // Start the server
 
// set app port 
app.get('/forgotpassword', (req, res) => {
const query = "SELECT email FROM user_login WHERE user_rollnumber = ?";
const userId = 'CB.EN.U4CSE20341';

connection.query(query, [userId], (error, results) => {
    if (error) {
        console.error('Error retrieving email from database:', error);
        connection.end();
        return;
    }

    if (results.length > 0) {
        const email = results[0].email;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'arthisri171202@gmail.com',
                pass: 'bnudxlnrgwwugcve'
            }
        });

        const htmlPageLink = "http://localhost:52330/asserts/sample.html"; // Update with the actual HTML page link

        const mailOptions = {
            from: 'arthisri171202@gmail.com',
            to: email,
            subject: 'Reset Password',
            html: `Click the link below to reset your password:<br><a href="${htmlPageLink}">Click here</a>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent successfully');
            }

            //connection.end(); // Close the database connection
        });
    } else {
        console.log('Email not found in the database');
        connection.end(); // Close the database connection
    }
});
});
app.post('/submit', (req, res) => {
  const password = req.body.password;

  // Insert the password into the database
  const query = 'INSERT INTO user_login (password) VALUES (?)';
  connection.query(query, [password], (err, result) => {
    if (err) {
      console.error('Error inserting password into the database: ' + err.stack);
      res.sendStatus(500);
      return;
    }
    console.log('Password inserted into the database');
    res.sendStatus(200);
  });
});

app.get('/timeslots', (req, res) => {
  const query = 'SELECT * FROM time_table';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/timeslots/:courseId', (req, res) => {
  const { courseId } = req.params;
  const query = `SELECT * FROM time_table WHERE course_id = '${courseId}'`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/timeslots', (req, res) => {
  const { courseId, day, startTime, endTime, slot } = req.body;
  const query = `INSERT INTO time_table (course_id, day, start_time, end_time, slot) VALUES ('${courseId}', '${day}', '${startTime}', '${endTime}', '${slot}')`;
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.json({ message: 'Schedule added successfully' });
  });
});
app.listen(52330);