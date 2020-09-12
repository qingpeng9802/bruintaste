import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

// set environment variables
import dotenv from 'dotenv';
const envDevstr = '.env.development.local';
const envProdstr = '.env.production.local';
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: envDevstr });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: envProdstr });
} else {
  dotenv.config({ path: envDevstr });
}

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and 
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri: process.env.AUTH0_JWKS
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUD,
  issuer: process.env.AUTH0_ISS,
  algorithms: ['RS256']
});

export default checkJwt;