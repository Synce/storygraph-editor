import {DOMParser} from '@xmldom/xmldom';
import atob from 'atob';
import pako from 'pako';
import {xml2json} from 'xml-js';

const parseXml = (xml: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'text/xml');
};

const mx2xml = (data: string): string | null => {
  let textContent = '';
  try {
    const node = parseXml(data).documentElement;

    if (node != null && node.nodeName === 'mxfile') {
      const diagrams = node.getElementsByTagName('diagram');

      if (diagrams.length > 0 && diagrams[0] !== undefined) {
        textContent = diagrams[0].textContent ?? '';
      }
    }
  } catch (e) {
    console.error('Error parsing XML: ', e);
    return null;
  }

  try {
    textContent = atob(textContent);
  } catch (e) {
    console.error('atob failed: ', e);
    return null;
  }

  try {
    textContent = pako.inflateRaw(
      Uint8Array.from(textContent, c => c.charCodeAt(0)),
      {to: 'string'},
    );
  } catch (e) {
    console.error('inflateRaw failed: ', e);
    return null;
  }

  try {
    textContent = decodeURIComponent(textContent);
  } catch (e) {
    console.error('decodeURIComponent failed: ', e);
    return null;
  }

  return textContent;
};

export function mx2json(data: string): string | null {
  const xmlData = mx2xml(data);
  if (!xmlData) return null;

  try {
    return xml2json(xmlData, {compact: true, spaces: 2});
  } catch (e) {
    console.error('Error converting XML to JSON: ', e);
    return null;
  }
}
