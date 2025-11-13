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

// This block allows the Express app to run on Cloud Run, which requires
// the server to listen on the port provided by the PORT environment variable.
// The `FUNCTION_TARGET` check prevents this from running in the Firebase Functions
// environment, where the server is started automatically.
if (!process.env.FUNCTION_TARGET) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}


// Expose the express app as a Cloud Function called "api".
// This name must match the function name in firebase.json rewrites.
// FIX: Cast `app` to `any` to resolve a type incompatibility issue between the express app and the expected request handler type in `firebase-functions`. This is a common workaround for type definition mismatches that can occur with certain versions of these packages.
export const api = functions.https.onRequest(app as any);