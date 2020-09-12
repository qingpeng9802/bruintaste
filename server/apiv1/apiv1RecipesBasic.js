// Copyright (c) 2020 Qingpeng Li. All rights reserved.
// Author: qingpeng9802@gmail.com (Qingpeng Li).

import * as client from '../db.js';

// protect api
import rateLimit from 'express-rate-limit';

function authkeyRecipes(str) {
  return str == process.env.API_KEY_RECIPES_BASIC ? true : false;
}

// route
import express from 'express';
let router = express.Router();

// limiter to protect GET API
const basicLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message:
    "Get a recipe too frequently ;) please let API take a 5-min break",
});

// GET router
const urlGet = '/recipes/basic/:id';
router.get(urlGet, basicLimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_RECIPES_BASIC;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  const id = req.params.id;
  if (id == '' || isNaN(parseInt(id)) || id.length != 6) {
    console.log(`[apiv1] *** Invalid id: ${id} ***`);
    res.status(400).send('Please use VALID id: a string representing int digits of length 6');
    return;
  }

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');
    const resRecipeEntry = await dbcc.findOne(
      { _id: id }
    );

    // if get no result
    if (!resRecipeEntry) {
      console.log(`[apiv1] get id: ${id} | NO result found in db`);
      res.status(404).send(`[apiv1] get id: ${id} | NO result found in db`);
      return;
    } else {
      console.log(`[apiv1] id: ${id} | FOUND in db`);
      res.json(resRecipeEntry);
      return;
    }
  } catch (e) {
    console.log(e);
    next();
  }
});

// POST router
const urlPost = '/recipes/basic';
router.post(urlPost, basicLimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_RECIPES_BASIC;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  // set all fields
  const id = req.body.id ?? '';
  if (id == '' || isNaN(parseInt(id)) || id.length != 6) {
    console.log(`[apiv1] *** Invalid id: ${id} ***`);
    res.status(400).send('Please use VALID id: a string representing int digits of length 6');
    return;
  }
  const title = req.body.title ?? ''
  const desc = req.body.desc ?? '';
  const allerg = req.body.allerg ?? [];

  const ingredjson = req.body.ingrjson ?? null;
  const ingredstr = req.body.ingrstr ?? '';

  const piccode = req.body.piccode ?? [];

  const eimg = req.body.eimg ?? false;

  const nf_size = req.body.nf_size ?? -1;
  const nf_unit = req.body.nf_unit ?? -1;

  const nf_cal = req.body.nf_cal ?? -1;
  const nf_fatcal = req.body.nf_fatcal ?? -1;

  const nf_totalf = req.body.nf_totalf ?? -1;
  const nf_totalfp = req.body.nf_totalfp ?? -1;
  const nf_sf = req.body.nf_sf ?? -1;
  const nf_sfp = req.body.nf_sfp ?? -1;
  const nf_tf = req.body.nf_tf ?? -1;

  const nf_chol = req.body.nf_chol ?? -1;
  const nf_cholp = req.body.nf_cholp ?? -1;
  const nf_sodium = req.body.nf_sodium ?? -1;
  const nf_sodiump = req.body.nf_sodiump ?? -1;

  const nf_totalcar = req.body.nf_totalcar ?? -1;
  const nf_totalcarp = req.body.nf_totalcarp ?? -1;
  const nf_diefib = req.body.nf_diefib ?? -1;
  const nf_diefibp = req.body.nf_diefibp ?? -1;
  const nf_sugars = req.body.nf_sugars ?? -1;

  const nf_protein = req.body.nf_protein ?? -1;

  const nf_vitaa = req.body.nf_vitaa ?? -1;
  const nf_vitac = req.body.nf_vitac ?? -1;
  const nf_calcium = req.body.nf_calcium ?? -1;
  const nf_iron = req.body.nf_iron ?? -1;

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');

    // find if id exist
    const resRecipeEntry = await dbcc.findOne(
      { _id: id }
    );
    // if get result
    if (resRecipeEntry) {
      console.log(`[apiv1] id: ${id} | found in db, cannot INSERT`);
      res.status(400).send(`[apiv1] id: ${id} | found in db, cannot INSERT`);
      return;
    }

    await dbcc.insertOne(
      {
        _id: id,
        allerg: allerg,
        desc: desc,
        eimg: eimg,
        ingredjson: ingredjson,
        ingredstr: ingredstr,
        piccode: piccode,
        title: title,
        nf_cal: nf_cal,
        nf_calcium: nf_calcium,
        nf_chol: nf_chol,
        nf_cholp: nf_cholp,
        nf_diefib: nf_diefib,
        nf_diefibp: nf_diefibp,
        nf_fatcal: nf_fatcal,
        nf_iron: nf_iron,
        nf_protein: nf_protein,
        nf_sf: nf_sf,
        nf_sfp: nf_sfp,
        nf_size: nf_size,
        nf_sodium: nf_sodium,
        nf_sodiump: nf_sodiump,
        nf_sugars: nf_sugars,
        nf_tf: nf_tf,
        nf_totalcar: nf_totalcar,
        nf_totalcarp: nf_totalcarp,
        nf_totalf: nf_totalf,
        nf_totalfp: nf_totalfp,
        nf_unit: nf_unit,
        nf_vitaa: nf_vitaa,
        nf_vitac: nf_vitac,
      }
    );

    console.log(`[apiv1] id: ${id} | has been INSERTED`);
    res.status(201).send(`[apiv1] id: ${id} | has been INSERTED`);
    return;
  } catch (e) {
    console.log(e);
    next();
  }
});

// PUT router
const urlPut = '/recipes/basic/:id';
router.put(urlGet, basicLimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_RECIPES_BASIC;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  // set all fields
  const id = req.params.id ?? '';
  if (id == '' || isNaN(parseInt(id)) || id.length != 6) {
    console.log(`[apiv1] *** Invalid id: ${id} ***`);
    res.status(400).send('Please use VALID id: a string representing int digits of length 6');
    return;
  }

  const title = req.body.title ?? ''
  const desc = req.body.desc ?? '';
  const allerg = req.body.allerg ?? [];

  const ingredjson = req.body.ingredjson ?? null;
  const ingredstr = req.body.ingredstr ?? '';

  const piccode = req.body.piccode ?? [];

  const eimg = req.body.eimg ?? false;

  const nf_size = req.body.nf_size ?? -1;
  const nf_unit = req.body.nf_unit ?? -1;

  const nf_cal = req.body.nf_cal ?? -1;
  const nf_fatcal = req.body.nf_fatcal ?? -1;

  const nf_totalf = req.body.nf_totalf ?? -1;
  const nf_totalfp = req.body.nf_totalfp ?? -1;
  const nf_sf = req.body.nf_sf ?? -1;
  const nf_sfp = req.body.nf_sfp ?? -1;
  const nf_tf = req.body.nf_tf ?? -1;

  const nf_chol = req.body.nf_chol ?? -1;
  const nf_cholp = req.body.nf_cholp ?? -1;
  const nf_sodium = req.body.nf_sodium ?? -1;
  const nf_sodiump = req.body.nf_sodiump ?? -1;

  const nf_totalcar = req.body.nf_totalcar ?? -1;
  const nf_totalcarp = req.body.nf_totalcarp ?? -1;
  const nf_diefib = req.body.nf_diefib ?? -1;
  const nf_diefibp = req.body.nf_diefibp ?? -1;
  const nf_sugars = req.body.nf_sugars ?? -1;

  const nf_protein = req.body.nf_protein ?? -1;

  const nf_vitaa = req.body.nf_vitaa ?? -1;
  const nf_vitac = req.body.nf_vitac ?? -1;
  const nf_calcium = req.body.nf_calcium ?? -1;
  const nf_iron = req.body.nf_iron ?? -1;

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');

    // find if id exist
    const resRecipeEntry = await dbcc.findOne(
      { _id: id }
    );
    // if get no result
    if (!resRecipeEntry) {
      console.log(`[apiv1] id: ${id} | NO found in db, cannot UPDATE`);
      res.status(400).send(`[apiv1] id: ${id} | NO found in db, cannot UPDATE`);
      return;
    }

    await dbcc.updateOne(
      { _id: id },
      {
        allerg: allerg,
        desc: desc,
        eimg: eimg,
        ingredjson: ingredjson,
        ingredstr: ingredstr,
        piccode: piccode,
        title: title,
        nf_cal: nf_cal,
        nf_calcium: nf_calcium,
        nf_chol: nf_chol,
        nf_cholp: nf_cholp,
        nf_diefib: nf_diefib,
        nf_diefibp: nf_diefibp,
        nf_fatcal: nf_fatcal,
        nf_iron: nf_iron,
        nf_protein: nf_protein,
        nf_sf: nf_sf,
        nf_sfp: nf_sfp,
        nf_size: nf_size,
        nf_sodium: nf_sodium,
        nf_sodiump: nf_sodiump,
        nf_sugars: nf_sugars,
        nf_tf: nf_tf,
        nf_totalcar: nf_totalcar,
        nf_totalcarp: nf_totalcarp,
        nf_totalf: nf_totalf,
        nf_totalfp: nf_totalfp,
        nf_unit: nf_unit,
        nf_vitaa: nf_vitaa,
        nf_vitac: nf_vitac,
      }
    );

    console.log(`[apiv1] id: ${id} | has been UPDATED`);
    res.status(200).send(`[apiv1] id: ${id} | has been UPDATED`);
    return;
  } catch (e) {
    console.log(e);
    next();
  }
});

// DELETE router
const urlDelete = '/recipes/basic/:id';
router.delete(urlGet, basicLimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_RECIPES_BASIC;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  const id = req.params.id ?? '';
  if (id == '' || isNaN(parseInt(id)) || id.length != 6) {
    console.log(`[apiv1] *** Invalid id: ${id} ***`);
    res.status(400).send('Please use VALID id: a string representing int digits of length 6');
    return;
  }

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');

    // find if id exist
    const resRecipeEntry = await dbcc.findOne(
      { _id: id }
    );
    // if get no result
    if (!resRecipeEntry) {
      console.log(`[apiv1] id: ${id} | NO found in db, cannot DELETE`);
      res.status(400).send(`[apiv1] id: ${id} | NO found in db, cannot DELETE`);
      return;
    }

    await dbcc.deleteOne(
      { _id: id }
    );

    console.log(`[apiv1] id: ${id} | has been DELETED`);
    res.status(204).send(`[apiv1] id: ${id} | has been DELETED`);
  } catch (e) {
    console.log(e);
    next();
  }
});

// PATCH router
const urlPatch = '/recipes/basic/:id';
router.patch(urlGet, basicLimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_RECIPES_BASIC;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  // set all fields
  const id = req.params.id ?? '';
  if (id == '' || isNaN(parseInt(id)) || id.length != 6) {
    console.log(`[apiv1] *** Invalid id: ${id} ***`);
    res.status(400).send('Please use VALID id: a string representing int digits of length 6');
    return;
  }

  let patchjson = {};
  const dbfields = ['title', 'desc', 'allerg', 'ingredjson', 'ingredstr',
    'piccode', 'eimg', 'nf_size', 'nf_unit', 'nf_cal', 'nf_fatcal',
    'nf_totalf', 'nf_totalfp', 'nf_sf', 'nf_sfp', 'nf_tf', 'nf_chol',
    'nf_cholp', 'nf_sodium', 'nf_sodiump', 'nf_totalcar', 'nf_totalcarp',
    'nf_diefib', 'nf_diefibp', 'nf_sugars', 'nf_protein', 'nf_vitaa',
    'nf_vitac', 'nf_calcium'];
  for (const ele of dbfields) {
    if (ele in req.body) {
      patchjson[ele] = req.body[ele];
    }
  }

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');

    // find if id exist
    const resRecipeEntry = await dbcc.findOne(
      { _id: id }
    );
    // if get no result
    if (!resRecipeEntry) {
      console.log(`[apiv1] id: ${id} | NO found in db, cannot PATCH`);
      res.status(400).send(`[apiv1] id: ${id} | NO found in db, cannot PATCH`);
      return;
    }

    await dbcc.updateOne(
      { _id: id },
      patchjson
    );

    console.log(`[apiv1] id: ${id} | has been PATCHED`);
    res.status(200).send(`[apiv1] id: ${id} | has been PATCHED`);
    return;
  } catch (e) {
    console.log(e);
    next();
  }
});

export default router;
