import nodemailer from 'nodemailer';

interface InvitationEmailData {
  recipientEmail: string;
  groupName: string;
  groupID: string;
  role: string;
  familialRelation?: string;
  inviterName: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_APP_PASSWORD, 
    },
  });
}

export const sendInvitationEmail = async (data: InvitationEmailData): Promise<void> => {
  const {
    recipientEmail,
    groupName,
    groupID,
    role,
    familialRelation,
    inviterName,
  } = data;

  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.APP_NAME }" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `You're invited to join ${groupName} family group!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2A1800 0%, #623405 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🐻 Family Invitation</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #2A1800; margin-top: 0;">You're invited to join a family group!</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">Hi there!</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>${inviterName}</strong> has invited you to join the <strong>${groupName}</strong> family group.
          </p>
          
          ${familialRelation ? `<p style="font-size: 16px; line-height: 1.6;">You've been added as: <strong>${familialRelation}</strong></p>` : ''}
          
          <p style="font-size: 16px; line-height: 1.6;">Your role will be: <strong>${role}</strong></p>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2A1800;">
            <p style="margin: 0; font-size: 14px;">
              You can join using Group ID: <strong>${groupID}</strong>
            </p>
          </div>
        </div>
        
        <p style="text-align: center; font-size: 18px; color: #2A1800; font-weight: bold;">Welcome to the family! 🎉</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};