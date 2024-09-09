const dbReady = require('lib/models').ready
const models = require('lib/models')

const nombreMigrationParaLog = 'cargar nuevas zonas'
const Zona = models.Zona



// Barrios
const barrios = [
  {
    "barrio": "Alem de Playa Grande",
    "zona": "Zona 1"
  },
  {
    "barrio": "Centro",
    "zona": "Zona 1"
  },
  {
    "barrio": "Divino Rostro",
    "zona": "Zona 1"
  },
  {
    "barrio": "Gral. Roca",
    "zona": "Zona 1"
  },
  {
    "barrio": "La Perla",
    "zona": "Zona 1"
  },
  {
    "barrio": "Lomas de Stella Maris",
    "zona": "Zona 1"
  },
  {
    "barrio": "Nueva Pompeya",
    "zona": "Zona 1"
  },
  {
    "barrio": "Parque Luro",
    "zona": "Zona 1"
  },
  {
    "barrio": "Playa Grande",
    "zona": "Zona 1"
  },
  {
    "barrio": "Plaza Mitre",
    "zona": "Zona 1"
  },
  {
    "barrio": "Primera Junta",
    "zona": "Zona 1"
  },
  {
    "barrio": "San Carlos",
    "zona": "Zona 1"
  },
  {
    "barrio": "Tribunales",
    "zona": "Zona 1"
  },
  {
    "barrio": "Constitución",
    "zona": "Zona 1"
  },  
  {
    "barrio": "Arroyo Chapadmalal",
    "zona": "Zona 10"
  },
  {
    "barrio": "Barrancas de San Benito",
    "zona": "Zona 10"
  },
  {
    "barrio": "El Marquesado",
    "zona": "Zona 10"
  },
  {
    "barrio": "Highland Park",
    "zona": "Zona 10"
  },
  {
    "barrio": "La Estafeta",
    "zona": "Zona 10"
  },
  {
    "barrio": "Marayui",
    "zona": "Zona 10"
  },
  {
    "barrio": "Playa Chapadmalal",
    "zona": "Zona 10"
  },
  {
    "barrio": "Playa Los Lobos",
    "zona": "Zona 10"
  },
  {
    "barrio": "San Eduardo de Chapadmalal",
    "zona": "Zona 10"
  },
  {
    "barrio": "San Eduardo del Mar",
    "zona": "Zona 10"
  },
  {
    "barrio": "La Germana",
    "zona": "Zona 11"
  },
  {
    "barrio": "La Gloria de la Peregrina",
    "zona": "Zona 11"
  },
  {
    "barrio": "La Peregrina",
    "zona": "Zona 11"
  },
  {
    "barrio": "Santa Paula",
    "zona": "Zona 11"
  },
  {
    "barrio": "Sierra de los Padres",
    "zona": "Zona 11"
  },
  {
    "barrio": "Bernardino Rivadavia",
    "zona": "Zona 2"
  },
  {
    "barrio": "Don Bosco",
    "zona": "Zona 2"
  },
  {
    "barrio": "Estación Norte",
    "zona": "Zona 2"
  },
  {
    "barrio": "Funes y San Lorenzo",
    "zona": "Zona 2"
  },
  {
    "barrio": "Los Andes",
    "zona": "Zona 2"
  },
  {
    "barrio": "Los Pinares",
    "zona": "Zona 2"
  },
  {
    "barrio": "Pinos de Anchorena",
    "zona": "Zona 2"
  },
  {
    "barrio": "Plaza Peralta Ramos",
    "zona": "Zona 2"
  },
  {
    "barrio": "San José",
    "zona": "Zona 2"
  },
  {
    "barrio": "San Juan",
    "zona": "Zona 2"
  },
  {
    "barrio": "Sarmiento",
    "zona": "Zona 2"
  },
  {
    "barrio": "Villa Primera",
    "zona": "Zona 2"
  },
  {
    "barrio": "Caisamar",
    "zona": "Zona 2"
  },  
  {
    "barrio": "Alfar",
    "zona": "Zona 3"
  },
  {
    "barrio": "Bosque Peralta Ramos",
    "zona": "Zona 3"
  },
  {
    "barrio": "Colinas de Peralta Ramos",
    "zona": "Zona 3"
  },
  {
    "barrio": "Faro Norte",
    "zona": "Zona 3"
  },
  {
    "barrio": "Las Avenidas",
    "zona": "Zona 3"
  },
  {
    "barrio": "Peralta Ramos Oeste",
    "zona": "Zona 3"
  },
  {
    "barrio": "Puerto",
    "zona": "Zona 3"
  },
  {
    "barrio": "Punta Mogotes",
    "zona": "Zona 3"
  },
  {
    "barrio": "Villa Lourdes",
    "zona": "Zona 3"
  },
  {
    "barrio": "Belisario Roldán",
    "zona": "Zona 4"
  },
  {
    "barrio": "Cnel. Dorrego",
    "zona": "Zona 4"
  },
  {
    "barrio": "Las Lilas",
    "zona": "Zona 4"
  },
  {
    "barrio": "López de Gomara",
    "zona": "Zona 4"
  },
  {
    "barrio": "Malvinas Argentinas",
    "zona": "Zona 4"
  },
  {
    "barrio": "Nueve de Julio",
    "zona": "Zona 4"
  },
  {
    "barrio": "Regional",
    "zona": "Zona 4"
  },
  {
    "barrio": "San Cayetano",
    "zona": "Zona 4"
  },
  {
    "barrio": "Bosque Alegre",
    "zona": "Zona 5"
  },
  {
    "barrio": "Bosque Grande",
    "zona": "Zona 5"
  },
  {
    "barrio": "El Gaucho",
    "zona": "Zona 5"
  },
  {
    "barrio": "El Martillo",
    "zona": "Zona 5"
  },
  {
    "barrio": "Fortunato de la Plaza",
    "zona": "Zona 5"
  },
  {
    "barrio": "Gral. Pueyrredon",
    "zona": "Zona 5"
  },
  {
    "barrio": "Las Heras",
    "zona": "Zona 5"
  },
  {
    "barrio": "San Antonio",
    "zona": "Zona 5"
  },
  {
    "barrio": "Santa Mónica",
    "zona": "Zona 5"
  },
  {
    "barrio": "Santa Rita",
    "zona": "Zona 5"
  },
  {
    "barrio": "Aeroparque",
    "zona": "Zona 6"
  },
  {
    "barrio": "Alto Camet",
    "zona": "Zona 6"
  },
  {
    "barrio": "Colonia Barragán",
    "zona": "Zona 6"
  },
  {
    "barrio": "Dos de Abril",
    "zona": "Zona 6"
  },
  {
    "barrio": "El Tejado",
    "zona": "Zona 6"
  },
  {
    "barrio": "Estación Camet",
    "zona": "Zona 6"
  },
  {
    "barrio": "Felix U. Camet",
    "zona": "Zona 6"
  },
  {
    "barrio": "Fray Luis Beltrán",
    "zona": "Zona 6"
  },
  {
    "barrio": "La Florida",
    "zona": "Zona 6"
  },
  {
    "barrio": "La Trinidad",
    "zona": "Zona 6"
  },
  {
    "barrio": "Las Margaritas",
    "zona": "Zona 6"
  },
  {
    "barrio": "Parque Camet",
    "zona": "Zona 6"
  },
  {
    "barrio": "Parque El Casal",
    "zona": "Zona 6"
  },
  {
    "barrio": "Parque Montemar El Grosellar",
    "zona": "Zona 6"
  },
  {
    "barrio": "Zacagnini",
    "zona": "Zona 6"
  },
  {
    "barrio": "Caribe",
    "zona": "Zona 7"
  },
  {
    "barrio": "F. Ameghino",
    "zona": "Zona 7"
  },
  {
    "barrio": "Feliz",
    "zona": "Zona 7"
  },
  {
    "barrio": "Hipódromo",
    "zona": "Zona 7"
  },
  {
    "barrio": "La Herradura",
    "zona": "Zona 7"
  },
  {
    "barrio": "Libertad",
    "zona": "Zona 7"
  },
  {
    "barrio": "Los Tilos",
    "zona": "Zona 7"
  },
  {
    "barrio": "Newbery",
    "zona": "Zona 7"
  },
  {
    "barrio": "San Jorge",
    "zona": "Zona 7"
  },
  {
    "barrio": "Santa Rosa de Lima",
    "zona": "Zona 7"
  },
  {
    "barrio": "Virgen de Luján",
    "zona": "Zona 7"
  },
  {
    "barrio": "Autódromo",
    "zona": "Zona 8"
  },
  {
    "barrio": "Batán - La Avispa",
    "zona": "Zona 8"
  },
  {
    "barrio": "Camino a Necochea",
    "zona": "Zona 8"
  },
  {
    "barrio": "Colinalegre",
    "zona": "Zona 8"
  },
  {
    "barrio": "Don Emilio",
    "zona": "Zona 8"
  },
  {
    "barrio": "El Boquerón",
    "zona": "Zona 8"
  },
  {
    "barrio": "Estación Chapadmalal",
    "zona": "Zona 8"
  },
  {
    "barrio": "Gral. Belgrano",
    "zona": "Zona 8"
  },
  {
    "barrio": "José Hernández",
    "zona": "Zona 8"
  },
  {
    "barrio": "La Unión Batán",
    "zona": "Zona 8"
  },
  {
    "barrio": "Las Américas",
    "zona": "Zona 8"
  },
  {
    "barrio": "Parque Hermoso",
    "zona": "Zona 8"
  },
  {
    "barrio": "Parque Palermo",
    "zona": "Zona 8"
  },
  {
    "barrio": "Cerrito y San Salvador",
    "zona": "Zona 3"
  },
  {
    "barrio": "El Progreso",
    "zona": "Zona 3"
  },
  {
    "barrio": "Termas Huinco",
    "zona": "Zona 3"
  },
  {
    "barrio": "Antartida Argentina",
    "zona": "Zona 9"
  },
  {
    "barrio": "Arenas del Sur",
    "zona": "Zona 9"
  },
  {
    "barrio": "Cerrito Sur",
    "zona": "Zona 9"
  },
  {
    "barrio": "Costa Azul",
    "zona": "Zona 9"
  },
  {
    "barrio": "Don Diego",
    "zona": "Zona 9"
  },
  {
    "barrio": "Florencio Sanchez",
    "zona": "Zona 9"
  },
  {
    "barrio": "Gral. San Martín",
    "zona": "Zona 9"
  },
  {
    "barrio": "Jardín de Peralta Ramos",
    "zona": "Zona 9"
  },
  {
    "barrio": "Jardín de Stella Maris",
    "zona": "Zona 9"
  },
  {
    "barrio": "Juramento",
    "zona": "Zona 9"
  },
  {
    "barrio": "Las Canteras",
    "zona": "Zona 9"
  },
  {
    "barrio": "Las Retamas",
    "zona": "Zona 9"
  },
  {
    "barrio": "Lomas de San Patricio",
    "zona": "Zona 9"
  },
  {
    "barrio": "Lomas del Golf",
    "zona": "Zona 9"
  },
  {
    "barrio": "Los Acantilados",
    "zona": "Zona 9"
  },
  {
    "barrio": "Mar y Sol",
    "zona": "Zona 9"
  },
  {
    "barrio": "Nuevo Golf",
    "zona": "Zona 9"
  },
  {
    "barrio": "Parque Independencia",
    "zona": "Zona 9"
  },
  {
    "barrio": "Playa Serena",
    "zona": "Zona 9"
  },
  {
    "barrio": "Quebradas de Peralta Ramos",
    "zona": "Zona 9"
  },
  {
    "barrio": "Rumencó",
    "zona": "Zona 9"
  },
  {
    "barrio": "San Jacinto",
    "zona": "Zona 9"
  },
  {
    "barrio": "San Patricio",
    "zona": "Zona 9"
  },
  {
    "barrio": "Santa Celina",
    "zona": "Zona 9"
  },
  {
    "barrio": "Santa Rosa del Mar de Peralta Ramos",
    "zona": "Zona 9"
  },
  {
    "barrio": "Zona Cementerio Parque",
    "zona": "Zona 9"
  }
]








/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  // done() devuelve al Migrator de lib/migrations
  dbReady()

    // Tomamos las zonas y agregamos los barrios de cada una
    .then(() => Zona.collection.find().forEach(zona => {
      const zonaBarrios = barrios.filter(barrio => barrio.zona === zona.nombre).map(barrio => barrio.barrio)
      Zona.collection.update({ _id: zona._id }, { $set: { barrios: zonaBarrios }});
    }))

    // Todo OK
    .then(() => {
      console.log(`-- Migración ${nombreMigrationParaLog} exitosa`)
      done()
    })
    // Error
    .catch((err) => {
      console.log(`-- Migración ${nombreMigrationParaLog} no funcionó! Error: ${err}`)
      done(err)
    })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
