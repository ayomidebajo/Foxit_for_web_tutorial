const pdf = PDFViewCtrl;
const PDFViewer = PDFViewCtrl.PDFViewer;
const PDFUi = UIExtension;

const pdfViewer = new PDFViewer({
  libPath: "./lib",
  jr: {
    licenseSN: licenseSN,
    licenseKey: licenseKey,
  },
  customs: {
    // Custom function to confirm the removal of documents
    closeDocBefore: function () {
      return confirm("Close the current document?");
    },
    // Custom function to render pages
    PageCustomRender: (function () {
      function CustomPageCustomRender(eCustom, pdfPageRender) {
        this.eCustom = eCustom;
        this.pdfPageRender = pdfPageRender;
      }
      // Custom function to limit the amount of pages to view
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
      // Custom function to remove the render whenever you change the file in the file input
      CustomPageCustomRender.prototype.destroy = function () {
        this.eCustom.innerHTML = "";
      };
      return CustomPageCustomRender;
    })(),
    ScrollWrap: PDFViewCtrl.CustomScrollWrap,
  },
});


// init the pdf host
pdfViewer.init("#pdf-viewer");

let fileName = undefined;
document.getElementById("file").onchange = function (e) {
  if (!e.target.value) {
    return;
  }

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

  // send file functionality
  let file = undefined;
  function loadFileAndDownload(pdfDoc) {
    let bufferArray = [];
    return pdfDoc
      .getStream(function ({ arrayBuffer, offset, size }) {
        bufferArray.push(arrayBuffer);
      })
      .then(function (size) {
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
};

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
        });
      })
      .catch((err) => {
        alert("Oh no, something went wrong");
      });
  });

// Logic to download file
function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  window.open(uri, "_blank");
}

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
