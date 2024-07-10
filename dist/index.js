"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: 'https://accredian-frontend-task-ashen-seven.vercel.app',
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Hello, world!");
});
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
const prisma = new client_1.PrismaClient();
app.post("/api/referrals", async (req, res) => {
    const { name, email, refferedName, refferedEmail } = req.body;
    if (!name || !email || !refferedName || !refferedEmail) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (!isValidEmail(email) || !isValidEmail(refferedEmail)) {
        return res.status(400).json({ error: "Invalid email" });
    }
    try {
        const referral = await prisma.referral.create({
            data: {
                Name: name,
                Email: email,
                refferedName: refferedName,
                refferedEmail: refferedEmail,
            },
        });
        //
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: refferedEmail,
            subject: "Referral from your friend",
            text: `Hi ${name},\n\nYou have been referred by ${refferedName}.\n\nBest Regards,\nYour Company`,
        };
        const response = await transporter.sendMail(mailOptions);
        console.log(response);
        res.status(201).json("ok");
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
exports.default = app;
