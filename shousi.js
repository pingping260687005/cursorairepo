const myapply = (context, args) => {
  context = context || window;
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};

const mycall = (context, ...args) => {
  context = context || window;
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};

const aaa = () => {};
aaa.call(this, ...args);

const mydeepclone = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const newObj = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = mydeepclone(obj[key]);
    }
  }

  return newObj;
};

const mypromiseall = (promises) => {
  const resultArray = [];
  new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject("");
    }
    promises.forEach((promise) => {
      Promise.resolve(promise)
        .then((result) => {
          resultArray.push(result);
          if (resultArray.length === promises.length) {
            resolve(resultArray);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  });
};



const mypromiserace = (promises) => {
  new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject("");
    }
    promises.forEach((promise) => {
      Promise.resolve(promise)
        .then((result) => {
            resolve(result);
        })
        .catch((e) => {
          reject(e);
        });
    });
  });
};

const mypromiseresolve = (promise) => { 
    if(promise instanceof Promise) {
      return promise
    }
    return new Promise((resolve, reject) => {
        resolve(promise)
    })
};

const mycurry = (fn) => { 
  const args = [];
  // how to know max lenght
  const maxlength = fn.length // it shows the number of arguments
  return (arg) => { 
     args.push(arg);
     if(args.length===maxlength) {
      return fn(...args);
     } else if(args.length>maxlength){
      const subArgs = args.slice(0, maxlength-1)
      return fn(...subArgs); 
     }
  };
};
const add = (a,b,c) => a+b+c
const a = curry(add)
a(1)(2)(3)
