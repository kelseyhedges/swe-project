var express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const xbuild = require('xmlbuilder');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xml2json = require('xml2json');

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
      if (err) {
        console.log(err)
        throw err
      }
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

  app.post('/user_address', function(req, res){
    var q = `SELECT * FROM user_info WHERE user_id = ${req.body.userid}`;
    connection.query(q, function(err, data){
      if(err){res.send(err)}
      else if (data.length < 1){
        res.status(400).json({error: 'User does not exist'})
      }
      else{
        res.json(data[0])
        }
      }
    )
  })

  app.post('/extract_user_info', function(req, res){
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

  app.post('/verify_address', function(req, res){
    var url = 'https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&XML='
    var xmlobj = {
      'AddressValidateRequest' : {
        '@USERID' : '896UNIVE6945',
        'Revision' : {'#text' : '1'},
        'Address' : {
          '@ID' : '0',
          'Address1' : {'#text' : req.body.name},
          'Address2' : {'#text' : req.body.street},
          'City' : {'#text' : req.body.city},
          'State' : {'#text' : req.body.state},
          'Zip5' : {'#text' : req.body.zip},
          'Zip4' : {}
        }
      }
    }
    var xml = xbuild.create(xmlobj, {encoding: 'utf-8'})
    url += xml.end()
    console.log(xml.end({pretty: true}));
    console.log(url)
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
        var v = JSON.parse(xml2json.toJson(xmlHttp.responseText))
        console.log(v)
        if (v['AddressValidateResponse']['Address']['Error'])
          res.send({'Error' : v['AddressValidateResponse']['Address']['Error']['Description']})
        else
          res.send(v['AddressValidateResponse']['Address'])
      }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
  })

  app.post('/update_address', function(req, res){
    var q = `UPDATE user_info 
      SET 
        firstname = '${req.body.firstname}',
        lastname = '${req.body.lastname}',
        street = '${req.body.street}',
        city = '${req.body.city}',
        state = '${req.body.state}',
        zip = ${req.body.zip}
      WHERE
        user_id = ${req.body.userid}`
    connection.query(q, function(err, data){
      if(err){res.send(err)}
      else{res.send({'status': 1})}
    })
  })

  app.get('/get_items', function(req, res){
    var q = `SELECT * FROM item`
    connection.query(q, function(err, data){
      if(err){res.send(err)}
      else{res.send({'items' : data})}
      }
    )
  })

  app.post('/new_order', function(req,res){
    var i = genId('order', 9);
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var user = req.body.user_id || 'NULL';

    console.log(req.body)

    var orderq = `INSERT INTO \`order\` 
      (order_id, addr1, addr2, city, state, zip, placed, user) VALUES
      (${i}, '${req.body.addr1}', '${req.body.addr2}', '${req.body.city}',
      '${req.body.state}', '${req.body.zip}', '${date}', ${user})`
    console.log(orderq)
    connection.query(orderq, function(err, data){
      if(err){res.send(err)}
      else{
        var q2 = `INSERT INTO order_contains (quantity, oid, iid) VALUES`
        var cart = req.body.cart
        for(var c = 0; c < Object.keys(cart).length; c++){
          var key = Object.keys(cart)[c]
          q2 += ` (${cart[key].quantity}, ${i}, ${key})`
          if(c < Object.keys(req.body.cart).length - 1)
            q2 += ','
        }
        console.log(q2)
        connection.query(q2, function(err, data){
          if(err){res.send(err)}
          else{
            var q3 = `SELECT * FROM 
              \`order\` as o, \`item\` as i, \`order_contains\` as c 
            WHERE
              o.order_id = ${i} AND c.oid = ${i} AND c.iid = i.item_id`
            connection.query(q3, function(err, d3){
              if(err){res.send(err)}
              else{res.send({'order' : d3})}
            })
            console.log(q3)
          }
        })
      }
    })
  })

}
