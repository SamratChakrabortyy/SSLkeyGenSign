const express = require('express');
const {
    logger,
    httpLogger
} = require('./utils/logger');
const app = express();
const bodyParser = require('body-parser');
const log4js = require('log4js');
const port = 3000;
const inputCSRDir = "/opt/ssl/client/CSR";
const csrSigningScipt = "scripts/signCSR.sh";
const multer  = require('multer');
const upload = multer({ dest: inputCSRDir });
const execSync = require('child_process').execSync;
 

app.post('/signCSR',  upload.single('csrFile'), (req, res, next) => {
    logger.info('Inside Sign CSR');
    try {
        if (req.file == undefined){
            logger.error("No file found")
            return res.status(400).send('No files were uploaded.');
        }
        let fileDetails = JSON.parse(JSON.stringify(req.file));
        if (fileDetails == undefined ||fileDetails.size == undefined  || fileDetails.size <= 0){
            logger.error("No file found")
            return res.status(400).send('No files were uploaded.');
        }
        logger.info(`CSR file details: ${JSON.stringify(fileDetails)}`);
        let csrFilePath = fileDetails.path;
        let csrFileName = fileDetails.originalname;
        if(csrFileName.indexOf('.csr') != csrFileName.length - 4){
            logger.error(`File type not CSR`);
            return res.status(400).send(`File Type not CSR`);
        }
        logger.info(`File with name ${csrFileName} successfully saved at ${csrFilePath}`);
        try{            
            logger.info(`Attempting to sign ${csrFileName}`);
            let tarFileName = execSync(`csrSigningScipt ${csrFilePath} ${csrFileName.substring(0, csrFileName.lastIndexOf(".csr"))}`, {
                timeout : 60 * 1000
            });
            logger.info(`Public key location for ${csrFileName}: ${tarFileName}`);
            res.header('Content-Type', 'application/gzip');
            res.attachment(tarFileName.substring(tarFileName.lastIndexOf('/') + 1));
            return res.sendFile(tarFileName);
        } catch(ex) {
            logger.error(`Error executing sigining script for ${csrFileName}`, ex);            
            return res.status(500).send("Internal Server Error");
        }
    } catch (ex) {
        logger.error(`Exception while signing CSR: `, ex);
        return res.status(500).send("Internal Server Error");
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