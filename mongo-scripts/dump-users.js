/* 
Abrir túnel con servidor mongo a localhost:26017
ssh -NL 26017:127.0.0.1:27032 SERVIDOR

y después ejecutar script:
mongo --quiet localhost:26017/BASE_DE_DATOS dump-users.js > ARCHIVO.csv
*/

print('Nombre,Apellido,Email,Fecha de registro,Validado')

//db.users.aggregate([
//  {$sort: {createdAt: -1}}
db.users.find().forEach(u => {
	var d = u.createdAt 
	// convertimos a GMT-3
	d.setHours(d.getHours() - 3)
	print(
		`${u.firstName},` +
		`${u.lastName},` +
		`${u.email},` +
		`${d.toISOString()},` + 
		`${u.emailValidated?'S':'N'}`
	)
})
