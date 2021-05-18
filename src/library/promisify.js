module.exports = promisify

function promisify (object, ...methods) {
  return methods.map(method =>
    (...args) => new Promise((resolve, reject) => object[method](...args,
      (error, result) => error ? reject(error) : resolve(result))))
}