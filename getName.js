const fs = require('fs');
const _ = {};
_.compose = (x, y) => v => x(y(v));
const prop = p => obj => obj[p];

class Container {
    constructor (value) {
        this.__value = value;
    }

    static of(value) {
        return new this(value);
    }

    map(f) {
        return Container.of(f(this.__value));
    }
}

class Monad extends Container {
    join() {
        return this.__value;
    }

    flatMap(f) {
        return this.map(f).join();
    }
}

class IO extends Monad {


    map(f) {
        return new IO(_.compose(f, this.__value));
    }

    flatMap(f) {
        return super.flatMap(f)();
    }
}

let readFile = function(filename) {
  return new IO(function() {
    return fs.readFileSync(filename, 'utf-8');
  });
};

let printName = function(x) {
  return new IO(function() {
    x = JSON.parse(x);
    console.log(x);
    return x;
  });
}

let getName = prop('name');

// let getUser = readFile('./data.json') // IO{ val: f => user }
//                 .map(printName) // IO{ val: f => IO { f => user }}

// getUser.__value().__value(); // 拿到 user

let getUserName = readFile('./data.json') // IO{ val: f => user }
                .flatMap(printName) // IO{ val: f => IO { f => user }}
                .map(getName);

console.log(getUserName.__value()); // 拿到 user