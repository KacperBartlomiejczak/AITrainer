/**
 * In-memory fake of the `expo-file-system` File/Directory/Paths API (native module is unavailable in Jest).
 * Mirrors the real behaviour we rely on: copy fails for a missing source or parent directory,
 * delete fails for a missing entry.
 */
const DOCUMENT_URI = "file:///document/";

const files = new Set();
const directories = new Set([DOCUMENT_URI]);

function toUri(parent, name) {
  const base = typeof parent === "string" ? parent : parent.uri;
  if (name === undefined) return base;
  return `${base.endsWith("/") ? base : `${base}/`}${name}`;
}

function parentDirectoryOf(uri) {
  return uri.slice(0, uri.lastIndexOf("/") + 1);
}

class Directory {
  constructor(parent, name) {
    const uri = toUri(parent, name);
    this.uri = uri.endsWith("/") ? uri : `${uri}/`;
  }

  get exists() {
    return directories.has(this.uri);
  }

  create() {
    directories.add(this.uri);
  }

  delete() {
    if (!directories.has(this.uri)) throw new Error(`Directory does not exist: ${this.uri}`);
    for (const file of [...files]) {
      if (file.startsWith(this.uri)) files.delete(file);
    }
    directories.delete(this.uri);
  }
}

class File {
  constructor(parent, name) {
    this.uri = toUri(parent, name);
  }

  get exists() {
    return files.has(this.uri);
  }

  async copy(destination) {
    if (!files.has(this.uri)) throw new Error(`Source file does not exist: ${this.uri}`);
    if (!directories.has(parentDirectoryOf(destination.uri))) {
      throw new Error(`Destination directory does not exist: ${destination.uri}`);
    }
    files.add(destination.uri);
  }

  delete() {
    if (!files.has(this.uri)) throw new Error(`File does not exist: ${this.uri}`);
    files.delete(this.uri);
  }
}

const Paths = {
  get document() {
    return new Directory(DOCUMENT_URI);
  },
};

const __fakeFileSystem = {
  reset() {
    files.clear();
    directories.clear();
    directories.add(DOCUMENT_URI);
  },
  addFile(uri) {
    files.add(uri);
    directories.add(parentDirectoryOf(uri));
  },
  hasFile(uri) {
    return files.has(uri);
  },
  listFiles() {
    return [...files].sort();
  },
};

module.exports = { File, Directory, Paths, __fakeFileSystem };
