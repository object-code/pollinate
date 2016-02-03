/*  __  __    _    _  _______    ____ _   _    _    _   _  ____ _____ ____  _
   |  \/  |  / \  | |/ / ____|  / ___| | | |  / \  | \ | |/ ___| ____/ ___|| |
   | |\/| | / _ \ | ' /|  _|   | |   | |_| | / _ \ |  \| | |  _|  _| \___ \| |
   | |  | |/ ___ \| . \| |___  | |___|  _  |/ ___ \| |\  | |_| | |___ ___) |_|
   |_|  |_/_/   \_\_|\_\_____|  \____|_| |_/_/   \_\_| \_|\____|_____|____/(_)

   There is a 100% chance that this project can use improvements.
   Pull requests are ALWAYS welcome, even if just amounts to a conversation.  */

var co = require('co')
var fs = require('fs')
var nunjucks = require('nunjucks')

module.exports = co.wrap(function * (state) {
    var parse = state.data.operations.parse
    var context = state.data.context

    context.name = state.data.name

    for(i = 0; i < parse.length; i++) {
        var fileToParse = state.flower.tmp + '/' + parse[i]
        var content = fs.readFileSync(fileToParse, 'utf-8')
        var renderedContent = nunjucks.renderString(content, state.data.context)
        fs.writeFileSync(fileToParse, renderedContent)
    }

    return state
})
