const engine = 'whatanime';

async function upload({blob, imgData}) {
  const img = new Image();
  img.onload = function() {
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');

    const maxSize = 640;
    const sw = img.naturalWidth;
    const sh = img.naturalHeight;
    let dw;
    let dh;
    if (sw > maxSize || sh > maxSize) {
      if (sw === sh) {
        dw = dh = maxSize;
      }
      if (sw > sh) {
        dw = maxSize;
        dh = (sh / sw) * maxSize;
      }
      if (sw < sh) {
        dw = (sw / sh) * maxSize;
        dh = maxSize;
      }
    } else {
      dw = sw;
      dh = sh;
    }

    cnv.width = dw;
    cnv.height = dh;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, dw, dh);
    ctx.drawImage(img, 0, 0, sw, sh, 0, 0, dw, dh);
    const data = cnv.toDataURL('image/jpeg', 0.8);

    document.querySelector('#autoSearch').checked = true;
    document.querySelector('#originalImage').src = data;
  };
  img.src = URL.createObjectURL(blob);
}

initUpload(upload, dataKey, engine);
