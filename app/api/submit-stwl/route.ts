import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { text, name } = await request.json();

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Add to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:C', // Sheet name and columns
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [new Date().toISOString(), text, name || 'Anonymous'], // Timestamp, submission text, and name
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Submission received!'
    });
  } catch (error) {
    console.error('Error handling submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit' },
      { status: 500 }
    );
  }
}
