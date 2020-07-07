'use strict';
exports.tweet_image = function (req, res) {
    try {
        var config = require('../../config.js');
        var Twit = require('twit');
        var fs = require('fs');
        var T = new Twit(config);
        fs.readFile('b64log.json', (err, data) => {
            var json = JSON.parse(data)
            let json_index = Math.floor(Math.random() * json.length)
            let b64content = json[json_index];
            // let b64content = json[json.length - 1]
            T.post('media/upload', { media_data: b64content }, (err, data, response) => {
                if (err) {
                    console.log('ERROR:', err);
                }
                else {
                    console.log('Image uploaded! \n Now tweeting it...');
                    T.post('statuses/update', {
                        status: 'Chet',
                        media_ids: new Array(data.media_id_string)
                    })
                }
            })

        })
        // console.log('tweeting image from', tweet_path + tweet_image_name);
        res.send(200);

    } catch (e) {
        console.log(e)
        res.status(500).send({
            message: 'Server Error',
            code: 500
        })
    }
};

