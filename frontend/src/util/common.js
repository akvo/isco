export const handleLoad = (event) => {
  const iframe = event.target;
  if (iframe?.contentDocument) {
    let css = "@page {";
    css += "size: 210mm 297mm; margin: 15mm;";
    css += "}";
    css +=
      "* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }";
    const style = document.createElement("style");
    style.type = "text/css";
    style.media = "print";
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    const head = iframe.contentDocument.head;
    if (head) {
      head.appendChild(style);
    }
  }
};
