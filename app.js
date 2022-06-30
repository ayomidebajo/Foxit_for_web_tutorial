const pdf = PDFViewCtrl;
const PDFViewer = PDFViewCtrl.PDFViewer;
const PDFUi = UIExtension;

const pdfViewer = new PDFViewer({
  libPath: "./lib",
  jr: {
    licenseSN: licenseSN,
    licenseKey: licenseKey,
    tileSize: 300,
  },
  customs: {
    //   Custom function to confirm the removal of document.
    closeDocBefore: function () {
      return confirm("Close the current document?");
    },
    //Custom function to render pages
    PageCustomRender: (function () {
      function CustomPageCustomRender(eCustom, pdfPageRender) {
        this.eCustom = eCustom;
        this.pdfPageRender = pdfPageRender;
      }
      // Custom function to limit the amount of pages to view.
      CustomPageCustomRender.prototype.render = function () {
        let self = this;
        return self.pdfPageRender.getPDFPage().then(function (page) {
          if (page.getIndex() > 3) {
            self.eCustom.innerHTML =
              "You are not authorized to view this page.";
            return false;
          }
        });
      };
      // Custom function to remove the render when ever you change the file in the file input
      CustomPageCustomRender.prototype.destroy = function () {
        this.eCustom.innerHTML = "";
      };
      return CustomPageCustomRender;
    })(),
    ScrollWrap: PDFViewCtrl.CustomScrollWrap,
  },
});

// new PDFViewCtrl_EditGraphicsAddonModule.EditGraphicsAddon(pdfViewer).init();
// new PDFViewCtrl_CreateAnnotAddonModule.CreateAnnotAddon(pdfViewer).init();
pdfViewer.init("#pdf-viewer");
let fileName = undefined;
// console.log(pdf, "goose bumps");
document.getElementById("file").onchange = function (e) {
  if (!e.target.value) {
    return;
  }
  //   console.log(e.target.files, "val");
  let pdf, fdf;
  for (let i = e.target.files.length; i--; ) {
    let file = e.target.files[i];
    let filename = file.name;
    fileName = file.name;
    if (/\.pdf$/i.test(filename)) {
      pdf = file;
      console.log(pdf, "po");
    } else if (/\.(x)?fdf$/i.test(filename)) {
      fdf = file;
    }
  }
  let file = undefined;
  function loadFileAndDownload(pdfDoc) {
    let bufferArray = [];
    return pdfDoc
      .getStream(function ({ arrayBuffer, offset, size }) {
        bufferArray.push(arrayBuffer);
      })
      .then(function (size) {
        console.log("The total size of the stream", bufferArray);
        file = new Blob([JSON.stringify(bufferArray)], {
          type: "application/pdf",
        });
        return new Blob(bufferArray, { type: "application/pdf" });
      });
  }

  // The pdfViewer method (openPDFByFile) returns a type of PDFDoc, this is how you can use the getStream() method.
  let file_uploaded = pdfViewer.openPDFByFile(pdf, {
    password: "",
    fdf: { file: fdf },
  });
  file_uploaded.then((res) => {
    loadFileAndDownload(res);
  });

  // logic to submit when user presses submit or enter
  document.getElementById("form").onsubmit = async function (e) {
    e.preventDefault();
    const body = new FormData(document.getElementById("form"));
    file_uploaded.then((res) => {
      loadFileAndDownload(res).then((res) => {
        console.log(res, "dance");
        body.append("file", res);
      });
    });

    // request to send file
    await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: body,
    })
      .then(() => {
        alert("The file has been uploaded successfully.");
      })
      .catch((err) => {
        alert("Oh no, something went wrong!");
      });
  };

  // // logic to download file when the user presses the download button
  // document.getElementById("download-btn").onclick = async function (e) {
  //   e.preventDefault();
  //   console.log("clicked");
  //   await fetch("http://localhost:3000/upload", {
  //     method: "GET",
  //   })
  //     .then((res) => {
  //       console.log(res, "she like me");
  //     })
  //     .catch((err) => {
  //       alert("Oh no, something went wrong");
  //     });
  // };
  const file_name = new FormData(document.getElementById("form"));
  file_name.append("fileName", "testfile");

  document
    .getElementById("download-btn")
    .addEventListener("click", async function (e) {
      e.preventDefault();
      console.log("clicked");
      await fetch(`http://localhost:3000/download?filename=${fileName}`, {
        method: "GET",
      })
        .then((res) => {
          res.json().then((res) => {
           downloadURI(res.data, fileName);
          })
        })
        .catch((err) => {
          alert("Oh no, something went wrong");
        });
    });
};

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  window.open(uri, "_blank");
}

console.log(document.getElementById("download-btn"), "gentitlyu");
// Zoom in and Zoom out
let scale = 1;
document.getElementById("plus").onclick = function () {
  scale += 0.25;
  pdfViewer.zoomTo(scale).catch(function () {});
};
document.getElementById("sub").onclick = function () {
  scale -= 0.25;
  pdfViewer.zoomTo(scale).catch(function () {});
};

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === "object" || typeof call === "function")
    ? call
    : self;
}
