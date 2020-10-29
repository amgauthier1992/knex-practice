const { expect } = require('chai') //require chai expect syntax
const knex = require('knex') //require knex framework
const ShoppingListService = require('../src/shopping-list-service') //require our service for testing it's methods

describe(`ShoppingList service object`, function() {
    let db; //no assignment? This just creates a variable db in memory. We assign this to the knexInstance below

    //test data for inserting into our shopping_list dummy table
    let testProducts = [
      {
        product_id: 1,
        name: 'Dorncogs',
        price: 5.99,
        date_added: new Date('2029-01-22T16:28:32.615Z'),
        checked: false,
        category: 'Lunch',
      },
      {
        product_id: 2,
        name: 'Creamice',
        price: 4.99,
        date_added: new Date('2100-05-22T16:28:32.615Z'),
        checked: true,
        category: 'Snack',
      },
      {
        product_id: 3,
        name: 'Bamhurgers',
        price: 7.99,
        date_added: new Date('1919-12-22T16:28:32.615Z'),
        checked: false,
        category: 'Main',
      },
    ];

    //When organizing test files, we tend to put all of the hooks at the top of the appropriate 
    //describe block. Before the variables???

    //establish connection to the test db, before we run the tests. We need to simulate the DB connection,
    //in order for our tests to run. We use knex to create an instance or connection to the DB.
    before('setup db', () => {
        db = knex({
           client: 'pg', //postgres
           comnection: process.env.TEST_DB_URL,
        });
    });

    // Before all tests run and after each individual test, empty the shopping_list table
    // The 1st string is used to describe the hook.
    before('clean db', () => db('shopping_list').truncate());
    afterEach('clean db', () => db('shopping_list').truncate());

    // After all tests run, let go of the db connection
    after('destroy db connection', () => db.destroy());

    describe('getAllProducts()', () => {
        it('returns an empty array', () => {
            return ShoppingListService
              .getAllProducts(db)
              .then(products => expect(products).to.eql([]));
        });

        // Whenever we set a context with data present, we should always include
        // a beforeEach() hook within the context that takes care of adding the
        // appropriate data to our table

        context('with data present', () => {
            beforeEach('insert test products', () => {
              db('shopping_list')
                .insert(testProducts)
            });

            it('returns all test products', () => {
                return ShoppingListService
                  .getAllProducts(db)
                  .then(products => expect(products).to.eql(testProducts));
            });
        });
    });

    describe('insertProduct()', () => {
        it('inserts record in db and returns product with new id', () => {
        // New product to use as subject of our test
        const newProduct = {
            name: 'Test new name',
            price: 5.99,
            date_added: new Date('2020-01-01T00:00:00.000Z'),
            checked: false,
            category: 'Main',
        };

        return ShoppingListService.insertProduct(db, newProduct)
          .then (actual => {
            expect(actual).to.eql({
              id: 1,
              name: newProduct.name,
              price: newProduct.price,
              date_added: newProduct.date_added,
              checked: newProduct.checked,
              category: newProduct.category,
            });
          });
        });
    });

    describe('getProductById()', () => {
        it('should return undefined', () => {
            return ShoppingListService
              .getProductById(db, 999)
              .then(product => expect(product).to.be.undefined);
        });

        context('with data present', () => {
            before('insert products', () => {
                db('shopping_list')
                  .insert(testProducts)
            });

            it('should return existing product', () => {
                const expectedProductId = 3;
                const expectedProduct = testProducts.find(p => p.id === expectedProductId);
                return ShoppingListService.getProductById(db, expectedProductId)
                  .then(actual => expect(actual).to.eql(expectedProduct));
            });
        });
    });

    describe('deleteProduct()', () => {
        it('should return 0 rows affected', () => {
            return ShoppingListService
              .deleteProduct(db, 999)
              .then(rowsAffected => expect(rowsAffected).to.eql(0));
        });

        context('with data present', () => {
            before('insert products', () => {
                db('shopping_list')
                  .insert(testProducts)
            });
            
            it('should return 1 row affected and record is removed from db', () => {
                const deletedProductId = 1;

                return ShoppingListService
                  .deleteProduct(db, deletedProductId)
                  .then(rowsAffected => {
                    expect(rowsAffected).to.eql(1);
                      return db('shopping_list').select('*');
                  })
                  .then(actual => {
                    //copy testProducts array with id 1 filtered out
                    const expected = testProducts.filter(p => p.id !== deletedProductId);
                      expect(actual).to.eql(expected);
                  });
            });
        });
    });

    describe('updateProduct()', () => {
        it('should return 0 rows affected', () => {
            return ShoppingListService
              .updateProduct(db, 999, { name: 'new name' })
              .then(rowsAffected => expect(rowsAffected).to.eql(0));
        });

        context('with data present', () => {
            before('insert products', () => {
                db('shopping_list')
                  .insert(testProducts)
            });

            it('should successfully update a product', () => {
                const updatedProductId = 1;
                const testProduct = testProducts.find(p => p.id === updatedProductId);
                // make copy of testArticle in db, overwriting with newly updated field value
                const updatedProduct = { ...testProduct, name: 'new name' };

                return ShoppingListService
                  .updateProduct(db, updatedProductId, updatedProduct)
                  .then(rowsAffected => {
                    expect(rowsAffected).to.eql(1)
                    return db('shopping_list').select('*').where({ id: updatedProductId }).first();
                  })
                  .then(product => {
                      expect(product).to.eql(updatedProduct)
                  });
            });
        });
    });
});