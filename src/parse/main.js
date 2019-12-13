import browser from 'webextension-polyfill';
import {uniqBy} from 'lodash-es';
import uuidV4 from 'uuid/v4';

import storage from 'storage/storage';
import {
  hasUrlSupport,
  validateUrl,
  normalizeFilename,
  normalizeImage,
  getImageElement
} from 'utils/app';
import {
  getBlankCanvasDataUrl,
  canvasToDataUrl,
  drawElementOnCanvas,
  getAbsoluteUrl
} from 'utils/common';
import {targetEnv} from 'utils/config';

const cssProperties = ['background-image', 'border-image-source', 'mask-image'];
const pseudoSelectors = ['::before', '::after'];
const replacedElements = ['img', 'video', 'iframe', 'embed'];
const rxCssUrl = /url\(['"]?([^'")]+)['"]?\)/gi;

function getFilenameExtFromUrl(url) {
  const file = url
    .split('/')
    .pop()
    .replace(/(?:#|\?).*?$/, '')
    .split('.');
  let filename = '';
  let ext = '';
  if (file.length === 1) {
    filename = file[0];
  } else {
    filename = file.join('.');
    ext = file.pop().toLowerCase();
  }

  return {filename, ext};
}

function fetchImage(url, {credentials = true, token = ''} = {}) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.timeout = 1200000; // 2 minutes
    xhr.responseType = 'blob';
    if (credentials) {
      xhr.withCredentials = true;
    }
    if (token) {
      xhr.setRequestHeader('x-sbi-token', token);
    }

    xhr.onload = () => {
      resolve(xhr);
    };
    xhr.onerror = () => {
      resolve();
    };
    xhr.onabort = () => {
      resolve();
    };
    xhr.ontimeout = () => {
      resolve();
    };

    xhr.send();
  });
}

function extractCSSImages(cssProps, node, pseudo = null) {
  if (pseudo) {
    cssProps = cssProps.slice();
    cssProps.push('content');
  }

  const urls = [];
  const style = window.getComputedStyle(node, pseudo);

  let match;

  cssProperties.forEach(function(prop) {
    let value = style.getPropertyValue(prop);
    if (value && value !== 'none') {
      while ((match = rxCssUrl.exec(value)) !== null) {
        urls.push({data: match[1]});
      }
    }
  });

  return urls;
}

async function parseNode(node) {
  const urls = [];
  const nodeName = node.nodeName.toLowerCase();
  let cssProps = cssProperties;

  if (nodeName === 'img') {
    if (node.currentSrc) {
      urls.push({data: node.currentSrc});
    }
  }

  if (nodeName === 'image') {
    const url = node.getAttribute('href') || node.getAttribute('xlink:href');
    if (url) {
      const absUrl = getAbsoluteUrl(url);
      if (absUrl) {
        urls.push({data: absUrl});
      }
    }
  }

  if (nodeName === 'embed') {
    const data = node.src;
    if (data && (await getImageElement(data))) {
      urls.push({data});
    }
  }

  if (nodeName === 'object') {
    const data = node.data;
    if (data && (await getImageElement(data))) {
      urls.push({data});
    }
  }

  if (nodeName === 'iframe') {
    const data = node.src;
    if (data && !node.srcdoc && (await getImageElement(data))) {
      urls.push({data});
    }
  }

  if (nodeName === 'canvas') {
    const data = canvasToDataUrl(node, {clear: false});
    if (data && data !== getBlankCanvasDataUrl(node.width, node.height)) {
      urls.push({data});
    }
  }

  if (nodeName === 'video') {
    if (node.readyState >= 2) {
      const cnv = document.createElement('canvas');
      const ctx = cnv.getContext('2d');
      cnv.width = node.videoWidth;
      cnv.height = node.videoHeight;

      if (drawElementOnCanvas(ctx, node)) {
        const data = canvasToDataUrl(cnv, {ctx});
        if (data) {
          urls.push({data});
        }
      }
    }

    if (node.poster) {
      urls.push({data: node.poster});
    }
  }

  if (nodeName === 'li') {
    cssProps = cssProps.slice();
    cssProps.push('list-style-image');
  }

  urls.push(...extractCSSImages(cssProps, node));

  if (!replacedElements.includes(nodeName)) {
    pseudoSelectors.forEach(function(pseudo) {
      urls.push(...extractCSSImages(cssProps, node, pseudo));
    });
  }

  return urls;
}

async function parseDocument() {
  if (typeof clickTarget === 'undefined' || !clickTarget.node) {
    throw new Error('');
  }

  let urls = [];
  const targetNode = clickTarget.node;

  const docNodeName = document.documentElement.nodeName.toLowerCase();
  if (docNodeName !== 'html' && docNodeName !== 'svg') {
    return urls;
  }

  urls.push(...(await parseNode(targetNode)));

  const options = await storage.get(
    ['imgFullParse', 'searchModeAction', 'searchModeContextMenu'],
    'sync'
  );

  if (targetNode.nodeName.toLowerCase() !== 'img' || options.imgFullParse) {
    const fullParseUrls = [];

    const clickRectBottom = clickTarget.uy + 24;
    const clickRectTop = clickTarget.uy - 24;
    const clickRectLeft = clickTarget.ux - 24;
    const clickRectRight = clickTarget.ux + 24;

    const nodes = document.getElementsByTagName('*');
    const nodeCount = nodes.length;

    for (let i = 0; i < nodeCount; i++) {
      let currentNode = nodes[i];
      // the node collection length may change during iteration
      if (!currentNode) {
        break;
      }

      let nodeRect = currentNode.getBoundingClientRect();
      if (
        clickRectBottom < nodeRect.top + window.scrollY ||
        clickRectTop > nodeRect.bottom + window.scrollY ||
        clickRectLeft > nodeRect.right + window.scrollX ||
        clickRectRight < nodeRect.left + window.scrollX
      ) {
        continue;
      }

      if (!currentNode.isSameNode(targetNode)) {
        fullParseUrls.push(...(await parseNode(currentNode)));
      }
    }

    urls.push(...fullParseUrls.reverse());
  }

  urls = uniqBy(urls, 'data');

  const daraUrls = urls.filter(item => item.data.startsWith('data:'));
  for (const item of daraUrls) {
    const index = urls.indexOf(item);
    const {data, ext} = await normalizeImage({dataUrl: item.data});
    if (data) {
      urls[index] = {data, filename: normalizeFilename({ext})};
    } else {
      urls.splice(index, 1);
    }
  }

  const isLocalDoc = window.location.href.startsWith('file://');
  if (isLocalDoc) {
    const fileUrls = urls.filter(item => item.data.startsWith('file://'));
    if (fileUrls.length) {
      const cnv = document.createElement('canvas');
      const ctx = cnv.getContext('2d');
      for (const item of fileUrls) {
        const url = item.data;
        const img = await getImageElement(url);
        if (img) {
          let {filename, ext} = getFilenameExtFromUrl(url);
          const type = ['jpg', 'jpeg', 'jpe'].includes(ext)
            ? 'image/jpeg'
            : 'image/png';
          cnv.width = img.naturalWidth;
          cnv.height = img.naturalHeight;

          if (drawElementOnCanvas(ctx, img)) {
            const data = canvasToDataUrl(cnv, {ctx, type});
            if (data) {
              filename = normalizeFilename({filename, ext});
              urls[urls.indexOf(item)] = {data, filename};
            }
          }
        }
      }
    }
  }

  const blobUrls = urls.filter(item => item.data.startsWith('blob:'));
  if (blobUrls.length) {
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    const filename = normalizeFilename({ext: 'png'});
    for (const item of blobUrls) {
      const img = await getImageElement(item.data);
      if (img) {
        cnv.width = img.naturalWidth;
        cnv.height = img.naturalHeight;

        if (drawElementOnCanvas(ctx, img)) {
          const data = canvasToDataUrl(cnv, {ctx});
          if (data) {
            urls[urls.indexOf(item)] = {data, filename};
          }
        }
      }
    }
  }

  const searchMode =
    frameStore.data.eventOrigin === 'action'
      ? options.searchModeAction
      : options.searchModeContextMenu;
  const mustUpload = searchMode === 'selectUpload';
  const urlSupport = await hasUrlSupport(frameStore.data.engine);

  const httpUrls = urls.filter(item => validateUrl(item.data));
  if (httpUrls.length) {
    for (const item of httpUrls) {
      const index = urls.indexOf(item);
      const url = item.data;
      if (mustUpload || !urlSupport) {
        let rsp;
        if (targetEnv === 'firefox') {
          const token = uuidV4();
          await browser.runtime.sendMessage({
            id: 'setRequestReferrer',
            referrer: window.location.href,
            token,
            url
          });
          rsp = await fetchImage(url, {token});
        } else {
          rsp = await fetchImage(url);
        }

        if (!rsp || !rsp.response) {
          urls.splice(index, 1);
          continue;
        }

        const {data, ext} = await normalizeImage({blob: rsp.response});
        if (data) {
          let {filename} = getFilenameExtFromUrl(url);
          filename = normalizeFilename({filename, ext});
          urls[index] = {url, data, filename, mustUpload};
        } else {
          urls.splice(index, 1);
        }
      } else {
        urls[index] = {url};
      }
    }
  }

  return urls.filter(item => validateSearchItem(item));
}

function validateSearchItem(item) {
  if (item.data && !item.data.startsWith('data:')) {
    return false;
  }

  return true;
}

self.initParse = async function initParse() {
  const images = await parseDocument().catch(err => {
    console.log(err.toString());
    browser.runtime.sendMessage({
      id: 'pageParseError'
    });
  });
  if (images) {
    browser.runtime.sendMessage({
      id: 'pageParseSubmit',
      engine: frameStore.data.engine,
      images
    });
  }
};
