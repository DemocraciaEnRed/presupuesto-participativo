// Ejecutar haciendo túnel con servidor mongo a localhost:26017 y después:
// mongo --quiet localhost:26017/ppunr-prod dump-users-no-validados.js > ppunr-facultades-usuarios-no-validados.csv

print('Nombre,Apellido,Email,Fecha registración')

db.users.find({emailValidated: false, createdAt: { "$gte" : new Date("2020-07-31")}}).sort({createdAt: -1}).forEach(u => {
	let d = u.createdAt 
	d.setHours(d.getHours() - 3)
	print(
		`${u.firstName},` +
		`${u.lastName},` +
		`${u.email},` +
		`${d.toISOString()}` 
	)
})
