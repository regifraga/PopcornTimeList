export class Util {
  static humanFileSize(size, decimalPoint) {
    if (size == 0) return "0 Bytes";

    let k = 1000,
      dm = decimalPoint || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(size) / Math.log(k));

    return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  s;
}
