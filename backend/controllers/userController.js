const User = require('../models/userModel');

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, occupation, position, location, linkedIn, github, portfolio, phone, cv, profilePicture } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            occupation,
            position,
            location,
            linkedIn,
            github,
            portfolio,
            phone,
            cv,
            profilePicture,
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser };
