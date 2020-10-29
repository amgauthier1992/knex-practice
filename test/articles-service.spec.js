const { expect } = require('chai')
const knex = require('knex')

//We want to write tests for a method called getAllArticles that 
//should retrieve all of the articles from a specific table in a 
//specific database. How can our test assert that this method works
//properly?

//1. The test needs to know what data is in the database table (exspected
//data). We can call this the "state" of the database table. The test
//should put soome data into the db and the test can be sure of the
//table's state.

//2. The test will need to call the method and check what data the method
//resolves (the actual data)

//3. The test needs to check that actual === expected. If they match,
//we know the method retrieved data from the db

//4. we should try the method when the db table is in diff states.
//so that we can be sure the method correctly reflects the table's
//state

//npm test to run the tests and see them fail
describe(`Articles service object`, function() {
    it(`should run the tests`, () => {
      expect(true).to.eql(false)
    })
})

//The method we want to test is ArticlesService.getAllArticles 
//so let's require the service, write a nested describe for this 
//method and write a test.

const ArticlesService = require('../src/articles-service')

describe(`Articles service object`, function() {
    let db 
    let testArticles = [
      {
        id: 1,
        date_published: new Date('2029-01-22T16:28:32.615Z'),
        title: 'First test post!',
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
      },
      {
        id: 2,
        date_published: new Date('2100-05-22T16:28:32.615Z'),
        title: 'Second test post!',
        content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
      },
      {
        id: 3,
        date_published: new Date('1919-12-22T16:28:32.615Z'),
        title: 'Third test post!',
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus, voluptate? Necessitatibus, reiciendis? Cupiditate totam laborum esse animi ratione ipsa dignissimos laboriosam eos similique cumque. Est nostrum esse porro id quaerat.'
      },
    ]
    
    //establish connection to the test db
    before(() => {
      db = knex({
         client: 'pg',
         comnection: process.env.TEST_DB_URL
      })
    })

    //The problem here is that every time we run the test, we insert another 3 items, so running the 
    //tests 10 times would insert 30 items. We need to clear the table so we have a fresh start
    //every time we run the tests. Truncate() removes all data from a table. 
    
    //removes all rows before we insert new test data
    before(() => db('blogful_articles').truncate())
    
    //remove all data after each test as well. 
    afterEach(() => db('blogful_articles').truncate())

    //inserts the test articles into the test db before the tests. The knexInstance.insert() 
    //method returns a promise, so we can utilize the features of mocha by returning that 
    //promise from the before callback function and mocha will wait for the SQL insert to 
    //complete before executing the tests.
    // before(() => {
    //   return db
    //     .into('blogful_articles')
    //     .insert(testArticles)
    // })

    //"destroy" the connection after tests run since Node thinks the script will want to stay
    //running while the db connection is open

    after(() => db.destroy()) //implicit return from an arrow function as .destroy() also returns a promise.

    //We can use separate describe blocks for when the database has data and when it doesn't.
    //context is a synonym for describe. We use it here because we're setting a "context"
    //of state for a group of tests a.k.a. "if the table has data".
    context(`Given 'blogful_articles' has data`, () => {
        //inserts data beforeEach test
        beforeEach(() => {
          return db
            .into('blogful_articles')
            .insert(testArticles)
        })

        it(`getAllArticles() resolves all articles from 'blogful_articles' table`, () => {
           //test that ArticlesService.getAllArticles method gets data from table
           //testArticles are our "expected" values. The getAllArticles will use asynchronous 
           //logic for the SQL query so our test code will assume getAllArticles returns a promise 
           //that resolves the articles.
           return ArticlesService.getAllArticles(db)
             .then(actual => {
                expect(actual).to.eql(testArticles)
             })
        })
        it(`getById() resolves an article by id from 'blogful_articles' table`, () => {
            const thirdId = 3
            const thirdTestArticle = testArticles[thirdId - 1]
            return ArticlesService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        title: thirdTestArticle.title,
                        content: thirdTestArticle.content,
                        date_published: thirdTestArticle.date_published,
                    })
                })
        })
        it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () => {
            const articleId = 3
            return ArticlesService.deleteArticle(db, articleId)
                .then(() => ArticlesService.getAllArticles(db))
                .then(allArticles => {
                    // copy the test articles array without the "deleted" article
                    const expected = testArticles.filter(article => article.id !== articleId)
                    expect(allArticles).to.eql(expected)
                })
        })
        it(`updateArticle() updates an article from the 'blogful_articles' table`, () => {
            const idOfArticleToUpdate = 3
            const newArticleData = {
                title: 'updated title',
                content: 'updated content',
                date_published: new Date(),
            }
            return ArticlesService.updateArticle(db, idOfArticleToUpdate, newArticleData)
                .then(() => ArticlesService.getById(db, idOfArticleToUpdate))
                .then(article => {
                    expect(article).to.eql({
                        id: idOfArticleToUpdate,
                        ...newArticleData,
                    })
                })
        })
    })
})

    context(`Given 'blogful_articles' has no data`, () => {
        it(`getAllArticles() resolves an empty array`, () => {
           return ArticlesService.getAllArticles(db)
             .then(actual => {
               expect(actual).to.eql([])
             })
        })
        it(`insertArticle() inserts a new article and resolves the new article with an 'id'`, () => {
            const newArticle = {
                title: 'Test new title',
                content: 'Test new content',
                date_published: new Date('2020-01-01T00:00:00.000Z'),
            }
            return ArticlesService.insertArticle(db, newArticle)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        title: newArticle.title,
                        content: newArticle.content,
                        date_published: newArticle.date_published,
                    })
                })
        })
     })


//Before we can test that the getAllArticles() gets all the articles, 
//we need to set what all the articles are. So, the test will need to 
//insert articles into the table. There's an extra consideration: the 
//test should not change our main database table. We will make a db
//specifically for testing.

//createdb -U dunder_mifflin knex-practice-test
//Inside the .env file, add a new line that saves an address for this database:

//In order for the test file to insert data into the database, we'll need 
//2 things:

//1) A connection to the database. We can make a Knex instance in the tests.
//2) The test data, let's call this testArticles.

//make the Knex instance before the tests run and save it in a variable called db
//to do this we use the mocha method before(). This runs before any of the 
//tests (the it() blocks). Before() is 1 of 4 hooks we can use with mocha.

//We can make some test data, an array of articles we put into the database 
//and then can later check against what is resolved by calling getAllArticles().

//We can use then Knex instance, db, to isnert the testArticles into the blogful_articles
//table, however, the test db (knex-practice-test) is a new database without a blogful_articles 
//table. We can use the create.blogful.sql script to create the table in the test database.

//psql -U dunder_mifflin -d knex-practice-test -f ./blogful-scripts/create.blogful.sql

//We will insert the test data into the blogful_articles table before the test runs as well. 
//Knex has a method called insert that we can pass an array of objects to, Knex will then 
//insert those objects into the table specified.