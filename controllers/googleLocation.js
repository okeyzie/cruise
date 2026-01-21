const CarModel = require("../models/Dashboard");
const {autocompleteLocation, geocodeAddres } = require("../services/googleMaps");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.searchLocation = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const predictions = await autocompleteLocation(query);

    res.status(200).json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCarsNearLocation = async (req, res) => {
  try {
    const { address, radius = 5000 } = req.query;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const { lat, lng } = await geocodeAddress(address);

    const cars = await CarModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: Number(radius), // meters
        },
      },
    });

    res.status(200).json({
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// explore for cars
exports.exploreCars = async (req, res) => {
  try {
    const cars = await CarModel.find().limit(20);   
    res.status(200).json({
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.createCar = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      year,
      pricePerDay,
      category,
      locationName,
      lng,
      lat,
      featured,
    } = req.body;

    let images = [];

    // Upload images to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "CruiseApp/cars",
        });

        images.push({
          public_id: upload.public_id,
          url: upload.secure_url,
        });

        fs.unlinkSync(file.path); // cleanup
      }
    }

    const car = await CarModel.create({
      name,
      brand,
      model,
      year,
      pricePerDay,
      category,
      featured,
      locationName,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      images,
    });

    res.status(201).json({
      message: "Car created successfully",
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create car",
      error: error.message,
    });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await CarModel.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

exports.getAllCars = async (req, res) => {
  try {
    const cars = await CarModel.find();  
    res.status(200).json({
      message: "Cars retrieved successfully",
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};

exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await CarModel.findByIdAndDelete(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    // Delete images from Cloudinary
    for (const image of car.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    return res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCarImages = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Delete old images from Cloudinary
    for (const img of car.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    let images = [];

    for (const file of req.files) {
      const upload = await cloudinary.uploader.upload(file.path, {
        folder: "CruiseApp/cars",
      });

      images.push({
        public_id: upload.public_id,
        url: upload.secure_url,
      });

      fs.unlinkSync(file.path);
    }

    car.images = images;
    await car.save();

    res.status(200).json({
      message: "Car images updated",
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
