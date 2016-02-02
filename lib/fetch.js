/*  __  __    _    _  _______    ____ _   _    _    _   _  ____ _____ ____  _
   |  \/  |  / \  | |/ / ____|  / ___| | | |  / \  | \ | |/ ___| ____/ ___|| |
   | |\/| | / _ \ | ' /|  _|   | |   | |_| | / _ \ |  \| | |  _|  _| \___ \| |
   | |  | |/ ___ \| . \| |___  | |___|  _  |/ ___ \| |\  | |_| | |___ ___) |_|
   |_|  |_/_/   \_\_|\_\_____|  \____|_| |_/_/   \_\_| \_|\____|_____|____/(_)

   There is a 100% chance that this project can use improvements.
   Pull requests are ALWAYS welcome, even if just amounts to a conversation.  */

var co = require('co')
var Package = require('duo-package')
var fs = require('fs')
var path = require('path')
var request = require('request')
var urlRegex = require('url-regex')
var uuid = require('uuid')

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

    if (isGitHub) {
        item = yield fetchGitHub(input, type)
    } else if (isURL) {
        item = yield fetchURL(input, type)
    } else {
        item = yield fetchPath(input, type)
    }

    return item
}

var fetchGitHub = function * (input, type) {
    if(type == "pollen") {
        return {
            error: "Pollen can't be supplied as a GitHub repository."
        }
    }

    var tmpPath = '/tmp/'+uuid.v1()
    var pkg = new Package(input, '*').directory(tmpPath)

    var fs = require('co-fs')
    yield fs.mkdir(tmpPath)

    yield pkg.fetch()

    return {
        input: input,
        source: 'github',
        tmp: pkg.directory() + '/' + pkg.slug()
    }
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

var fetchPath = function * (input, type) {
    if(type == "pollen" && !fs.lstatSync(input).isFile()) {
        return {
            error: "Pollen must be a file."
        }
    }

    var fileName = path.basename(input)
    var tmp = '/tmp/' + uuid.v1()

    fs.createReadStream(input).pipe(fs.createWriteStream(tmp))

    return {
        input: input,
        source: 'path',
        tmp: tmp
    }
}

