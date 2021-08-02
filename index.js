// index.js
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const app = express();
const path = require('path');
const { v1: uuidv1 } = require('uuid');



let result = {
    done: false,
    error: [],
    file: [],
    obj: null
};

let storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        fs.access('./uploads', (err) => {
            if (!err) {   
                callback(null, './uploads');  
            } else {
                
                fs.mkdir('./uploads', function(err) {
                if (err) {
                    console.log(err.stack);
                } else {
                    callback(null, './c');
                }
            });
            }
        });
    },
    filename: function (req, file, callback) {
        callback(null, uuidv1());
    }
  });




app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.listen(3333, () => {
 console.log('server started!');
});

app.use('/public', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + "/views"));

app.get("/", function(request, response){
    response.redirect("index.html");
});


app.post("/add_files",  function(req, res){
    let upload = multer({ storage : storage}).array('images[]');
    upload(req,res,function(err) {
        if (err) {
          console.error("Ошибка получения файла: ",err); 
          result.error.push({ msg: 'Ошибка получения файла', err: `${err}` });
          res.json(result);
        }
        result.file=req.files;
        result.done=true;
        res.json(result);
    })


});

app.post("/delete_file",  function(req, res){
    fs.unlink(req.body.fname, function(err){
        if (err) {
            console.error("Ошибка удаления файла: ",err); 
            result.done=false;
            result.error.push({ msg: 'Ошибка удаления файла', err: `${err}` });
            res.json(result);
        } else {
            result.done=true;
            result.error=[];
            result.file=[];
            res.json(result);
        }
    });
});


module.exports = app;