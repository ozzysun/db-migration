const exec = require('child_process').exec
const cmdArray = async(workPath, cmdArray) => {
  try {
    const resultArray = []
    for (let i = 0; i < cmdArray.length; i++) {
      const result = await cmd(workPath, cmdArray[i])
      resultArray.push(result)
    }
    return resultArray
  } catch (e) {
    return e
  }
}
const cmd = async(workPath, cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: workPath }, (err, stdout, stderr) => {
      if (err !== null) {
        reject(err)
      } else {
        const info = stdout.split('\n')
        resolve({ stdout: info, stderr })
      }
    })
  })
}
module.exports = { cmd, cmdArray }
