var array = [0, 1];
var tmp = array.toString();
array[1] = 2;

var array2 = [0, 1]
var tmp = array2.toLocaleString();
array2[1] = 2;

var array3 = [0, 1];
var tmp = array3.indexOf(1);
array3[1] = 2;

var array4 = [0, 1];
var tmp = array4.lastIndexOf(1);
array4[1] = 2;

var array5 = [0, 1];
var tmp = array5.every(compare);

array5[1] = 2;

var array6 = [0, 1];
var tmp = array6.some(compare);
array6[1] = 2;

var array6 = [0, 1];
var tmp = array6.some(compare);
array6[1] = 2;

var array7 = [0, 1];
array7.forEach(increase);
array7[1] = 2;

var array8 = [0, 1];
var tmp = array8.map(increase);
array8[1] = 2;

var array9 = [0, 1];
var tmp = array9.reduce(function (previousValue, currentValue) {
    return previousValue + currentValue;
});
array9[1] = 2;

var array10 = [0, 1];
var tmp = array10.reduceRight(function (previousValue, currentValue) {
    return previousValue + currentValue;
});
array10[1] = 2;

var array11 = [0, 1];
var tmp = array11.reduceRight(function (previousValue, currentValue) {
    return previousValue + currentValue;
});
array11[1] = 2;

var array12 = [0, 1];
var tmp = array12.join();
array12[1] = 2;

var array13 = [0, 1];
var tmp = array13.filter(compare);
array13[1] = 2;

var array14 = [0, 1, 2];
var tmp = array14.slice(0, 2);
array14[1] = 2;


function compare(currentValue) {
    if (currentValue > 1)
        return true;
    else return false;
}

function increase(currentValue) {
    return currentValue + 1;
}