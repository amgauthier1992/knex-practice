require('dotenv').config()
const knex = require('knex')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL
})

console.log('knex and driver installed correctly');

//use node ./src/drills.js to run

// 1. Get all items that contain text

// A function that takes one parameter for searchTerm which will be any string
// The function will query the shopping_list table using Knex methods and 
// select the rows which have a name that contains the searchTerm using a case 
// insensitive match.

function searchByProductName(searchTerm) {
knexInstance
    .select('*') 
    .from('shopping_list')
    .where('name', 'ILIKE', `%${searchTerm}%`)
    .then(result => {
        console.log('SEARCH TERM', { searchTerm })
        console.log(result)
    })
}

searchByProductName('Tofurkey');

// 2. Get all items paginated

// A function that takes one parameter for pageNumber which will be a number
// The function will query the shopping_list table using Knex methods and select 
// the pageNumber page of rows paginated to 6 items per page.

function paginateProducts(pageNumber) {
    const productsPerPage = 6
    const offset = productsPerPage * (pageNumber - 1)
    knexInstance
      .select('*')
      .from('shopping_list')
      .limit(productsPerPage)
      .offset(offset)
      .then(result => {
        console.log('PAGINATE ITEMS', { pageNumber })
        console.log(result)
      })
  }

paginateProducts(4)

// 3. Get all items added after date

// A function that takes one parameter for daysAgo which will be a number 
// representing a number of days. This function will query the shopping_list table 
// using Knex methods and select the rows which have a date_added that is greater
// than the daysAgo.

function getItemsAddedAfterDate(daysAgo) {
    knexInstance
      .select('product_id','name', 'price', 'date_added', 'checked', 'category')
      .from('shopping_list')
      .where(
        'date_added',
        '>',
        knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo)
      )
      .then(result => {
        console.log('PRODUCTS ADDED DAYS AGO')
        console.log(result)
      })
}
  
    getItemsAddedAfterDate(30)


// 4. Get the total cost for each category

// A function that takes no parameters
// The function will query the shopping_list table using Knex methods and select 
// the rows grouped by their category and showing the total price for each category.

function costPerCategory() {
    knexInstance
    .select('category')
    .sum('price as total') //renames price column to total? 
    .from('shopping_list') 
    .groupBy('category') 
    .then(result => {
        console.log('Cost per category')
        console.log(result)
    })
}

costPerCategory();