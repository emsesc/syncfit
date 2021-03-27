require('dotenv').config();
const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const ID = process.env.S3_ID;
const SECRET = process.env.S3_SECRET;
const BUCKET_NAME = 'syncfit-test-bucket';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});


const getFiles = async (accessToken) => {
    // use accessToken to get all download links
    let links = [];
    let dates = ['2020-10-27', '2021-02-08']

    let append1 = await makeCall(links, accessToken, dates[0])
    let final = await makeCall(append1, accessToken, dates[1])

    console.log(final)
    return final
}

async function makeCall(links, accessToken, date) {
    // call Fitbit API to get links and all activities
    let params = new URLSearchParams({
        'afterDate': date,
        'sort': 'asc',
        'offset': 0,
        'limit': 100
    })

    // parameters and number of iterations are hardcoded due to the restrictions of the fitbit api

    let resdata = await fetch('https://api.fitbit.com/1/user/-/activities/list.json' + `?${params.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })
    
    let responseData = await resdata.json()
    // console.log(responseData)
    console.log(responseData.activities.length)
    for (var i = 0; i < responseData.activities.length; i++) {
        if (responseData.activities[i].distance > 2.4) {
            links.push(responseData.activities[i].tcxLink)
        }
        //Do something
        //10 27 2020
        // last file is done.txt which triggers the serverless function 
    }
    return links
}

const downAndUp = async (links, accessToken) => {
    for (var i = 0; i < links.length; i++) {
        let resdata = await fetch(links[i], {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          })
        
        let responseData = await resdata.text()

        fileName = links[i].slice(links[i].length - 15)
        uploadFile(fileName, Buffer.from(responseData))
    }
    // upload this file to let us know that everything is complete
    uploadFile("completed.txt", Buffer.from("Upload complete"))
}

const uploadFile = (fileName, fileContent) => {
    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName, // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
};

const checkDownload = async () => {
    let status = true
    var params = {
        Bucket: BUCKET_NAME, /* required */
        Key: "completed.txt"
    };

    console.log("Requesting for completed.txt")
    try {
        await s3.getObject(params).promise();
    } catch (e) {
        status = false;
    }

    console.log(status)
    return status
}

const listFiles = async() => {
    let filesArray = []

    var params = {
        Bucket : BUCKET_NAME,
    };

    let files = await s3.listObjects(params).promise();

    let result = await files.Contents
    for (var i = 0; i < result.length; i++) {
        filesArray.push(result[i].Key)
    }

    console.log(filesArray)
    return filesArray;
}

exports.listFiles = listFiles
exports.getFiles = getFiles
exports.downAndUp = downAndUp
exports.checkDownload = checkDownload