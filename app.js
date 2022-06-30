const pdf = PDFViewCtrl;
const PDFViewer = PDFViewCtrl.PDFViewer;
// const PDFdoc = pdf.PDF;
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
    if (/\.pdf$/i.test(filename)) {
      pdf = file;
      //   console.log(pdf, "po");
    } else if (/\.(x)?fdf$/i.test(filename)) {
      fdf = file;
    }
  }

  function loadFileAndDownload(pdfDoc) {
    let bufferArray = [];
    return pdfDoc
      .getStream(function ({ arrayBuffer, offset, size }) {
        bufferArray.push(arrayBuffer);
      })
      .then(function (size) {
        console.log("The total size of the stream", size);
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
};

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