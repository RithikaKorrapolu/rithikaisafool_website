# Google Calendar API Setup

To enable automatic event date updates on the Connect page, you need to complete the following steps:

## 1. Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **stwl-form-482722** (the same project you used for Google Sheets)
3. Go to **APIs & Services** → **Library**
4. Search for "Google Calendar API"
5. Click **Enable**

## 2. Share Your Calendar with the Service Account

1. Open [Google Calendar](https://calendar.google.com/)
2. Find your calendar "rithika@rithikaisafool.com" in the left sidebar
3. Click the three dots next to it → **Settings and sharing**
4. Scroll down to **Share with specific people**
5. Click **Add people**
6. Add: `stwl-form@stwl-form-482722.iam.gserviceaccount.com`
7. Set permission to: **See all event details**
8. Click **Send**

## 3. Test the Integration

Once you've completed the steps above:

1. Restart your dev server (if it's running)
2. Visit the Connect page at http://localhost:3000/connect
3. The calendar should now display the date of your next "Penny for Your Thoughts" event

## How It Works

- The API route `/api/calendar/next-event` fetches the next upcoming event from your Google Calendar
- The Connect page automatically displays the month and day from that event
- The "Add to calendar" button links directly to your public event
- The date updates automatically whenever you create a new event in the future

## Troubleshooting

If the calendar shows "..." or "Dec 26" (fallback):
- Check the browser console for errors
- Verify the service account has calendar access
- Ensure Google Calendar API is enabled in your project
- Make sure your calendar event is public and in the future
