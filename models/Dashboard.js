const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    locationName: {
      type: String,
    },


    pricePerDay:{ 
        type: Number,
        required: true
    },
      category: {
      type: String,
      enum: ["Sedan", "SUV", "Luxury", "Electric", "Truck"],
      required: true,
    },

        images: [
      {
        public_id: String,
        url: String,
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    available: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔥 Geo index
carSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Car", carSchema);
