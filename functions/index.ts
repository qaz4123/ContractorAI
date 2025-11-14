
import * as functions from "firebase-functions";
import express from 'express';
import * as admin from "firebase-admin";

// Keep admin initialized in case it's needed for other API routes in the future
admin.initializeApp();

const app = express();

// The rewrite in firebase.json sends all /api/** requests to this function.
// The express app handles routing from there. A request to /api/ (or /api) will hit this handler.
app.get('/', (req, res) => {
  res.status(200).send('API server is healthy and running!');
});

// You can add more API routes to the express app here
// e.g., app.post('/users', ...) or app.get('/products', ...)
// These would be accessed via /api/users, /api/products etc.

// Expose the express app as a Cloud Function called "api".
// This name must match the function name in firebase.json rewrites.
export const api = functions.https.onRequest(app as any);
