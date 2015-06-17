var fs      = require('fs');
var path 	= require('path');

//Prepare config
var config = {
	'conf' : {},

	'load' : function(name) {
		var filename = __dirname + '/' + name + '.json';
		//console.log('FILENAME ['+filename+']');
		if (fs.existsSync(filename)) {
		    conf = require(filename);
		    return true;
		}
		return false;
	},

	'get' : function(partname) {
		//console.log('Get config part [%j]', conf);
		if (conf[partname] != undefined )
		{
			return conf[partname];
		} else {
			return {};
		}
	}
}

module.exports = config;