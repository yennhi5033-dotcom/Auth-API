import User from '../models/user.model.js';

export const registerUser = async (data) => {
  const user = await User.create(data);
  return user;
};

export const loginUser = async (data) => {
  const user = await User.findOne({ email: data.email }).select("+password");
  if (!user || !(await user.comparePassword(data.password))) {
    throw new Error("Invalid email or password");
  }
  return user;
};
export const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");
    return user;
};
