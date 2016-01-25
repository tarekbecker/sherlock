var a = [1, 2, 3];

if (true) {
  var b = [1, 2, 3];
  a[1] = 7;
  if (true) {
    b[0] = 7;
  }
  b[1] = 3;
  b[0] = 5;
}

a[0] = 5;