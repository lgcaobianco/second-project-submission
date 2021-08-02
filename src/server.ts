import express from 'express';
import bodyParser from 'body-parser';
import {
	filterImageFromURL,
	deleteLocalFiles
} from './util/util';

import {
	oneOf,
	check,
	validationResult
} from 'express-validator';
import {
	promises
} from 'dns';
import {
	pathToFileURL
} from 'url';

(async () => {

	// Init the Express application
	const app = express();

	// Set the network port
	const port = process.env.PORT || 8082;

	// Use the body parser middleware for post requests
	app.use(bodyParser.json());

	// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
	// GET /filteredimage?image_url={{URL}}
	// endpoint to filter an image from a public url.
	// IT SHOULD
	//    1
	//    1. validate the image_url query
	//    2. call filterImageFromURL(image_url) to filter the image
	//    3. send the resulting file in the response
	//    4. deletes any files on the server on finish of the response
	// QUERY PARAMATERS
	//    image_url: URL of a publicly accessible image
	// RETURNS
	//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

	app.get("/filteredimage",
		check('image_url').exists().withMessage('url is required'),
		check('image_url')
		.custom((image_url) => {
			const imageUrl = image_url;
			if (!(imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
				throw new Error('provided url does not seem to be valid');
			}
			return Promise.resolve();
		})
	, (req, res) => {
		try {
			validationResult(req).throw();
			const validImageUrl = req.query.image_url;
			filterImageFromURL(validImageUrl).then(pathToImage => {
				console.log(`[INFO] file returned is: ${pathToImage}`);
				res.sendFile(pathToImage, (err) => {
					if (err) {
						console.log(`[ERROR] failed to send file to client`);
						throw new Error(err.message);
					}
					res.end();
					deleteLocalFiles([pathToImage]);
					console.log(`[INFO] deleted filed ${pathToImage}`);

				});
			}).catch(err => {
				throw new Error(err);
			});
		} catch (err) {
			res.status(400).send(err);
		}
	});





	/**************************************************************************** */

	//! END @TODO1

	// Root Endpoint
	// Displays a simple message to the user
	app.get("/", async (req, res) => {
		res.send("try GET /filteredimage?image_url={{}}")
	});


	// Start the Server
	app.listen(port, () => {
		console.log(`server running http://localhost:${ port }`);
		console.log(`press CTRL+C to stop server`);
	});
})();