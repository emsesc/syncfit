const fetch = require('node-fetch')

const getFiles = async (accessToken) => {
    let links = [];
    let dates = ['2020-10-27', '2021-02-08']

    let append1 = await makeCall(links, accessToken, dates[0])
    let final = await makeCall(append1, accessToken, dates[1])

    console.log(links)
    return links
}

async function makeCall(links, accessToken, date) {
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
    console.log(responseData)
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

// const downAndUp = async (links) => {

// }

exports.getFiles = getFiles
// exports.downAndUp = downAndUp