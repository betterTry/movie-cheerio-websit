var mongoose = require('mongoose');
var OnlineSchema = require('../schemas/online');
var Online = mongoose.model('Online', OnlineSchema);

module.exports = Online;