import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";

dotenv.config();

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return next(createError(409, "Email is already in use."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save();
    const token = jwt.sign({ id: createdUser._id }, "mynameisharsh11", {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    // Check if user exists
    if (!user) {
      return next(createError(404, "User not found"));
    }
    console.log(user);
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign({ id: user._id }, "mynameisharsh11", {
      expiresIn: "9999 years",
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );

    //calculte total calories burnt
    const totalCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Calculate total no of workouts
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    //Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalCaloriesBurnt.length > 0
        ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
        : 0;

    // Fetch category of workouts
    const categoryCalories = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Format category data for pie chart

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
      );
      weeks.push(`${date.getDate()}th`);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData: pieChartData,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const todaysWorkouts = await Workout.find({
      user: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutString, date } = req.body;
    
    console.log("Received workout data:", { workoutString, date });
    
    if (!workoutString) {
      return next(createError(400, "Workout string is missing"));
    }
    
    // Split workoutString into entries (separated by semicolons or new lines if no semicolons)
    let workouts;
    if (workoutString.includes(';')) {
      workouts = workoutString.split(';').filter(entry => entry.trim() !== "");
    } else {
      // If no semicolons, treat the entire string as one workout
      workouts = [workoutString];
    }
    
    console.log("Parsed workouts:", workouts);
    
    if (workouts.length === 0) {
      return next(createError(400, "No valid workout data found"));
    }

    const parsedWorkouts = [];
    
    // Process each workout entry
    for (const entry of workouts) {
      // Clean up the entry and split by newlines
      const lines = entry.split('\n').map(line => line.trim()).filter(line => line !== "");
      console.log("Processing workout lines:", lines);
      
      if (lines.length < 5) {
        return next(createError(400, `Workout must have at least 5 lines (category, name, sets/reps, weight, duration). Found ${lines.length} lines.`));
      }
      
      if (!lines[0].startsWith('#')) {
        return next(createError(400, "First line must start with '#' to indicate category"));
      }
      
      // Build workout object manually
      const workoutDetails = {
        category: lines[0].substring(1).trim(),
        workoutName: lines[1].startsWith('*') ? lines[1].substring(1).trim() : lines[1].trim(),
        date: date ? new Date(date) : new Date()
      };
      
      // Parse sets and reps from line 3
      const setsRepsLine = lines[2];
      if (setsRepsLine.includes('sets') && setsRepsLine.includes('reps')) {
        try {
          const setsMatch = setsRepsLine.match(/\*(\d+)\s*sets/);
          const repsMatch = setsRepsLine.match(/\*(\d+)\s*reps/);
          
          if (setsMatch && repsMatch) {
            workoutDetails.sets = parseInt(setsMatch[1]);
            workoutDetails.reps = parseInt(repsMatch[1]);
          } else {
            console.log("Failed to parse sets/reps:", setsRepsLine);
            return next(createError(400, `Invalid sets/reps format. Expected "*X sets *Y reps", got "${setsRepsLine}"`));
          }
        } catch (error) {
          console.error("Error parsing sets/reps:", error);
          return next(createError(400, "Error parsing sets and reps"));
        }
      } else {
        return next(createError(400, `Sets/reps line should include both "sets" and "reps". Found: "${setsRepsLine}"`));
      }
      
      // Parse weight from line 4
      const weightLine = lines[3];
      if (weightLine.includes('kg')) {
        try {
          const weightMatch = weightLine.match(/\*(\d+(\.\d+)?)\s*kg/);
          if (weightMatch) {
            workoutDetails.weight = parseFloat(weightMatch[1]);
          } else {
            console.log("Failed to parse weight:", weightLine);
            return next(createError(400, `Invalid weight format. Expected "*X kg", got "${weightLine}"`));
          }
        } catch (error) {
          console.error("Error parsing weight:", error);
          return next(createError(400, "Error parsing weight"));
        }
      } else {
        return next(createError(400, `Weight line should include "kg". Found: "${weightLine}"`));
      }
      
      // Parse duration from line 5
      const durationLine = lines[4];
      if (durationLine.includes('min')) {
        try {
          const durationMatch = durationLine.match(/\*(\d+(\.\d+)?)\s*min/);
          if (durationMatch) {
            workoutDetails.duration = parseFloat(durationMatch[1]);
          } else {
            console.log("Failed to parse duration:", durationLine);
            return next(createError(400, `Invalid duration format. Expected "*X min", got "${durationLine}"`));
          }
        } catch (error) {
          console.error("Error parsing duration:", error);
          return next(createError(400, "Error parsing duration"));
        }
      } else {
        return next(createError(400, `Duration line should include "min". Found: "${durationLine}"`));
      }
      
      console.log("Successfully parsed workout:", workoutDetails);
      parsedWorkouts.push(workoutDetails);
    }

    // Calculate calories and save workouts
    const savedWorkouts = [];
    
    for (const workout of parsedWorkouts) {
      workout.caloriesBurned = calculateCaloriesBurnt(workout);
      const newWorkout = new Workout({ ...workout, user: userId });
      const savedWorkout = await newWorkout.save();
      savedWorkouts.push(savedWorkout);
    }

    return res.status(201).json({
      message: "Workouts added successfully",
      workouts: savedWorkouts
    });
  } catch (err) {
    console.error("Error in addWorkout:", err);
    return next(err);
  }
};

// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  try {
    const durationInMinutes = parseInt(workoutDetails.duration) || 0;
    const weightInKg = parseInt(workoutDetails.weight) || 0;
    const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
    return durationInMinutes * caloriesBurntPerMinute * weightInKg;
  } catch (error) {
    console.error("Error calculating calories:", error);
    return 0;
  }
};