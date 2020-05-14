const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// to access the module which is inside the project we use direname
const date = require(__dirname + "/date.js")
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");
// Notice: there is a space in view engine
// browser only executes the javascript, ejs(view folder) and html

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to the to_do_list."
});

const item2 = new Item({
    name: "Hit the + button to add new item."
});

const item3 = new Item({
    name: "Hit the checkbox to delete item."
});

// let items = [];
// let workItems = [];
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// get: Data given to the server.
// post: Data given by the server. 
app.get("/", function(req, res) {
    let day = date.getDate();
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany([item1, item2, item3], function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Submitted.");
                }
            });
            res.redirect("/");
        } else {
        res.render("list", {listTitle: "Today", newItem: foundItems});
    }
});
});

app.get("/:customListName", function(req, res) {
    const customListName = _.toLower(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create a new list.
                // console.log("Doesnt Exist!");
                const list = new List ({
                    name: customListName,
                    items: [item1, item2, item3]
                });
                list.save();
            } else {
                // Show an existing list.
                // console.log("Exist!");
                res.render("list", {listTitle: foundList.name, newItem: foundList.items});
            }
        }
    });
});

app.post("/", function(req, res) {
    let itemName = req.body.newItem;
    let listName = req.body.list;
    const item = new Item ({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function(req, res) {
    const listName = req.body.listName;
    const checkedItemId = req.body.checkbox;
// we used findOneAndUpdate because we cannot pass two values in input(list.ejs)
// value alredy in use _id
// value we wanted to use listTitle       
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (!err) {
                console.log("Successfully deleted the checked item.")
                res.redirect("/");
            }
         });
        } else {

            List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
                if (!err) {
                    res.redirect("/" + listName);
                }
            });
        }        
});

app.listen(3000, (req, res) => console.log("Server started on port 3000"));


    // var currentDay = today.getDay();
    // var day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // for(i=0; i<7; i++) {
    //     if (i == currentDay) {
    //         res.render("list", {kindOfDay: day[i]});          
    //         break;
    //     }
    // }


        // if (currentDay === 6 || currentDay === 0) {
        //     res.write("<h1>yeahh! It's the weekend.</h1>");
        //     res.write("<p>You can Netflix and chill</p>");
        //     res.send();     
        // } else {
        //     res.write("<h1> boo! it's the workday.</h1>");
        //     res.write("<p>Focus on your work so that you can leave early tonight.</p>");
        //     res.send();  
        // }