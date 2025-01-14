'use strict'

// let http = require('http')

// //create a server object:
// http.createServer(function(req, res) {
//     res.writeHead(200,{'Content-Type':'text/html'})
//    res.write('<h1>Hello World!</h1>')//write a response to the client
//    res.end()//end the response
//   }).listen(8000)
// the server object listens on port 8000

// EXPRESS

// use express framework,
const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('public_html'))

// use ejs template engine
app.set('view engine', 'ejs')
const navbarLinksData = [
    { label: 'Home Page', link: '/' },
    { label: 'Bye Bye', link: '/byebye' },
    { label: 'chair', link: '/test-html' },
    { label: 'form_post.html', link: '/form_post.html' },
    { label: 'products', link: '/products' },
    { label: 'seasons', link: '/seasons' },
    { label: 'orders', link: '/orders' }
]

app.get('/products', function (req, res) {
    const pageData = {} // initialize empty object
    pageData.title = 'Product Catalog-blabla.com'
    pageData.description = 'Huge selection of products for all your needs'
    pageData.author = 'The blabla.com team'
    const products = [
        { id: 1, name: 'white shoes', price: '99.99' },
        { id: 2, name: 'black shoes', price: '69.99' },
        { id: 3, name: 'blue shoes', price: '79.99' }
    ]
    pageData.content = '<table>'
    for (let i = 0; i < products.length; i++) {
        pageData.content += '<tr><td>' + products[i].id + '</td>'
        pageData.content += '<td>' + products[i].name + '</td>'
        pageData.content += '<td>' + products[i].price + '</td>'
        pageData.content += '</tr>'
    }
    pageData.content += '</table>'
    res.render('master_template', pageData)
})

app.get('/seasons', function (req, res) {
    const pageData = {} // initialize empty object
    pageData.title = 'Exercise 2'
    pageData.description = 'EJS Template Engine'
    pageData.author = 'Safaldeep Singh'
    const seasons = [
        { id: 1, name: 'Winter' },
        { id: 2, name: 'Summer' },
        { id: 3, name: 'Fall' },
        { id: 3, name: 'Spring' }
    ]
    pageData.content = '<ol>'
    for (let i = 0; i < seasons.length; i++) {
        pageData.content += '<li>' + seasons[i].name + '</li>'
    }
    pageData.content += '</ol>'

    pageData.navbarLinks = '<ul class="navbar-nav">'
    for (let i = 0; i < navbarLinksData.length; i++) {
        pageData.navbarLinks += '<li class="nav-item">'
        pageData.navbarLinks += '<a class="nav-link" href="' + navbarLinksData[i].link + '">' + navbarLinksData[i].label + '</a>'
        pageData.navbarLinks += '</li>'
    }
    pageData.navbarLinks += '</ul>'
    res.render('master_template', pageData)
})

// HOME PAGE http://localhost:8000
app.get('/',
    function (req, res) {
        res.send('<h1>Hello World</h1>')
    }
)
app.get('/byebye',
    function (req, res) {
        res.send('<h1>Bye Bye</h1>')
    }
)
app.get('/test-html',
    function (req, res) {
        res.sendFile(path.join(__dirname, 'test.html'))
    }
)

/* POST form processing **********************************************************/
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded())

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

// see /public_html/form_post.html
// display form with http://localhost:8000/form_post.html
app.post('/form_validate',
    function (request, response) {
        // get the form inputs from the body of the HTTP request
        console.log(request.body)
        const username = request.body.username
        const password = request.body.password
        console.log('username=' + username + ' password=' + password)
        // process form, validate data …
        if (username === '' || password === '') {
            response.writeHead(400, { 'Content-Type': 'text/html' })
            response.end('missing username or password')
        } else {
            response.writeHead(200, { 'Content-Type': 'text/html' })
            response.end('Thanks for submitting the form')
        }
    }
)

app.get('/test-param/:a/:b',
    function (req, res) {
        res.send(req.params.a + req.params.b)
    }
)
const DB = require('./src/dao')

app.get('/orders', function (request, response) {
    DB.connect()
    DB.query('SELECT * from orders', function (orders) {
        let html = ''
        html += 'Number of orders: ' + orders.rowCount + '<br>'
        html += '<table>'
        html += '<tr>' +
        '<th>Order #</th>' +
        '<th>Date</th>' +
        '<th>Reqd. Date</th>' +
        '<th>Ship Date</th>' +
        '<th>Status</th>' +
        '<th>Comments</th>' +
        '</tr>'
        for (let i = 0; i < orders.rowCount; i++) {
            html += '<tr>' +
            '<td>' + orders.rows[i].ordernumber + '</td>' +
            '<td>' + orders.rows[i].orderdate + '</td>' +
            '<td>' + orders.rows[i].requireddate + '</td>' +
            '<td>' + orders.rows[i].shippeddate + '</td>' +
            '<td>' + orders.rows[i].status + '</td>' +
            '<td>' + orders.rows[i].comments + '</td>' +
            '</tr>'
        }
        html += '</table>'

        // use the page template of course to display the list
        const pageData = {} // initialize empty object
        pageData.title = 'Orders List-blabla.com'
        pageData.description = 'Orders Number and Name'
        pageData.author = 'The blabla.com team'
        // send out the html table
        pageData.content = html
        pageData.navbarLinks = '<ul class="navbar-nav">'
        for (let i = 0; i < navbarLinksData.length; i++) {
            pageData.navbarLinks += '<li class="nav-item">'
            pageData.navbarLinks += '<a class="nav-link" href="' + navbarLinksData[i].link + '">' + navbarLinksData[i].label + '</a>'
            pageData.navbarLinks += '</li>'
        }
        pageData.navbarLinks += '</ul>'
        response.render('master_template', pageData)
        DB.disconnect()
    })
})

app.get('/customer_search_id',
    function (req, res) {
        DB.connect()
        const pageData = {}
        const customerId = req.query.customer_id
        const sqlQuery = 'select * from customers where customernumber =$1'
        // const sqlQuery = 'select * from customers where customernumber =$1'
        const params = [customerId]
        pageData.content = '<table>'
        DB.queryParams(sqlQuery, params, (customers) => {
            // console.log(customers)
            console.log(customers.rowCount)
            for (let i = 0; i < customers.rowCount; i++) {
                pageData.content += '<tr>'
                pageData.content += '<td>' + customers.rows[i].customernumber + '</td>'
                pageData.content += '<td>' + customers.rows[i].customername + '</td>'
                pageData.content += '</tr>'
            }
            pageData.content += '</table>'
            console.log(pageData.content)
            res.render('customer_results.ejs', pageData)
        })
        // DB.disconnect()
    }
)

// for AJAX tests, returns the list of customers in a JSON string
app.get('/customers', function (request, response) {
    const DB = require('./src/dao')
    DB.connect()
    DB.query('SELECT * from customers', function (customers) {
        const customersJSON = { customers: customers.rows }
        const customersJSONString = JSON.stringify(customersJSON, null, 4)
        // set content type
        response.writeHead(200, { 'Content-Type': 'application/json' })
        // send out a string
        response.end(customersJSONString)
    })
})

// delete one customer
// note you cannot delete customers with orders
// to know customers that don't have an order run this query
// SELECT * from customers
// LEFT JOIN orders on customers.customernumber = orders.customernumber
// WHERE ordernumber IS NULL
// ORDER BY customers.customernumber ASC
// result: you can delete customernumber 477,480,481 and others
app.delete('/customers/:id', function (request, response) {
    const id = request.params.id // read the :id value send in the URL
    const DB = require('./src/dao')
    DB.connect()
    DB.queryParams('DELETE from customers WHERE customernumber=$1', [id], function (customers) {
        response.writeHead(200, { 'Content-Type': 'text/html' })
        // send out a string
        response.end('OK customer deleted')
    })
})

app.get('/employees', function (request, response) {
    const DB = require('./src/dao')
    DB.connect()
    DB.query('SELECT * from employees', function (employees) {
        const employeesJSON = { employees: employees.rows }
        const employeesJSONString = JSON.stringify(employeesJSON, null, 4)
        // set content type
        response.writeHead(200, { 'Content-Type': 'application/json' })
        // send out a string
        response.end(employeesJSONString)
    })
})

// LAST LINE OF CODE- START SERVER - ON PORT 8000
app.listen(8001, function () {
    console.log('Server listening to port 8000, go to http://localhost:8000')
})
