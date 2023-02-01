# Overview
This repository contains a tool to retrieve step count and heart rate data from Google Fit API and store it in a MongoDB database. The tool also generates a daily message ranking users according to the number of steps they have taken and sends it to a WhatsApp group.

## Requirements
- Google Fit API credentials
- MongoDB database URL
- WhatsApp API credentials

## Usage
1. Clone the repository and navigate to the project directory
```bash
git clone https://github.com/<username>/<repo-name>
cd <repo-name>
```
2. Install the dependencies
```
npm install
```
3. Create a .env file in the root of the project and add the following environment variables:
```makefile
GOOGLE_FIT_API_KEY=<Google Fit API Key>
MONGODB_URI=<MongoDB Connection URL>
clientId = <your-client-id>;
clientSecret = <your-client-secret>;
redirectUri = <your-redirect-uri>;
```
4. Run the script
```sql
npm start
```

## Limitations
The tool currently only supports retrieving step count and heart rate data and generating a daily message. If you need to retrieve other types of data or generate messages at different times, you will need to modify the code.

## Conclusion
This tool provides a basic implementation of retrieving data from Google Fit API and storing it in a MongoDB database, later that data will be segregated into leaderboards which will be sent as a whatsapp message at the time of winners announcement.
