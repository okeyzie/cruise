const userModel = require("../model/user");
const jwt = require("jsonwebtoken");

exports.checkLogin = (req, res, next) => {
    try {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Kindly login"
    });
  }
    const checkValidToken = jwt.verify(token.split(" ")[1],process.env.JWT_SECRET, async (error, result) =>{
        if(error){
            return res.status(401).json({
                message: "Login seession expired, please login again"
            });
        }else{
            const user = await userModel.findById(result.id);
        
            req.user = user._id;
            next();
        }
    });
} catch (error) {
  res.status(500).json({
    message: "Internal Server Error"
  });
}
};

exports.authenticate = async (req, res, next) => {
  try{
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message:`Invalid token provided`
      })
    }
    const decoded = await jwt.verify(token,process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (user === null){
      return res.status(404).json({
        message:`Authentication Failed: User not found`
      })
    }
    req.user = decoded;
    next()
  }catch (error) {
    if (error instanceof jwt.TokenExpiredError){
      return res.status(401).json({
        message:`Session expired, Please login again to continue`
      })
    }
    res.status(500).json({
      message: error.message
    })
  }
}

exports.adminAuth = async (req, res, next) =>{
  if (req.user.isAdmin !== true){
    return res.status(403).json({
      message:`You're not authorized perform this action.`
    })
  }else {
    next()
  }
}