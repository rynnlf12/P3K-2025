import { google } from 'googleapis';

// Jika kamu mengekspor `auth` secara named
export const auth = new google.auth.JWT({
    email: process.env.GDRIVE_CLIENT_EMAIL,
    key: process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  