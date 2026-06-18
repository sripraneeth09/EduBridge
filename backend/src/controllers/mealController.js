const Meal = require('../models/Meal');
const MealStock = require('../models/MealStock');
const mongoose = require('mongoose');

const computeAverage = (ratings = []) => {
  if (!ratings.length) return 0;
  const total = ratings.reduce((sum, item) => sum + (item.score || 0), 0);
  return Number((total / ratings.length).toFixed(1));
};

const defaultMenusByWeekday = {
  1: {
    menuName: 'Monday: Cooked Rice',
    description: 'Cooked rice, pappu charu (dal), egg curry, peanut chikki.'
  },
  2: {
    menuName: 'Tuesday: Pulihora',
    description: 'Tamarind, lemon, or mango rice (pulihora), tomato dal, boiled egg.'
  },
  3: {
    menuName: 'Wednesday: Vegetable Pulav',
    description: 'Vegetable rice (veg pulav), aloo kurma, boiled egg, peanut chikki.'
  },
  4: {
    menuName: 'Thursday: Khichidi',
    description: 'Khichidi, tomato chutney, boiled egg.'
  },
  5: {
    menuName: 'Friday: Rice with Greens',
    description: 'Cooked rice, dal with green leafy vegetables, boiled egg, peanut chikki.'
  },
  6: {
    menuName: 'Saturday: Sweet Pongal',
    description: 'Cooked rice, sambar, sweet pongal.'
  }
};

const normalizeDateKey = date => new Date(date).toISOString().slice(0,10);

const buildDefaultMeal = date => {
  const weekday = date.getDay();
  const defaultMenu = defaultMenusByWeekday[weekday];
  if (!defaultMenu) return null;
  return {
    _id: `default-${normalizeDateKey(date)}`,
    date,
    menuName: defaultMenu.menuName,
    description: defaultMenu.description,
    numberServed: 0,
    ratings: []
  };
};

const getWeekDates = (date) => {
  const current = new Date(date);
  const day = current.getDay();
  const monday = new Date(current);
  monday.setDate(current.getDate() - ((day + 6) % 7));
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
};

exports.createMenu = async (req, res) => {
  try{
    const { date, menuName, description } = req.body;
    const meal = await Meal.create({ date, menuName, description });
    res.status(201).json(meal);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateCount = async (req, res) => {
  try{
    const { date, numberServed } = req.body;
    let meal = await Meal.findOne({ date });
    if (!meal) {
      const dateVal = new Date(date);
      const defaultData = buildDefaultMeal(dateVal);
      meal = await Meal.create({
        date: dateVal,
        menuName: defaultData ? defaultData.menuName : 'Meal Plan',
        description: defaultData ? defaultData.description : '',
        numberServed: Number(numberServed),
        ratings: []
      });
    } else {
      meal.numberServed = (meal.numberServed || 0) + Number(numberServed);
      await meal.save();
    }
    res.json(meal);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.rateMeal = async (req, res) => {
  try{
    const { mealId, score, comment } = req.body;
    let meal;
    if (typeof mealId === 'string' && mealId.startsWith('default-')) {
      const dateStr = mealId.replace('default-', '');
      const dateVal = new Date(dateStr);
      const defaultData = buildDefaultMeal(dateVal);
      meal = await Meal.create({
        date: dateVal,
        menuName: defaultData ? defaultData.menuName : 'Meal Plan',
        description: defaultData ? defaultData.description : '',
        numberServed: 0,
        ratings: []
      });
    } else if (mongoose.Types.ObjectId.isValid(mealId)) {
      meal = await Meal.findById(mealId);
    }

    if(!meal) return res.status(404).json({ message: 'Meal not found' });

    const existing = meal.ratings.find(r => r.user.toString() === req.user._id.toString());
    if(existing){
      existing.score = score;
      existing.comment = comment;
      existing.createdAt = new Date();
    } else {
      meal.ratings.push({ user: req.user._id, score, comment });
    }

    await meal.save();
    const averageRating = computeAverage(meal.ratings);
    res.json({ meal, averageRating });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listMeals = async (req, res) => {
  try{
    const meals = await Meal.find().sort({ date:-1 }).populate('ratings.user', 'name role');
    const actualMeals = meals.reduce((map, meal) => {
      map.set(normalizeDateKey(meal.date), meal);
      return map;
    }, new Map());

    const weekDates = getWeekDates(new Date());
    const defaultMeals = weekDates
      .map(date => {
        const key = normalizeDateKey(date);
        return actualMeals.has(key) ? actualMeals.get(key) : buildDefaultMeal(date);
      })
      .filter(Boolean);

    const extraMeals = meals.filter(meal => {
      const key = normalizeDateKey(meal.date);
      return !weekDates.some(date => normalizeDateKey(date) === key);
    });

    const allMeals = [...defaultMeals, ...extraMeals];
    const output = allMeals.map(meal => {
      const data = meal.toObject ? meal.toObject() : meal;
      return {
        ...data,
        averageRating: computeAverage(data.ratings),
        ratings: (data.ratings || []).map(r => ({
          user: r.user,
          score: r.score,
          comment: r.comment,
          createdAt: r.createdAt
        }))
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(output);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.createStock = async (req, res) => {
  try{
    const { itemName, quantity, unit } = req.body;
    const stock = await MealStock.create({ itemName, quantity, unit });
    res.status(201).json(stock);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateStock = async (req, res) => {
  try{
    const { id } = req.params;
    const updates = req.body;
    const stock = await MealStock.findByIdAndUpdate(id, updates, { new: true });
    res.json(stock);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listStock = async (req, res) => {
  try{
    const stocks = await MealStock.find().sort({ itemName: 1 });
    res.json(stocks);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteStock = async (req, res) => {
  try{
    await MealStock.findByIdAndDelete(req.params.id);
    res.json({ message: 'Stock item deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};