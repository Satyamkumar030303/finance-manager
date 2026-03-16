const authService = require("../services/auth.service")

exports.register = async (req, res) =>{
    try{
        const user = await authService.registerUser(req.body);

        res.status(201).json({
            message: "User Registered Successfully..",
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error){
        res.status(400).json({ error: error.message });
    }      
};

exports.login = async (req, res) => {
  try {
    const { user, token } = await authService.loginUser(req.body);

    res.status(200).json({
      message: "User logged in successfully...",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
      },
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
