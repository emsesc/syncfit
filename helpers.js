const fetch = require('node-fetch')

const getFiles = async (accessToken) => {
    let links = [];
    let dates = ['2020-10-27', '2021-02-08']

    for (var i = 0; i < dates.length; i++) {
        let params = new URLSearchParams({
            'afterDate': dates[i],
            'sort': 'asc',
            'offset': 0,
            'limit': 100
        })
    
        // parameters and number of iterations are hardcoded due to the restrictions of the fitbit api
    
        const resdata = await fetch('https://api.fitbit.com/1/user/-/activities/list.json' + `?${params.toString()}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          })
        
        const responseData = await resdata.json()
        // console.log(responseData)
        for (var i = 0; i < responseData.activities.length; i++) {
            if (responseData.activities[i].distance > 2.4) {
                links.push(responseData.activities[i].tcxLink)
            }
            //Do something
            //10 27 2020
            // last file is done.txt which triggers the serverless function 
        }    
    }
    console.log(links)
}

exports.getFiles = getFiles