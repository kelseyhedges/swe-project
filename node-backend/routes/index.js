var express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken')

const bcrypt = require('bcrypt');
const saltRounds = 10;

process.env.SECRET_KEY = '5oWFG:t5MFE4dqU'

module.exports = function(app, connection){

  function genId(tablename, length) {
    var i = new Date().getTime();
    var additive = '0x' + 'f'.repeat(length-1);
    i = i & additive;
    if (i.toString().length > length){
      i = Math.floor(i/10);
    }
    if (i < 0){ i *= -1; }
    while (i.toString().length < length){
      i *= 10;
    }
    connection.query(`CALL id_exists('${tablename}', ${i})`, 
    function(err, data){
      if (err) throw err
      if (data[0][0].exists){
        i = genId(tablename, length);
      }
    });
    return i;
  }

  app.post('/new_user', function(req, res){
    const {passcode, email, firstName, lastName} = req.body;
    userid = genId('user_info', 9)
    bcrypt.hash(passcode, saltRounds, function(err, hash){
      if (err){ return res.send(err) }
      var q = `CALL new_user('${firstName}', '${lastName}', ${userid}, '${hash}', '${email}');`;
      connection.query(q, function(err, data){
        if (err){
          return res.send(err);
        }
        else { return res.json({status: 1}); }
      })
    });
  })

  app.post('/login', function(req, res){
    // check to see if credentials valid
    var q = `SELECT U.*, L.password FROM user_login as L, user_info as U WHERE U.email = '${req.body.userid}' AND L.uid = U.user_id`;
    connection.query(q, function(err, data){
      if(err){res.send(err)}
      else if (data.length < 1){
        res.status(400).json({error: 'User does not exist'})
      }
      else{
        if(bcrypt.compareSync(req.body.passcode, data[0].password)){
          let payload = {...data[0]}
          let token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '4h'})
          res.json({token: token, firstname: payload.firstname, lastname: payload.lastname})
        }
        else{
          res.status(400).json({error: 'Incorrect credentials'})
        }
      }
    })
  })

  app.post('/extract_user_info', function(req, res){
    console.log('Token received');
    jwt.verify(req.body.token, process.env.SECRET_KEY, 
      {expiresIn: '4h'}, function(err, content){
        if(err){ res.json({error: err}); }
        else{
          console.log(content);
          delete content.password;
          res.json({...content});
        }
      });
  })

}
