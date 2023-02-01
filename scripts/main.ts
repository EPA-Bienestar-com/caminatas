import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { MongoClient } from "mongodb";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

const clientId = "your-client-id";
const clientSecret = "your-client-secret";
const redirectUri = "your-redirect-uri";
const scopes = ["https://www.googleapis.com/auth/fitness.activity.read"];
const mongoUrl = "mongodb://localhost:27017/";
let stepCountData : number;
let heartRate : number;

async function retrieveGoogleFitData(accessToken: string, userId: string) {
  const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  oAuth2Client.setCredentials({ access_token: accessToken });

  const fit = google.fitness({ version: "v1", auth: oAuth2Client });

  const request = {
    userId: "me",
    resource: {
      aggregateBy: [{
        dataTypeName: "com.google.step_count.delta",
        dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      }],
      bucketByTime: {
        durationMillis: 86400000
      },
      startTimeMillis: (new Date("2022-01-01").getTime()),
      endTimeMillis: (new Date().getTime()),
    }
  };
  
  fit.users.dataset.aggregate(request).then((response) => {
    if (response.data && response.data.bucket) {
      const bucket = response.data.bucket[0];
      if (bucket && bucket.dataset) {
        const dataset = bucket.dataset[0];
        if (dataset && dataset.point) {
          const point = dataset.point[0];
          if (point && point.value) {
            const value = point.value[0];
            if (value && value.intVal) {
              const stepCountData = value.intVal;
              console.log("Step Count:",stepCountData);
            }
          }
        }
      }
    }
  });
  
  

  const heartRateResponse = {
    userId: "me",
    resource: {
      aggregateBy: [{
        dataTypeName: "com.google.heart_rate.bpm",
        dataSourceId: "raw:com.google.heart_rate.bpm:*"
      }],
      bucketByTime: {
        durationMillis: 86400000
      },
      startTimeMillis: (new Date("2022-01-01").getTime()),
      endTimeMillis: (new Date().getTime()),
    },
  };

  fit.users.dataset.aggregate(heartRateResponse).then((response) => {
    if (response.data && response.data.bucket) {
      const bucket = response.data.bucket[0];
      if (bucket && bucket.dataset) {
        const dataset = bucket.dataset[0];
        if (dataset && dataset.point) {
          const point = dataset.point[0];
          if (point && point.value) {
            const value = point.value[0];
            if (value && value.intVal) {
              const heartRate = value.intVal;
              console.log("Heart rate:",heartRate);
            }
          }
        }
      }
    }
  });


  const client = await MongoClient.connect(mongoUrl);
  const db = client.db("fitdata");
  const collection = db.collection("users");

  await collection.updateOne(
    { userId: userId },
    { $set: { stepCount: stepCountData, heartRate: heartRate } },
    { upsert: true }
  );

  client.close();
}

async function generateWhatsAppMessage() {
    const client = await MongoClient.connect(mongoUrl);
//   client.connect(err => {
//     if (err) {
//       console.error(err);
//       return;
//     }
  const db = client.db("fitdata");
  const collection = db.collection("users");

  const users = await collection.find().sort({ stepCount: -1 }).toArray();
  let message = "Today's step count leaderboard:\n";

  for (let i = 0; i < users.length; i++) {
    message += `${i + 1}. ${users[i].userId}: ${users[i].stepCount} steps\n`;
  }

  console.log(message);

  client.close();
}



async function main() {
  // Retrieve access token for the user
  const accessToken = "user-access-token";

  // Retrieve Google Fit data for the user
  await retrieveGoogleFitData(accessToken, "user-id");

  // Generate the WhatsApp message
  if (moment().hour() === 17) {
    await generateWhatsAppMessage();
  }
}

main();

