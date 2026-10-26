import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

export interface EmailOptions {
  email: string;
  subject: string;
  mailgenContent: any;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!process.env.MAILTRAP_SMTP_HOST || !options.email) {
    return;
  }

  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Project Camp',
      link: process.env.SERVER_URL || 'http://localhost:3000',
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT || 2525),
    auth: {
      user: process.env.MAILTRAP_SMTP_USER || '',
      pass: process.env.MAILTRAP_SMTP_PASS || '',
    },
  });

  const mailOptions = {
    from: 'support@projectcamp.dev',
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Log gracefully so mail service failures never crash user registration or password reset
    console.warn('Mail notification could not be delivered:', error instanceof Error ? error.message : error);
  }
};

export const emailVerificationMailgenContent = (username: string, verificationUrl: string) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Project Camp! We're excited to have you on board.",
      action: {
        instructions: 'To verify your email address, please click the button below:',
        button: {
          color: '#22c55e',
          text: 'Verify Email',
          link: verificationUrl,
        },
      },
      outro: 'If you did not sign up for Project Camp, you can safely ignore this email.',
    },
  };
};

export const forgotPasswordMailgenContent = (username: string, passwordResetUrl: string) => {
  return {
    body: {
      name: username,
      intro: 'We received a request to reset the password for your Project Camp account.',
      action: {
        instructions: 'To reset your password, please click the button below:',
        button: {
          color: '#eab308',
          text: 'Reset Password',
          link: passwordResetUrl,
        },
      },
      outro: 'If you did not request a password reset, you can safely ignore this email.',
    },
  };
};

export const forgetPasswordMailgenContent = forgotPasswordMailgenContent;
