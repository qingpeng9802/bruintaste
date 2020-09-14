// Copyright (c) 2020 Qingpeng Li. All rights reserved.
// Author: qingpeng9802@gmail.com (Qingpeng Li).

'use strict';

import * as client from '../db.js';

// protect api
import rateLimit from 'express-rate-limit';

function authkeyRecipes(str) {
  return str == process.env.API_KEY_RECIPES_SEAR ? true : false;
}

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
const urlGet = '/recipes/basic/:id';
router.get(urlGet, searchlimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_RECIPES_SEAR;
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
      { _id: id },
      {
        projection:
        {
          'ingredjson': 0
        }
      }
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

// `/recipes/:ops/:filters` router
const urlSearch = '/recipes/:ops';
router.get(urlSearch, searchlimiter, async function (req, res, next) {
  // authorization API
  const keyname = process.env.API_KEY_NAME_RECIPES_SEAR;
  if (!(keyname in req.query) || !authkeyRecipes(req.query[keyname])) {
    console.log('[apiv1] *** Using Error API Key ***');
    res.status(401).send('Please use approved keyname and keyvalue :)');
    return;
  }

  // if `ops` valid
  const validops = ['search', 'suggest', 'searchtext', 'searchcount', 'searchpage'];
  const ops = req.params.ops;

  if (!validops.includes(ops)) {
    console.log('[apiv1] *** Invalid ops ***');
    res.status(404).send('Please use correct ops :)');
    return;
  }

  const queryjson = req.query;
  const searchStr = queryjson.searchstr;

  let resjson = null;
  // dispatcher for `opss`
  switch (ops) {
    case 'search':
      resjson = await search(queryjson);
      if (resjson) {
        res.json(resjson);
        return;
      } else {
        res.status(404).send(`[apiv1/search] *** Error while founding: ${searchStr} in db ***`);
        return;
      }
      break;
    case 'searchpage':
      resjson = await searchPage(queryjson);
      if (resjson) {
        res.json(resjson);
        return;
      } else {
        res.status(404).send(`[apiv1/searchPage] *** Error while founding: ${searchStr} in db ***`);
        return;
      }
      break;
    case 'searchcount':
      resjson = await searchCount(queryjson);
      if (resjson) {
        res.json(resjson);
        return;
      } else {
        res.status(404).send(`[apiv1/searchCount] *** Error while founding: ${searchStr} in db ***`);
        return;
      }
      break;
    case 'suggest':
      resjson = await suggest(queryjson);
      if (resjson) {
        res.json(resjson);
        return;
      } else {
        res.status(404).send(`[apiv1/suggest] *** Error while founding: ${searchStr} in db ***`);
        return;
      }
      break;
    case 'searchtext':
      resjson = await searchText(queryjson);
      if (resjson) {
        res.json(resjson);
        return;
      } else {
        res.status(404).send(`[apiv1/searchText] *** Error while founding: ${searchStr} in db ***`);
        return;
      }
      break;
    default:
      console.log('[apiv1] *** This must be BUG ***');
      break;
  }
});

const searchResLimit = 50;

// get `recipeEntries` from mongodb by search word using $text
async function searchText(queryjson) {
  const searchStr = queryjson.searchstr;
  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');
    const resRecipeEntries = await dbcc.find(
      {
        $text: { $search: searchStr }
      })
      .project({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      //.limit(searchResLimit)
      .toArray();

    // if get result
    if (resRecipeEntries.length == 0) {
      console.log(`[apiv1/searchText] searchStr: ${searchStr}| NO result found in db`);
    }
    return resRecipeEntries;
  } catch (e) {
    console.log(e);
    return null;
  }
}


// get `recipeEntries` from mongodb by search word using $search
async function search(queryjson) {
  const searchStr = queryjson.searchstr;

  // if `filters` in `req.query` valid
  const validSearchFields = ['title', 'ingredstr', 'desc', 'allerg', 'piccode'];
  let textjson = {};
  if ('fuzzy' in queryjson && (queryjson['fuzzy'] == 'true')) {
    textjson.fuzzy = {};
  }
  textjson.path = [];

  for (const ele of validSearchFields) {
    if (ele in queryjson && (queryjson[ele] == 'true')) {
      textjson.path.push(ele);
    }
  }
  textjson.path.length == 0 ? textjson.path.push(validSearchFields[0]) : null;
  textjson.query = searchStr;

  const searchIndexName = "stringTiInDeAlPic";

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');
    const resRecipeEntries = await dbcc.aggregate([
      {
        $search: {
          "index": searchIndexName,
          "text": textjson,
          "highlight": { "path": textjson.path }
        }
      },
      {
        $project: {
          "title": 1,
          "desc": 1,
          "ingredstr": 1,
          'allerg': 1,
          'piccode': 1,
          'eimg': 1,
          score: { $meta: "searchScore" },
          highlights: { $meta: "searchHighlights" }
        }
      }
    ]).toArray();

    // if get result
    if (resRecipeEntries.length == 0) {
      console.log(`[apiv1/search] searchStr: ${searchStr}| NO result found in db`);
    }
    return resRecipeEntries;
  } catch (e) {
    console.log(e);
    return null;
  }
}

const suggestResLimit = 20;

// get search suggestion by setting
async function suggest(queryjson) {
  const searchStr = queryjson.searchstr;

  const validSearchFields = ['title', 'ingredstr', 'desc'];

  let suggestjson = {};
  if ('fuzzy' in queryjson && (queryjson['fuzzy'] == 'true')) {
    suggestjson.fuzzy = {};
  }
  suggestjson.path = "title";
  for (const ele of validSearchFields) {
    if (ele in queryjson && (queryjson[ele] == 'true')) {
      suggestjson.path = ele;
      break;
    }
  }

  suggestjson.query = searchStr;

  const suggestIndexName = "autocompleteTiInDe";

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');
    const resRecipeEntries = await dbcc.aggregate([
      {
        $search: {
          "index": suggestIndexName,
          "autocomplete": suggestjson
        }
      },
      {
        $limit: suggestResLimit
      },
      {
        $project: {
          [suggestjson.path]: 1
        }
      }
    ]).toArray();

    // if get result
    if (resRecipeEntries.length == 0) {
      console.log(`[apiv1/suggest] searchStr: ${searchStr}| NO result found in db`);
    }
    return resRecipeEntries;
  } catch (e) {
    console.log(e);
    return null;
  }
}

// get the count number of search result
async function searchCount(queryjson) {
  const searchStr = queryjson.searchstr;

  // if `filters` in `req.query` valid
  const validSearchFields = ['title', 'ingredstr', 'desc', 'allerg', 'piccode'];
  let textjson = {};
  if ('fuzzy' in queryjson && (queryjson['fuzzy'] == 'true')) {
    textjson.fuzzy = {};
  }
  textjson.path = [];

  for (const ele of validSearchFields) {
    if (ele in queryjson && (queryjson[ele] == 'true')) {
      textjson.path.push(ele);
    }
  }
  textjson.path.length == 0 ? textjson.path.push(validSearchFields[0]) : null;
  textjson.query = searchStr;

  const searchIndexName = "stringTiInDeAlPic";
  const countName = 'count';

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');
    const countEntry = await dbcc.aggregate([
      {
        $search: {
          "index": searchIndexName,
          "text": textjson,
          "highlight": { "path": textjson.path }
        }
      },
      {
        $count: "count"
      }
    ]).toArray();

    // if get result
    if (countEntry[0][countName] == 0) {
      console.log(`[apiv1/searchCount] searchStr: ${searchStr}| NO result found in db`);
    }
    return countEntry;
  } catch (e) {
    console.log(e);
    return null;
  }
}

// get paginated pagesearch result
async function searchPage(queryjson) {
  const skipName = 'skip';
  const limitName = 'limit';
  let skip = 0;
  let limit = 50;
  if (!(skipName in queryjson) || !(limitName in queryjson)) {
    console.log(`[apiv1/searchPage] Missing params, must have |${skipName}| and |${limitName}|`);
    return null;
  } else {
    skip = parseInt(queryjson[skipName], 10);
    limit = parseInt(queryjson[limitName], 10);
  }

  const searchStr = queryjson.searchstr;

  // if `filters` in `req.query` valid
  const validSearchFields = ['title', 'ingredstr', 'desc', 'allerg', 'piccode'];
  let textjson = {};
  if ('fuzzy' in queryjson && (queryjson['fuzzy'] == 'true')) {
    textjson.fuzzy = {};
  }
  textjson.path = [];

  for (const ele of validSearchFields) {
    if (ele in queryjson && (queryjson[ele] == 'true')) {
      textjson.path.push(ele);
    }
  }
  textjson.path.length == 0 ? textjson.path.push(validSearchFields[0]) : null;
  textjson.query = searchStr;

  const searchIndexName = "stringTiInDeAlPic";

  try {
    const dbc = client.db(process.env.DB_STR);
    const dbcc = dbc.collection('recipes');
    const resRecipeEntries = await dbcc.aggregate([
      {
        $search: {
          "index": searchIndexName,
          "text": textjson,
          "highlight": { "path": textjson.path }
        }
      },
      {
        $project: {
          "title": 1,
          "desc": 1,
          "ingredstr": 1,
          'allerg': 1,
          'piccode': 1,
          'eimg': 1,
          score: { $meta: "searchScore" },
          highlights: { $meta: "searchHighlights" }
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]).toArray();

    // if get result
    if (resRecipeEntries.length == 0) {
      console.log(`[apiv1/searchPage] searchStr: ${searchStr}| NO result found in db`);
    }
    return resRecipeEntries;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export default router;
