import { NextFunction, Request, Response } from "express";
import userModel from "../models/user.model";
import { config } from "../config/envConfig";
import { generateRefreshToken, verifyToken } from "../utils/jwt";
import { userService } from "../services/user.service";
import { DatabaseError } from "../utils/error";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
//var bcrypt = require("bcrypt");
// var jwt = require("jsonwebtoken");
const { SECRET_KEY_FOR_ACCESS_TOKEN, SECRET_KEY_FOR_REFRESH_TOKEN } = config;
async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = { userId: user.id.toString() };

    const token = jwt.sign(payload, SECRET_KEY_FOR_ACCESS_TOKEN, {
      expiresIn: "1h",
    });
    const refreshToken = generateRefreshToken(user.id.toString());

    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({
      message: "Login successful",
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function refreshToken(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      SECRET_KEY_FOR_REFRESH_TOKEN
    ) as JwtPayload;
    const userId = decoded.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign({ userId }, SECRET_KEY_FOR_ACCESS_TOKEN, {
      expiresIn: "1h",
    });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
}

const getProfile = async (req: Request, res: Response) => {
  try {
    const authorization = req.headers.authorization;
    const accessToken = authorization.split(" ")[1];
    const { payload } = verifyToken(accessToken);
    const user = await userService.getById(payload.userId);
    return res.status(200).json({ user: user });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(503).json({ message: error.message });
    } else {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }
};

export default { login, getProfile, refreshToken };
