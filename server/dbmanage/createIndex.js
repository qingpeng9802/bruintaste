// create compound text index
db.recipes.createIndex(
  { "$**": "text" },
  {
    weights: {
      title: 100,
      ingredstr: 50,
      desc: 30,
      allerg: 10,
      piccode: 3
    },
    name: "textindex"
  }
);

// create simple combined index

db.recipes.createIndex(
  { title: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { ingredstr: 1} ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { desc: 1} ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { allerg: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { piccode: 1 } ,
  { name: "titleIndex" }
);

// ----------------------

db.recipes.createIndex(
  { title: 1, ingredstr: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { title: 1, desc: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { title: 1, ingredstr: 1, desc: 1 } ,
  { name: "titleIndex" }
);

// ----------------------

db.recipes.createIndex(
  { title: 1, piccode: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { title: 1, desc: 1, piccode: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { title: 1, ingredstr: 1, piccode: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { ingredstr: 1, piccode: 1 } ,
  { name: "titleIndex" }
);

db.recipes.createIndex(
  { desc: 1, piccode: 1 } ,
  { name: "titleIndex" }
);
