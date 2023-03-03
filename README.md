# dreambooth-image-resize-nodejs

A Nodejs script to quickly resize images to the required 512x512px for Dreambooth model training.

```bash
# Install dependencies
npm i

# Run the script
# Currently it can only do one file at a time which is hard-coded in resize.js
node resize.js
```

### TODO

 - [ ] Read the files from `process-images` then output them to `processed-images` with `-512` appended to the filename
