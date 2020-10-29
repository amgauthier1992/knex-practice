//Making a service object first involves making an object that
//we'll export.

//****We'll put methods on this object that store our CRUD transactions. 
//The first method is for getting all articles, let's call it 
//getAllArticles*****

const ArticlesService = {
    getAllArticles(knex) {
        return knex.select('*').from('blogful_articles')
    },
    insertArticle(knex, newArticle) {
        return knex
          .insert(newArticle)
          .into('blogful_articles')
          .returning('*')
          .then(rows => {
            return rows[0]
          })
    },
    getById(knex, id) {
        return knex.from('blogful_articles').select('*').where('id', id).first()
    },
    deleteArticle(knex, id) {
        return knex('blogful_articles')
          .where({ id })
          .delete()
    },
    updateArticle(knex, id, newArticleFields) {
        return knex('blogful_articles')
          .where({ id })
          .update(newArticleFields)
    },
}

//The getAllArticles will need access to the Knex instance. We can "inject" the db variable 
//here to achieve this. We update the test code to inject the Knex instance (db).

module.exports = ArticlesService;

//Right now, the Knex instance is created inside the main file, 
//blogful.js, by using the knex() function.

//The blogful file requires the article service and if the 
//service then needs the Knex instance, it would need to require 
//it from the blogful file. This circle of requires back and forth
//creates a dependency cycle. WE WANT TO AVOID THIS.

//The point at which you require the file is the point at which 
//your application prepares the connection to the database. 
//By putting the knex instance in its own file, This would make 
//preparing the connection to the database "implicit" rather than 
//"explicit".

// Connecting to the database is considered a "side-effect" as it 
//can change the state of the environment. We prefer side-effects 
//to be explicit or contained in one place that's easy to find. 

//Typically, the file or unit of code that starts up an application 
// is called the application "main" or "controller". The "controller" 
// is a good place to trigger your side-effects as it makes 
//the connection more explicit. We want to "inject" the instance into
//the service.

// In this solution, we would keep the knex() call inside the controller 
// file, blogful.js. The side effect is still explicit inside the 
// "controller" file. How does the ArticlesService get access to the 
// Knex instance though? The knexInstance is a variable and we've passed
// variables between files plenty before. We use function arguments. 
//We can make the Knex instance a parameter for each of the 
//ArticlesService's methods.