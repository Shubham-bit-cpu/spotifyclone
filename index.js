const express = require('express')
var request = require('request');
var cors = require('cors')
var app = express()

app.use(cors())
const port = 2000
const querystring = require('node:querystring');
const { connected } = require('node:process');
var client_id = '2b00bdea52e3421f97ec3632995fb254';
var client_secret = '18333b69e5fa4443a3ca4c0c20ecd426';
var redirect_uri = `http://localhost:3000/callback`;
const generateRandomString = (myLength) => {
    const chars =
        "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
    const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join("");
    return randomString;
};

app.get('/login', function (req, res) {
    console.log('here')
    var state = generateRandomString(16);
    var scope = 'user-read-private user-read-email';
    console.log("reachedheresss")
    const url = 'https://accounts.spotify.com/authorize?';
    const data = querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    })
    console.log(data)
    return res.send({ "url": url + data });
});



app.get('/callback', function (req, res) {
    console.log("reachedhereCALLBACK")
    var code = req.query.code || null;
    var state = req.query.state || null;
    console.log("reachedhereCALLBACK")
    console.log(code)
    console.log('req')
    if (state === null) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };
        request.post(authOptions, function (error, response, body) {
            console.log(response.statusCode)
            console.log('response')
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                console.log(access_token)
                res.send({
                    'access_token': access_token
                    
                })
            }
        });

    }
});

 app.get('/refresh_token', function(req, res) {

   var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'http://localhost:2000',
      headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
       form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
       json: true     };

    request.post(authOptions, function(error, response, body) {
       if (!error && response.statusCode === 200) {
         var access_token = body.access_token;
         res.send({
           'access_token': access_token
         });
      }
     });
   });

// var client_id = '2b00bdea52e3421f97ec3632995fb254';
// var client_secret = '18333b69e5fa4443a3ca4c0c20ecd426';

// var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//         'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
//     },
//     form: {
//         grant_type: 'client_credentials'
//     },
//     json: true
// };

// request.post(authOptions, function (error, response, body) {
//     if (!error && response.statusCode === 200) {
//         var token = body.access_token;
//     }
// });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})