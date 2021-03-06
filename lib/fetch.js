/*  __  __    _    _  _______    ____ _   _    _    _   _  ____ _____ ____  _
   |  \/  |  / \  | |/ / ____|  / ___| | | |  / \  | \ | |/ ___| ____/ ___|| |
   | |\/| | / _ \ | ' /|  _|   | |   | |_| | / _ \ |  \| | |  _|  _| \___ \| |
   | |  | |/ ___ \| . \| |___  | |___|  _  |/ ___ \| |\  | |_| | |___ ___) |_|
   |_|  |_/_/   \_\_|\_\_____|  \____|_| |_/_/   \_\_| \_|\____|_____|____/(_)

   There is a 100% chance that this project can use improvements.
   Pull requests are ALWAYS welcome, even if just amounts to a conversation.  */

var co = require('co')
var fs = require('fs')
var Promise = require('promise')
var path = require('path')
var request = require('request')
var urlRegex = require('url-regex')
var uuid = require('uuid')
var gunzip = require('gunzip-maybe')
var tar = require('tar-fs')


module.exports = co.wrap(function * (args) {
    var types = ['flower','pollen']
    var state = {}

    for (var i = 0; i < types.length; i++) {
        if(typeof args[i] !== 'undefined') {
            state[types[i]] = yield fetchItem(args[i], types[i])
        }
    }

    return state

})

var fetchItem = function * (input, type) {
    var item = null
    var isGitHub = input.match(/[A-Za-z\-_]+\/[A-Za-z\-_]+$/g) // https://www.debuggex.com/i/zM04_3xkUW-7yFSK.png
    var isURL = urlRegex({exact: true}).test(input)
    var isJSON = input.match(/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/g)
    var isFile = input.match(/[^\\]*\.(\w+)$/g)

    if (isGitHub) {
        item = yield fetchGitHub(input, type)
    } else if (isURL) {
        item = yield fetchURL(input, type)
    } else if (isJSON) {
        item = yield fetchJSON(input, type)
    } else if (isFile){
        item = yield fetchFile(input, type)
    }

    return item
}

var fetchGitHub = function (input, type) {
    return new Promise(function (resolve, reject) {
        if(type == "pollen") {
            return {
                error: "Pollen can't be supplied as a GitHub repository."
            }
        }

        var tmpPath = '/tmp/'+uuid.v1()

        // setup the tmp path
        fs.mkdir(tmpPath, function() {
            // get the default branch
            var query = {}
            if(typeof process.env.token !== 'undefined') {
                query = {
                    access_token: process.env.token
                }
            }

            var stream = request({
                url: 'https://api.github.com/repos/'+input,
                qs: query,
                headers: {
                    'User-Agent': 'request'
                }
            }, function (error, response, body) {
                // get the archive
                var repoDetails = JSON.parse(body)

                var stream = request({
                    url: 'https://github.com/'+input+'/archive/'+repoDetails.default_branch+'.tar.gz'
                }).pipe(gunzip()).pipe(tar.extract(tmpPath))

                stream.on('finish', function () {
                    resolve({
                        input: input,
                        source: 'github',
                        tmp: tmpPath + '/' + repoDetails.name + '-' + repoDetails.default_branch
                    })
                })
            })
        })
    })
}

var fetchURL = function * (input, type) {
    if(type == "flower") {
        return {
            error: "URLs for Flower files are currently not supported."
        }
    }

    var response = request(input)
    var contentType = (response.headers['content-type']) ? response.headers['content-type'] : false
    var tmp = '/tmp/' + path.basename(response.path)

    response.pipe(fs.createWriteStream(tmp))

    return {
        input: input,
        source: 'url',
        tmp: tmp,
        contentType: contentType
    }
}

var fetchJSON = function * (input, type) {
    if(type == "flower") {
        return {
            error: "Flowers must be a tree of files"
        }
    }

    return {
        input: input,
        source: 'json'
    }
}

var fetchFile = function * (input, type) {
    return new Promise(function (resolve, reject) {
        if(type == "pollen" && !fs.lstatSync(input).isFile()) {
            return {
                error: "Pollen must be a file."
            }
        }

        var fileName = path.basename(input)
        var tmpPath = '/tmp/'+uuid.v1()

        // setup the tmp path
        fs.mkdir(tmpPath, function() {

            var stream = fs.createReadStream(input).pipe(fs.createWriteStream(tmpPath + '/data.json'))

            stream.on('finish', function () {
                resolve({
                    input: input,
                    source: 'path',
                    tmp: tmpPath + '/data.json'
                })
            })
        })
    })
}
