#!/usr/bin/env node

/*  __  __    _    _  _______    ____ _   _    _    _   _  ____ _____ ____  _
   |  \/  |  / \  | |/ / ____|  / ___| | | |  / \  | \ | |/ ___| ____/ ___|| |
   | |\/| | / _ \ | ' /|  _|   | |   | |_| | / _ \ |  \| | |  _|  _| \___ \| |
   | |  | |/ ___ \| . \| |___  | |___|  _  |/ ___ \| |\  | |_| | |___ ___) |_|
   |_|  |_/_/   \_\_|\_\_____|  \____|_| |_/_/   \_\_| \_|\____|_____|____/(_)

   There is a 100% chance that this project can use improvements.
   Pull requests are ALWAYS welcome, even if just amounts to a conversation.  */

var program = require('commander')
var co = require('co')

program
  .version(require('../package.json').version)
  .usage('flower [pollen]')

program.on('--help', function() {
  console.log('  Examples:')
  console.log()
  console.log('    $ pollinate codingcoop/test-flower test.json')
  process.exit()
})

program.parse(process.argv)

var log = require('normalize-log')

if(program.args.length < 1) {
  log.error('Invalid args. type `pollinate --help` for options.')
  process.exit(1)
}

co(function() { return program.args })
    .then(require('../lib/fetch.js'))
    .then(require('../lib/extend.js'))
    .then(require('../lib/discard.js'))
    .then(require('../lib/parse.js'))
    .then(require('../lib/move.js'))
    .then(co.wrap(function* (state) {
        console.log(state)
    }))
