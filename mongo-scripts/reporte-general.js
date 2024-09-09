(function reportar(){
	print('Usuarios que iniciaron el registro etapa 1:', db.users.count({createdAt:{$lt:new Date("2020-12-10")}}) )
	ids=db.users.find({createdAt:{$lt:new Date("2020-12-10")}},{_id:1}).map(u=>u._id).toArray();
	print('Votos de usuarios etapa 1:', db.votes.count({author:{$in:ids}, value:'voto'}))

	print('Usuarios que iniciaron el registro etapa 2:', db.users.count({createdAt:{$gte:new Date("2020-12-10")}}) )
	ids=db.users.find({createdAt:{$gte:new Date("2020-12-10")}},{_id:1}).map(u=>u._id).toArray();
	print('Votos de usuarios etapa 2:', db.votes.count({author:{$in:ids}, value:'voto'}))

	print('Usuarios totales:', db.users.count())
	print('Votos totales:', db.votes.count({value:'voto'}))
})()
