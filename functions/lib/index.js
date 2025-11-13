"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const admin = __importStar(require("firebase-admin"));
// Keep admin initialized in case it's needed for other API routes in the future
admin.initializeApp();
const app = (0, express_1.default)();
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
exports.api = functions.https.onRequest(app);
