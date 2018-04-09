// /// <reference types="../../../node_modules/exif-js/exif.d.ts" />
import * as EXIF from 'exif-js';


export default class Utils {

    static base64ToArrayBuffer(base64, contentType): ArrayBuffer {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || '';
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        const binary = atob(base64);
        const len = binary.length;
        const buffer = new ArrayBuffer(len);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

}