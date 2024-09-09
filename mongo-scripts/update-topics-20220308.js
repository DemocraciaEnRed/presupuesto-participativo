/* 
  Inicialmente no se estaba almacenando la Zona en el Topic
  De manera preventiva a futuro se actualizan los Topics agregandole la zona del usuario que lo cargo
*/

print('-- Updating topics --');

db.topics.find().forEach(t => {

  if (!t.zona) {
    const topicId = t._id
    const zonaId = db.users.findOne({ _id: t.owner}).zona
    if (zonaId) {
      db.topics.updateOne({"_id": topicId},
          { 
            $set: {
              "zona" : zonaId
            }
          }
      )
      print(` Updating topic ${topicId} => Add zona: ${zonaId}`);
    }
  }

});

print('-- Done --');

