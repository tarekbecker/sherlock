- [ ] support for length based pushed
```javascript 
var a = [];
a[a.length] = 5;
```
- [ ] block values that are return values of functions
```javascript
var a = [foo()];
a[0] = 10;
// is optimized still a = [foo()];
```

- [ ] support for conditions
```javascript
var a = [];
if (true) {
  a.push(0); // lock full object here!
}
a.push(1);
// is optimized still a = [];

var b = [];
if (true) {
    b[1] = 5; // what happens if b[0] and later b[1] ???
}
b[0] = 5;
// is optimized b = [5]
```

- [ ] partial lock (conditions, slice, ...)
```javascript
var a = [0, 1, 2, 3];
if (true) {
  a.push(4); // lock index 4 to infinity
}
a.push(1);
a[0] = -1;
// is optimized a = [-1, 1, 2, 3];
```