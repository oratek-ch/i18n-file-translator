const { translate, detectLanguage, wordAlternatives, translateWithAlternatives } = require('deepl-translator');
const _ = require('lodash');

let count1 = 0;
let count2 = 0;
const moc = {
	"confirm_delete_message": "Are you sure you want to delete this workflow ?",
	"connect": {
		"_alert": {
			"auth_message_ko": "Authentification was unsuccesfull",
			"auth_message_ok": "Authentification was succesfull",
			"redirect_message": "You will be redirect in few seconds"
		}
	},
	"_alert": {
		"upload_success": "Upload successful, launching workflow...",
		"signiant": {
			"error_fail_to_load": "Signiant App Failed to load. This mode will not work.",
			"error_unable_to_open_folder_selector": "Unable to open the folder selector: %s",
			"error_network_connectivity_restored": "Network Connectivity Restored",
			"error_transfer_object_undefined": "Transfer object undefined",
			"signiant_start_resume_transfer": "Signiant just resume transfer",
			"error_signiant_resume_transfer": "Signiant doesn't arrive to resume transfer",
			"error_connection_lost": "Your connection has been lost. Press launch application on the next dialog.",
			"connection_reestablish": "Connection to Signiant App Re-established",
			"checking_restart_transfer": "Checking to restart transfer",
			"restarting_transfer_in_progress": "Restarting Transfer in Progress",
			"error_reinitialize_signiant_app": "Re-Initialize Signiant App Failed, retrying...",
			"attempt_reinitialize_connection": "Attempt Re Initialize Connection to Signiant",
			"error_failed_load": "Signiant App Failed to load. Transfer Services will not be available.",
			"error_upload_sample": "Sample Upload Transfer Error %s, %s",
			"error_while_transfering_file": "Error while transfering files.",
			"download_successful": "Download successful",
			"network_loss_detected": "Network Loss Detected, Waiting for Network To Return"
		},
		"two_factor": {
			"check_error": "Your validation code doesn't match the correct code",
			"new_code_sent": "A new code has been sent"
		}
	},
}

function translateText (text, inputLang, outputLang, callback) {
	translate(text, inputLang, outputLang)
		.then(res => {
			callback(null, res.translation)
		})
		.catch((e) => {
			callback(e);
		})
};

function translateObj (params, inputLang, outputLang, callback) {
	_.forIn(params, function (value, key) {
		if (_.isObject(value)) {
			translateObj(value, inputLang, outputLang, callback);
		} else {
			count1++; // count for number of call
			translateText(value, inputLang, outputLang, (err, result) => {
				count2++; // count for number of callback
				params[key] = result;
				if (count1 === count2) callback(null, moc); // once all callback arrived means that process ended
			});
		}
	});
};

translateObj(moc, 'EN', 'FR', (err, result) => {
	console.log('err', err);
	console.log('The result obj = ', result);
});
