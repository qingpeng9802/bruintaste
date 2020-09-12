// Copyright (c) 2020 Qingpeng Li. All rights reserved.
// Author: qingpeng9802@gmail.com (Qingpeng Li).

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

// set path
import path from 'path';
const __dirname = path.resolve();

import debug from 'debug';

// connect to the database
import * as client from './db.js';
try {
  await client.connect(process.env.DBC_STR)
    .then(res => {
      console.log('[Express] Mongodb connected!');
    }, err => {
      console.log(`[Express] ***** Fatal ERROR: Mongodb connection failed *****`);
    });
} catch (e) {
  console.log(e);
}

// set middleware for express
import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';

let server = express();
export default server;

const httpOrigin = 'http://localhost';
const httpsOrigin = 'https://localhost';
const devOrigin = 'https://bt.dd';

const allowMethods = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
const allowHeaders = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(compression());
server.use(cors());
server.use(function (req, res, next) {
  // set CORS for Proxying API Requests in React

  let allowedOrigins = [httpOrigin, httpsOrigin, devOrigin];

  if (process.env.NODE_ENV === 'production') {
    process.env.WEB0 ? allowedOrigins.push(process.env.WEB0) : null;
    process.env.WEB1 ? allowedOrigins.push(process.env.WEB1) : null;
  }

  const origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  //res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', allowMethods);
  res.setHeader('Access-Control-Allow-Headers', allowHeaders);
  next();
});

// set daily rotating logger
import morgan from 'morgan';
import rfs from 'rotating-file-stream';

const logfilename = 'access.log';

if (process.env.NODE_ENV === 'development') {
  server.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
  let accessLogStream = rfs.createStream(logfilename, {
    interval: '1M',
    path: path.join(__dirname, 'log')
  });
  server.use(morgan('combined', { stream: accessLogStream }));
} else {
  console.log(process.env.NODE_ENV);
  console.log('[Express] *** CANNOT LOG by NODE_ENV ERROR ***');
}

// route to `apiRouter`
import apiv1RecipesBasic from './apiv1/apiv1RecipesBasic.js';
import apiv1RecipesSearch from './apiv1/apiv1RecipesSearch.js';
import apiv1UsersBasic from './apiv1/apiv1UsersBasic.js';
import apiv1UsersOps from './apiv1/apiv1UsersOps.js';


server.use('/api/v1', apiv1RecipesSearch, apiv1UsersOps);

// catch 404
server.use(function (req, res, next) {
  //res.status(404).send('[Express] *** INVALID API USED ***')
});

// set listening port
const PORT = process.env.EXPRESS_PORT;
server.listen(PORT, function () {
  console.log(`[Express] Listening at port: ${PORT}`);
});
