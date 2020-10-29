//Create, Read, Update, Delete  / GET,INSERT,UPDATE,DELETE

const ShoppingListService = {
    getAllProducts(knex){
        //we create a dummy table in our test DB which mirrors the table in the real DB
        //we dont want to modify the data in our production database table.
        return knex.select('*').from('shopping_list') //select all query from shopping_list
    },
    getProductById(knex, productId) {
        //select all where 'id' === productId. Why is it written like the 1st 'id' is an argument and
        //the 2nd productId looks like a parameter? What does .first() do?
        return knex.from('shopping_list').select('*').where('id', productId).first() 
    },
    insertProduct(knex, newProduct){
        return knex
          .insert(newProduct)  //method that accepts an item (object for new product in our case) to insert
          .into('shopping_list') //into our shopping_list dummy table
          .returning('*') // selects the columns we want to select. This method selects an array
          //with one index/object (the product we want to add)
          .then(rows => { // in order for our test to pass (expected needs to deep equal actual as it's an
          //object we need to extract the first index of our array. 
            return rows[0]
          })
    },
    updateProduct(knex, productId, newProductFields){
        return knex('shopping_list')
          .where({ productId })
          .update(newProductFields)
    },
    deleteProduct(knex, productId){
        return knex('shopping_list')
          .where({ productId })
          .delete()
    },
}

module.exports = ShoppingListService;