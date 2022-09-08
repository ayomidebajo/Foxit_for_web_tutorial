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

// const spacesEndpoint = new aws.Endpoint(process.env.ENDPOINT);
const s3 = new aws.S3({
  // endpoint: spacesEndpoint,
  secretAccessKey: process.env.SECRET,
  accessKeyId: process.env.ACCESS,
  region: "us-east-2",
});


// Create the bucket
// const params = {
//   // your bucket name
//   Bucket: "testbucketfoxit",
//   CreateBucketConfiguration: {
//     // Set your region here
//     LocationConstraint: "us-east-2",
//   },
// };



// Change bucket property to your Space name
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "testbucketfoxit",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, cb) {
      // console.log(file, "dile");
      cb(null, file.originalname);
    },
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
  }),
}).any();
// }).array("file", 1);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// change the url to your own
let corsOptions = {
  origin: [
    "https://testbucketfoxit.s3.us-east-2.amazonaws.com/",
    "http://localhost:8080/",
  ],
};

app.get("/download", cors(corsOptions), function (req, res) {
  var fileName = req.query.filename;
  console.log(req.body, 'li');
  var directory =
    "https://testbucketfoxit.s3.us-east-2.amazonaws.com/" + fileName;
  
  
  console.log(directory, 'yey');
  res.json({
    data: directory
  })
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
