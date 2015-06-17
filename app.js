var Tail = require('tail').Tail;
var highlight = require('console-highlight');

var notifier = require('node-notifier');
var path = require('path');

var config = require('./config');

var arguments = process.argv.slice(2);
console.log(arguments);

var configname = 'default';
if (arguments[0] != undefined) {
	configname = arguments[0];
	console.log("Update label...");
}

if (!config.load(configname))
{
	log("[ERROR] INVALID CONFIG!!!");
	return;
}

var message_config = config.get('message');

//error_notify('Test title', message_config.icon, message_config.icon);

var lineSeparator= "\n";
var fromBeginning = false;
var watchOptions = {}; // as per node fs.watch documentations

//Pass Laber from params
var label = config.get('label');
var immediate = config.get('immediate');

var regular = new RegExp("\\["+label+"\\]");

console.log("REGULAR:["+regular+"]");

var counter = 0;
var error_processing = false;
var first_error_line = true;

tail = new Tail(config.get('logpath'), lineSeparator, watchOptions, fromBeginning)

tail.on("line", function(data) {

	//console.log("ORIGIN: ["+data+"]");
	if (error_processing) {

		if (first_error_line)
		{
			first_error_line = false;
		} else {
			var eresult = data.match(/^\d{4}\/\d{2}\/\d{2}/);
			//console.log("ERS:: ["+eresult+"]");
			if (eresult && !immediate) {
				//if ((data == '---') && !immediate) {
				//console.log("End error...");
				counter = 0;
				console.log('\n');
				first_error_line = true;
				error_processing = false;
			}
		}
	}

	var result = data.match(regular);
	if (result == ('['+label+']')) 
	{
		if (!immediate) {
			error_processing = true;
		} else {
			//if immediate
			log(data);
		}
		error_notify(label, ('Log ['+data+'] found'), message_config.icon);
	}

	if (error_processing){
		log( pad(counter++, 3) + "   " + data + "");
	}
});

tail.on("error", function(error) {
	log('ERROR: ', error);
});

tail.watch();


function error_notify(title, message, image) {
	notifier.notify({
		title: title,
		message: message,
		icon: path.join(__dirname, image), // absolute path (not balloons)
		sound: true, // Only Notification Center or Windows Toasters
		wait: true // wait with callback until user action is taken on notification
	}, function (err, response) {
		//console.log("Error ["+err+"]["+response+"]");
	});
}

function pad(number, length) {
   
	var str = '' + number;
	while (str.length < length) {
		str = '0' + str;
	}
   
	return str;

}

function log(string) {

	console.log(highlight(string, {
	  // optional options 
	  //language: 'makefile', // will auto-detect if omitted 
	  theme: 'railscasts' // a highlight.js theme 
	}));
}