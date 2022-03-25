import { writeFile } from "fs";
import { join } from "path";
import request from "request";
import blend from "@mapbox/blend";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

/**
 * @description Since the following declaration of variables does not mutate in runtime, I have changed their
 * type from "let" to "const" to make them constants
 * 
 * @author
 * @since
 */
const {
  greeting = "Hello",
  who = "You",
  width = 400,
  height = 500,
  color = "Pink",
  size = 100
} = argv;

/**
 * @description Added two new constants to easily change the output file name
 * and the save directory without going through the code logic.
 * This improves the maintainability and readability of the code.
 */
const outputFileName = "cat-card.jpg";
const outputFileSaveDirectory = `${process.cwd()}/output`;

/**
 *
 * @param {String} message The message which needs to be displayed on the cat image
 * @returns {Object} Request params object
 *
 * @description Implemented this common function to reduce the unwanted lines of code and
 * improve the readability, simplicity and maintainability
 *
 * @author Ashan Lakshith Thotawatta
 * @since 24-03-2022
 *
 */
const buildRequestParamsObject = (message) => {
  return {
    url:
      "https://cataas.com/cat/says/" +
      message +
      "?width=" +
      width +
      "&height=" +
      height +
      "&color" +
      color +
      "&s=" +
      size,
    encoding: "binary",
  };
};

/**
 *
 * @param {String} displayMessage Message to be included in the image
 * @returns {Promise} Resolution or rejection of the image retrieval with the included message
 * 
 * @description Sends an API call to get the image using the parameters generated from the
 * buildRequestParamsObject() function. Returns a Promise to support with asynchronous function calling
 *
 * @author Ashan Lakshith Totawatta
 * @since 24-03-2022
 */
const sendApiRequestSync = (displayMessage) => {
  const requestParamsObject = buildRequestParamsObject(displayMessage);
  return new Promise((resolve, reject) => {
    request.get(requestParamsObject, (err, res, responseBody) => {
      if (err) {
        // error occurred
        console.log(err);
        reject(new Error(err));
      } else {
        // executed successfully
        console.log("Received response with status:" + res.statusCode);
        resolve(responseBody);
      }
    });
  });
};

/**
 * 
 * @param {Array} downloadedImagesArray Array of image data objects retrieved from the API
 * @description This function merges the images passed in as an array into a single image and writes the file
 * ina server directory
 * 
 * @author Ashan Lakshith Thotawatta
 * @since 24-03-2022
 */
const mergeImages = (downloadedImagesArray) => {
  blend(
    [
      {
        buffer: new Buffer.from(downloadedImagesArray[0], "binary"),
        x: 0,
        y: 0,
      },
      {
        buffer: new Buffer.from(downloadedImagesArray[1], "binary"),
        x: width,
        y: 0,
      },
    ],
    {
      width: width * 2,
      height: height,
      format: "jpeg",
    },
    (err, data) => {
      const fileOut = `${outputFileSaveDirectory}/${outputFileName}`;
      writeFile(fileOut, data, "binary", (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("The file was saved!");
      });
    }
  );
}

/**
 *
 * @description Main function
 *
 * @author Ashan Lakshith Thotawatta
 * @since 24-03-2022
 */
const mainAsyncFunction = async () => {
  try {
    const firstImage = sendApiRequestSync(greeting);
    const secondImage = sendApiRequestSync(who);

    /**
     * @description Use of Promise.all() improves performance by running the asynchronous  
     * function calls parallelly.
     */
    const downloadedImages = await Promise.all([
      firstImage,
      secondImage
    ])

    mergeImages(downloadedImages);

  } catch (error) {
    console.log(error);
  }
};

mainAsyncFunction();
