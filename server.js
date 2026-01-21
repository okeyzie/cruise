require('dotenv').config();
const cors = require("cors");
const express = require('express');
const mongoose = require('mongoose');
mongoose.set('strictPopulate', false);

const PORT = process.env.PORT || 1234;
const db = process.env.MONGO_DB;
const userRouter = require("./router/user");
const locationRoutes = require("./router/googleLocation");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const session = require('express-session');
const passport = require('passport');
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

app.use(session({
  secret: 'session-app',
  resave: true,
  saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
  title: 'API documentation for Cruise-Car App',
    version: '1.0.0',
    description:
      'API Documentation for all Endpoints.',
    // license: {
    //   name: 'Licensed Under MIT',
    //   url: 'https://spdx.org/licenses/MIT.html',
    // },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://google.com',
    },
  },
  servers: [
    {
      url: 'https://cruise-wx9q.onrender.com/docs',
      description: 'Development server',
    },
    {
      url: 'http://localhost:8080/docs',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format **Bearer &lt;token&gt;**',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./router/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Root route for basic server check
app.get('/', (req, res) => {
  res.send('Connected to Backend Server')
});

// API routes
app.use("/api/v1", userRouter);
app.use("/api/v1", locationRoutes);

app.use((error, req, res, next) => {
  if (error) {
    return res.status(500).json({
      message: error.message
    })
  };
  next();
});


mongoose.connect(db).then(()=>{
    console.log(`Connected to the database successfully`);
    app.listen(PORT, ()=>{
    console.log(`Server is running on the PORT: ${PORT}`);  
})
}).catch((error)=> {
    console.log("Error connecting to the datbase:", error.message)
});

