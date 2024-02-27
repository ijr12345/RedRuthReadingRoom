const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');
const AWS = require('aws-sdk');


// TODO: Secure API w/ authorization... JWT tokens or something
// TODO: Fix env processing

// Set up express server
const server = express();
const port = process.env.APP_PORT || 8000;
const PORTTest = 8000;
server.use(express.json());

// Create connection to mySQL db using variables in .env.
// Attempt connection/log results.
var connection = mysql.createConnection({
    host     : 'database-redruth-reforged-2.cahzbkkx4lwy.us-east-1.rds.amazonaws.com',
    user     : 'root',
    password : 'redruthpassword',
    port     : '3306',
    database : 'redruthinfo',
    ssl      : 'Amazon RDS'
});

connection.connect(function(err) {
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
  
    console.log('Connected to database.');
});

connection.on('error', function(err) {
    console.log("[mysql error]",err);
});

server.use(cors());

// Listen for incoming calls
server.listen(port,'0.0.0.0', () => {
    console.log(`App listening at http://localhost:${port}`); 
});

server.get('/', (req, res) => {
    res.send('The redruth reading room API is currently up and running🥳')
})

// Type: Record :: DB Query
// Overview: Called by Record page to get prompt information after specifying a prompt_id in the URL
// Accepts: prompt_id
// Returns: prompt_id, prompt, description, public_flg
server.get('/api/getprompt', (req, res) => {
    let prompt_id = req.query.prompt_id;
    if (Number.isInteger(Number(prompt_id))) {
        connection.query('SELECT prompt_id, prompt, description, public_record_flg FROM t_prompt WHERE prompt_id = ? ORDER BY prompt_id DESC', [prompt_id], function (error, results, fields) {
        //if (error) throw error;
        if (error) {
            console.error('prompt_id is this: ' + prompt_id);
        }
        console.log("res");
        console.log(results[0]);
        console.log('end of res');
        res.json(results[0]);
        });
    }
});

// Type: ADMIN :: DB Query
// Overview: Called by admin page, returns collections belonging to user
// Accepts: user_id
// Returns: collection_id, title, description, created_dt, COUNT(recordings total), COUNT(unlistened recordings), public_record_flg, public_listen_flg
server.get('/api/admin/getusercollections', (req, res) => {
    let user_id = req.query.user_id;
    connection.query('SELECT tc.collection_id, tc.title, tc.description, tc.created_dt, COUNT(taf.file_id) as file_count, COUNT(tal.file_id) as unlistened_count, tc.public_record_flg, tc.public_listen_flg FROM t_collection as tc LEFT JOIN t_prompt as tp ON tc.collection_id = tp.collection_id LEFT JOIN t_audio_file as taf ON taf.prompt_id = tp.prompt_id LEFT JOIN t_admin_listened as tal ON tal.file_id = taf.file_id AND tal.listened = false WHERE tc.user_id = ? GROUP BY tc.collection_id ORDER BY tc.collection_id ASC', [user_id], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

// Type: ADMIN :: DB Query
// Overview: Called by Inbox on admin page, returns unlistened recordings
// Accepts: user_id, collection_id
// Returns: file_id, title, prompt, timestamp, file_length
server.get('/api/admin/getunlistenedrecordingsbycollection', (req, res) => {
    let user_id = req.query.user_id;
    let collection_id = req.query.collection_id;
    connection.query('SELECT taf.file_id, taf.title, tp.prompt, taf.timestamp, taf.file_length FROM t_prompt as tp JOIN t_audio_file as taf ON tp.prompt_id = taf.prompt_id JOIN t_admin_listened as tal ON taf.file_id = tal.file_id WHERE tal.user_id = ? AND tal.listened = false AND tp.collection_id = ? ORDER BY taf.timestamp ASC', [user_id, collection_id], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

// Type: ADMIN :: DB Query
// Overview: Called by clicking a recording
// Accepts: file_id
// Returns: metadata for the audio file
server.get('/api/admin/getrecording', (req, res) => {
    let file_id = req.query.file_id;
    connection.query('SELECT taf.file_id, tp.prompt, taf.name, taf.email, taf.phone_num, taf.postal_code, taf.title, taf.remarks, taf.timestamp, taf.file_length FROM t_audio_file as taf JOIN t_prompt tp ON tp.prompt_id = taf.prompt_id LEFT JOIN t_audio_file_metadata as tafm ON taf.file_id = tafm.file_id WHERE taf.file_id = ?', [file_id], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
})


// Type: ADMIN :: DB Query
// Overview: Called by prompt component on admin page, returns prompts belonging to user and their selected collection
// Accepts: user_id, collection_id
// Returns: prompt_id, prompt, description, public_flg
// server.get('/api/admin/getusercollectionprompts', (req, res) => {
//     let user_id = req.query.user_id;
//     let collection_id = req.query.collection_id;
//     connection.query('SELECT prompt_id, prompt, description, public_flg FROM t_prompt WHERE user_id = ? AND collection_id = ? ORDER BY prompt_id ASC', [user_id, collection_id], function (error, results, fields) {
//         if (error) throw error;
//         res.json(results);
//         });
// })

// Type: ADMIN :: DB Query
// Overview: Called by response component on admin page, returns responses belonging to a prompt
// Accepts: prompt_id
// Returns: file_id, title, description, public_flg
// server.get('/api/admin/getpromptresponses', (req, res) => {
//     let prompt_id = req.query.prompt_id;
//     connection.query('SELECT file_id, title, public_flg FROM t_audio_file WHERE prompt_id = ? ORDER BY file_id ASC', [prompt_id], function (error, results, fields) {
//         if (error) throw error;
//         res.json(results);
//         });
// })

// Type: ADMIN :: DB Update
// Overview: Called by PublicRecordButton, toggles collection recordability
// Accepts: public_flg, collection_id
// Returns: results
server.get('/api/admin/update/collectionpublicrecordflg', (req, res) => {
    let public_flg = req.query.public_record_flg === 'true' ? true : false;
    let collection_id = req.query.collection_id;
    
    connection.query('UPDATE t_collection SET public_record_flg = ? WHERE collection_id = ?', [!public_flg, collection_id], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

// Type: ADMIN :: DB Update
// Overview: Called by PublicListenButton, toggles collection listenability
// Accepts: public_flg, collection_id
// Returns: results
server.get('/api/admin/update/collectionpubliclistenflg', (req, res) => {
    let public_flg = req.query.public_listen_flg === 'true' ? true : false;
    let collection_id = req.query.collection_id;
    
    connection.query('UPDATE t_collection SET public_listen_flg = ? WHERE collection_id = ?', [!public_flg, collection_id], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

function uploadAudioToDatabase(file_id, user_id, prompt_id, userName){
    prompt_id = 666; // FOR NOW HARD CODED
    user_id = 12345; // FOR NOW HARD CODED
    
    connection.query("INSERT INTO t_audio_file (file_id, user_id, prompt_id, name) VALUES (?, ?, ?, ?)", [file_id, user_id, prompt_id,userName]);
}


// Type: ADMIN :: DB Update
// Overview: Called by PromptPublicButton, toggles prompt publicity
// Accepts: public_flg, prompt_id
// Returns: results
// server.get('/api/admin/update/promptpublicflg', (req, res) => {
//     let public_flg = req.query.public_flg === 'true' ? true : false;
//     let prompt_id = req.query.prompt_id;

//     connection.query('UPDATE t_prompt SET public_flg = ? WHERE prompt_id = ?', [!public_flg, prompt_id], function (error, results, fields) {
//         if (error) throw error;
//         res.json(results);
//         });
// })

// Type: ADMIN :: DB Update
// Overview: Called by ResponsePublicButton, toggles audio_file publicity
// Accepts: public_flg, file_id
// Returns: results
// server.get('/api/admin/update/audiofilepublicflg', (req, res) => {
//     let public_flg = req.query.public_flg === 'true' ? true : false;
//     let file_id = req.query.file_id;

//     connection.query('UPDATE t_audio_file SET public_flg = ? WHERE file_id = ?', [!public_flg, file_id], function (error, results, fields) {
//         if (error) throw error;
//         res.json(results);
//         });
// })

// Type: ADMIN :: DB Create
// Overview: Called by CreateNewCollection, creates new collection
// Accepts:
// Returns:
// server.get('/api/admin/update/audiofilepublicflg', (req, res) => {
//     let public_flg = req.query.public_flg === 'true' ? true : false;
//     let file_id = req.query.file_id;

//     connection.query('UPDATE t_audio_file SET public_flg = ? WHERE file_id = ?', [!public_flg, file_id], function (error, results, fields) {
//         if (error) throw error;
//         res.json(results);
//         });
// })]


require('dotenv').config();

server.set('json spaces', 5); // to pretify json response


// create collection in admin console
server.post('/api/admin/createcollection/', (req, res) => {
    const info = req.body;
    var user_id = 12345;
    var collection_name = info.cName;
    var collection_description = info.cDescription;
    
    // add collection to database
    connection.query('Insert into t_collection (user_id, title, description, created_dt) values (?, ? , ?, CURDATE())', [user_id, collection_name, collection_description], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

// create prompt in admin console
server.post('/api/admin/createprompt/', (req, res) => {
    const info = req.body;
    var user_id = 12345;
    var collectionID = info.cID
    var prompt_name = info.pName;
    var prompt_description = info.pDescription;

    //add prompt to database
    connection.query('Insert into t_prompt (collection_id, user_id, prompt, description, created_dt) values (?, ?, ? , ?, CURDATE())', [collectionID, user_id, prompt_name, prompt_description], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

// Multer Configuration
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Overview: Sends a submitted recording from the record page to the AWS S3 bucket
server.post('/api/upload/', upload.single('audio'), (req, res) => {
    const audioPath = req.file.path; 
    const fileContent = fs.readFileSync(audioPath);
    const name = Date.now().toString() + '.m4a';
    
    const userName = req.query.userName;

    const accessKeyId = 'AKIA2WTBG4K3GELKESGS';
      const secretAccessKey = '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';
      const region = 'us-west-2';
      const Bucket = 'redruth-bucket';
      console.log(region);
      AWS.config.update({ // Credentials are OK
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: region
    });

    const s3 = new AWS.S3();
      s3.putObject({
        Bucket: Bucket,
        Key: name,
        Body: fileContent,
        ACL: 'public-read'
      },function (res) {
        console.log('S3 put object response: ' + res); 
    });
    uploadAudioToDatabase(name, '12345', '666',userName);
});

// Send Audio form S3 to react

server.get('/api/admin/getAudioFile', (req, res) =>{
    //let key = '1707180583513.m4a'
    let key = req.query.file_id + '.m4a'
    console.log(key)

    const accessKeyId = 'AKIA2WTBG4K3GELKESGS';
    const secretAccessKey = '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';
    const region = 'us-west-2';
    const Bucket = 'redruth-bucket';
    console.log(region);
    AWS.config.update({ // Credentials are OK
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region
    });
    const s3 = new AWS.S3();
    
    s3.getObject(
        { Bucket: Bucket, Key: key, ResponseContentType: 'audio/mpeg'},
        function (error, data) {
          if (error != null) {
            console.log("Failed to retrieve an object: " + error);
          } else {
            console.log(data)
            res.set('Content-Type', 'audio/mpeg')
            res.json(data)
          }
        })

    
})

server.get('/api/admin/getListOfFiles', (req, res) => { 
    let prompt_id = req.query.prompt_id
    connection.query('SELECT t_audio_file.* from t_audio_file WHERE prompt_id = ?', prompt_id, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

server.get('/api/admin/getPromptName', (req, res) =>{
    let prompt_id = req.query.prompt_id
    connection.query('SELECT prompt from t_prompt WHERE prompt_id = ?', prompt_id, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

server.get('/api/admin/getPromptId', (req, res) =>{
    let prompt_name = req.query.prompt_name
    connection.query('SELECT prompt_id from t_prompt WHERE prompt = ?', prompt_name, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

server.get('/api/admin/promptByCollection', (req, res) =>{
    let collection_id = req.query.collection_id

    connection.query('SELECT prompt from t_prompt WHERE collection_id = ?', collection_id, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

server.get('/api/admin/getCollectionId', (req, res) =>{
    let collection_name = req.query.collection_name
    connection.query('SELECT collection_id from t_collection WHERE title = ?', collection_name, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
})

server.get('/api/admin/RemoveAudio', (req, res) =>{
    //TODO make sure audio is removed from everything
    // Deleates form database but not S3 bucket
    let file_id = req.query.file_id
    const accessKeyId = 'AKIA2WTBG4K3GELKESGS';
    const secretAccessKey = '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';
    const region = 'us-west-2';
    const Bucket = 'redruth-bucket';
    console.log(region);
    AWS.config.update({ // Credentials are OK
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region
    });
    const s3 = new AWS.S3();
    const input = {
        "Bucket": Bucket,
        "Key": file_id+".m4a"
      };
    s3.deleteObject(input, function (err,data){
        // ACCESS DENIED NED TO FIX
        if (err) console.log(err, err.stack);  // error
        else     console.log("deleated");
    });
    
    connection.query('DELETE FROM t_audio_file WHERE file_id = ?', file_id, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
        });
    
})

module.exports = server;
