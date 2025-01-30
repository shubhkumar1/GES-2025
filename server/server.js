import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// mongoose.connect('mongodb://localhost:27017/student')
mongoose.connect('mongodb+srv://contactamazingfacts107:IXqOwMFNcHCzcyXm@cluster0.qjqrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log("MongoDB is connected"))
    .catch((err) => console.error(err));


// Student registration schema
const studentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, uppercase: true },
        rollNum: { type: String, required: true, uppercase: true },
        department: { type: String, required: true },
        subject: { type: String, required: true, uppercase: true },
        session: { type: String, required: true },
        mobileNum: { type: String, required: true },
        parentNum: { type: String, required: true, unique: true },
        parentAltNum: { type: String, required: true, unique: true },
        relation: { type: String, required: true, uppercase: true },
        relationAltNum: { type: String, required: true, uppercase: true },
        mail: { type: String, required: true, unique: true, lowercase: true },
        gender: { type: String, required: true, uppercase: true },
        upiID: { type: String, required: true, lowercase: true },
        paidBy: { type: String, required: true, uppercase: true },
        textArea: { type: String, required: true },
        amount: { type: String, required: true, uppercase: true },
        tshirtSize: { type: String, uppercase: true },
        age: { type: String, required: true }
    },
    { timestamps: true }
);
const Student = mongoose.model("Student", studentSchema);

// Final data of students
// const finalSchema = new mongoose.Schema(
//     {
//         f_name: { type: String, required: true },
//         f_rollNum: { type: String, required: true, unique: true },
//         f_mobileNum: { type: Number, required: true, unique: true },
//         f_parentNum: { type: Number, required: true, unique: true },
//         f_mail: { type: String, required: true, unique: true, lowerCase: true },
//         f_gender: { type: String, required: true },
//         f_upiID_Num: { type: String, required: true },
//     },
//     { timestamps: true }
// )
// const Final = mongoose.model("Final", finalSchema);

// Admain login
const adminSchema = new mongoose.Schema({
    A_name: { type: String, required: true },
    A_mail: { type: String, required: true },
    A_password: { type: String, required: true }
});
const Admin = mongoose.model("Admin", adminSchema);


app.get('/', (req, res) => {
    res.send('Server is setup successfully');
})

// Student registration form
app.post('/api/registration', async (req, res) => {
    try {

        const { name, rollNum, department, subject, session, mobileNum, parentNum, parentAltNum, relation, relationAltNum, mail, gender, upiID, paidBy, textArea, age } = req.body;

        let studentName = await Student.findOne({ name });
        let studentMobileNum = await Student.findOne({ mobileNum });
        let studentGender = await Student.findOne({ gender });
        let studentRelation = await Student.findOne({ relation });
        let studentUpiID = await Student.findOne({ upiID });
        let studentRollNum = await Student.findOne({ rollNum });
        let studentMail = await Student.findOne({ mail });
        let studentParentNum = await Student.findOne({ parentNum });

        // if (studentRollNum || studentMail || studentParentNum) {
        //     return res.status(400).send({ message: "User already exist" });
        // }

        if (studentRollNum) {
            return res.status(400).send({ message: `Roll N0. is already exist` });
        }
        else if (studentMail) {
            return res.status(400).send({ message: `Mail is already exist` });
        }
        else if (studentParentNum) {
            return res.status(400).send({ message: `Parent's Number is already exist` });
        }
        // Check info
        else if (studentName && studentMobileNum && studentGender && studentRelation && studentUpiID && studentRollNum && studentMail && studentParentNum) {
            return res.send({ message: "Congratulations, your given information is correct. - :)" })
        }

        // let student = new Student({ name, rollNum, mobileNum, parentNum, mail, gender, upiID });
        // await student.save();

        Student.create({
            name: name,
            rollNum: rollNum,
            department: department,
            subject: subject,
            session: session,
            mobileNum: mobileNum,
            parentNum: parentNum,
            parentAltNum: parentAltNum,
            relation: relation,
            relationAltNum: relationAltNum,
            mail: mail,
            gender: gender,
            upiID: upiID,
            paidBy: paidBy, // Firstname + last 4 digit mobileNum
            textArea: textArea,
            amount: "Unpaid",
            tshirtSize: "",
            age: age
        })

        res.status(201).send({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).send({ message: "Server error" });
    }
});

// Find student data by upiID
app.get('/api/admin/search-data/:id1/:id2', async (req, res) => {
    // const { searchInput } = req.body;
    // console.log(req.params.id1);
    if (req.params.id1 === 'UPI ID') {
        Student.find(
            { upiID: req.params.id2 }
        ).then((student) => {
            res.send(student);
        }).catch((err) => {
            res.status(500).send({ message: "Server problem" })
        })
    }
    if (req.params.id1 === 'Roll No.') {
        Student.find(
            { rollNum: req.params.id2 }
        ).then((student) => {
            res.send(student);
        }).catch((err) => {
            res.status(500).send({ message: "Server problem" })
        })
    }
    if (req.params.id1 === 'Mobile No.') {
        Student.find(
            { mobileNum: req.params.id2 }
        ).then((student) => {
            res.send(student);
        }).catch((err) => {
            res.status(500).send({ message: "Server problem" })
        })
    }
    // Student.find(
    //     { rollNum: req.params.id2 }
    // ).then((student) => {
    //     res.send(student);
    // }).catch((err) => {
    //     res.status(500).send({ message: "Server problem" })
    // })
})


// Email-provider
let transport = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: 'contactamazingfacts107@gmail.com',
        pass: 'rxwsmzjbrtoaityc'
    }
})
// Update student data
app.put('/api/admin/update-data', async (req, res) => {

    const { code } = req.body;


    let student = await Student.find({ rollNum: code });

    let stuMail = student[0].mail;
    let stuName = student[0].name;

    console.log(stuMail);
    let mailOptions = {
        from: "contactamazingfacts107@gmail.com",
        to: stuMail,
        subject: "🎉 Your Registration for GES-2025 is Confirmed! 🎉",
        html: `<h1>DEAR ${stuName},</h1><p>We are thrilled to confirm your registration for the Global Entrepreneurship Summit 2025 (GES-2025)! </p><p>Get ready to embark on an incredible journey filled with innovation, inspiration, and networking opportunities. This year&apos;s summit promises to be our most exciting yet, with a lineup of world-renowned speakers, cutting-edge workshops, and unparalleled opportunities to connect with fellow entrepreneurs from around the globe.</p><h3>Event Details:</h3><ul><li>Date: 7th Feb to 9th Feb</li><li>Location: IIT Kharagpur</li></ul><p>Stay tuned with us. We can&apos;t wait to see you at GES-2025 and witness the magic of entrepreneurship unfold!</p><h3>Best regards,</h3><h3>Shubham Kumar</h3><h3>BCA Department</h3><h3>Marwari College, Ranchi</h3>`
    }
    try {
        // const { code } = req.body;
        await Student.updateOne({ rollNum: code }, { amount: "PAID" });

        let info = await transport.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

        res.send({ message: "update successfully" })
    } catch (err) {
        res.send(err);
    }
})

// delete student data
app.delete('/api/admin/delete/:id', async (req, res) => {
    try {
        await Student.findOneAndDelete({ rollNum: req.params.id })
        res.send({ message: "Deleted successfully" });
    } catch (err) {
        res.send({ message: "Server error" });
    }
})

// get student data for everyone
// app.get('/api/students', async (req, res) => {
//     Student.find(
//         { amount: 'paid' }
//     ).then((student) => {
//         res.send(student);
//     }).catch((err) => {
//         res.status(500).send({ message: "Server problem" })
//     })
// })

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find({ amount: 'paid' }).sort({ updatedAt: 1 }); // Sort by date in descending order
        res.send(students);
    } catch (err) {
        res.status(500).send({ message: "Server problem" });
    }
});


app.get('/api/studentsdata', async (req, res) => {
    Student.find(
        { amount: 'unpaid' }
    ).then((student) => {
        res.send(student);
    }).catch((err) => {
        res.status(500).send({ message: "Server problem" })
    })
})

// Admin signup------------Done
app.post('/api/signup', (req, res) => {
    try {
        const { A_name, A_mail, A_password } = req.body;

        Admin.create({
            A_name: A_name,
            A_mail: A_mail,
            A_password: A_password
        })

        res.send('Admin register successfully');
    } catch (err) {
        res.send(err)
    }
})


var x;
x = Math.floor((Math.random() * 1000000));

app.post('/api/admin/OTC', async (req, res) => {
    const {A_mail} = req.body;

    const admin = await Admin.findOne({ A_mail });

    if (!admin) {
        return res.status(500).send({ message: "Invalid email" });
    }
    let toMail;
    if (A_mail == 'shubh@ges.com') {
        toMail = `contactamazingfacts107@gmail.com`;
    }
    else {
        toMail = `contactamazingfacts107@gmail.com, ${A_mail}`;
    }
    let mailOptions = {
        from: "contactamazingfacts107@gmail.com",
        to: toMail,
        subject: "Your OTP, GES-2025",
        html: `<h1>DEAR Sir,</h1><h2>Your OTP is: </h2><center><h3>${x}</h3></center>`
    }

    let info = await transport.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);

    res.send({message: "OTP send successfuly"});
})

console.log(x);
// Admin login....Done
app.post('/api/admin/login', async (req, res) => {

    const { A_code, A_mail, A_password, A_OTP } = req.body;

    let toMail;
    if (A_mail == 'shubh@ges.com') {
        toMail = `contactamazingfacts107@gmail.com`;
    }
    else {
        toMail = `contactamazingfacts107@gmail.com, ${A_mail}`
    }
    let mailOptions = {
        from: "contactamazingfacts107@gmail.com",
        to: toMail,
        subject: "Admin Signup alert GES-2025",
        html: `<h1>DEAR Sir,</h1><h2>Someone login right now from your login credential</h2><h3>Details: <br>${A_code}<br>${A_mail}</h3>`
    }


    try {

        console.log(x);
        console.log(A_code);
        console.log(A_mail);
        console.log(A_password);
        console.log(A_OTP);

        console.log(typeof(x))
        console.log(typeof(Number(A_OTP)))
        const admin = await Admin.findOne({ A_mail });

        if (!admin || admin.A_password !== A_password || admin.A_name !== A_code || x !== Number(A_OTP) ) {
            return res.status(500).send({ message: "Invalid login details" });
        }


        // res.send(admin);
        x = Math.floor((Math.random() * 1000000));
        let info = await transport.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.status(200).send({ message: "Login successfully" });

        // res.status(200).send({message: "Login successful!"});



        // if (admin && A_code === admin.A_name && A_password === admin.A_password) {
        //     res.status(200).send({ message: "Login successfully" });
        // }
        // else {
        //     res.status(500).send({ message: "Invalid login details" });
        // }
    } catch (err) {
        res.status(500).send({ message: "Server error" });
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));