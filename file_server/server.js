require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

app.use(
  cors({
    origin: "*",
  })
);

const spacesEndpoint = new aws.Endpoint(process.env.ENDPOINT);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  secretAccessKey: process.env.SECRET,
  accessKeyId: process.env.ACCESS,
});

// Change bucket property to your Space name
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "web-uploads",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, cb) {
      // console.log(file, "dile");
      cb(null, file.originalname);
    },
  }),
}).any()
// }).array("file", 1);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/upload", function (req, res) {
  var fileName = req.body.fileName;
  var directory =
    "https://fileRepo.ams3.digitaloceanspaces.com/" + fileName + ".pdf";
  res.send({ dir: directory });
});

app.post("/upload", function (request, response, next) {
  upload(request, response, function (error) {
    if (error) {
      console.log(error, "error");
      return response.send("Error, something went wrong");
    }
    if (!request) {
      console.log("no request found");
    }
    console.log(request.body, "File uploaded successfully.");
    response.send("Success, file uploaded");
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
