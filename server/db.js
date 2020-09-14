// Copyright (c) 2020 Qingpeng Li. All rights reserved.
// Author: qingpeng9802@gmail.com (Qingpeng Li).

'use strict';

import mongoc from 'mongodb';
const { MongoClient } = mongoc;

export let client = null;

// establish a connection to mongodb
export async function connect(url) {
  return new Promise(async (resolve, reject) => {
    if (client) {
      console.log('[Mongodb Client] Connection has been established before!');
      resolve();
    }
    client = new MongoClient(url, { useUnifiedTopology: true });
    let res = await client.connect();
    console.log('[Mongodb Client] Connected successfully.');
    resolve();
  });
}

// get a specified database by name
export function db(dbName) {
  return client.db(dbName);
}

// close the connection
export async function close() {
  if (client) {
    await client.close();
    client = null;
    console.log('[Mongodb Client] Connection closed successfully.');
    return;
  } else {
    console.log('[Mongodb Client] *** No connection can be closed ***');
    return;
  }
}

