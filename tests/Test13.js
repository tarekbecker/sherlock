var array = [0];
var array2 = [5,10];
var a = {};

array. push(1);

a.text = "text";
a.number = 5;
a.number2 = add(5,10);

a.number = 10;

var array3 = [5];

array3.push(10);
array3[1] = add(5,10);


for (var i = 1; i <= array.length; i++) {
    array2.push(i);
}

array.push(3);

function add(a,b) {

    return a + b;
}

var person ={};

person.firstName = "David";
person.lastName = "Guesewell";
person.phoneNumber = 61052;

function getFullName(person)
{
 return  person.firstName+' '+person.lastName;
}

var fullname = getFullName(person);

person.firstName = "Tarek";