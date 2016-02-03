/*  __  __    _    _  _______    ____ _   _    _    _   _  ____ _____ ____  _
   |  \/  |  / \  | |/ / ____|  / ___| | | |  / \  | \ | |/ ___| ____/ ___|| |
   | |\/| | / _ \ | ' /|  _|   | |   | |_| | / _ \ |  \| | |  _|  _| \___ \| |
   | |  | |/ ___ \| . \| |___  | |___|  _  |/ ___ \| |\  | |_| | |___ ___) |_|
   |_|  |_/_/   \_\_|\_\_____|  \____|_| |_/_/   \_\_| \_|\____|_____|____/(_)

   There is a 100% chance that this project can use improvements.
   Pull requests are ALWAYS welcome, even if just amounts to a conversation.  */

var co = require('co')
var mv = require('mv')
var Promise = require('promise')

module.exports = co.wrap(function * (state) {
    return new Promise(function (resolve, reject) {
        var move = state.data.operations.move

        for(i = 0; i < move.length; i++) {
            for(var key in move[i]) {
                var orig = state.flower.tmp + '/' + key
                var dest = state.flower.tmp + '/' + move[i][key]
                mv(orig, dest, function(err){
                    resolve(state)
                })
            }
        }
    })
})
