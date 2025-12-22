import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import DocumentExpiryEmail from '@/components/emails/DocumentExpiryEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, userName, docType, expiryDate } = await req.json();
    if (!to || !userName || !docType || !expiryDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }


    // Render the email template to HTML string (await Promise)
    const html = await render(
      React.createElement(DocumentExpiryEmail, { userName, docType, expiryDate })
    );

    // Resend expects 'to' as array
    const toArr = Array.isArray(to) ? to : [to];

    const result = await resend.emails.send({
      from: 'DriveSync <noreply@drivesync.hu>',
      to: toArr,
      subject: `Lejáró okirat: ${docType}`,
      html,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Resend API error' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
