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


import jwt from 'jsonwebtoken';

// recipe:
// 
//  recipeid(string): {
//    createdtime(Timestamp);
// }  
// 

// PATCH router (add a recipe to favorites)
// body: 
// recipeid(string)
const urlAdd = '/users/favadd/:userid';
router.patch(urlAdd, checkJwt, checkPermissions(process.env.AUTH0_USFAV), searchlimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_USER;
  //console.log(req);
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

  /** ----------------------- check integrity of id ---------------- */
  const authHeader = req.headers.authorization;
  const parts = authHeader.split(' ');

  if (parts.length != 2) {
    console.log('[apiv1] *** No authorization token was found ***');
    res.status(401).send('Please add authorization in HTTP header');
    return;
  }

  const idFromToken = jwt.decode(parts[1])['sub'];

  if (id !== idFromToken) {
    console.log('[apiv1] *** Forgery: params Id is NOT the same with token Id ***');
    res.status(401).send('Forgery: Please confirm params Id and token Id you used');
    return;
  }
  /** ---------------------- check integrity of id End --------------- */

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('users');

    const recipeid = req.body.recipeid;
    if (!recipeid) {
      console.log('[apiv1] *** No recipeid in body ***');
      res.status(404).send('Please add recipeid in HTTP body :)');
      return;
    } else if (recipeid == '' || isNaN(parseInt(recipeid)) || recipeid.length != 6) {
      console.log(`[apiv1] *** Invalid recipeid: ${recipeid} ***`);
      res.status(400).send('Please use VALID recipeid: a string representing int digits of length 6');
      return;
    }

    const recipekey = `favorites.${recipeid}`;
    await dbcc.updateOne(
      { _id: id },
      {
        $set:
        {
          [recipekey]: {
            createdtime: Date.now()
          }
        }
      },
      { upsert: true }
    );

    console.log(`[apiv1] userid: ${id}, recipeid: ${recipeid} | has been added`);
    res.status(200).send(`[apiv1] userid: ${id}, recipeid: ${recipeid}  | has been added`);
  } catch (e) {
    console.log(e);
    next();
  }
});

// PATCH router (remove a recipe to favorites)
// body: 
// recipeid(string)
const urlRemove = '/users/favremove/:userid';
router.patch(urlRemove, checkJwt, checkPermissions(process.env.AUTH0_REMFAV), searchlimiter, async function (req, res, next) {
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

  /** ----------------------- check integrity of id ---------------- */
  const authHeader = req.headers.authorization;
  const parts = authHeader.split(' ');

  if (parts.length != 2) {
    console.log('[apiv1] *** No authorization token was found ***');
    res.status(401).send('Please add authorization in HTTP header');
    return;
  }

  const idFromToken = jwt.decode(parts[1])['sub'];

  if (id !== idFromToken) {
    console.log('[apiv1] *** Forgery: params Id is NOT the same with token Id ***');
    res.status(401).send('Forgery: Please confirm params Id and token Id you used');
    return;
  }
  /** ---------------------- check integrity of id End --------------- */

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('users');
    // find if id exist
    const userEntry = await dbcc.findOne(
      { _id: id }
    );
    // if get no result
    if (!userEntry) {
      console.log(`[apiv1] userid: ${id} | NO found in db, cannot remove favorite`);
      res.status(400).send(`[apiv1] userid: ${id} | NO found in db, cannot remove favorite`);
      return;
    }

    const recipeid = req.body.recipeid;
    if (!recipeid) {
      console.log('[apiv1] *** No recipeid in body ***');
      res.status(404).send('Please add recipeid in HTTP body :)');
      return;
    } else if (recipeid == '' || isNaN(parseInt(recipeid)) || recipeid.length != 6) {
      console.log(`[apiv1] *** Invalid recipeid: ${recipeid} ***`);
      res.status(400).send('Please use VALID recipeid: a string representing int digits of length 6');
      return;
    }

    const recipekey = `favorites.${recipeid}`;
    await dbcc.updateOne(
      { _id: id },
      {
        $unset:
        {
          [recipekey]: null
        }
      }
    );

    console.log(`[apiv1] userid: ${id}, recipeid: ${recipeid} | has been removed`);
    res.status(200).send(`[apiv1] userid: ${id}, recipeid: ${recipeid}  | has been removed`);
  } catch (e) {
    console.log(e);
    next();
  }
});


// GET router (get a array of favorite cards)
const urlFavCards = '/users/favcards/:userid';
router.get(urlFavCards, checkJwt, checkPermissions(process.env.AUTH0_RFAVC), searchlimiter, async function (req, res, next) {

  // authorization API
  const keyname = process.env.API_KEY_NAME_USER;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log(keyname)
    console.log(req.query[keyname])
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

  /** ----------------------- check integrity of id ---------------- */
  const authHeader = req.headers.authorization;
  const parts = authHeader.split(' ');

  if (parts.length != 2) {
    console.log('[apiv1] *** No authorization token was found ***');
    res.status(401).send('Please add authorization in HTTP header');
    return;
  }

  const idFromToken = jwt.decode(parts[1])['sub'];

  if (id !== idFromToken) {
    console.log('[apiv1] *** Forgery: params Id is NOT the same with token Id ***');
    res.status(401).send('Forgery: Please confirm params Id and token Id you used');
    return;
  }
  /** ---------------------- check integrity of id End --------------- */

  try {
    /** ------------------- Users --------------------------- */
    const dbc = client.db(process.env.DB_STR);
    const dbccu = dbc.collection('users');
    // find if id exist
    const userEntry = await dbccu.findOne(
      { _id: id }
    );
    // if get no result
    if (!userEntry) {
      console.log(`[apiv1] userid: ${id} | NO found in db, get cards`);
      res.status(400).send(`[apiv1] userid: ${id} | NO found in db, get cards`);
      return;
    }

    const favRes = userEntry.favorites;
    if (!favRes || favRes == {}) {
      console.log(`[apiv1] userid: ${id} | Field: favorites is empty`);
      res.status(400).send(`[apiv1] userid: ${id} | Field: favorites is empty`);
      return;
    }

    const recipeIdArr = Object.keys(favRes);
    if (!recipeIdArr || recipeIdArr.length == 0) {
      console.log(`[apiv1] userid: ${id} | recipeIdArr is empty`);
      res.status(400).send(`[apiv1] userid: ${id} | recipeIdArr is empty`);
      return;
    }

    /** ------------------- Recipes --------------------------- */
    const dbccr = dbc.collection('recipes');

    let cards = await dbccr.find(
      {
        _id: {
          $in: recipeIdArr
        }
      },
    ).project(
      {
        "title": 1,
        "desc": 1,
        "ingredstr": 1,
        'allerg': 1,
        'piccode': 1,
        'eimg': 1
      }
    ).toArray();

    // if get no result
    if (!cards) {
      console.log(`[apiv1] get userid: ${id} | NO card found in db`);
      res.status(404).send(`[apiv1] get userid: ${id} | NO card found in db`);
      return;
    } else {
      console.log(`[apiv1] userid: ${id} | cards FOUND in db`);

      for (let ele of cards) {
        ele['createdtime'] = favRes[ele['_id']]['createdtime'];
      }

      res.json(cards);
      return;
    }

  } catch (e) {
    console.log(e);
    next();
  }
});

export default router;
