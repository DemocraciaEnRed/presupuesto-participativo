db.users.updateMany({emailValidated: false},{$set:{emailValidated: true}})
