# Google Sheets Setup for STWL Form Submissions

## Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) with your work Google account
2. Create a new spreadsheet
3. Name it "STWL Submissions" (or whatever you prefer)
4. In the first row, add headers: `Timestamp` in A1, `Submission` in B1, and `Name` in C1
5. Copy the spreadsheet ID from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

## Step 2: Set up Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 3: Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in:
   - Service account name: "stwl-form-handler" (or any name)
   - Click "Create and Continue"
   - Skip optional fields, click "Done"
4. Click on the service account you just created
5. Go to "Keys" tab
6. Click "Add Key" > "Create new key"
7. Choose "JSON" format
8. Click "Create" - a JSON file will download

## Step 4: Share Google Sheet with Service Account
1. Open your Google Sheet
2. Click "Share" button
3. Paste the service account email (found in the JSON file as `client_email`)
   - It looks like: `stwl-form-handler@project-name.iam.gserviceaccount.com`
4. Give it "Editor" access
5. Click "Send"

## Step 5: Add Credentials to .env.local
Open the downloaded JSON file and copy these values to `.env.local`:

```env
GOOGLE_SHEET_ID=paste_spreadsheet_id_here
GOOGLE_CLIENT_EMAIL=paste_client_email_from_json_here
GOOGLE_PRIVATE_KEY="paste_private_key_from_json_here"
```

**Important:** Keep the private key in quotes and make sure to include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

## Step 6: Deploy to Vercel
Add these same environment variables to your Vercel project:
1. Go to your Vercel project dashboard
2. Settings > Environment Variables
3. Add all three variables with the same values

## Test It!
After setup, test by submitting a form - you should see new rows appear in your Google Sheet with:
- Column A: Timestamp
- Column B: Submission text
- Column C: Name (or "Anonymous" if not provided)
