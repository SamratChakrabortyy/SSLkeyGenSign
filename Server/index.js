const express = require('express');
const {
    logger,
    httpLogger
} = require('./utils/logger');
const app = express();
const bodyParser = require('body-parser');
const log4js = require('log4js');
const fileUpload = require('express-fileupload');
const port = 3000;
const inputCSRDir = "/opt/ssl/client/CSR"


var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
 
//var app = express()
 
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  logger.info(req.file);
  res.status(200).send("Check Uploads");
})

app.post('/signCSR',  upload.single('csrFile'), (req, res, next) => {
    logger.info('Inside Sign CSR');
    try {
        
        //logger.info(req);
        logger.info(req.file);
        logger.info(req.body);
        if (!req.file || Object.keys(req.files).size === 0){
            logger.error("No file found")
            return res.status(400).send('No files were uploaded.');
        }
        logger.info(`CSR file details: ${req.file}`);
        let csrFilePath = req.file.path;
        let csrFileName = req.file.originalname;
        if(csrFileName.indexOf('.csr') != csrFileName.length - 4){
            logger.error(`File type not CSR`);
            res.status(400).send(`File Type not CSR`);
        }
        logger.info(`File with name ${csrFileName} successfully saved at ${csrFilePath}`);
        res.send("File Upload Successful");
    } catch (ex) {
        logger.error(`Exception while signing CSR: `, ex);
        res.status(500).send("Internal Server Error");
    }
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(log4js.connectLogger(httpLogger, {
    level: 'info',
    format: (req, res, format) => format(':remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"'),
}));
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})