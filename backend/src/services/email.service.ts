import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Email is not configured — set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env',
    );
  }

  const port = SMTP_PORT ? Number(SMTP_PORT) : 587;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

interface SendCredentialsEmailInput {
  to: string;
  name: string;
  email: string;
  tempPassword: string;
  role: string;
}

export async function sendCredentialsEmail({
  to,
  name,
  email,
  tempPassword,
  role,
}: SendCredentialsEmailInput) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Your AbyssERP account has been created',
    text: [
      `Hi ${name},`,
      '',
      `An AbyssERP account has been created for you with the role: ${role}.`,
      '',
      `Login email: ${email}`,
      `Temporary password: ${tempPassword}`,
      '',
      `Sign in at ${appUrl} and you'll be asked to set a new password right away.`,
      '',
      'If you were not expecting this account, please contact your administrator.',
    ].join('\n'),
    html: `
      <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a;">
        <p>Hi ${escapeHtml(name)},</p>
        <p>An AbyssERP account has been created for you with the role: <strong>${escapeHtml(role)}</strong>.</p>
        <table style="margin: 16px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 12px 4px 0; color: #666;">Login email</td>
            <td style="padding: 4px 0; font-weight: 600;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 12px 4px 0; color: #666;">Temporary password</td>
            <td style="padding: 4px 0; font-weight: 600; font-family: monospace;">${escapeHtml(tempPassword)}</td>
          </tr>
        </table>
        <p>Sign in at <a href="${appUrl}">${appUrl}</a> — you'll be asked to set a new password right away.</p>
        <p style="color: #666; font-size: 13px;">If you were not expecting this account, please contact your administrator.</p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface LowStockAlertInput {
  to: string[];
  productName: string;
  quantity: number;
  threshold: number;
}

export async function sendLowStockAlertEmail({ to, productName, quantity, threshold }: LowStockAlertInput) {
  if (to.length === 0) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  await getTransporter().sendMail({
    from,
    to,
    subject: `Low stock alert: ${productName}`,
    text: [
      `"${productName}" is running low — only ${quantity} unit(s) left (threshold: ${threshold}).`,
      '',
      `Restock it at ${appUrl}/inventory`,
    ].join('\n'),
    html: `
      <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a;">
        <p><strong>${escapeHtml(productName)}</strong> is running low — only
        <strong>${quantity}</strong> unit(s) left (threshold: ${threshold}).</p>
        <p><a href="${appUrl}/inventory">Restock it in AbyssERP</a></p>
      </div>
    `,
  });
}

interface NewSaleAlertInput {
  to: string[];
  saleId: string;
  totalAmount: number;
  currency: string;
}

export async function sendNewSaleAlertEmail({ to, saleId, totalAmount, currency }: NewSaleAlertInput) {
  if (to.length === 0) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const invoiceRef = saleId.slice(-8).toUpperCase();
  const formattedTotal = `${currency} ${totalAmount.toFixed(2)}`;

  await getTransporter().sendMail({
    from,
    to,
    subject: `New sale completed — #${invoiceRef}`,
    text: [
      `Sale #${invoiceRef} was just completed for ${formattedTotal}.`,
      '',
      `View it at ${appUrl}/sales`,
    ].join('\n'),
    html: `
      <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a;">
        <p>Sale <strong>#${escapeHtml(invoiceRef)}</strong> was just completed for
        <strong>${escapeHtml(formattedTotal)}</strong>.</p>
        <p><a href="${appUrl}/sales">View it in AbyssERP</a></p>
      </div>
    `,
  });
}