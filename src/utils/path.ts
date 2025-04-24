import path from 'path';

export function resolvePath(url: string): string {
  // If the path is absolute, return it as is
  if (url.startsWith('/') || /^[A-Za-z]:/.test(url)) {
    return url;
  }

  // If the path is relative (starts with ./ or ../)
  if (url.startsWith('./') || url.startsWith('../')) {
    return path.resolve(process.cwd(), url);
  }

  // If the path doesn't start with ./ but is not absolute,
  // treat it as relative to current working directory
  return path.resolve(process.cwd(), url);
}
