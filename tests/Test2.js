var array = [0, 1];

var a = createValue();

if (a > 0.5) {
    array.push(3);
}
array.push(2);

function createValue()
{
    return 0.5;
}