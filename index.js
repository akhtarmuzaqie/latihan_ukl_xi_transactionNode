const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()

const secretKey = 'thisisverysecretkey'
const penjualKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended :true
}))

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "jual_buah"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})

const isAuthorized = (request, result, next)=>{

    if(typeof(request.headers['auth-pembeli']) == 'undefined'){
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token Is Not Provided Or Invalid'
        })
    }

    let token = request.headers['auth-token']

    jwt.verify(token, secretKey, (err, decoded) =>{
        if (err){
            return result.status(403).json({
                success: false,
                message: 'Unauthorized. Token is Invalid or Not Provided'
            })
        }
    })
    next()
}
//beginning
app.get('/', (request, result) => {
    result.json({
        success: true,
        message: 'Welcome to Fruits Shop'
    })
})
//register
app.post('/register', (request, result) => {
    let data = request.body

    let sql = `
        insert into users (name, email, password)
        values ('`+data.name+`', '`+data.email+`', '`+data.password+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Your Account Succesfully Registered!'
    })
})

//login user
app.post('/login', function(request, result){
    let data  = request.body
    var email = data.email;
    var password = data.password;
    if(email && password){
        db.query('SELECT * FROM users where email = ? AND password = ?', [email, password], function(error, results, fields){
            if(results.length > 0){
                let token = jwt.sign(data.email + '|' + data.password, secretKey)
            result.json({
                success:true,
                message: 'Logged In',
                token: token
            })

            }else{
                result.json({
                    success: false,
                    message: 'Invalid Credential',
                })
            }
            result.end();
        })

    }
})
app.get('/buah', isAuthorized,(req,res) =>{
    let sql = `
    select * from buah`

    db.query(sql,(err, result) =>{
        if(err) throw err

        res.json({
            success: true,
            message:'Success Retrieve Data From Database',
            data:result
        })
    })

})

app.post('/buah/buy/:id', isAuthorized, (req, res)=>{
    let data = req.body

    db.query(`
    insert into transaksi (id_user, id_buah)
    values ('`+data.id_user+`', '`+req.params.id+`')
    `, (err, result) =>{
        if (err) throw err
    })
})



app.listen(2324, () => {
    console.log('App is running on port 2324!')
})