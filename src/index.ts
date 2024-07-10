import express, { Request, Response } from "express"
import cors from "cors" 
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();
// app.use(cors({
//   origin: 'https://wd-compiler-frontend.vercel.app', 
//   credentials: true,
// }));



app.get('/', (req, res) => {
  res.send('Hello, world!');
});


function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


const prisma = new PrismaClient();

app.post('/api/referrals', async (req: Request, res: Response) => {
  const { name , email , refferedName, refferedEmail } = req.body;
  

  if (!name || !email || !refferedName || !refferedEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (!isValidEmail(email) || !isValidEmail(refferedEmail)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {

    

        const referral = await prisma.referral.create({
       data :{
          Name : name,
          Email : email,   
          refferedName : refferedName,
          refferedEmail : refferedEmail,
       }
    });


    // 
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user:  process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });


    const mailOptions = {
      from: process.env.EMAIL_USER ,
      to: refferedEmail,
      subject: 'Referral from your friend',
      text: `Hi ${name},\n\nYou have been referred by ${refferedName}.\n\nBest Regards,\nYour Company`
    };
  

     const response = await transporter.sendMail(mailOptions);
   
      console.log(response)

    res.status(201).json("ok");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})

export default app;













        // const referral = await prisma.referral.create({
    //    data :{
    //       Name : name,
    //       Email : email,   
    //       refferedName : refferedName,
    //       refferedEmail : refferedEmail,
    //    }
    // });