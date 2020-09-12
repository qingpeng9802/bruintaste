// Copyright (c) 2020 Qingpeng Li. All rights reserved.
// Author: qingpeng9802@gmail.com (Qingpeng Li).

import * as client from '../db.js';

// protect api
import rateLimit from 'express-rate-limit';

function authkeyRecipes(str) {
  return str == process.env.API_KEY_USER ? true : false;
}

import checkJwt from '../middleware/authz.middleware.js';
import checkPermissions from '../middleware/permissions.middleware.js';

// route
import express from 'express';
let router = express.Router();

// limiter to protect search API
const searchlimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message:
    "Search too frequently ;) please let API take a 5-min break",
});

// GET router
const urlGet = '/users/:userid';
router.get(urlGet, searchlimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_USER;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  const id = req.params.userid;
  if (!id) {
    console.log('[apiv1] *** No userid in body ***');
    res.status(404).send('Please add userid in HTTP body :)');
    return;
  } else if (!id.startsWith('facebook|') && !id.startsWith('google-oauth2|')) {
    console.log('[apiv1] *** Invalid userid in body ***');
    res.status(404).send('Please use valid userid in HTTP body :)');
    return;
  }

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('users');
    const userEntry = await dbcc.findOne(
      { _id: id }
    );

    // if get no result
    if (!userEntry) {
      console.log(`[apiv1] get userid: ${id} | NO result found in db`);
      res.status(404).send(`[apiv1] get userid: ${id} | NO result found in db`);
      return;
    } else {
      console.log(`[apiv1] userid: ${id} | FOUND in db`);
      res.json(userEntry);
      return;
    }
  } catch (e) {
    console.log(e);
    next();
  }
});

// POST router
// must not exist before ! (usually not be used)
// body:
// userid, fav
const urlPost = '/users';
router.post(urlPost, searchlimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_USER;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  const id = req.body.userid;
  if (!id) {
    console.log('[apiv1] *** No userid in body ***');
    res.status(404).send('Please add userid in HTTP body :)');
    return;
  } else if (!id.startsWith('facebook|') && !id.startsWith('google-oauth2|')) {
    console.log('[apiv1] *** Invalid userid in body ***');
    res.status(404).send('Please use valid userid in HTTP body :)');
    return;
  }

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('users');
    const userEntry = await dbcc.findOne(
      { _id: id }
    );

    // if get result
    if (userEntry) {
      console.log(`[apiv1] userid: ${id} | found in db, cannot INSERT`);
      res.status(400).send(`[apiv1] userid: ${id} | found in db, cannot INSERT`);
      return;
    }

    const fav = req.body.fav ?? {};
    // more fields

    await dbcc.insertOne(
      {
        _id: id,
        favorites: fav
        // more fields
      }
    );

    console.log(`[apiv1] userid: ${id} | has been INSERTED`);
    res.status(201).send(`[apiv1] userid: ${id} | has been INSERTED`);
    return;
  } catch (e) {
    console.log(e);
    next();
  }
});

// PUT router
// does or not exist, both are okay (upsert: true)
// body:
// userid, fav
const urlPut = '/users';
router.put(urlPut, searchlimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_USER;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  const id = req.body.userid;
  if (!id) {
    console.log('[apiv1] *** No userid in body ***');
    res.status(404).send('Please add userid in HTTP body :)');
    return;
  } else if (!id.startsWith('facebook|') && !id.startsWith('google-oauth2|')) {
    console.log('[apiv1] *** Invalid userid in body ***');
    res.status(404).send('Please use valid userid in HTTP body :)');
    return;
  }

  const fav = req.body.fav ?? {};
  // more fields

  const dbc = client.db(process.env.DB_STR);
  const dbcc = dbc.collection('users');
  try {
    await dbcc.updateOne(
      { _id: id },
      {
        $set:
        {
          favorites: fav
          // more fields
        }
      },
      { upsert: true }
    );

    console.log(`[apiv1] userid: ${id} | has been UPSERTED`);
    res.status(200).send(`[apiv1] userid: ${id} | has been UPSERTED`);
    return;
  } catch (e) {
    console.log(e);
    next();
  }
});

// DELETE router
// dangerous (usually not be used)
const urlDelete = '/users/:userid';
router.delete(urlDelete, searchlimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_USER;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  const id = req.params.userid;
  if (!id) {
    console.log('[apiv1] *** No userid in body ***');
    res.status(404).send('Please add userid in HTTP body :)');
    return;
  } else if (!id.startsWith('facebook|') && !id.startsWith('google-oauth2|')) {
    console.log('[apiv1] *** Invalid userid in body ***');
    res.status(404).send('Please use valid userid in HTTP body :)');
    return;
  }

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('users');
    // find if id exist
    const userEntry = await dbcc.findOne(
      { _id: id }
    );
    // if get no result
    if (!userEntry) {
      console.log(`[apiv1] userid: ${id} | NO found in db, cannot DELETE`);
      res.status(400).send(`[apiv1] userid: ${id} | NO found in db, cannot DELETE`);
      return;
    }

    await dbcc.deleteOne(
      { _id: id }
    );

    console.log(`[apiv1] userid: ${id} | has been DELETED`);
    res.status(204).send(`[apiv1] userid: ${id} | has been DELETED`);
  } catch (e) {
    console.log(e);
    next();
  }
});

export default router;
