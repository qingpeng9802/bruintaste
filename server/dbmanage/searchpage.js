db.recipes.explain("executionStats").aggregate([
  {
    $search: {
      "index": 'stringTiInDeAlPic',
      "text": {
        fuzzy: {}, 
        path: ['title', 'ingredstr', 'desc'],
        query: 'ja'
      },
      "highlight": { "path": ['title', 'ingredstr', 'desc'] }
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
    $skip: 500
  },
  {
    $limit: 100
  }
]);