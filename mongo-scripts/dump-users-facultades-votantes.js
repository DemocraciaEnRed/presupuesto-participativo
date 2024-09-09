/* Ejecutar haciendo túnel con servidor mongo a localhost:26017 y después:
mongo --quiet localhost:26017/ppunr-prod dump-users-facultades.js > ppunr-facultades-usuarios.csv
*/

print('Nombre,Apellido,Email,DNI,Facultad,Claustro,Fecha de registro,Validado')

db.users.aggregate([
  {$match: { emailValidated : true } },
  // hacemos joins
  {$lookup: {
    from:'claustros',
    localField:'claustro',
    foreignField:'_id',
    as:'claustro'
  }},
  {$lookup: {
    from:'facultades',
    localField:'facultad',
    foreignField:'_id',
    as:'facultad'
  }},
  {$unwind: {path:'$claustro'} },
  {$unwind: {path:'$facultad'} },
  {$sort: {createdAt: -1}}
]).forEach(u => {
        if (!db.votes.findOne({author:u._id}))
                return

	let d = u.createdAt 
	// convertimos a GMT-3
	d.setHours(d.getHours() - 3)
	print(
		`${u.firstName},` +
		`${u.lastName},` +
		`${u.email},` +
		`${u.dni},` +
		`${u.facultad.abreviacion},` +
		`${u.claustro.nombre},` +
		`${d.toISOString()},` + 
		`${u.emailValidated?'S':'N'}`
	)
})
