function Fruit(color, sweetness, fruitName, lands) {
    this.color = color;
    this.sweetness = sweetness;
    this.fruitName = fruitName;
    this.nativeToLand = lands;

    this.showName = function () {
        console.log("This is a " + this.fruitName);
    }
}

var countries = ["South America", "Central America", "West Africa"];
var mangoFruit = new Fruit("Yellow", 8, "Mango",countries );
countries.push("USA");
var pineappleFruit = new Fruit("Brown", 5, "Pineapple", countries[3])

var fruits = [mangoFruit,pineappleFruit];


mangoFruit.sweetness = 5;

var mangoName = mangoFruit.showName();

mangoFruit.fruitName = "mangospecial";

var pineAppleName = fruits[1].showName();

pineappleFruit.fruitName = "newPineApple";

fruits.push(new Fruit("Orange", 8, "Orange",countries[1] ));

var orangeFruit = fruits[2];

orangeFruit.sweetnees = 3;

var numberOfFruits = fruits.length;


fruits.push(new Fruit("Green", 1, "Apple",countries[2] ));



