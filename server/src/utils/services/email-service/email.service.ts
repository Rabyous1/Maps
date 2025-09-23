import * as nodemailer from 'nodemailer';
import * as expressHandlebars from 'express-handlebars';
import nodemailerExpressHandlebars from 'nodemailer-express-handlebars';
import Handlebars from 'handlebars';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import * as path from 'path';

export const sendEmail = (data: any) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },

        // tls: {
        //     rejectUnauthorized: false, 
        // },

    });

    const handlebars = expressHandlebars.create({
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        extname: '.handlebars',
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'views/layouts'),
        partialsDir: path.join(__dirname, 'views/partials'),
    });

    transporter.use(
        'compile',
        nodemailerExpressHandlebars({
            viewEngine: handlebars,
            viewPath: path.join(__dirname, 'views/partials'),
        }),
    );

    const { to, cc, subject, template, context } = data;
    if (!to) {
        console.error("Aucun destinataire spécifié");
        return;
    }

    const mailOptions = {
        from: 'khedmapfe@gmail.com',
        to: to,
        subject: subject,
        template: template,
        cc: cc,
        context: context,
    };

    

    transporter.sendMail(mailOptions, error => {
        if (error) {
            console.error("Erreur lors de l'envoi du mail:", error);
        } else {
            console.log("Mail envoyé avec succès");
        }
    });
};
