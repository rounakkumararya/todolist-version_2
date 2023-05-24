//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

app.use(express.static("public"));

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "<--Hit the + button",
});

const item3 = new Item({
  name: "Hit this to delete item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  run();

  async function run() {
    const items = await Item.find();

    if (items.length === 0) {
      await Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;

  removeItem();
  async function removeItem() {
    await Item.findByIdAndRemove(checkedItemId);
    console.log("sucessfully deleted the item");
    res.redirect("/");
  }
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  console.log(listName);

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    save();
    async function save() {
      await item.save();
      res.redirect("/");
    }
  } else {
    List.findOne({ name: listName }).then((result) => {
      addListItem();
      async function addListItem() {
        result.items.push(item);
        await result.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", function (req, res) {
  const customList = req.params.customListName;

  List.findOne({ name: customList }).then((data) => {
    if (data) {
      res.render("list", { listTitle: data.name, newListItems: data.items });
    } else {
      const list = new List({
        name: customList,
        items: defaultItems,
      });

      save();
      async function save() {
        await list.save();
        res.redirect("/" + customList);
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
