const sharp = require("sharp")

/**
 * Get the image height and width.
 *
 * @param {string} image Image path
 * @returns {Promise<{ width: number, height: number }>}
 */
async function getImageDimensions(image) {
    const metadata = await sharp(image).metadata()
    return {
        width: +metadata.width,
        height: +metadata.height,
    }
}

/**
 * Get the image orientation.
 *
 * @param {string} image Image path
 * @returns {Promise<string>} Landscape or portrait
 */
async function getImageOrientation(image) {
    const dimensions = await getImageDimensions(image)
    return (+dimensions.width >= +dimensions.height) ? "landscape" : "portrait"
}

/**
 * Based on the image orientation, set the required parameters for the initial
 * resize.
 *
 * @param {string} image Image path
 * @returns {Promise<Object>}
 * @throws Will throw an error if the image is below the required resolution
 */
async function setResizeParams(image) {
    const dimensions = await getImageDimensions(image)
    const orientation = await getImageOrientation(image)

    if (dimensions.width < 512 || dimensions.height < 512) {
        throw new Error("Image must be at least 512x512px")
    }

    return orientation === "landscape" ? { height: 512 } : { width: 512 }
}

/**
 * Resize the image prior to cropping.
 *
 * @param {string} image Image path
 * @returns {Promise<Buffer>}
 */
async function resizeImage(image) {
    const params = await setResizeParams(image)
    return await sharp(image).resize(params).toBuffer()
}

/**
 * Crop the resized image to the required 512x512px size for Dreambooth,
 * compress and correctly format the image prior to output.
 *
 * @param {Buffer} resized The resized image buffer
 */
async function crop(resized) {
    let crop = { width: 512, height: 512 }
    const dimensions = await getImageDimensions(resized)

    if (getImageOrientation(resized) === "landscape") {
        crop.top = 0
        crop.left = Math.round((dimensions.width - 512) / 2)
    } else {
        crop.top = Math.round((dimensions.height - 512) / 2)
        crop.left = 0
    }

    sharp(resized)
        .extract(crop)
        .toFormat("jpeg", { mozjpeg: true })
        .toFile("processed-images/portrait-512.jpg")
}

const image = "process-images/portrait.jpg"
resizeImage(image).then(crop)
