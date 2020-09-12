// sort collection to another collection, then rename it
db.recipes.find().sort({_id : 1}).forEach(function(e){
  db.recipe.insert(e);
});

show collections;
// db.recipes.drop();

db.recipe.renameCollection('recipes');