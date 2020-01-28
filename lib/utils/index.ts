import * as fs from "fs"
import * as path from 'path';


export function traverseDir(directory: string) {
  return new Promise((resolve, reject) => {
    function traverse(dir: string, done:(err: NodeJS.ErrnoException | null, files?: string[]) => void) {
      let results: string[] = []
      fs.readdir(dir, (err, files) => {
        let i = 0
        if (err) {
          return done(err)
        }
        (function next() {
          let file = files[i++]
          if (!file) {
            return done(null, results)
          }
          file = path.join(dir, file)
          fs.stat(file, (err, stat) => {
            if (stat && stat.isDirectory()) {
              traverse(file, (err, res) => {
                if (res) {
                  results = results.concat(res)
                }
                next()
              })
            } else {
              results.push(file)
              next();
            }
          })
        })()
      });
    }
    traverse(directory, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results);
      }
    })
  })
}
