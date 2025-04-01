const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const db = new sqlite3.Database('./students.db',(err)=>{
    if(err){
        console.error('error opening database',err);
    }else{
        console.log('connected to the Sqlite3 database. ');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS student(
    roll_number INTEGER PRIMARY KEY ,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone_number INTEGER,
    address TEXT
    );`);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/student', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize  = parseInt(req.query.pageSize ) || 3;
    const offset = (page - 1) * pageSize;

    db.get('SELECT COUNT(*) AS count FROM student', (err, row) => {
        if(err){
            return res.status(500).json({ error: err.message });
        }
        const totalStudent = row.count;

        db.all(`SELECT * FROM student LIMIT ? OFFSET ?`, [pageSize, offset], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message ,"message":"Error fetching students"});
            }
            res.json({ message: 'Students fetched successfully', 
                students: rows, 
                totalStudent:totalStudent,
                totalPages:Math.ceil(totalStudent / pageSize),
                currentPage:page 
            });
        });
    });
});

app.get('/',(req,res)=>{
    res.json({message:'Welcome to Student Management System',
        student:'You can go /student page to see all students',
        add_student:'You can go /add_student page to add student',
        update_student:'You can go /update_student page to update student',
        delete_student:'You can go /delete_student page to delete student',
        search_student:'You can go /search_student page to search student'});

});

// app.get('/', (req, res) => {
//     const query = 'SELECT * FROM student';
//     db.all(query, (err, rows) => {
//         if (err) {
//             console.error('Error fetching students', err);
//             res.json({ message: 'Error fetching students' });
//         } else {
//             res.json({ message: 'Students fetched successfully', students: rows });
//         }
//     });
// });

app.post('/add_student', (req, res) => {
    const roll_number = req.body.roll_number;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
    const address = req.body.address;
    const student = {
        roll_number: roll_number,
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone_number: phone_number,
        address: address
    };
    db.run(`INSERT INTO student(roll_number, first_name, last_name, email, phone_number, address) VALUES(?,?,?,?,?,?)`,
        [roll_number, first_name, last_name, email, phone_number, address], (err) => {
            if (err) {
                console.error('Error inserting student', err);
                res.json({ message: 'Error inserting student' });
            } else {
                res.json({ message: 'Student inserted successfully', student: student });
            }
        });
});

app.put('/update_student/:roll_number', (req, res) => {
    const roll_number = req.params.roll_number;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
    const address = req.body.address;
    const student = {
        roll_number: roll_number,
        first_name: first_name,
        last_name: last_name,
        email: email,
        phone_number: phone_number,
        address: address
    };
    db.run(`UPDATE student SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ? WHERE roll_number = ?`,
        [first_name, last_name, email, phone_number, address, roll_number], (err) => {
            if (err) {
                console.error('Error updating student', err);
                res.json({ message: 'Error updating student' });
            } else {
                res.json({ message: 'Student updated successfully', student: student });
            }
        });
});

app.delete('/delete_student/:roll_number', (req, res) => {
    const roll_number = req.params.roll_number;
    db.run(`DELETE FROM student WHERE roll_number = ?`, [roll_number], (err) => {
        if (err) {
            console.error('Error deleting student', err);
            res.json({ message: 'Error deleting student' });
        } else {
            res.json({ message: 'Student deleted successfully' });
        }
    });
});

app.get('/search_student/:roll_number', (req, res) => {
    const roll_number = req.params.roll_number;
    db.get(`SELECT * FROM student WHERE roll_number = ?`, [roll_number], (err, row) => {
        if (err) {
            console.error('Error fetching student', err);
            res.json({ message: 'Error fetching student' });
        } else {
            res.json({ message: 'Student fetched successfully', student: row });
        }
    });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});