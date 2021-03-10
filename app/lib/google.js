import { google } from 'googleapis'
const OAuth2 = google.auth.OAuth2

export default () =>
  new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL)
