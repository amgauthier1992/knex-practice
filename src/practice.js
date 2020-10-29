require('dotenv').config() //lets us grab values from .env
const knex = require('knex')

//we use the instance to connect to the database
//Knex instance methods return promise like objects for building queries. 
const knexInstance = knex({
  client: 'pg',
//connection: 'postgresql://dunder_mifflin@localhost/knex-practice', ***MOVED INTO .env***

//Note: If you set a password for the user dunder_mifflin you will need to specify the connection like so:
//connection: 'postgresql://dunder_mifflin:password-here@localhost/knex-practice',  

  connection: process.env.DB_URL //referencing env variable for connection string
})

console.log('knex and driver installed correctly');
// const q1 = knexInstance('amazong_products').select('*').toQuery()
// const q2 = knexInstance.from('amazong_products').select('*').toQuery()
// console.log('q1:', q1)
// console.log('q2:', q2)

// Create explicit form of the query we built above. And let's use .then with a callback (result) to perform the query and console.log the result of the query:
knexInstance.from('amazong_products').select('*')  //selecting all products from amazong
   .then(result => {
     console.log(result)
})
//Note: this is the first point in time that our Node script attempts to connect to the database. 
//You may see errors if the connection string is incorrect, if the database doesn't exist, or if the table doesn't exist.

//to run use node ./src/practice.js or npm start (as we made the node command our start script)

//Let's modify the query to select the identifier, name, price, and category of one product. We'll build a query equivalent to this:

// SELECT product_id, name, price, category
//   FROM amazong_products
// WHERE name = 'Point of view gun';

// We will specify the columns to select instead of using "all" ('*') and we'll chain the .where method to specify which name we want to select. Here's the full query:

const qry = knexInstance
  .select('product_id', 'name', 'price', 'category')
  .from('amazong_products')
  .where({ name: 'Point of view gun' })
  .first()
  .toQuery()
//   .then(result => {
//     console.log(result)
//   })

console.log(qry)

//select "product_id", "name", "price", "category" from 
//"amazong_products" where "name" = 'Point of view gun' limit 1

//Running the script here you'll see a console output that added 
//a limit 1 to the query and thus improved the performance slightly!

//Now we need to build this query in knex. 
//We can pass 3 arguments to the .where() operator:

// const searchTerm = 'holo'
function searchByProduceName(searchTerm) {
knexInstance
  .select('product_id', 'name', 'price', 'category')
  .from('amazong_products')
  .where('name', 'ILIKE', `%${searchTerm}%`)
  .then(result => {
    console.log(result)
  })
}
searchByProduceName('holo')

//We'll put it in a function that accepts the searchTerm as a 
//parameter (as we dont know the search term yet) so that we
//can use that our employer decides when theyre ready.^^

function paginateProducts(page) {
  const productsPerPage = 10
  const offset = productsPerPage * (page - 1)
  knexInstance
    .select('product_id', 'name', 'price', 'category')
    .from('amazong_products')
    .limit(productsPerPage)
    .offset(offset)
    .then(result => {
      console.log(result)
    })
}

paginateProducts(2)

function getProductsWithImages() {
  knexInstance
    .select('product_id', 'name', 'price', 'category', 'image')
    .from('amazong_products')
    .whereNotNull('image')
    .then(result => {
      console.log(result)
    })
}

getProductsWithImages()

function mostPopularVideosForDays(days) {
  knexInstance
    .select('video_name', 'region')
    .count('date_viewed AS views')
    .where(
      'date_viewed',
      '>',
      knexInstance.raw(`now() - '?? days'::INTERVAL`, days)
    )
    .from('whopipe_video_views')
    .groupBy('video_name', 'region')
    .orderBy([
      { column: 'region', order: 'ASC' },
      { column: 'views', order: 'DESC' },
    ])
    .then(result => {
      console.log(result)
    })
}

mostPopularVideosForDays(30)