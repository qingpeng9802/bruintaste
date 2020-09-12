// move a collection to another collection of different db
db.recipes.find().forEach(
  function(d){
    db.getSiblingDB('<new_database>')['recipes'].insert(d); 
  }
);